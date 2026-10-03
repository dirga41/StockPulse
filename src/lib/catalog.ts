import { prisma } from "./prisma";
import { itemSchema, storeSchema } from "./validation";
import type { z } from "zod";

/** Cabang baru otomatis mendapat baris stok 0 untuk semua barang. */
export async function createStore(input: z.infer<typeof storeSchema>) {
  return prisma.$transaction(async (tx) => {
    const store = await tx.store.create({ data: input });
    const items = await tx.item.findMany();
    await tx.storeInventory.createMany({
      data: items.map((i) => ({ storeId: store.id, itemId: i.id, minThresholdQty: i.defaultMinThreshold })),
    });
    return store;
  });
}

/** Barang baru otomatis tercatat di semua cabang dengan stok 0 dan ambang batas default. */
export async function createItem(input: z.infer<typeof itemSchema>) {
  const { categoryName, ...data } = input;
  return prisma.$transaction(async (tx) => {
    const category = categoryName
      ? await tx.category.upsert({ where: { name: categoryName }, update: {}, create: { name: categoryName } })
      : null;
    const item = await tx.item.create({ data: { ...data, categoryId: category?.id } });
    const stores = await tx.store.findMany();
    await tx.storeInventory.createMany({
      data: stores.map((s) => ({ storeId: s.id, itemId: item.id, minThresholdQty: item.defaultMinThreshold })),
    });
    return item;
  });
}
