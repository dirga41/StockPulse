import { prisma } from "@/lib/prisma";
import { createItem } from "@/lib/catalog";
import { errorResponse } from "@/lib/api";
import { itemSchema } from "@/lib/validation";

export async function GET() {
  const items = await prisma.item.findMany({ include: { category: true }, orderBy: { sku: "asc" } });
  return Response.json(items);
}

export async function POST(req: Request) {
  try {
    const item = await createItem(itemSchema.parse(await req.json()));
    return Response.json(item, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
