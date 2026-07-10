import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { confirmReading, unconfirmReading, getPlanStartDate } from "@/lib/db";
import { getCurrentDayNumber } from "@/lib/currentDay";
import { PLAN_TOTAL_DAYS } from "@/lib/plan";

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const day = Number(body?.day);
  const action = body?.action === "unconfirm" ? "unconfirm" : "confirm";

  const currentDay = getCurrentDayNumber(await getPlanStartDate());
  if (!Number.isInteger(day) || day < 1 || day > Math.min(currentDay, PLAN_TOTAL_DAYS)) {
    return NextResponse.json({ error: "Dia inválido." }, { status: 400 });
  }

  if (action === "confirm") {
    await confirmReading(user.id, day);
  } else {
    await unconfirmReading(user.id, day);
  }

  return NextResponse.json({ ok: true });
}
