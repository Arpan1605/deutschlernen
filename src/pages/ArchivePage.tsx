import { tx } from "../lib/i18n";
import { UI } from "../data/strings";
import { state } from "../lib/store";
import { plan, buildDay, todayIdx, weekOf, weekTheme, type ModKey } from "../lib/plan";
import { pad3, range } from "../lib/text";
import { taskBuilder, songKey } from "../lib/pdf/sections";
import { REAL_SONGS } from "../data/weeks";
import { EpisodeTask, StoryTask, SongTask } from "../components/tasks/modules";
import { PdfButton } from "../components/ui/PdfButton";
import { getLang } from "../lib/i18n";

/** One collapsible entry: renders its task module only when opened. */
function Entry({ d, mod, label, open }: { d: number; mod: ModKey; label: string; open?: boolean }) {
  const q = buildDay(d).find((x) => x.mod === mod);
  const Body = mod === "episode" ? EpisodeTask : mod === "story" ? StoryTask : SongTask;
  return (
    <details open={open}>
      <summary>{label}</summary>
      {q && (
        <div className="stack">
          <Body d={d} q={q} />
          <div className="pdfbar">
            <PdfButton label={tx(UI.pdf_one)} make={() => taskBuilder(d, q)} />
          </div>
        </div>
      )}
    </details>
  );
}

/** Audio drama episodes or novel chapters, newest last; today's opens automatically. */
export function SeriesArchive({
  kind,
  mod,
  heading,
  lead,
  offline,
  unit,
}: {
  kind: "ep" | "story";
  mod: ModKey;
  heading: string;
  lead: string;
  offline: string;
  unit: string;
}) {
  const t = todayIdx();
  const days = range(1, plan.total + 1).filter((d) => state.content[kind + "-d" + pad3(d)]);
  const todayHas = buildDay(t).some((q) => q.mod === mod);
  return (
    <section className="view">
      <div className="sec-title">
        <div>
          <h2>{heading}</h2>
          <p className="lead">{lead}</p>
        </div>
      </div>
      <div className="archive">
        {days.map((d) => {
          const C = state.content[kind + "-d" + pad3(d)];
          return (
            <Entry
              key={d}
              d={d}
              mod={mod}
              open={d === t}
              label={unit + " " + (C.data?.no || "") + ": " + (C.data?.title || "") + " · " + tx(UI.day) + " " + d}
            />
          );
        })}
        {todayHas && !state.content[kind + "-d" + pad3(t)] && <Entry d={t} mod={mod} open label={tx(UI.day) + " " + t} />}
        {!days.length && !todayHas && <p className="note">{tx(UI.not_yet)}</p>}
      </div>
      <p className="offline">{offline}</p>
    </section>
  );
}

export const AudioDramaPage = () => (
  <SeriesArchive
    kind="ep"
    mod="episode"
    heading={tx(UI.serie_h)}
    lead={tx(UI.serie_lead)}
    offline={tx(UI.serie_offline)}
    unit={tx(UI.ep)}
  />
);
export const NovelPage = () => (
  <SeriesArchive
    kind="story"
    mod="story"
    heading={tx(UI.roman_h)}
    lead={tx(UI.roman_lead)}
    offline={tx(UI.roman_offline)}
    unit={tx(UI.chapter)}
  />
);

/** One song per plan week. */
export function SongsPage() {
  const cw = weekOf(todayIdx());
  return (
    <section className="view">
      <div className="sec-title">
        <div>
          <h2>{tx(UI.songs_h)}</h2>
          <p className="lead">{tx(UI.songs_lead)}</p>
        </div>
      </div>
      <div className="archive">
        {range(0, cw + 1).map((w) => {
          const d = w * 7 + 1,
            C = state.content[songKey(d)];
          return (
            <Entry
              key={w}
              d={d}
              mod="song"
              open={w === cw}
              label={tx(UI.week) + " " + (w + 1) + " · " + tx(weekTheme(d).t) + (C ? " · ♪ " + (C.data?.title || "") : "")}
            />
          );
        })}
      </div>
      <p className="offline">
        {(getLang() === "de"
          ? "Echte deutsche Lieder zum Weiterhören in deiner Musik-App: "
          : "Real German songs to play in your music app: ") + REAL_SONGS.join(" · ")}
      </p>
    </section>
  );
}
