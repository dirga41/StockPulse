import { prisma } from "@/lib/prisma";
import { createStore } from "@/lib/catalog";
import { errorResponse } from "@/lib/api";
import { storeSchema } from "@/lib/validation";

export async function GET() {
  const stores = await prisma.store.findMany({ orderBy: { code: "asc" } });
  return Response.json(stores);
}

export async function POST(req: Request) {
  try {
    const store = await createStore(storeSchema.parse(await req.json()));
    return Response.json(store, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
