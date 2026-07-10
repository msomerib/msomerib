import crypto from "crypto";
import { cookies } from "next/headers";
import { getUserById, type User } from "./db";

const COOKIE_NAME = "leitura_session";
const SECRET = process.env.SESSION_SECRET || "leitura-em-familia-dev-secret";

function sign(userId: number): string {
  const hmac = crypto.createHmac("sha256", SECRET).update(String(userId)).digest("hex");
  return `${userId}.${hmac}`;
}

function verify(token: string): number | null {
  const [idPart, sig] = token.split(".");
  if (!idPart || !sig) return null;
  const expected = crypto.createHmac("sha256", SECRET).update(idPart).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  const id = Number(idPart);
  return Number.isInteger(id) ? id : null;
}

export async function createSession(userId: number) {
  const store = await cookies();
  store.set(COOKIE_NAME, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSessionUser(): Promise<User | undefined> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return undefined;
  const userId = verify(token);
  if (userId === null) return undefined;
  return getUserById(userId);
}
