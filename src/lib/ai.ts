/** Calling Claude from the page: JSON generation, marking and error messages. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { tx } from "./i18n";
import { UI } from "../data/strings";
import { runtime } from "./runtime";
import { gradePrompt } from "./prompts";
import type { Level } from "../data/levels";

export function errCopy(e: any) {
  const c = e?.code;
  if (c === "not_granted") return tx(UI.e_not_granted);
  if (c === "rate_limited" || c === "queue_overflow") return tx(UI.e_rate);
  if (c === "invalid_json") return tx(UI.e_json);
  if (c === "bad_key") return tx(UI.e_bad_key);
  if (c === "unavailable") return tx(window.claude ? UI.unavailable_claude : UI.unavailable);
  if (c === "network") return tx(UI.e_network);
  return tx(UI.e_other);
}

/** Ask for JSON; resolves the parsed object or throws {code, message}. */
export async function generateJson<T = any>(prompt: string, validate?: (r: any) => boolean, opts?: any): Promise<T> {
  if (!runtime.sample) throw { code: "unavailable", message: tx(UI.unavailable) };
  const R = await runtime.sample.json(prompt, { cache: false, ...opts });
  if (!R || typeof R !== "object" || (validate && !validate(R))) throw { code: "invalid_json" };
  return R as T;
}

export interface Feedback {
  score?: number;
  criteria?: { name: string; score: number; comment_de?: string; comment_en?: string }[];
  errors?: { wrong: string; right: string; rule_de?: string; rule_en?: string }[];
  corrected?: string;
  summary_de?: string;
  summary_en?: string;
}

export async function gradeText(kind: "schreiben" | "sprechen", task: string, text: string, lv: Level) {
  const F = await generateJson<Feedback>(gradePrompt(kind, task, text, lv));
  return { feedback: F, score: Math.max(0, Math.min(100, Math.round(+(F.score ?? 0) || 0))) };
}
