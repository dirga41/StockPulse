import type { StockStatus } from "@/lib/stock";

const styles: Record<StockStatus, string> = {
  HABIS: "bg-red-600 text-white",
  KRITIS: "bg-amber-100 text-amber-800 ring-1 ring-amber-300",
  AMAN: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};

const labels: Record<StockStatus, string> = { HABIS: "Habis", KRITIS: "Kritis", AMAN: "Aman" };

export function StatusBadge({ status }: { status: StockStatus }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
