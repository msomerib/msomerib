import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getPlanStartDate, listUsers, getConfirmationsForDay } from "@/lib/db";
import { getCurrentDayNumber } from "@/lib/currentDay";
import { getDayReading, formatDayReference, PLAN_TOTAL_DAYS } from "@/lib/plan";
import { getDevotional } from "@/lib/devotionals";
import DevotionalCard from "./components/DevotionalCard";
import GroupStatus from "./components/GroupStatus";
import ConfirmButton from "./components/ConfirmButton";

export default async function Home() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const day = getCurrentDayNumber(await getPlanStartDate());
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

  const planFinished = day >= PLAN_TOTAL_DAYS && confirmedIds.size === users.length;

  return (
    <div className="flex flex-col gap-5">
      <DevotionalCard
        day={day}
        reference={reading ? formatDayReference(reading) : "—"}
        devotional={devotional}
      />

      <ConfirmButton day={day} initiallyConfirmed={confirmedIds.has(user.id)} />

      <GroupStatus members={members} />

      {planFinished && (
        <p className="text-center text-sm text-emerald-700 dark:text-emerald-400">
          🎉 Vocês concluíram o plano de 180 dias! Que bênção ter caminhado juntos pela Palavra.
        </p>
      )}

      <div className="flex justify-center gap-4 text-sm text-stone-500 dark:text-stone-400 pt-2">
        <Link href="/historico" className="hover:text-stone-800 dark:hover:text-stone-100">
          Ver histórico do grupo
        </Link>
        {day > 1 && (
          <Link href={`/dia/${day - 1}`} className="hover:text-stone-800 dark:hover:text-stone-100">
            Reler o dia anterior
          </Link>
        )}
      </div>
    </div>
  );
}
