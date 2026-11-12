/* eslint-disable @typescript-eslint/no-explicit-any */
import { tx } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { norm } from "../../lib/text";
import { say, stopSpeech } from "../../lib/speech";
import { SpeakButton } from "../ui/SpeakButton";
import { CheckButton } from "../ui/CheckButton";

/** Song lyrics with gap-fill inputs, read-aloud and a glossary. */
export function SongGaps({ S, st, onChange, onSave }: { S: any; st: any; onChange: () => void; onSave: () => void }) {
  st.g = st.g || {};
  const byLine: Record<number, { w: string; i: number }[]> = {};
  (S.gaps || []).forEach((g: any, i: number) => (byLine[g.l] = byLine[g.l] || []).push({ w: g.w, i }));
  return (
    <div className="stack">
      <h4 style={{ margin: 0, fontFamily: "var(--f-display)", fontSize: 22 }}>♪ {S.title || ""}</h4>
      <div className="player">
        <button type="button" className="btn primary" onClick={() => say((S.lines || []).join(". "), 0.85)}>
          {tx(UI.play)}
        </button>
        <button type="button" className="btn" onClick={stopSpeech}>
          {tx(UI.stop)}
        </button>
      </div>
      <div className="lyrics">
        {(S.lines || []).map((line: string, li: number) => {
          const gaps = byLine[li] || [];
          if (!gaps.length) return <div key={li}>{line}</div>;
          const parts: React.ReactNode[] = [];
          let rest = line;
          gaps.forEach((g) => {
            const pos = rest.indexOf(g.w);
            if (pos < 0) return;
            parts.push(rest.slice(0, pos));
            const ok = norm(st.g[g.i]) === norm(g.w);
            parts.push(
              <input
                key={"g" + g.i + String(st.checked)}
                type="text"
                aria-label={"Lücke " + (g.i + 1)}
                size={Math.max(4, g.w.length)}
                defaultValue={st.g[g.i] || ""}
                className={st.checked ? (ok ? "ok" : "no") : ""}
                onChange={(e) => {
                  st.g[g.i] = e.target.value;
                  onSave();
                }}
              />,
            );
            if (st.checked && !ok)
              parts.push(
                <span key={"s" + g.i} className="why">
                  {" "}
                  ({g.w})
                </span>,
              );
            rest = rest.slice(pos + g.w.length);
          });
          parts.push(rest);
          return <div key={li}>{parts}</div>;
        })}
      </div>
      {S.words && (
        <div className="gloss">
          {S.words.map((x: any, i: number) => (
            <span key={i}>
              {x.de} – {x.en}
              <SpeakButton text={x.de} />
            </span>
          ))}
        </div>
      )}
      <CheckButton
        checked={!!st.checked}
        onToggle={() => {
          if (st.checked) {
            st.checked = false;
            st.g = {};
          } else st.checked = true;
          onChange();
        }}
      />
    </div>
  );
}
