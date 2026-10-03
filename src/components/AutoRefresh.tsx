"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Muat ulang data server secara berkala agar dashboard selalu terkini. */
export function AutoRefresh({ seconds = 15 }: { seconds?: number }) {
  const router = useRouter();
  const [last, setLast] = useState<Date | null>(null);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
        setLast(new Date());
      }
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);

  return (
    <span className="inline-flex items-center gap-2 text-xs text-slate-500">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      Live · {last ? `diperbarui ${last.toLocaleTimeString("id-ID")}` : `refresh tiap ${seconds} detik`}
    </span>
  );
}
