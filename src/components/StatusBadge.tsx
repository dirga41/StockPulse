import type { StockStatus } from "@/lib/stock";

const styles: Record<StockStatus, string> = {
  HABIS: "bg-red-600 text-white",
  KRITIS: "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-700",
  AMAN: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800",
};

const labels: Record<StockStatus, string> = { HABIS: "Habis", KRITIS: "Kritis", AMAN: "Aman" };

export function StatusBadge({ status }: { status: StockStatus }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
