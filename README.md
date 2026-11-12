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
| AI + storage | Inside Claude: the artifact runtime (`window.claude`) – `sample`, `db` (private per-user storage), `user`, `downloads`. Elsewhere: Claude API (visitor's key or `api/claude.js` server function) + `localStorage` |
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
    standalone.ts          Claude API + browser downloads when hosted elsewhere
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
api/claude.js              optional Vercel server function that holds your API key
```

## Data

Signed-in viewers' data lives in their private space `data/users/<id>/plan/…` (days, content, tests, wtests, mocks, meta/profile|settings|patterns). Everything is mirrored to `localStorage`. Data formats are unchanged from the original single-file version, so existing progress loads as-is.

## Hosting outside Claude (GitHub Pages, Vercel, Netlify …)

Outside Claude the app switches to `src/lib/standalone.ts`:

- **PDFs** download through the browser.
- **Progress** is saved in the visitor's browser (`localStorage`).
- **Lessons, tests and marking** call the Claude API in one of two ways:

**Option A – each visitor uses their own key (any static host, e.g. GitHub Pages).**
Deploy `dist/index.html` as is. On first visit the welcome window has a "Claude connection" field; the visitor pastes an Anthropic API key (console.anthropic.com → API Keys). The key stays in their browser and is sent directly to `api.anthropic.com`; usage is billed to their API account. Fine for yourself or a few people you trust; don't share your own key this way.

**Option B – one key on your server, visitors need nothing (Vercel).**
1. Import the repo into Vercel. `api/claude.js` becomes a server function.
2. In Project → Settings → Environment Variables set `ANTHROPIC_API_KEY` (your key), `VITE_AI_PROXY_URL=/api/claude`, and optionally `ALLOWED_ORIGIN=https://your-site.vercel.app`.
3. Build command `npm run build`, output directory `dist`.
Every visitor then uses your key, so set a monthly spend limit in the Anthropic console.

Models default to `claude-sonnet-5-5` (material, marking) and `claude-haiku-5-5` (chat, quick checks); override with `VITE_AI_MODEL` / `VITE_AI_QUICK_MODEL` (and `AI_MODEL` / `AI_QUICK_MODEL` for the server function).
