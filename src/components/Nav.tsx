"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/stok", label: "Stok" },
  { href: "/transfer", label: "Transfer" },
  { href: "/riwayat", label: "Riwayat" },
  { href: "/master", label: "Cabang & Barang" },
];

export function Nav({ criticalCount }: { criticalCount: number }) {
  const path = usePathname();
  return (
    <nav className="flex flex-wrap gap-1">
      {links.map((l) => {
        const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {l.label}
            {l.href === "/" && criticalCount > 0 && (
              <span className="ml-1.5 rounded-full bg-red-600 px-1.5 text-xs text-white">{criticalCount}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
