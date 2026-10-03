import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { intParam } from "@/lib/api";
import { stockStatus } from "@/lib/stock";

// GET /api/inventory?storeId=1&status=KRITIS
export async function GET(req: NextRequest) {
  const storeId = intParam(req.nextUrl.searchParams.get("storeId"));
  const status = req.nextUrl.searchParams.get("status");
  const rows = await prisma.storeInventory.findMany({
    where: storeId ? { storeId } : undefined,
    include: { store: true, item: { include: { category: true } } },
    orderBy: [{ store: { code: "asc" } }, { item: { sku: "asc" } }],
  });
  const result = rows
    .map((r) => ({ ...r, status: stockStatus(r.quantity, r.minThresholdQty) }))
    .filter((r) => !status || r.status === status);
  return Response.json(result);
}
