/** Content for each kind of daily task. Each module creates its material with
 *  Claude on first open, then renders the interactive exercise. */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { tx } from "../../lib/i18n";
import { UI } from "../../data/strings";
import { cget, cset, cwork, saveC, binder } from "../../lib/store";
import { pad3 } from "../../lib/text";
import { levelFor, weekTheme, type Task } from "../../lib/plan";
import { generateJson } from "../../lib/ai";
import * as prompts from "../../lib/prompts";
import { dueCards } from "../../lib/srs";
import { songKey } from "../../lib/pdf/sections";
import { GenerateButton } from "../ui/GenerateButton";
import { CheckButton, Score } from "../ui/CheckButton";
import { VocabTable } from "../blocks/VocabTable";
import { Flashcards } from "../blocks/Flashcards";
import { GrammarLesson } from "../blocks/GrammarLesson";
import { ReadingBlock, mcScore } from "../blocks/ReadingBlock";
import { ListeningBlock } from "../blocks/ListeningBlock";
import { ProductionBlock } from "../blocks/ProductionBlock";
import { SongGaps } from "../blocks/SongGaps";
import { PatternCard } from "../blocks/PatternCard";
import { SentenceRules } from "../blocks/SentenceRules";
import { SentenceExercise } from "../blocks/SentenceExercise";

type ModProps = { d: number; q: Task };

/** Shared pattern: generate on first open, offer a fresh version afterwards. */
function useGenerated(
  key: string,
  kind: string,
  d: number,
  prompt: () => string,
  valid: (r: any) => boolean,
  extra: Record<string, unknown> = {},
) {
  const C = cget(key);
  const make = async (again = false) => {
    const R = await generateJson(prompt() + (again ? "\nErstelle eine NEUE Version mit anderen Beispielen." : ""), valid);
    cset(key, { kind, day: d, data: R, st: {}, ...extra });
  };
  const create = <GenerateButton label={tx(UI.create)} onGenerate={() => make()} />;
  const regen = <GenerateButton variant="regen" label={tx(UI.regen)} onGenerate={() => make(true)} />;
  return { C, create, regen, bind: binder(() => saveC(key)) };
}

export function VocabTask({ d }: ModProps) {
  const { C, create } = useGenerated(
    "vocab-d" + pad3(d),
    "vocab",
    d,
    () => prompts.vocabPrompt(d),
    (R) => R.words?.length >= 5,
    { st: { cards: {} } },
  );
  const [drill, setDrill] = useState(false);
  if (!C) return create;
  if (drill) return <Flashcards cards={dueCards()} onDone={() => setDrill(false)} />;
  return (
    <>
      <div className="player">
        <button type="button" className="btn primary" onClick={() => setDrill(true)}>
          {tx(UI.fc_learn)} ({dueCards().length})
        </button>
      </div>
      <VocabTable words={C.data.words} />
    </>
  );
}

export function ReviewTask() {
  const [list] = useState(dueCards);
  const [done, setDone] = useState(false);
  if (!list.length || done) return <p className="note">{tx(UI.fc_none)}</p>;
  return (
    <>
      <p className="note" style={{ margin: 0 }}>
        {tx(UI.fc_due).replace("{n}", String(list.length))}
      </p>
      <Flashcards cards={list} onDone={() => setDone(true)} />
    </>
  );
}

export function GrammarTask({ d }: ModProps) {
  const { C, create, regen, bind } = useGenerated(
    "gram-d" + pad3(d),
    "gram",
    d,
    () => prompts.grammarPrompt(d),
    (R) => !!R.exercises?.length,
  );
  if (!C) return create;
  C.st = C.st || {};
  return (
    <>
      <GrammarLesson G={C.data} st={C.st} {...bind} />
      {regen}
    </>
  );
}

export function SyntaxTask({ d, rulesOpen = false }: ModProps & { rulesOpen?: boolean }) {
  const { C, create, regen, bind } = useGenerated(
    "syn-d" + pad3(d),
    "syn",
    d,
    () => prompts.syntaxPrompt(d),
    (R) => !!R.build?.length,
  );
  if (!C)
    return (
      <>
        <SentenceRules open={rulesOpen} />
        {create}
      </>
    );
  C.st = C.st || {};
  return (
    <>
      <SentenceRules open={rulesOpen} />
      <SentenceExercise S={C.data} st={C.st} day={C.day || d} onChange={bind.onChange} />
      {regen}
    </>
  );
}

export function ReadingTask({ d }: ModProps) {
  const { C, create, bind } = useGenerated(
    "read-d" + pad3(d),
    "read",
    d,
    () => prompts.readingPrompt(d),
    (R) => !!(R.text && R.questions),
  );
  if (!C) return create;
  const st = (C.st = C.st || {});
  return (
    <>
      <ReadingBlock R={C.data} st={st} onChange={bind.onChange} />
      <CheckButton
        checked={!!st.checked}
        onToggle={() => {
          if (st.checked) C.st = {};
          else st.checked = true;
          bind.onChange();
        }}
      >
        <Score value={mcScore(C.data.questions, st)} />
      </CheckButton>
    </>
  );
}

