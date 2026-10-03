import { prisma } from "@/lib/prisma";
import { transferAction } from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";
import { Select } from "@/components/Selects";

export const dynamic = "force-dynamic";

export default async function TransferPage({ searchParams }: PageProps<"/transfer">) {
  const sp = await searchParams;
  const num = (k: string) => Number(sp[k]) || undefined;

  const [stores, items, transfers] = await Promise.all([
    prisma.store.findMany({ orderBy: { code: "asc" } }),
    prisma.item.findMany({ orderBy: { sku: "asc" } }),
    prisma.stockTransfer.findMany({
      include: { fromStore: true, toStore: true, item: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);
  const storeOpts = stores.map((s) => ({ id: s.id, label: s.name }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transfer Antar Cabang</h1>
        <p className="text-sm text-slate-500">Stok berkurang di cabang asal dan bertambah di cabang tujuan dalam satu transaksi.</p>
      </div>

      <section className="card">
        <ActionForm action={transferAction} submitLabel="Transfer stok" className="grid gap-3 md:grid-cols-5 md:items-end">
          <Select name="fromStoreId" label="Dari cabang" options={storeOpts} defaultValue={num("fromStoreId")} />
          <Select name="toStoreId" label="Ke cabang" options={storeOpts} defaultValue={num("toStoreId")} />
          <Select name="itemId" label="Barang" options={items.map((i) => ({ id: i.id, label: `${i.sku} · ${i.name}` }))} defaultValue={num("itemId")} />
          <label className="block">
            <span className="label">Jumlah</span>
            <input name="quantity" type="number" min={1} required defaultValue={num("quantity")} className="input" />
          </label>
          <label className="block">
            <span className="label">Catatan</span>
            <input name="note" className="input" placeholder="opsional" />
          </label>
        </ActionForm>
      </section>

      <section className="card">
        <h2 className="mb-3 font-semibold">Riwayat transfer</h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Waktu</th>
                <th>Dari</th>
                <th>Ke</th>
                <th>Barang</th>
                <th className="text-right">Jumlah</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id}>
                  <td className="text-slate-500">{t.id}</td>
                  <td className="whitespace-nowrap">{t.createdAt.toLocaleString("id-ID")}</td>
                  <td>{t.fromStore.name}</td>
                  <td>{t.toStore.name}</td>
                  <td>{t.item.name}</td>
                  <td className="text-right font-semibold">{t.quantity} {t.item.unit}</td>
                  <td className="text-slate-500">{t.note ?? "-"}</td>
                </tr>
              ))}
              {transfers.length === 0 && (
                <tr><td colSpan={7} className="py-6 text-center text-slate-500">Belum ada transfer.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
