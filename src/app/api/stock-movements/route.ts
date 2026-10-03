import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, intParam } from "@/lib/api";
import { recordMovement } from "@/lib/stock";
import { movementSchema } from "@/lib/validation";

// GET /api/stock-movements?storeId=1&itemId=2&limit=50
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const storeId = intParam(q.get("storeId"));
  const itemId = intParam(q.get("itemId"));
  const logs = await prisma.stockLog.findMany({
    where: { storeId, itemId },
    include: { store: true, item: true },
    orderBy: { createdAt: "desc" },
    take: Math.min(intParam(q.get("limit")) ?? 50, 500),
  });
  return Response.json(logs);
}

// POST /api/stock-movements  { storeId, itemId, type: "IN"|"OUT"|"ADJUSTMENT", quantity, note? }
export async function POST(req: Request) {
  try {
    const log = await recordMovement(movementSchema.parse(await req.json()));
    return Response.json(log, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
