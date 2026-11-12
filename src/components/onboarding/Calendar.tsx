import { useEffect, useRef, useState } from "react";
import { getLang } from "../../lib/i18n";
import { fmt, isoDate, parseDate, short, MONTHS } from "../../lib/dates";

/** Date picker styled like the rest of the site (weeks start on Monday). */
export function Calendar({ value, onChange, labelId }: { value: string; onChange: (iso: string) => void; labelId?: string }) {
  const [open, setOpen] = useState(false);
  const sel = parseDate(value);
  const [month, setMonth] = useState(() => new Date(sel.getFullYear(), sel.getMonth(), 1));
  const wrap = useRef<HTMLDivElement>(null),
    btn = useRef<HTMLButtonElement>(null),
    pop = useRef<HTMLDivElement>(null);
  const de = getLang() === "de",
    now = new Date();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    pop.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus();
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const toggle = () => {
    if (!open) setMonth(new Date(sel.getFullYear(), sel.getMonth(), 1));
    setOpen(!open);
  };
  const pick = (iso: string) => {
    onChange(iso);
    setOpen(false);
    btn.current?.focus();
  };
  const lead = (month.getDay() + 6) % 7;
  const first = new Date(month.getFullYear(), month.getMonth(), 1 - lead);
  const days = Array.from({ length: 42 }, (_, i) => new Date(first.getFullYear(), first.getMonth(), first.getDate() + i));

  return (
    <div className="cal" ref={wrap}>
      <button
        type="button"
        ref={btn}
        className="cal-btn"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={labelId}
        onClick={toggle}
      >
        <span>{fmt(sel)}</span>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <rect x="1.5" y="2.5" width="13" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M1.5 6h13M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1.4" fill="none" />
        </svg>
      </button>
      {open && (
        <div
          className="cal-pop"
          ref={pop}
          role="dialog"
          aria-label={de ? "Kalender" : "Calendar"}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setOpen(false);
              btn.current?.focus();
            }
          }}
        >
          <div className="cal-head">
            <b>
              {MONTHS[getLang()][month.getMonth()]} {month.getFullYear()}
            </b>
            <div className="cal-nav">
              <button
                type="button"
                aria-label={de ? "Vorheriger Monat" : "Previous month"}
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={de ? "Nächster Monat" : "Next month"}
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              >
                ›
              </button>
            </div>
          </div>
          <div className="cal-grid" role="grid">
            {(de ? ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"] : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]).map((w) => (
              <div key={w} className="wd">
                {w}
              </div>
            ))}
            {days.map((dt) => {
              const iso = isoDate(dt),
                cls = [dt.getMonth() !== month.getMonth() ? "out" : "", iso === isoDate(now) ? "today" : ""].join(" ").trim();
              return (
                <button
                  key={iso}
                  type="button"
                  className={cls}
                  aria-label={fmt(dt)}
                  aria-selected={iso === value}
                  onClick={() => pick(iso)}
                >
                  {dt.getDate()}
                </button>
              );
            })}
          </div>
          <div className="cal-foot">
            <span>{(de ? "Heute: " : "Today: ") + short(now)}</span>
            <button type="button" onClick={() => pick(isoDate(now))}>
              {de ? "Heute wählen" : "Pick today"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
