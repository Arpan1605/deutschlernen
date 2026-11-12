import { tx } from "../lib/i18n";
import { UI } from "../data/strings";
import { PATTERN_CATS } from "../data/patterns";
import { state } from "../lib/store";
import { range } from "../lib/text";
import { makePdf } from "../lib/pdf/document";
import { sections } from "../lib/pdf/sections";
import { PatternCard } from "../components/blocks/PatternCard";
import { PdfButton } from "../components/ui/PdfButton";

/** All 100 workbook patterns grouped into their five categories. */
export function PatternsPage() {
  const done = Object.values(state.patterns).filter(Boolean).length;
  let start = 0;
  const cats = PATTERN_CATS.map((c) => {
    const ids = range(start, start + c[1].length);
    start += c[1].length;
    return { name: c[0], ids };
  });
  return (
    <section className="view">
      <div className="sec-title">
        <div>
          <h2>{tx(UI.pat_h)}</h2>
          <p className="lead">{tx(UI.pat_lead)}</p>
        </div>
        <div className="mono">
          {done} / 100 {tx(UI.pat_done)}
        </div>
      </div>
      <div className="pdfbar" style={{ marginBottom: 12 }}>
        <PdfButton
          label={tx(UI.pdf_all_pat)}
          make={() => [
            (JS) => {
              const P = makePdf(JS, tx(UI.pat_h));
              cats.forEach((c) => sections.patterns(P, c.ids, c.name));
              return P.finish();
            },
            "Fahrplan_100-Sprechmuster.pdf",
          ]}
        />
      </div>
      {cats.map((c, ci) => (
        <details key={ci} className="pat-cat">
          <summary style={{ cursor: "pointer" }}>
            <span className="eyebrow">
              {tx(UI.cat)} {ci + 1} ·{" "}
            </span>
            <b style={{ fontFamily: "var(--f-display)", fontSize: 20 }}>{c.name}</b>
          </summary>
          <div className="pat-grid">
            {c.ids.map((i) => (
              <PatternCard key={i} i={i} />
            ))}
          </div>
        </details>
      ))}
    </section>
  );
}
