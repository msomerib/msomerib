import { NT_TOTAL_CHAPTERS, PSALMS_TOTAL_CHAPTERS, ntChapterAt } from "./bibleBooks";

export const PLAN_TOTAL_DAYS = 180;

export interface DayReading {
  day: number; // 1..180
  ntRefs: string[]; // ex: ["Mateus 1", "Mateus 2"]
  psalmRefs: string[]; // ex: ["Salmo 23"]
}

/** Distribui `total` itens ao longo de `days` dias, o mais uniformemente possível
 * (o mesmo princípio do algoritmo de Bresenham). Retorna quantos itens cabem em cada dia. */
function distributeEvenly(total: number, days: number): number[] {
  const counts: number[] = [];
  for (let i = 0; i < days; i++) {
    const upTo = Math.floor(((i + 1) * total) / days);
    const from = Math.floor((i * total) / days);
    counts.push(upTo - from);
  }
  return counts;
}

let cachedPlan: DayReading[] | null = null;

/** Gera o plano de leitura completo: Novo Testamento + Salmos em 180 dias. */
export function generatePlan(): DayReading[] {
  if (cachedPlan) return cachedPlan;

  const ntCounts = distributeEvenly(NT_TOTAL_CHAPTERS, PLAN_TOTAL_DAYS);
  const psalmCounts = distributeEvenly(PSALMS_TOTAL_CHAPTERS, PLAN_TOTAL_DAYS);

  const plan: DayReading[] = [];
  let ntCursor = 0; // próximo capítulo absoluto do NT a ser lido (0-indexado)
  let psalmCursor = 0; // próximo salmo a ser lido (0-indexado)

  for (let day = 1; day <= PLAN_TOTAL_DAYS; day++) {
    const ntRefs: string[] = [];
    const ntCount = ntCounts[day - 1];
    for (let k = 0; k < ntCount; k++) {
      ntCursor++;
      if (ntCursor <= NT_TOTAL_CHAPTERS) {
        const { book, chapter } = ntChapterAt(ntCursor);
        ntRefs.push(`${book} ${chapter}`);
      }
    }

    const psalmRefs: string[] = [];
    const psalmCount = psalmCounts[day - 1];
    for (let k = 0; k < psalmCount; k++) {
      psalmCursor++;
      if (psalmCursor <= PSALMS_TOTAL_CHAPTERS) {
        psalmRefs.push(`Salmo ${psalmCursor}`);
      }
    }

    plan.push({ day, ntRefs, psalmRefs });
  }

  cachedPlan = plan;
  return plan;
}

export function getDayReading(day: number): DayReading | undefined {
  const plan = generatePlan();
  return plan.find((d) => d.day === day);
}

/** Formata as referências de um dia em texto legível, ex: "Mateus 1-2 e Salmo 1". */
export function formatDayReference(reading: DayReading): string {
  const parts: string[] = [];
  if (reading.ntRefs.length > 0) parts.push(reading.ntRefs.join("; "));
  if (reading.psalmRefs.length > 0) parts.push(reading.psalmRefs.join("; "));
  return parts.join(" e ");
}
