import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { stockStatus, type StockStatus } from "@/lib/stock";
import { movementAction, thresholdAction } from "@/app/actions";
import { ActionForm } from "@/components/ActionForm";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Select } from "@/components/Selects";
import { StatusBadge } from "@/components/StatusBadge";

export const dynamic = "force-dynamic";

export default async function StokPage({ searchParams }: PageProps<"/stok">) {
  const sp = await searchParams;
  const storeId = Number(sp.storeId) || undefined;
  const status = (typeof sp.status === "string" ? sp.status : undefined) as StockStatus | undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const [stores, items, rows] = await Promise.all([
    prisma.store.findMany({ orderBy: { code: "asc" } }),
    prisma.item.findMany({ orderBy: { sku: "asc" } }),
    prisma.storeInventory.findMany({
      where: {
        storeId,
        item: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : undefined,
      },
      include: { store: true, item: { include: { category: true } } },
      orderBy: [{ store: { code: "asc" } }, { item: { sku: "asc" } }],
    }),
  ]);

  const inventory = rows
    .map((r) => ({ ...r, status: stockStatus(r.quantity, r.minThresholdQty) }))
    .filter((r) => !status || r.status === status);

  const filterHref = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { storeId: storeId?.toString(), status, q: q || undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) p.set(k, v);
    return `/stok?${p}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Stok per Cabang</h1>
          <p className="text-sm text-slate-500">Catat barang masuk, keluar, dan stock opname.</p>
        </div>
        <AutoRefresh />
      </div>

      <section className="card">
        <h2 className="mb-3 font-semibold">Catat mutasi stok</h2>
        <ActionForm action={movementAction} submitLabel="Simpan mutasi" className="grid gap-3 md:grid-cols-6 md:items-end">
          <div className="md:col-span-1">
            <Select name="storeId" label="Cabang" defaultValue={storeId} options={stores.map((s) => ({ id: s.id, label: s.name }))} />
          </div>
          <div className="md:col-span-2">
            <Select name="itemId" label="Barang" options={items.map((i) => ({ id: i.id, label: `${i.sku} · ${i.name}` }))} />
          </div>
          <label className="block">
            <span className="label">Jenis</span>
            <select name="type" className="input" defaultValue="IN">
              <option value="IN">Masuk (+)</option>
              <option value="OUT">Keluar (−)</option>
              <option value="ADJUSTMENT">Opname (set jumlah)</option>
            </select>
          </label>
          <label className="block">
            <span className="label">Jumlah</span>
            <input name="quantity" type="number" min={0} required className="input" />
          </label>
          <label className="block">
            <span className="label">Catatan</span>
            <input name="note" className="input" placeholder="opsional" />
          </label>
        </ActionForm>
      </section>

      <section className="card">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <FilterChip href={filterHref({ storeId: undefined })} active={!storeId}>Semua cabang</FilterChip>
          {stores.map((s) => (
            <FilterChip key={s.id} href={filterHref({ storeId: String(s.id) })} active={storeId === s.id}>{s.code}</FilterChip>
          ))}
          <span className="mx-2 h-5 w-px bg-slate-200" />
          <FilterChip href={filterHref({ status: undefined })} active={!status}>Semua status</FilterChip>
          {(["HABIS", "KRITIS", "AMAN"] as const).map((s) => (
            <FilterChip key={s} href={filterHref({ status: s })} active={status === s}>{s.charAt(0) + s.slice(1).toLowerCase()}</FilterChip>
          ))}
          <form className="ml-auto" action="/stok">
            {storeId && <input type="hidden" name="storeId" value={storeId} />}
            {status && <input type="hidden" name="status" value={status} />}
            <input name="q" defaultValue={q} placeholder="Cari barang / SKU" className="input w-48" />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Cabang</th>
                <th>SKU</th>
                <th>Barang</th>
                <th>Kategori</th>
                <th className="text-right">Stok</th>
                <th>Min. (ambang kritis)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((r) => (
                <tr key={r.id} className={r.status === "HABIS" ? "bg-red-50" : r.status === "KRITIS" ? "bg-amber-50/60" : ""}>
                  <td className="whitespace-nowrap">{r.store.code}</td>
                  <td className="text-slate-500">{r.item.sku}</td>
                  <td>{r.item.name}</td>
                  <td className="text-slate-500">{r.item.category?.name ?? "-"}</td>
                  <td className="text-right font-semibold">
                    {r.quantity.toLocaleString("id-ID")} <span className="font-normal text-slate-500">{r.item.unit}</span>
                  </td>
                  <td>
                    <ActionForm action={thresholdAction} submitLabel="Ubah" resetOnSuccess={false} className="flex items-center gap-2 [&_.btn-primary]:px-2 [&_.btn-primary]:py-1 [&_.btn-primary]:text-xs">
                      <input type="hidden" name="id" value={r.id} />
                      <input name="minThresholdQty" type="number" min={0} defaultValue={r.minThresholdQty} className="input w-20 py-1" />
                    </ActionForm>
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr><td colSpan={7} className="py-6 text-center text-slate-500">Tidak ada data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`rounded-full px-3 py-1 text-xs font-medium ${active ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
      {children}
    </Link>
  );
}
