import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const stores = [];
  for (const s of [
      { code: "JKT", name: "Cabang Jakarta Pusat", address: "Jl. Merdeka No. 1, Jakarta" },
      { code: "BDG", name: "Cabang Bandung", address: "Jl. Asia Afrika No. 10, Bandung" },
      { code: "SBY", name: "Cabang Surabaya", address: "Jl. Pemuda No. 5, Surabaya" },
  ]) {
    stores.push(await prisma.store.upsert({ where: { code: s.code }, update: {}, create: s }));
  }

  const cats: Record<string, number> = {};
  for (const name of ["Bahan Baku", "Kemasan", "Perlengkapan"]) {
    cats[name] = (await prisma.category.upsert({ where: { name }, update: {}, create: { name } })).id;
  }

  const items = [
    { sku: "BB-001", name: "Biji Kopi Arabika", unit: "kg", defaultMinThreshold: 15, categoryId: cats["Bahan Baku"] },
    { sku: "BB-002", name: "Susu UHT", unit: "liter", defaultMinThreshold: 30, categoryId: cats["Bahan Baku"] },
    { sku: "BB-003", name: "Gula Aren Cair", unit: "liter", defaultMinThreshold: 10, categoryId: cats["Bahan Baku"] },
    { sku: "KM-001", name: "Cup Plastik 16oz", unit: "pcs", defaultMinThreshold: 200, categoryId: cats["Kemasan"] },
    { sku: "KM-002", name: "Tutup Cup", unit: "pcs", defaultMinThreshold: 200, categoryId: cats["Kemasan"] },
    { sku: "KM-003", name: "Paper Bag", unit: "pcs", defaultMinThreshold: 100, categoryId: cats["Kemasan"] },
    { sku: "PL-001", name: "Tisu Makan", unit: "pak", defaultMinThreshold: 20, categoryId: cats["Perlengkapan"] },
    { sku: "PL-002", name: "Sabun Cuci Piring", unit: "botol", defaultMinThreshold: 5, categoryId: cats["Perlengkapan"] },
  ];
  const created = [];
  for (const i of items) {
    created.push(await prisma.item.upsert({ where: { sku: i.sku }, update: {}, create: i }));
  }

  // Jumlah awal per cabang (urutan sesuai `items`); beberapa sengaja di bawah ambang batas.
  const qty: Record<string, number[]> = {
    JKT: [40, 12, 25, 800, 650, 300, 60, 3],
    BDG: [8, 55, 4, 150, 420, 0, 35, 12],
    SBY: [22, 90, 18, 520, 90, 210, 15, 9],
  };

  for (const store of stores) {
    for (const [idx, item] of created.entries()) {
      const exists = await prisma.storeInventory.findUnique({
        where: { storeId_itemId: { storeId: store.id, itemId: item.id } },
      });
      if (exists) continue;
      const q = qty[store.code][idx];
      await prisma.storeInventory.create({
        data: { storeId: store.id, itemId: item.id, quantity: q, minThresholdQty: item.defaultMinThreshold },
      });
      await prisma.stockLog.create({
        data: {
          storeId: store.id,
          itemId: item.id,
          type: "ADJUSTMENT",
          qtyChange: q,
          qtyBefore: 0,
          qtyAfter: q,
          note: "Stok awal (seed)",
        },
      });
    }
  }
  // Akun awal; segera ganti password dengan `npm run user:create`.
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", name: "Administrator", passwordHash: await hashPassword("admin123") },
  });

  console.log(`Seed selesai: ${stores.length} cabang, ${created.length} barang.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
