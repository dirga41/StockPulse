import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "sp_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export type Session = { uid: number; username: string; name: string; exp: number };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 16) throw new Error("AUTH_SECRET belum diatur di .env (minimal 16 karakter)");
  return s;
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

/** Token sesi = payload JSON (base64url) + tanda tangan HMAC, disimpan di cookie httpOnly. */
export function createSessionToken(user: { id: number; username: string; name: string }) {
  const session: Session = {
    uid: user.id,
    username: user.username,
    name: user.name,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString()) as Session;
    return session.exp > Date.now() / 1000 ? session : null;
  } catch {
    return null;
  }
}
