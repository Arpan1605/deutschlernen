/** Shapes of everything the app saves. Generated material (from Claude) is kept
 *  loosely typed because its JSON comes back from a model. */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Profile {
  name: string;
  cur: string;
  target: string;
  days: number;
  start: string;
  created?: string;
}
export interface DayRecord {
  day: number;
  done: Record<string, boolean>;
  note: string;
  updated?: string;
}
export interface ContentDoc {
  kind: string;
  day: number;
  week?: number;
  data?: any;
  st?: any;
  updated?: string;
}
export interface Mock {
  id: string;
  date: string;
  level: string;
  l: number | null;
  h: number | null;
  s: number | null;
  sp: number | null;
}
export interface PatternMine {
  s: string[];
  fb?: { ok: boolean; fix: string; note_de?: string; note_en?: string }[];
  fbFor?: string[];
}
export interface AppState {
  days: Record<string, DayRecord>;
  mocks: Mock[];
  patterns: Record<string, boolean>;
  pmine: Record<string, PatternMine>;
  tests: Record<string, any>;
  wtests: Record<string, any>;
  content: Record<string, ContentDoc>;
  settings: { level: string };
  profile: Profile | null;
}
