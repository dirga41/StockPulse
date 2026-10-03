import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/login");

  const criticalCount = await prisma.storeInventory.count({
    where: { quantity: { lte: prisma.storeInventory.fields.minThresholdQty } },
  });
  return (
    <div className="min-h-screen">
      <Sidebar criticalCount={criticalCount} userName={session.name} />
      <main className="px-4 py-6 md:ml-64 md:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
