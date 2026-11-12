/* eslint-disable @typescript-eslint/no-explicit-any */
import { tx } from "../../lib/i18n";
import { UI } from "../../data/strings";
import type { Level } from "../../data/levels";
import { ModShell } from "../ui/ModShell";
import { CheckButton } from "../ui/CheckButton";
import { ReadingBlock, mcScore } from "./ReadingBlock";
import { ListeningBlock } from "./ListeningBlock";
import { ProductionBlock } from "./ProductionBlock";

const arr = (x: any) => (Array.isArray(x) ? x : x ? [x] : []);
const avg = (a: (number | null)[]) =>
  a.length && a.every((v) => v != null) ? Math.round((a as number[]).reduce((x, y) => x + y, 0) / a.length) : null;

/** Scores per module for a generated test (daily: single items, weekly: arrays). */
export function testScores(G: any, T: any) {
  const slot = (k: string, i: number) => (Array.isArray(G[k]) ? (T[k] || [])[i] : T[k]) || {};
  return {
    l: avg(arr(G.lesen).map((R: any, i: number) => mcScore(R.questions, slot("lesen", i)))),
    h: avg(arr(G.hoeren).map((H: any, i: number) => mcScore(H.questions, slot("hoeren", i)))),
    s: avg(arr(G.schreiben).map((_: any, i: number) => slot("schreiben", i).score ?? null)),
    sp: T.sprechen?.score ?? null,
  };
}

export function ScoreGrid({ sc }: { sc: ReturnType<typeof testScores> }) {
  const rows: [keyof typeof sc, string][] = [
    ["l", "lesen"],
    ["h", "hoeren"],
    ["s", "schreiben"],
    ["sp", "sprechen"],
  ];
  return (
    <div className="sumgrid">
      {rows.map(([k, label]) => {
        const v = sc[k];
        return (
          <div key={k} className="stat">
            <div className="n" style={v == null ? undefined : { color: v >= 60 ? "var(--ok)" : "var(--warn)" }}>
              {v == null ? "—" : v + " %"}
            </div>
            <div className="l">{tx(UI[label])}</div>
          </div>
        );
      })}
    </div>
  );
}

/** All four modules of a generated test, interactive. */
export function TestModules({ G, T, lv, onChange, onSave }: { G: any; T: any; lv: Level; onChange: () => void; onSave: () => void }) {
  const weekly = Array.isArray(G.lesen);
  const slot = (k: string, i: number) => {
    if (!weekly) return (T[k] = T[k] || {});
    T[k] = T[k] || [];
    return (T[k][i] = T[k][i] || {});
  };
  const reset = (k: string, i: number, keep: string[] = []) => {
    const cur = slot(k, i),
      fresh: any = {};
    keep.forEach((x) => (fresh[x] = cur[x]));
    if (weekly) T[k][i] = fresh;
    else T[k] = fresh;
    T.logged = false;
  };
  const label = (i: number) => (weekly ? tx(UI.text) + " " + (i + 1) : undefined);
  const task = (P: any, extra: string) => (P.task_de || "") + "\nLeitpunkte: " + (P.points || []).join("; ") + extra;
  return (
    <>
      {arr(G.lesen).map((R: any, i: number) => {
        const st = slot("lesen", i);
        return (
          <ModShell key={"l" + i} kind="lesen" score={mcScore(R.questions, st)} label={label(i)}>
            <ReadingBlock R={R} st={st} onChange={onChange} />
            <CheckButton
              checked={!!st.checked}
              onToggle={() => {
                if (st.checked) reset("lesen", i);
                else st.checked = true;
                onChange();
              }}
            />
          </ModShell>
        );
      })}
      {arr(G.hoeren).map((H: any, i: number) => {
        const st = slot("hoeren", i);
        return (
          <ModShell key={"h" + i} kind="hoeren" score={mcScore(H.questions, st)} label={label(i)}>
            <ListeningBlock H={H} st={st} onChange={onChange} />
            <CheckButton
              checked={!!st.checked}
              onToggle={() => {
                if (st.checked) reset("hoeren", i, ["rate", "plays", "noVoice"]);
                else st.checked = true;
                onChange();
              }}
            />
          </ModShell>
        );
      })}
      {arr(G.schreiben).map((P: any, i: number) => {
        const st = slot("schreiben", i);
        return (
          <ModShell key={"s" + i} kind="schreiben" score={st.score ?? null} label={label(i)}>
            <ProductionBlock
              kind="schreiben"
              P={P}
              st={st}
              lv={lv}
              taskText={task(P, "\nMindestens " + (P.min_words || lv.wmin) + " Wörter.")}
              onChange={onChange}
              onSave={onSave}
            />
          </ModShell>
        );
      })}
      {G.sprechen && (
        <ModShell kind="sprechen" score={T.sprechen?.score ?? null}>
          <ProductionBlock
            kind="sprechen"
            P={G.sprechen}
            st={(T.sprechen = T.sprechen || {})}
            lv={lv}
            taskText={task(
              G.sprechen,
              "\nSprechzeit: " + (G.sprechen.minutes || lv.speak) + " Minuten" + (weekly ? ", danach Diskussion." : "."),
            )}
            onChange={onChange}
            onSave={onSave}
          />
        </ModShell>
      )}
    </>
  );
}
