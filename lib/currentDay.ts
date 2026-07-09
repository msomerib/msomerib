import { PLAN_TOTAL_DAYS } from "./plan";

/** Calcula em que dia do plano (1..180) estamos, dado o dia em que o grupo começou.
 * O dia 1 é o próprio `startDate`. Depois do dia 180, permanece em 180 (plano concluído). */
export function getCurrentDayNumber(startDate: string): number {
  const [y, m, d] = startDate.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.round((today.getTime() - start.getTime()) / 86_400_000);
  const day = diffDays + 1;
  return Math.min(Math.max(day, 1), PLAN_TOTAL_DAYS);
}
