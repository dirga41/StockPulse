"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";

export type LoginState = { error: string; username: string } | null;

export async function loginAction(_: LoginState, form: FormData): Promise<LoginState> {
  const username = String(form.get("username") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!username || !password) return { error: "Username dan password wajib diisi", username };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Username atau password salah", username };
  }

  (await cookies()).set(SESSION_COOKIE, createSessionToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  // Hanya izinkan redirect ke path internal.
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/");
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
