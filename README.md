# Fahrplan

A personal, day-by-day German study plan from beginner (A0) up to C1, built around the Goethe-Zertifikat exams. Each visitor enters their name, current level, target level, number of days and a start date; the app then builds a plan and has Claude write the daily material at the right level.

## Tech stack

| Layer | Choice |
|---|---|
| UI | **React 18** (function components + hooks) |
| Language | **TypeScript 5** (strict) |
| Build | **Vite 5** with `@vitejs/plugin-react` and `vite-plugin-singlefile` (the whole app ships as one HTML file) |
| Styling | Plain CSS with design tokens (custom properties), light + dark themes, no CSS framework |
| PDF | **jsPDF** (loaded on demand) |
| Audio | Browser Web Speech API (German voices) |
| AI + storage | Claude artifact runtime (`window.claude`): `sample` (Claude), `db` (private per-user storage), `user`, `downloads` |
| Fallback storage | `localStorage` |
| Fonts | Barlow, Barlow Condensed, JetBrains Mono (Google Fonts) |

## Scripts

```bash
npm install
npm run dev        # local dev server (AI, sync and PDF downloads need the Claude runtime)
npm run typecheck  # TypeScript only
npm run build      # dist/index.html — a single self-contained file
npm run artifact   # build + dist/artifact.html for publishing as a Claude artifact
npm run format     # Prettier
```

## Folder structure

```
src/
  main.tsx                 entry: local boot, then remote storage
  App.tsx                  layout, routing, onboarding gate, shared day/week state
  types.ts                 saved data shapes
  data/                    static content
    strings.ts             all UI text (German + English)
    levels.ts              CEFR ladder, level descriptions, exam formats, planning constants
    weeks.ts               13 topic + grammar blocks
    patterns.ts            the 100 workbook speaking patterns
    roles.ts, sentenceRules.ts, skills.ts, tips.ts
  lib/                     logic, no UI
    plan.ts                profile → dates, stages, level per day, grammar block, daily tasks
    prompts.ts             every prompt sent to Claude
    ai.ts                  JSON generation, marking, error messages
    store.ts               state, persistence, React subscription
    boot.ts                connect storage, migrate legacy data, load
    runtime.ts             typed wrappers for window.claude capabilities
    srs.ts                 Leitner flashcards
    progress.ts            day status, streak
    speech.ts              read-aloud
    i18n.ts, dates.ts, text.ts, router.ts, appContext.ts
    pdf/                   worksheet builder, sections, download
  components/
    layout/                Header (tabs, user chip, language), RouteBar
    onboarding/            Onboarding, Calendar, Segmented
    tasks/                 TaskCard, modules (one per task type)
    blocks/                Reading, Listening, Production, Feedback, Flashcards, GrammarLesson,
                           SentenceRules, SentenceExercise, SongGaps, PatternCard, VocabTable, TestModules
    ui/                    SpeakButton, GenerateButton, PdfButton, CheckButton, Timer, ModShell, StatusLine
  pages/                   Today, Plan, DailyTest, WeeklyTest, Sentences, Vocabulary,
                           Archive (audio drama, novel, songs), Patterns, Conversation, Exam
  styles/                  tokens.css, base.css, modules.css, features.css
scripts/to-artifact.mjs    strips the document shell for the artifact host
```

## Data

Signed-in viewers' data lives in their private space `data/users/<id>/plan/…` (days, content, tests, wtests, mocks, meta/profile|settings|patterns). Everything is mirrored to `localStorage`. Data formats are unchanged from the original single-file version, so existing progress loads as-is.

## Running outside Claude

The plan, onboarding, sentence rules, patterns, read-aloud and progress tracking work anywhere. Claude-generated material, marking, account sync and PDF downloads need the Claude artifact runtime; to host elsewhere, replace `lib/runtime.ts` with your own backend (e.g. an API route that calls the Anthropic API with your key).
