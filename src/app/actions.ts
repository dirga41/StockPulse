"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createItem, createStore } from "@/lib/catalog";
import { errorMessage } from "@/lib/api";
import { recordMovement, transferStock } from "@/lib/stock";
import { itemSchema, movementSchema, storeSchema, thresholdSchema, transferSchema } from "@/lib/validation";

export type ActionState = { ok: boolean; message: string } | null;

function fields(form: FormData) {
  return Object.fromEntries([...form.entries()].map(([k, v]) => [k, typeof v === "string" && v === "" ? undefined : v]));
}

async function run(fn: () => Promise<string>): Promise<ActionState> {
  try {
    const message = await fn();
    revalidatePath("/", "layout");
    return { ok: true, message };
  } catch (err) {
    return { ok: false, message: errorMessage(err) };
  }
}

export async function movementAction(_: ActionState, form: FormData) {
  return run(async () => {
    const log = await recordMovement(movementSchema.parse(fields(form)));
    return `Stok tercatat: ${log.qtyBefore} → ${log.qtyAfter}`;
  });
}

export async function transferAction(_: ActionState, form: FormData) {
  return run(async () => {
    const t = await transferStock(transferSchema.parse(fields(form)));
    return `Transfer #${t.id} berhasil (${t.quantity} unit)`;
  });
}

export async function storeAction(_: ActionState, form: FormData) {
  return run(async () => {
    const s = await createStore(storeSchema.parse(fields(form)));
    return `Cabang ${s.name} ditambahkan`;
  });
}

export async function itemAction(_: ActionState, form: FormData) {
  return run(async () => {
    const i = await createItem(itemSchema.parse(fields(form)));
    return `Barang ${i.name} ditambahkan ke semua cabang`;
  });
}

export async function thresholdAction(_: ActionState, form: FormData) {
  return run(async () => {
    const id = Number(form.get("id"));
    const data = thresholdSchema.parse(fields(form));
    await prisma.storeInventory.update({ where: { id }, data: { minThresholdQty: data.minThresholdQty } });
    return "Ambang batas diperbarui";
  });
}
