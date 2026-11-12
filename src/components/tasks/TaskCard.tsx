import { useId } from "react";
import { tx } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { SK, SKC } from "../../data/skills";
import { dayData, saveDay, bump } from "../../lib/store";
import { taskBuilder } from "../../lib/pdf/sections";
import type { Task } from "../../lib/plan";
import { PdfButton } from "../ui/PdfButton";
import { TaskContent } from "./modules";

/** One row of the day's plan: tick box, skill, title, Open/Close with the exercise inside, and a PDF button. */
export function TaskCard({ d, q, open, onToggle }: { d: number; q: Task; open: boolean; onToggle: () => void }) {
  const id = useId();
  const x = dayData(d),
    done = !!x.done?.[q.id];
  return (
    <li className={"task" + (done ? " done" : "")}>
      <input
        type="checkbox"
        id={id}
        aria-label={tx(q.title)}
        checked={done}
        onChange={(e) => {
          x.done[q.id] = e.target.checked;
          saveDay(d);
          bump();
        }}
      />
      <div className="skill" style={{ color: SKC[q.s] }}>
        {tx(SK[q.s])}
      </div>
      <div className="t-main">
        <div className="t-title">{tx(q.title)}</div>
        <div className="t-body">{tx(q.body)}</div>
        {(q.mod || q.link) && (
          <div className="t-actions">
            {q.mod && (
              <button type="button" className="t-open" aria-expanded={open} onClick={onToggle}>
                {open ? tx(UI.close_task) : tx(UI.open_task)}
              </button>
            )}
            {q.link && (
              <a href={"#" + q.link} className="t-open" style={{ textDecoration: "none" }}>
                {tx(UI.go_to)}
              </a>
            )}
          </div>
        )}
        {open && q.mod && (
          <div className="t-content">
            <TaskContent d={d} q={q} />
            <div className="pdfbar">
              <PdfButton label={tx(UI.pdf_one)} make={() => taskBuilder(d, q)} />
            </div>
          </div>
        )}
      </div>
      <div className="t-min">{q.min} min</div>
    </li>
  );
}
