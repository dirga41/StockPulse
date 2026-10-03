import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { errorResponse, intParam } from "@/lib/api";
import { thresholdSchema } from "@/lib/validation";

// PATCH /api/inventory/:id  { "minThresholdQty": 20 }
export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/inventory/[id]">) {
  const id = intParam((await ctx.params).id);
  if (!id) return Response.json({ error: "id tidak valid" }, { status: 400 });
  try {
    const data = thresholdSchema.parse(await req.json());
    const row = await prisma.storeInventory.update({ where: { id }, data });
    return Response.json(row);
  } catch (err) {
    return errorResponse(err);
  }
}