export function StoryTask({ d }: ModProps) {
  const { C, create, bind } = useGenerated(
    "story-d" + pad3(d),
    "story",
    d,
    () => prompts.storyPrompt(d),
    (R) => !!R.text,
  );
  if (!C) return create;
  const st = (C.st = C.st || {});
  const R = { ...C.data, title: tx(UI.chapter) + " " + (C.data.no || "") + ": " + (C.data.title || "") };
  return (
    <>
      <ReadingBlock R={R} st={st} onChange={bind.onChange} />
      <CheckButton
        checked={!!st.checked}
        onToggle={() => {
          if (st.checked) C.st = {};
          else st.checked = true;
          bind.onChange();
        }}
      />
    </>
  );
}

export function EpisodeTask({ d }: ModProps) {
  const { C, create, bind } = useGenerated(
    "ep-d" + pad3(d),
    "ep",
    d,
    () => prompts.episodePrompt(d),
    (R) => !!R.lines?.length,
  );
  if (!C) return create;
  const st = (C.st = C.st || {});
  const H = { ...C.data, title: tx(UI.ep) + " " + (C.data.no || "") + ": " + (C.data.title || "") };
  return (
    <>
      <ListeningBlock H={H} st={st} onChange={bind.onChange} />
      <CheckButton
        checked={!!st.checked}
        onToggle={() => {
          if (st.checked) C.st = { rate: st.rate, plays: st.plays, noVoice: st.noVoice };
          else st.checked = true;
          bind.onChange();
        }}
      />
    </>
  );
}

export function SongTask({ d }: ModProps) {
  const key = songKey(d);
  const { C, create, bind } = useGenerated(
    key,
    "song",
    d,
    () => prompts.songPrompt(d),
    (R) => !!R.lines?.length,
  );
  if (!C) return create;
  C.st = C.st || {};
  return <SongGaps S={C.data} st={C.st} {...bind} />;
}

export function WriteTask({ d, q }: ModProps) {
  const key = "write-d" + pad3(d),
    C = cwork(key, "write", d),
    bind = binder(() => saveC(key));
  C.st = C.st || {};
  return <ProductionBlock kind="schreiben" P={{}} st={C.st} lv={levelFor(d)} taskText={q.task || tx(q.body)} noMeta {...bind} />;
}

export function TalkTask({ d, q }: ModProps) {
  const key = "talk-d" + pad3(d),
    C = cwork(key, "talk", d),
    bind = binder(() => saveC(key)),
    lv = levelFor(d);
  C.st = C.st || {};
  return <ProductionBlock kind="sprechen" P={{ task_de: q.task, minutes: lv.speak }} st={C.st} lv={lv} taskText={q.task || ""} {...bind} />;
}

export function GramTestTask({ d }: ModProps) {
  const key = "gt-d" + pad3(d),
    C = cwork(key, "gt", d),
    bind = binder(() => saveC(key)),
    W = weekTheme(d);
  C.st = C.st || {};
  const subs = W.sub.map((s) => s.de).join("; ");
  return (
    <ProductionBlock
      kind="schreiben"
      P={{ task_de: "10 eigene Sätze mit: " + W.g.de + " (" + subs + ")" }}
      st={C.st}
      lv={levelFor(d)}
      taskText={"Zehn eigene Sätze, die diese Grammatik korrekt verwenden: " + W.g.de + " – " + subs + ". Bewerte vor allem die Grammatik."}
      noMeta
      noTimer
      {...bind}
    />
  );
}

export function PatternsTask({ q }: ModProps) {
  return (
    <div className="pat-grid">
      {(q.pats || []).map((i) => (
        <PatternCard key={i} i={i} />
      ))}
    </div>
  );
}

/** Pick the module component for a task. */
export function TaskContent({ d, q }: ModProps) {
  switch (q.mod) {
    case "vocab":
      return <VocabTask d={d} q={q} />;
    case "review":
      return <ReviewTask />;
    case "grammar":
      return <GrammarTask d={d} q={q} />;
    case "syntax":
      return <SyntaxTask d={d} q={q} />;
    case "reading":
      return <ReadingTask d={d} q={q} />;
    case "story":
      return <StoryTask d={d} q={q} />;
    case "episode":
      return <EpisodeTask d={d} q={q} />;
    case "song":
      return <SongTask d={d} q={q} />;
    case "write":
      return <WriteTask d={d} q={q} />;
    case "talk":
      return <TalkTask d={d} q={q} />;
    case "gramtest":
      return <GramTestTask d={d} q={q} />;
    case "patterns":
      return <PatternsTask d={d} q={q} />;
    default:
      return null;
  }
}
