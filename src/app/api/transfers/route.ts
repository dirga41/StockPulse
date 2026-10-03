import { prisma } from "@/lib/prisma";
import { errorResponse } from "@/lib/api";
import { transferStock } from "@/lib/stock";
import { transferSchema } from "@/lib/validation";

export async function GET() {
  const transfers = await prisma.stockTransfer.findMany({
    include: { fromStore: true, toStore: true, item: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return Response.json(transfers);
}

// POST /api/transfers  { fromStoreId, toStoreId, itemId, quantity, note? }
export async function POST(req: Request) {
  try {
    const transfer = await transferStock(transferSchema.parse(await req.json()));
    return Response.json(transfer, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
