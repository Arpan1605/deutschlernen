/** App state, persistence and a tiny subscription so React re-renders after changes.
 *  Data is saved to the viewer's private space in the artifact database when
 *  available, and always mirrored to localStorage as a fallback. */
import { useSyncExternalStore } from "react";
import type { AppState, ContentDoc, DayRecord } from "../types";
import { pad3 } from "./text";
import type { DbNamespace } from "./runtime";

export const state: AppState = {
  days: {},
  mocks: [],
  patterns: {},
  pmine: {},
  tests: {},
  wtests: {},
  content: {},
  settings: { level: "auto" },
  profile: null,
};

const LS = "fahrplan-b2-v2";
export const storage = { db: null as DbNamespace | null, base: "" };
export type SaveStatus = "saved_local" | "saved_sync" | "saving" | "saved_ok" | "saved_fail";
export const saveState = { status: "saved_local" as SaveStatus };

/* ---------- subscription ---------- */
let version = 0;
const listeners = new Set<() => void>();
export function bump() {
  version++;
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};
/** Re-render the calling component whenever the store changes. */
export const useStore = () => useSyncExternalStore(subscribe, () => version);

/* ---------- local persistence ---------- */
export function lsSave() {
  try {
    localStorage.setItem(LS, JSON.stringify(state));
  } catch {
    /* storage blocked */
  }
}
export function lsLoad() {
  try {
    const s = JSON.parse(localStorage.getItem(LS) || localStorage.getItem("fahrplan-b2-v1") || "null");
    if (s)
      for (const k of Object.keys(state) as (keyof AppState)[]) if (s[k] != null) (state as unknown as Record<string, unknown>)[k] = s[k];
  } catch {
    /* corrupt or blocked */
  }
}

/* ---------- remote persistence (debounced, one queue per document) ---------- */
const queues: Record<string, Promise<unknown>> = {};
const timers: Record<string, ReturnType<typeof setTimeout>> = {};
function setStatus(s: SaveStatus) {
  saveState.status = s;
  bump();
}

export function saveDoc(path: string, data: unknown, now = false) {
  lsSave();
  const db = storage.db;
  if (!db) {
    saveState.status = "saved_local";
    return;
  }
  clearTimeout(timers[path]);
  timers[path] = setTimeout(
    () => {
      const run = () => db.doc(storage.base + path).set(JSON.parse(JSON.stringify(data)));
      queues[path] = (queues[path] || Promise.resolve())
        .then(run)
        .then(() => setStatus("saved_ok"))
        .catch(() => setStatus("saved_fail"));
    },
    now ? 0 : 700,
  );
  saveState.status = "saving";
}

/* ---------- helpers for the main collections ---------- */
export const dayKey = (d: number) => "d" + pad3(d);
export function dayData(d: number): DayRecord {
  return state.days[dayKey(d)] || (state.days[dayKey(d)] = { day: d, done: {}, note: "" });
}
export function saveDay(d: number) {
  const x = dayData(d);
  x.updated = new Date().toISOString();
  saveDoc("days/" + dayKey(d), x);
}
export const cget = (key: string): ContentDoc | undefined => state.content[key];
export function cset(key: string, obj: ContentDoc) {
  state.content[key] = obj;
  saveC(key);
  bump();
}
export function saveC(key: string) {
  const o = state.content[key];
  if (o) {
    o.updated = new Date().toISOString();
    saveDoc("content/" + key, o);
  }
}
/** Get a content doc that only holds the learner's own work (writing, talks), creating it if needed. */
export function cwork(key: string, kind: string, day: number): ContentDoc {
  return state.content[key] || (state.content[key] = { kind, day, st: {} });
}
export function savePatterns() {
  saveDoc("meta/patterns", { done: state.patterns, mine: state.pmine });
}
export function saveTest(d: number) {
  const k = "d" + pad3(d),
    t = state.tests[k];
  if (t) {
    t.updated = new Date().toISOString();
    saveDoc("tests/" + k, t);
  }
}
export function saveWeek(w: number) {
  const k = "w" + String(w + 1).padStart(2, "0"),
    t = state.wtests[k];
  if (t) {
    t.updated = new Date().toISOString();
    saveDoc("wtests/" + k, t);
  }
}

/** Callbacks for exercise components: onSave persists (typing), onChange persists and re-renders. */
export function binder(save: () => void) {
  return {
    onSave: save,
    onChange: () => {
      save();
      bump();
    },
  };
}
