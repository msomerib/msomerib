import type { Devotional } from "@/lib/devotionals";
import { PLAN_TOTAL_DAYS } from "@/lib/plan";

export default function DevotionalCard({
  day,
  reference,
  devotional,
}: {
  day: number;
  reference: string;
  devotional: Devotional | undefined;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 p-6 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-500 font-medium mb-1">
        Dia {day} de {PLAN_TOTAL_DAYS}
      </p>
      <h2 className="font-serif text-xl font-semibold mb-3">{reference}</h2>

      {devotional ? (
        <>
          <h3 className="font-medium text-stone-800 dark:text-stone-200 mb-2">
            {devotional.title}
          </h3>
          <p className="text-stone-700 dark:text-stone-300 leading-relaxed mb-4 whitespace-pre-line">
            {devotional.commentary}
          </p>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-400 mb-1">
              Aplicação prática para hoje
            </p>
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
              {devotional.application}
            </p>
          </div>
        </>
      ) : (
        <p className="text-stone-500 dark:text-stone-400 italic">
          Devocional deste dia ainda não disponível.
        </p>
      )}
    </div>
  );
}
