/** Completion status per day and the streak. */
import { buildDay, plan, todayIdx } from "./plan";
import { state, dayKey } from "./store";
import { learnedCount } from "./srs";

/** 0 = untouched, 1 = partly done, 2 = all tasks ticked. */
export function dayStatus(d: number) {
  const t = buildDay(d),
    x = state.days[dayKey(d)];
  if (!x) return 0;
  const n = t.filter((q) => x.done?.[q.id]).length;
  return n === 0 ? 0 : n === t.length ? 2 : 1;
}
export function totals() {
  let full = 0;
  for (let d = 1; d <= plan.total; d++) if (dayStatus(d) === 2) full++;
  let streak = 0,
    s = todayIdx();
  if (dayStatus(s) !== 2) s--;
  while (s >= 1 && dayStatus(s) === 2) {
    streak++;
    s--;
  }
  return { full, words: learnedCount(), streak };
}
