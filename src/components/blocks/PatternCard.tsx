import { useId, useState } from "react";
import { tx, pickLang, getLang } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { PATTERNS } from "../../data/patterns";
import { state, savePatterns, bump } from "../../lib/store";
import { generateJson, errCopy } from "../../lib/ai";
import { patternCheckPrompt } from "../../lib/prompts";
import { SpeakButton } from "../ui/SpeakButton";
import { StatusLine } from "../ui/StatusLine";

/** One workbook pattern: anchor sentence with audio, three own sentences, a check by Claude and a done tick. */
export function PatternCard({ i }: { i: number }) {
  const uid = useId();
  const P = PATTERNS[i];
  const mine = (state.pmine[i] = state.pmine[i] || { s: ["", "", ""] });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ msg: string; err?: boolean }>({ msg: "" });
  const check = async () => {
    const sent = mine.s.filter((x) => x.trim());
    if (!sent.length) return;
    setBusy(true);
    setStatus({ msg: tx(UI.grading) });
    try {
      const R = await generateJson<{ items: NonNullable<typeof mine.fb> }>(patternCheckPrompt(P, sent), undefined, { modelTier: "quick" });
      mine.fb = R.items || [];
      mine.fbFor = sent;
      savePatterns();
      setStatus({ msg: "" });
      bump();
    } catch (e) {
      setStatus({ msg: errCopy(e), err: true });
    }
    setBusy(false);
  };
  return (
    <div className="pat-card">
      <div className="eyebrow">#{String(i + 1).padStart(2, "0")}</div>
      <div className="pf">{P[0]}</div>
      <div className="anc">
        <SpeakButton text={P[1]} /> {P[1]}
      </div>
      <div className="anc-en">{P[2]}</div>
      {mine.s.map((s, k) => (
        <div key={k} className="stack" style={{ gap: 4 }}>
          {s.trim() && (
            <div className="note">
              <SpeakButton text={s} /> {getLang() === "de" ? "Anhören: " : "Listen: "}
              {s}
            </div>
          )}
          <input
            type="text"
            id={`${uid}-${k}`}
            defaultValue={s}
            placeholder={k + 1 + ". " + (getLang() === "de" ? "Dein Satz …" : "Your sentence …")}
            aria-label={tx(UI.my_sent) + " " + (k + 1)}
            onChange={(e) => {
              mine.s[k] = e.target.value;
              savePatterns();
            }}
            onBlur={bump}
          />
        </div>
      ))}
      <div className="player">
        <button type="button" className="btn" disabled={busy} onClick={check}>
          {tx(UI.check_sent)}
        </button>
        <label htmlFor={`${uid}-done`} className="note" style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input
            type="checkbox"
            id={`${uid}-done`}
            checked={!!state.patterns[i]}
            onChange={(e) => {
              state.patterns[i] = e.target.checked;
              savePatterns();
              bump();
            }}
          />
          {tx(UI.pat_done)}
        </label>
      </div>
      <StatusLine {...status} />
      {mine.fb?.length ? (
        <ul className="errs">
          {mine.fb.map((f, n) => (
            <li key={n}>
              <span>{f.ok ? "✓ " : "✗ "}</span>
              {f.ok ? <span>{mine.fbFor?.[n] || ""}</span> : <ins>{f.fix}</ins>} <SpeakButton text={f.ok ? mine.fbFor?.[n] || "" : f.fix} />
              <div className="why">{pickLang(f.note_de, f.note_en)}</div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
