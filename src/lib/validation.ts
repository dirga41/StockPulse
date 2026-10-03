import { z } from "zod";

const id = z.coerce.number().int().positive();
const note = z.string().trim().max(500).optional().nullable();

export const storeSchema = z.object({
  code: z.string().trim().min(2).max(10).transform((s) => s.toUpperCase()),
  name: z.string().trim().min(2).max(100),
  address: z.string().trim().max(255).optional().nullable(),
});

export const itemSchema = z.object({
  sku: z.string().trim().min(2).max(30).transform((s) => s.toUpperCase()),
  name: z.string().trim().min(2).max(100),
  unit: z.string().trim().min(1).max(20).default("pcs"),
  categoryName: z.string().trim().max(50).optional().nullable(),
  defaultMinThreshold: z.coerce.number().int().min(0).default(10),
});

export const movementSchema = z.object({
  storeId: id,
  itemId: id,
  type: z.enum(["IN", "OUT", "ADJUSTMENT"]),
  quantity: z.coerce.number().int().min(0),
  note,
});

export const transferSchema = z.object({
  fromStoreId: id,
  toStoreId: id,
  itemId: id,
  quantity: z.coerce.number().int().positive(),
  note,
});

export const thresholdSchema = z.object({
  minThresholdQty: z.coerce.number().int().min(0),
});

/** Pesan error pertama dari zod dalam bentuk yang mudah dibaca. */
export function firstIssue(err: z.ZodError) {
  const issue = err.issues[0];
  return issue ? `${issue.path.join(".") || "input"}: ${issue.message}` : "Input tidak valid";
}
