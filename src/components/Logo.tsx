/** Logo StockPulse: lambang "SP" dan nama aplikasi. */
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-12 w-12 text-lg rounded-xl" : "h-8 w-8 text-xs rounded-lg";
  const text = size === "lg" ? "text-2xl" : "text-lg";
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`inline-flex items-center justify-center bg-emerald-600 font-bold text-white ${box}`}>SP</span>
      <span className={`font-bold tracking-tight text-slate-900 dark:text-white ${text}`}>
        Stock<span className="text-emerald-600 dark:text-emerald-400">Pulse</span>
      </span>
    </span>
  );
}
