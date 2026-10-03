import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const typeLabel = {
  IN: "Masuk",
  OUT: "Keluar",
  ADJUSTMENT: "Opname",
  TRANSFER_IN: "Transfer masuk",
  TRANSFER_OUT: "Transfer keluar",
} as const;

export default async function RiwayatPage({ searchParams }: PageProps<"/riwayat">) {
  const sp = await searchParams;
  const storeId = Number(sp.storeId) || undefined;

  const [stores, logs] = await Promise.all([
    prisma.store.findMany({ orderBy: { code: "asc" } }),
    prisma.stockLog.findMany({
      where: { storeId },
      include: { store: true, item: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Riwayat Mutasi Stok</h1>
        <p className="text-sm text-slate-500">Audit trail semua perubahan stok (200 terakhir).</p>
      </div>
      <section className="card">
        <div className="mb-3 flex flex-wrap gap-2">
          <Link href="/riwayat" className={`rounded-full px-3 py-1 text-xs font-medium ${!storeId ? "bg-slate-900 text-white" : "bg-slate-100"}`}>Semua</Link>
          {stores.map((s) => (
            <Link key={s.id} href={`/riwayat?storeId=${s.id}`} className={`rounded-full px-3 py-1 text-xs font-medium ${storeId === s.id ? "bg-slate-900 text-white" : "bg-slate-100"}`}>
              {s.code}
            </Link>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Cabang</th>
                <th>Barang</th>
                <th>Jenis</th>
                <th className="text-right">Perubahan</th>
                <th className="text-right">Sebelum → Sesudah</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap">{l.createdAt.toLocaleString("id-ID")}</td>
                  <td>{l.store.code}</td>
                  <td>{l.item.name}</td>
                  <td>{typeLabel[l.type]}{l.transferId ? ` #${l.transferId}` : ""}</td>
                  <td className={`text-right font-semibold ${l.qtyChange >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {l.qtyChange >= 0 ? "+" : ""}{l.qtyChange}
                  </td>
                  <td className="text-right text-slate-500">{l.qtyBefore} → {l.qtyAfter}</td>
                  <td className="text-slate-500">{l.note ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
