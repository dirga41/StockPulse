import { Prisma, StockLogType } from "@prisma/client";
import { prisma } from "./prisma";

export class StockError extends Error {}

export type StockStatus = "HABIS" | "KRITIS" | "AMAN";

/** Stok dianggap kritis bila jumlahnya <= ambang batas minimum. */
export function stockStatus(quantity: number, minThresholdQty: number): StockStatus {
  if (quantity <= 0) return "HABIS";
  if (quantity <= minThresholdQty) return "KRITIS";
  return "AMAN";
}

type Tx = Prisma.TransactionClient;

/** Ambil (atau buat) baris inventaris dan kunci barisnya agar mutasi paralel tidak saling menimpa. */
async function lockInventory(tx: Tx, storeId: number, itemId: number) {
  const item = await tx.item.findUnique({ where: { id: itemId } });
  if (!item) throw new StockError("Barang tidak ditemukan");
  const store = await tx.store.findUnique({ where: { id: storeId } });
  if (!store) throw new StockError("Cabang tidak ditemukan");

  await tx.storeInventory.upsert({
    where: { storeId_itemId: { storeId, itemId } },
    create: { storeId, itemId, quantity: 0, minThresholdQty: item.defaultMinThreshold },
    update: {},
  });
  const [row] = await tx.$queryRaw<{ id: number; quantity: number }[]>`
    SELECT id, quantity FROM store_inventory
    WHERE "storeId" = ${storeId} AND "itemId" = ${itemId}
    FOR UPDATE`;
  return row;
}

async function applyChange(
  tx: Tx,
  opts: {
    storeId: number;
    itemId: number;
    type: StockLogType;
    /** Perubahan relatif; untuk ADJUSTMENT pakai `setTo`. */
    delta?: number;
    setTo?: number;
    note?: string | null;
    transferId?: number;
  },
) {
  const row = await lockInventory(tx, opts.storeId, opts.itemId);
  const before = row.quantity;
  const after = opts.setTo ?? before + (opts.delta ?? 0);
  if (after < 0) {
    throw new StockError(`Stok tidak cukup (tersedia ${before})`);
  }
  await tx.storeInventory.update({ where: { id: row.id }, data: { quantity: after } });
  return tx.stockLog.create({
    data: {
      storeId: opts.storeId,
      itemId: opts.itemId,
      type: opts.type,
      qtyChange: after - before,
      qtyBefore: before,
      qtyAfter: after,
      note: opts.note || null,
      transferId: opts.transferId,
    },
  });
}

export type MovementInput = {
  storeId: number;
  itemId: number;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  note?: string | null;
};

/** Barang masuk, keluar, atau penyesuaian (stock opname). */
export async function recordMovement(input: MovementInput) {
  if (!Number.isInteger(input.quantity) || input.quantity < 0) {
    throw new StockError("Jumlah harus bilangan bulat >= 0");
  }
  if (input.type !== "ADJUSTMENT" && input.quantity === 0) {
    throw new StockError("Jumlah harus lebih dari 0");
  }
  return prisma.$transaction((tx) =>
    applyChange(tx, {
      storeId: input.storeId,
      itemId: input.itemId,
      type: input.type,
      delta: input.type === "IN" ? input.quantity : input.type === "OUT" ? -input.quantity : undefined,
      setTo: input.type === "ADJUSTMENT" ? input.quantity : undefined,
      note: input.note,
    }),
  );
}

export type TransferInput = {
  fromStoreId: number;
  toStoreId: number;
  itemId: number;
  quantity: number;
  note?: string | null;
};

/** Pindahkan stok antar cabang dalam satu transaksi database. */
export async function transferStock(input: TransferInput) {
  if (input.fromStoreId === input.toStoreId) {
    throw new StockError("Cabang asal dan tujuan harus berbeda");
  }
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new StockError("Jumlah transfer harus bilangan bulat > 0");
  }
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.stockTransfer.create({ data: { ...input, note: input.note || null } });
    // Kunci baris dengan urutan id cabang yang tetap untuk menghindari deadlock.
    const steps = [
      { storeId: input.fromStoreId, type: StockLogType.TRANSFER_OUT, delta: -input.quantity },
      { storeId: input.toStoreId, type: StockLogType.TRANSFER_IN, delta: input.quantity },
    ].sort((a, b) => a.storeId - b.storeId);
    for (const s of steps) {
      await applyChange(tx, { ...s, itemId: input.itemId, note: input.note, transferId: transfer.id });
    }
    return transfer;
  });
}

/** Daftar stok kritis/habis di semua cabang, yang paling parah lebih dulu. */
export async function getCriticalStock(storeId?: number) {
  const inv = await prisma.storeInventory.findMany({
    where: {
      quantity: { lte: prisma.storeInventory.fields.minThresholdQty },
      ...(storeId ? { storeId } : {}),
    },
    include: { store: true, item: true },
  });
  return inv
    .map((r) => ({ ...r, status: stockStatus(r.quantity, r.minThresholdQty) }))
    .sort((a, b) => a.quantity / Math.max(a.minThresholdQty, 1) - b.quantity / Math.max(b.minThresholdQty, 1));
}

/**
 * Cabang lain yang punya stok berlebih untuk barang yang sama, sebagai saran transfer.
 * `surplus` = jumlah yang bisa dikirim tanpa membuat cabang sumber ikut kritis.
 */
export async function suggestSources(itemId: number, excludeStoreId: number) {
  const rows = await prisma.storeInventory.findMany({
    where: { itemId, storeId: { not: excludeStoreId } },
    include: { store: true },
  });
  return rows
    .map((r) => ({ store: r.store, surplus: r.quantity - r.minThresholdQty - 1 }))
    .filter((r) => r.surplus > 0)
    .sort((a, b) => b.surplus - a.surplus);
}
