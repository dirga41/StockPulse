"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/auth-actions";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { href: "/", label: "Dashboard", icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" },
  { href: "/stok", label: "Stok", icon: "M21 8l-9-5-9 5v8l9 5 9-5V8zM3.3 7.6L12 12.5l8.7-4.9M12 22V12.5" },
  { href: "/transfer", label: "Transfer", icon: "M7 7h13l-4-4M17 17H4l4 4" },
  { href: "/riwayat", label: "Riwayat", icon: "M12 8v4l3 2M3.05 11a9 9 0 1 1 .5 4M3 4v5h5" },
  { href: "/master", label: "Cabang & Barang", icon: "M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1M10 21v-4h4v4" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function Sidebar({ criticalCount, userName }: { criticalCount: number; userName: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bar atas untuk layar kecil */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden dark:border-slate-800 dark:bg-slate-900">
        <Logo />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Buka menu"
          className="rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Icon d="M3 6h18M3 12h18M3 18h18" />
        </button>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
          >
            <Icon d="M6 6l12 12M18 6L6 18" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-slate-900 text-white dark:bg-emerald-600"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                <Icon d={l.icon} />
                <span className="flex-1">{l.label}</span>
                {l.href === "/" && criticalCount > 0 && (
                  <span className="rounded-full bg-red-600 px-1.5 text-xs text-white" title="Stok kritis">
                    {criticalCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-slate-200 p-3 dark:border-slate-800">
          <ThemeToggle withLabel />
          <form action={logoutAction} className="flex items-center justify-between gap-2 px-2 py-1.5">
            <span className="truncate text-sm text-slate-600 dark:text-slate-300">{userName}</span>
            <button
              type="submit"
              className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Keluar
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
