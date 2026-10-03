import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/** Semua halaman dan API wajib login, kecuali halaman /login. */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    return session ? NextResponse.redirect(new URL("/", req.url)) : NextResponse.next();
  }
  if (session) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return Response.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }
  const url = new URL("/login", req.url);
  if (pathname !== "/") url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|icon.svg|favicon.ico).*)"],
};
