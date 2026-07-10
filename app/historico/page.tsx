import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getPlanStartDate, listUsers, getAllConfirmations } from "@/lib/db";
import { getCurrentDayNumber } from "@/lib/currentDay";
import { generatePlan, formatDayReference } from "@/lib/plan";

export default async function HistoricoPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const currentDay = getCurrentDayNumber(await getPlanStartDate());
  const users = await listUsers();
  const plan = generatePlan().filter((d) => d.day <= currentDay);
  const allConfirmations = await getAllConfirmations();

  const confirmedByDay = new Map<number, Set<number>>();
  for (const c of allConfirmations) {
    if (!confirmedByDay.has(c.day)) confirmedByDay.set(c.day, new Set());
    confirmedByDay.get(c.day)!.add(c.user_id);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-xl font-semibold">Histórico do grupo</h1>
      <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-stone-800">
        <table className="w-full text-sm">
          <thead className="bg-stone-100 dark:bg-stone-900 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Dia</th>
              <th className="px-3 py-2 font-medium">Leitura</th>
              {users.map((u) => (
                <th key={u.id} className="px-3 py-2 font-medium text-center">
                  {u.name.split(" ")[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...plan].reverse().map((d) => {
              const confirmed = confirmedByDay.get(d.day) ?? new Set<number>();
              return (
                <tr key={d.day} className="border-t border-stone-200 dark:border-stone-800">
                  <td className="px-3 py-2">
                    <Link href={`/dia/${d.day}`} className="hover:underline">
                      {d.day}
                    </Link>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{formatDayReference(d)}</td>
                  {users.map((u) => (
                    <td key={u.id} className="px-3 py-2 text-center">
                      {confirmed.has(u.id) ? "✓" : "–"}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
