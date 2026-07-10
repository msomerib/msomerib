import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getPlanStartDate, listUsers, getConfirmationsForDay } from "@/lib/db";
import { getCurrentDayNumber } from "@/lib/currentDay";
import { getDayReading, formatDayReference, PLAN_TOTAL_DAYS } from "@/lib/plan";
import { getDevotional } from "@/lib/devotionals";
import DevotionalCard from "@/app/components/DevotionalCard";
import GroupStatus from "@/app/components/GroupStatus";
import ConfirmButton from "@/app/components/ConfirmButton";

export default async function DayPage({ params }: { params: Promise<{ day: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { day: dayParam } = await params;
  const day = Number(dayParam);
  if (!Number.isInteger(day) || day < 1 || day > PLAN_TOTAL_DAYS) notFound();

  const currentDay = getCurrentDayNumber(await getPlanStartDate());
  const reading = getDayReading(day);
  const devotional = getDevotional(day);
  const users = await listUsers();
  const confirmations = await getConfirmationsForDay(day);
  const confirmedIds = new Set(confirmations.map((c) => c.user_id));

  const members = users.map((u) => ({
    name: u.name,
    confirmed: confirmedIds.has(u.id),
    isMe: u.id === user.id,
  }));

  return (
    <div className="flex flex-col gap-5">
      <DevotionalCard
        day={day}
        reference={reading ? formatDayReference(reading) : "—"}
        devotional={devotional}
      />

      {day <= currentDay ? (
        <ConfirmButton day={day} initiallyConfirmed={confirmedIds.has(user.id)} />
      ) : (
        <p className="text-center text-sm text-stone-500 dark:text-stone-400">
          Este dia ainda não chegou no plano.
        </p>
      )}

      <GroupStatus members={members} />

      <div className="flex justify-between text-sm text-stone-500 dark:text-stone-400 pt-2">
        {day > 1 ? (
          <Link href={`/dia/${day - 1}`} className="hover:text-stone-800 dark:hover:text-stone-100">
            ← Dia anterior
          </Link>
        ) : (
          <span />
        )}
        <Link href="/" className="hover:text-stone-800 dark:hover:text-stone-100">
          Hoje
        </Link>
        {day < currentDay ? (
          <Link href={`/dia/${day + 1}`} className="hover:text-stone-800 dark:hover:text-stone-100">
            Próximo dia →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
