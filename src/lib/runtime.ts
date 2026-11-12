/** Thin, typed wrappers around the Claude artifact runtime (window.claude).
 *  Each capability resolves to null when the page runs anywhere else. */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DocSnap {
  exists: boolean;
  id: string;
  data(): any;
}
export interface QuerySnap {
  size: number;
  docs: DocSnap[];
}
export interface Query {
  where(f: string, op: string, v: unknown): Query;
  orderBy(f: string, dir?: "asc" | "desc"): Query;
  limit(n: number): Query;
  get(): Promise<QuerySnap>;
}
export interface DbNamespace {
  doc(path: string): { get(): Promise<DocSnap>; set(data: unknown): Promise<unknown> };
  collection(path: string): Query;
}
export interface UserNamespace {
  id(): Promise<string | null>;
  isOwner(): Promise<boolean>;
}
export interface SampleFn {
  (input: string | { role: string; content: string }[], opts?: any): Promise<{ text: string }>;
  json(input: string, opts?: any): Promise<any>;
}
export interface DownloadsNamespace {
  save(req: { filename: string; data: Blob | ArrayBuffer | string }): Promise<{ status: string }>;
}

declare global {
  interface Window {
    claude?: { use(name: string): Promise<any> };
    __CLAUDE_API_KEY__?: string;
  }
}

export const runtime = {
  sample: null as SampleFn | null,
  sampleReady: false,
  downloads: null as DownloadsNamespace | null,
  downloadsReady: false,
};

export async function use<T>(name: string): Promise<T | null> {
  try {
    return window.claude?.use ? ((await window.claude.use(name)) as T | null) : null;
  } catch {
    return null;
  }
}
