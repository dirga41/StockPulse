import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "./session";

/** Sesi pengguna yang sedang login (untuk Server Component / Server Action). */
export async function getSession() {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}
