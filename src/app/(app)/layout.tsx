import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Nav } from "@/components/Nav";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logoutAction } from "@/app/auth-actions";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/login");

  const criticalCount = await prisma.storeInventory.count({
    where: { quantity: { lte: prisma.storeInventory.fields.minThresholdQty } },
  });
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Logo />
          <div className="flex flex-wrap items-center gap-3">
            <Nav criticalCount={criticalCount} />
            <form action={logoutAction} className="flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="text-sm text-slate-600">{session.name}</span>
              <button type="submit" className="rounded-md px-2 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </>
  );
}
