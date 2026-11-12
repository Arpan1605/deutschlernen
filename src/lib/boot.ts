/** Start-up: connect to the viewer's private storage, move legacy data across
 *  once for the owner, and load everything into the store. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { state, storage, saveState, lsSave, lsLoad, bump } from "./store";
import { runtime, use, type DbNamespace, type UserNamespace, type SampleFn, type DownloadsNamespace } from "./runtime";
import { applyProfile, DEFAULT_PROFILE } from "./plan";

async function loadAll(db: DbNamespace, prefix: string) {
  const out: any = { days: {}, mocks: [], tests: {}, wtests: {}, content: {} };
  let n = 0;
  for (const c of ["days", "mocks", "tests", "wtests"]) {
    const s = await db
      .collection(prefix + c)
      .limit(1000)
      .get();
    s.docs.forEach((x) => {
      const v = x.data();
      if (!v) return;
      const o = JSON.parse(JSON.stringify(v));
      n++;
      if (c === "mocks") out.mocks.push(o);
      else out[c][x.id] = o;
    });
  }
  // content can be large: page through it by day
  let last = -1;
  for (let guard = 0; guard < 20; guard++) {
    const s = await db
      .collection(prefix + "content")
      .where("day", ">", last)
      .orderBy("day")
      .limit(500)
      .get();
    if (!s.size) break;
    s.docs.forEach((x) => {
      const v = x.data();
      if (!v) return;
      out.content[x.id] = JSON.parse(JSON.stringify(v));
      n++;
      last = Math.max(last, +v.day || 0);
    });
    if (s.size < 500) break;
  }
  const meta: any = {};
  for (const m of ["patterns", "settings", "profile"]) {
    const s = await db.doc(prefix + "meta/" + m).get();
    if (s.exists) {
      meta[m] = JSON.parse(JSON.stringify(s.data() || {}));
      n++;
    }
  }
  return { out, meta, n };
}
function adopt(r: { out: any; meta: any }) {
  Object.assign(state, r.out);
  if (r.meta.patterns) {
    state.patterns = r.meta.patterns.done || {};
    state.pmine = r.meta.patterns.mine || {};
  }
  if (r.meta.settings) state.settings = r.meta.settings;
  if (r.meta.profile) state.profile = r.meta.profile;
}
async function pushAll(db: DbNamespace) {
  const put = (p: string, o: unknown) => db.doc(storage.base + p).set(JSON.parse(JSON.stringify(o)));
  for (const k in state.days) await put("days/" + k, state.days[k]);
  for (const m of state.mocks) await put("mocks/" + (m.id || "m" + Date.now()), m);
  for (const c of ["tests", "wtests", "content"] as const)
    for (const k in state[c]) {
      const o: any = state[c][k];
      if (c === "content" && o && o.day == null) o.day = 0;
      await put(c + "/" + k, o);
    }
  await put("meta/patterns", { done: state.patterns, mine: state.pmine });
  await put("meta/settings", state.settings || { level: "auto" });
  if (state.profile) await put("meta/profile", state.profile);
}

/** Load local data synchronously so the first frame is useful. */
export function bootLocal() {
  lsLoad();
  applyProfile(state.profile);
}

let booting: Promise<void> | null = null;
/** Connect capabilities; resolves when storage is settled. Safe to call more than once. */
export function bootRemote() {
  return (booting = booting || connect());
}

async function connect() {
  use<SampleFn>("sample").then((s) => {
    runtime.sample = s;
    runtime.sampleReady = true;
    bump();
  });
  use<DownloadsNamespace>("downloads").then((d) => {
    runtime.downloads = d;
    runtime.downloadsReady = true;
    bump();
  });
  try {
    const [db, user] = await Promise.all([use<DbNamespace>("db"), use<UserNamespace>("user")]);
    let uid: string | null = null;
    try {
      uid = user ? await user.id() : null;
    } catch {
      /* no id */
    }
    if (!db || !uid) return;
    storage.db = db;
    storage.base = "data/users/" + uid + "/plan/";
    const mine = await loadAll(db, storage.base);
    if (!mine.n) {
      let owner = false;
      try {
        owner = !!(await user!.isOwner());
      } catch {
        /* unknown */
      }
      let legacy: { out: any; meta: any; n: number } = { out: {}, meta: {}, n: 0 };
      if (owner) {
        try {
          legacy = await loadAll(db, "");
        } catch {
          /* none */
        }
      }
      if (legacy.n) {
        adopt(legacy);
        if (!state.profile) state.profile = { ...DEFAULT_PROFILE };
        await pushAll(db);
      } else if (Object.keys(state.content).length || state.profile) await pushAll(db);
    } else {
      adopt(mine);
      lsSave();
    }
    saveState.status = "saved_sync";
  } catch {
    storage.db = null;
    storage.base = "";
    saveState.status = "saved_local";
  } finally {
    applyProfile(state.profile);
    bump();
  }
}
