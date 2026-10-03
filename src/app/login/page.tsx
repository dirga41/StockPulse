import { Logo } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Masuk · StockPulse" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>
        <div className="card">
          <h1 className="text-lg font-semibold">Masuk</h1>
          <p className="mb-5 text-sm text-slate-500">Gunakan akun StockPulse Anda.</p>
          <LoginForm next={typeof next === "string" ? next : ""} />
        </div>
      </div>
    </main>
  );
}
