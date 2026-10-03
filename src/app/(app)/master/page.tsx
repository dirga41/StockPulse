import { prisma } from "@/lib/prisma";
import { itemAction, storeAction } from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";

export const dynamic = "force-dynamic";

export default async function MasterPage() {
  const [stores, items] = await Promise.all([
    prisma.store.findMany({ orderBy: { code: "asc" } }),
    prisma.item.findMany({ include: { category: true }, orderBy: { sku: "asc" } }),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Cabang</h2>
        <ActionForm action={storeAction} submitLabel="Tambah cabang" className="grid gap-3 sm:grid-cols-2">
          <label><span className="label">Kode</span><input name="code" required className="input" placeholder="MDN" /></label>
          <label><span className="label">Nama</span><input name="name" required className="input" placeholder="Cabang Medan" /></label>
          <label className="sm:col-span-2"><span className="label">Alamat</span><input name="address" className="input" /></label>
        </ActionForm>
        <table className="table">
          <thead><tr><th>Kode</th><th>Nama</th><th>Alamat</th></tr></thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}><td className="font-medium">{s.code}</td><td>{s.name}</td><td className="text-slate-500 dark:text-slate-400">{s.address ?? "-"}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Barang</h2>
        <ActionForm action={itemAction} submitLabel="Tambah barang" className="grid gap-3 sm:grid-cols-2">
          <label><span className="label">SKU</span><input name="sku" required className="input" placeholder="BB-004" /></label>
          <label><span className="label">Nama</span><input name="name" required className="input" /></label>
          <label><span className="label">Satuan</span><input name="unit" className="input" placeholder="pcs" /></label>
          <label><span className="label">Kategori</span><input name="categoryName" className="input" placeholder="Bahan Baku" /></label>
          <label className="sm:col-span-2"><span className="label">Ambang batas minimum default</span><input name="defaultMinThreshold" type="number" min={0} className="input" placeholder="10" /></label>
        </ActionForm>
        <table className="table">
          <thead><tr><th>SKU</th><th>Nama</th><th>Kategori</th><th className="text-right">Min. default</th></tr></thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}><td className="font-medium">{i.sku}</td><td>{i.name} <span className="text-xs text-slate-400 dark:text-slate-500">/{i.unit}</span></td><td className="text-slate-500 dark:text-slate-400">{i.category?.name ?? "-"}</td><td className="text-right">{i.defaultMinThreshold}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
