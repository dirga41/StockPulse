import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCriticalStock, suggestSources } from "@/lib/stock";
import { AutoRefresh } from "@/components/AutoRefresh";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [stores, itemCount, totals, critical, recent] = await Promise.all([
    prisma.store.findMany({ orderBy: { code: "asc" } }),
    prisma.item.count(),
    prisma.storeInventory.groupBy({ by: ["storeId"], _sum: { quantity: true } }),
    getCriticalStock(),
    prisma.stockLog.findMany({ include: { store: true, item: true }, orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const suggestions = await Promise.all(critical.map((c) => suggestSources(c.itemId, c.storeId)));
  const habis = critical.filter((c) => c.status === "HABIS").length;

  const perStore = stores.map((s) => ({
    store: s,
    units: totals.find((t) => t.storeId === s.id)?._sum.quantity ?? 0,
    critical: critical.filter((c) => c.storeId === s.id).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Stok</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ringkasan stok seluruh cabang</p>
        </div>
        <AutoRefresh />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Cabang" value={stores.length} />
        <Stat label="Jenis barang" value={itemCount} />
        <Stat label="Stok kritis" value={critical.length - habis} tone={critical.length - habis ? "amber" : undefined} />
        <Stat label="Stok habis" value={habis} tone={habis ? "red" : undefined} />
      </div>

      <section className="card">
        <h2 className="mb-3 font-semibold">Ringkasan per cabang</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {perStore.map(({ store, units, critical }) => (
            <Link
              key={store.id}
              href={`/stok?storeId=${store.id}`}
              className={`rounded-lg border p-4 hover:shadow ${critical ? "border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30" : "border-slate-200 dark:border-slate-800"}`}
            >
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">{store.code}</div>
              <div className="font-medium">{store.name}</div>
              <div className="mt-2 flex justify-between text-sm">
                <span>{units.toLocaleString("id-ID")} unit</span>
                <span className={critical ? "font-semibold text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}>
                  {critical ? `${critical} item kritis` : "Semua aman"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="card">
        <h2 className="mb-1 font-semibold">⚠️ Alert stok kritis</h2>
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Barang dengan stok di bawah atau sama dengan ambang batas minimum.</p>
        {critical.length === 0 ? (
          <p className="text-sm text-emerald-700 dark:text-emerald-400">Tidak ada stok kritis. 🎉</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Cabang</th>
                  <th>Barang</th>
                  <th className="text-right">Stok</th>
                  <th className="text-right">Minimum</th>
                  <th>Saran transfer dari</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {critical.map((c, i) => {
                  const best = suggestions[i][0];
                  return (
                    <tr key={c.id} className={c.status === "HABIS" ? "bg-red-50 dark:bg-red-950/40" : ""}>
                      <td><StatusBadge status={c.status} /></td>
                      <td>{c.store.name}</td>
                      <td>
                        {c.item.name} <span className="text-xs text-slate-400 dark:text-slate-500">{c.item.sku}</span>
                      </td>
                      <td className="text-right font-semibold">{c.quantity} {c.item.unit}</td>
                      <td className="text-right text-slate-500 dark:text-slate-400">{c.minThresholdQty}</td>
                      <td className="text-sm">
                        {best ? `${best.store.name} (bisa kirim ${best.surplus})` : <span className="text-slate-400 dark:text-slate-500">Tidak ada, perlu pembelian</span>}
                      </td>
                      <td>
                        {best && (
                          <Link
                            className="text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                            href={`/transfer?itemId=${c.itemId}&toStoreId=${c.storeId}&fromStoreId=${best.store.id}&quantity=${Math.min(best.surplus, Math.max(c.minThresholdQty * 2 - c.quantity, 1))}`}
                          >
                            Transfer →
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Mutasi terakhir</h2>
          <Link href="/riwayat" className="text-sm text-emerald-700 dark:text-emerald-400 hover:underline">Lihat semua</Link>
        </div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
          {recent.map((l) => (
            <li key={l.id} className="flex justify-between gap-2 py-2">
              <span>
                <span className="font-medium">{l.item.name}</span> · {l.store.name}
              </span>
              <span className={l.qtyChange >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}>
                {l.qtyChange >= 0 ? "+" : ""}{l.qtyChange} ({l.type.replace("_", " ")})
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: "amber" | "red" }) {
  const color = tone === "red" ? "text-red-600 dark:text-red-400" : tone === "amber" ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white";
  return (
    <div className="card">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`mt-1 text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
