import { NextRequest, NextResponse } from "next/server";
import { findUserByName, verifyPin } from "@/lib/db";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name : "";
  const pin = typeof body?.pin === "string" ? body.pin : "";

  const user = await findUserByName(name);
  if (!user || !verifyPin(user, pin)) {
    return NextResponse.json({ error: "Nome ou PIN incorretos." }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
