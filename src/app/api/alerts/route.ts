import type { NextRequest } from "next/server";
import { intParam } from "@/lib/api";
import { getCriticalStock, suggestSources } from "@/lib/stock";

// GET /api/alerts?storeId=1 — stok kritis beserta saran cabang sumber transfer
export async function GET(req: NextRequest) {
  const alerts = await getCriticalStock(intParam(req.nextUrl.searchParams.get("storeId")));
  const withSuggestions = await Promise.all(
    alerts.map(async (a) => ({
      ...a,
      suggestedSources: (await suggestSources(a.itemId, a.storeId)).slice(0, 3),
    })),
  );
  return Response.json(withSuggestions);
}
