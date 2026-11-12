import { tx } from "../lib/i18n";
import { UI } from "../data/strings";
import { buildDay, levelFor, todayIdx } from "../lib/plan";
import { taskBuilder } from "../lib/pdf/sections";
import { SyntaxTask } from "../components/tasks/modules";
import { PdfButton } from "../components/ui/PdfButton";

/** Sentence-structure rules (open) plus the most recent sentence-building exercise. */
export function SentencesPage() {
  let d = todayIdx();
  for (let i = d; i >= 1; i--)
    if (buildDay(i).some((q) => q.mod === "syntax")) {
      d = i;
      break;
    }
  const q = buildDay(d).find((x) => x.mod === "syntax");
  return (
    <section className="view">
      <div className="sec-title">
        <div>
          <h2>{tx(UI.syn_h)}</h2>
          <p className="lead">{tx(UI.syn_lead)}</p>
        </div>
      </div>
      <div className="stack">
        <div className="eyebrow">
          {tx(UI.day)} {d} · {tx(UI.level)} {levelFor(d).code}
        </div>
        {q && <SyntaxTask d={d} q={q} rulesOpen />}
        {q && (
          <div className="pdfbar">
            <PdfButton label={tx(UI.pdf_one)} make={() => taskBuilder(d, q)} />
          </div>
        )}
      </div>
    </section>
  );
}
