import { Prisma } from "@prisma/client";
import { z } from "zod";
import { StockError } from "./stock";
import { firstIssue } from "./validation";

export function errorResponse(err: unknown) {
  if (err instanceof z.ZodError) return Response.json({ error: firstIssue(err) }, { status: 400 });
  if (err instanceof StockError) return Response.json({ error: err.message }, { status: 422 });
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return Response.json({ error: "Data dengan kode yang sama sudah ada" }, { status: 409 });
  }
  console.error(err);
  return Response.json({ error: "Terjadi kesalahan server" }, { status: 500 });
}

/** Ubah error menjadi pesan untuk ditampilkan di form (server action). */
export function errorMessage(err: unknown) {
  if (err instanceof z.ZodError) return firstIssue(err);
  if (err instanceof StockError) return err.message;
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    return "Data dengan kode yang sama sudah ada";
  }
  console.error(err);
  return "Terjadi kesalahan server";
}

export function intParam(value: string | null) {
  const n = Number(value);
  return value && Number.isInteger(n) && n > 0 ? n : undefined;
}
