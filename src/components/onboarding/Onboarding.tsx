import { useEffect, useId, useRef, useState } from "react";
import { tx } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { CUR_LEVELS, TARGETS } from "../../data/levels";
import { state, saveDoc, bump } from "../../lib/store";
import { applyProfile, withProfile, wordsPerDay, hoursNeeded, hoursPlanned, dateOf, plan } from "../../lib/plan";
import { isoDate, short } from "../../lib/dates";
import { LangSwitch } from "../layout/Header";
import { Segmented } from "./Segmented";
import { Calendar } from "./Calendar";

const RANK: Record<string, number> = { A0: 0, A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };
const DAY_PRESETS = [30, 60, 90, 120, 180];

/** First-visit questions (name, current level, target, days, start date) and the profile editor. */
export function Onboarding({ edit, onClose }: { edit: boolean; onClose: () => void }) {
  const p = state.profile;
  const [name, setName] = useState(p?.name || "");
  const [cur, setCur] = useState(p?.start ? p.cur : "");
  const [target, setTarget] = useState(p?.start ? p.target : "");
  const [days, setDays] = useState<number>(p?.days || 90);
  const [start, setStart] = useState(edit && p?.start && p?.name ? p.start : isoDate(new Date()));
  const [err, setErr] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const ids = { name: useId(), start: useId() };
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const valid = cur && target && days >= 14 && days <= 365;
  const preview = valid
    ? withProfile({ name, cur, target, days, start }, () => ({
        wpd: wordsPerDay(),
        need: hoursNeeded(),
        have: hoursPlanned(),
        from: short(dateOf(1)) + " " + dateOf(1).getFullYear(),
        to: short(dateOf(plan.total)) + " " + dateOf(plan.total).getFullYear(),
      }))
    : null;
  const moved = edit && p?.start && start !== p.start && Object.keys(state.content).length > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setErr(tx(UI.ob_need_name));
    if (!cur || !target) return setErr(tx(UI.ob_need_tgt));
    if (!(days >= 14 && days <= 365)) return setErr(tx(UI.ob_need_days));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) return setErr(tx(UI.ob_need_start));
    state.profile = { name: name.trim().slice(0, 40), cur, target, days, start, created: p?.created || new Date().toISOString() };
    saveDoc("meta/profile", state.profile, true);
    applyProfile(state.profile);
    bump();
    onClose();
  };

  return (
    <div
      className="ob"
      role="dialog"
      aria-modal="true"
      aria-labelledby="obTitle"
      onKeyDown={(e) => {
        if (e.key === "Escape" && edit) onClose();
      }}
    >
      <form className="ob-card" onSubmit={submit} noValidate>
        <div className="ob-top">
          <span className="eyebrow">FAHRPLAN</span>
          <LangSwitch />
        </div>
        <div>
          <h2 id="obTitle">{tx(edit ? UI.ob_title_edit : UI.ob_title_new)}</h2>
          <p className="lead" style={{ marginTop: 6 }}>
            {tx(edit ? UI.ob_lead_edit : UI.ob_lead)}
          </p>
        </div>

        <div className="ob-field">
          <label htmlFor={ids.name}>{tx(UI.ob_name)}</label>
          <input
            ref={nameRef}
            type="text"
            id={ids.name}
            autoComplete="given-name"
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="ob-field">
          <div className="lab">{tx(UI.ob_cur)}</div>
          <Segmented
            options={CUR_LEVELS.map((v) => ({ value: v, label: v === "A0" ? tx(UI.ob_a0) : v, sub: v === "A0" ? "A0" : undefined }))}
            value={cur}
            onChange={(v) => {
              setCur(v);
              if (target && RANK[target] <= RANK[v]) setTarget("");
            }}
          />
        </div>

        <div className="ob-field">
          <div className="lab">{tx(UI.ob_tgt)}</div>
          <Segmented
            options={TARGETS.map((v) => ({ value: v, label: v }))}
            value={target}
            onChange={setTarget}
            disabled={(v) => cur !== "" && RANK[v] <= RANK[cur]}
          />
        </div>

        <div className="ob-field">
          <div className="lab">{tx(UI.ob_days)}</div>
          <Segmented
            options={DAY_PRESETS.map((v) => ({ value: v, label: String(v), sub: tx(UI.ob_days_u) }))}
            value={days}
            onChange={setDays}
          />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <label htmlFor="obDays" className="note">
              {tx(UI.ob_custom)}
            </label>
            <input
              type="number"
              id="obDays"
              min={14}
              max={365}
              style={{ maxWidth: 110 }}
              value={DAY_PRESETS.includes(days) ? "" : days}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10);
                if (v) setDays(v);
              }}
            />
          </div>
        </div>

        <div className="ob-field">
          <div className="lab" id={ids.start}>
            {tx(UI.ob_start)}
          </div>
          <Calendar value={start} onChange={setStart} labelId={ids.start} />
          {moved && <div className="note">{tx(UI.ob_start_note)}</div>}
        </div>

        {preview && (
          <div className="ob-sum">
            <div>{tx(UI.ob_sum).replace("{from}", preview.from).replace("{to}", preview.to).replace("{words}", String(preview.wpd))}</div>
            <div className="note">{tx(UI.ob_hours).replace("{need}", String(preview.need)).replace("{have}", String(preview.have))}</div>
            <div className={preview.have < preview.need * 0.85 ? "ob-warn" : "note"}>
              {tx(preview.have < preview.need * 0.85 ? UI.ob_tight : UI.ob_ok)}
            </div>
          </div>
        )}
        <div className="ob-err" role="alert">
          {err}
        </div>
        <div className="ob-actions">
          {edit && (
            <button type="button" className="btn" onClick={onClose}>
              {tx(UI.ob_cancel)}
            </button>
          )}
          <button type="submit" className="btn primary">
            {tx(edit ? UI.ob_save : UI.ob_go)}
          </button>
        </div>
      </form>
    </div>
  );
}
