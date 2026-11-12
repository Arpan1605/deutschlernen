/** Every interface string in German and English. Entries written as functions
 *  are computed from the learner's current plan (dates, goal, word counts). */
import { B, type Bi } from "../lib/i18n";
import { nf } from "../lib/text";
import { short } from "../lib/dates";
import { LADDER, EXAM } from "./levels";
import { plan, prof, startIdx, wordGoal, wordsPerDay, dateOf } from "../lib/plan";

export const UI: Record<string, Bi> = {
  ob_title_new: B("Willkommen! Lass uns deinen Plan bauen.", "Welcome! Let's build your plan."),
  ob_title_edit: B("Dein Plan", "Your plan"),
  ob_lead: B(
    "Drei Fragen, dann stellt die Seite jeden Tag Material auf deinem Niveau zusammen. Keine Anmeldung nötig.",
    "Three questions, then the site puts together material at your level every day. No sign-up needed.",
  ),
  ob_lead_edit: B(
    "Du kannst Name, Ziel, Dauer und Startdatum jederzeit ändern. Dein Fortschritt bleibt erhalten.",
    "You can change your name, goal, length and start date any time. Your progress is kept.",
  ),
  ob_name: B("Wie heißt du?", "What's your name?"),
  ob_cur: B("Wo stehst du jetzt?", "Where are you now?"),
  ob_tgt: B("Welches Niveau willst du erreichen?", "Which level do you want to reach?"),
  ob_days: B("In wie vielen Tagen?", "In how many days?"),
  ob_custom: B("oder eigene Zahl:", "or your own number:"),
  ob_start: B("Wann startest du?", "When do you start?"),
  ob_start_note: B(
    "Achtung: Ein neues Startdatum verschiebt, welche Aufgaben zu welchem Tag gehören. Bereits erstelltes Material bleibt gespeichert.",
    "Note: a new start date shifts which tasks belong to which day. Material you already created stays saved.",
  ),
  ob_need_start: B("Bitte wähle ein gültiges Startdatum.", "Please choose a valid start date."),
  ob_go: B("Plan erstellen", "Create my plan"),
  ob_save: B("Speichern", "Save"),
  ob_cancel: B("Abbrechen", "Cancel"),
  ob_need_name: B("Bitte gib deinen Namen ein.", "Please enter your name."),
  ob_need_tgt: B("Das Ziel muss über deinem jetzigen Niveau liegen.", "Your goal has to be above your current level."),
  ob_need_days: B("Wähle zwischen 14 und 365 Tagen.", "Choose between 14 and 365 days."),
  ob_a0: B("Anfänger", "Beginner"),
  ob_days_u: B("Tage", "days"),
  ob_sum: B(
    "Plan: {from} → {to} · {words} neue Wörter pro Tag · etwa 2½–3 Std. täglich",
    "Plan: {from} → {to} · {words} new words a day · about 2½–3 hrs daily",
  ),
  ob_hours: B(
    "Grobe Schätzung: {need} Lernstunden nötig, dein Plan bringt rund {have}.",
    "Rough estimate: {need} study hours needed, your plan gives about {have}.",
  ),
  ob_tight: B("Sehr sportlich – mehr Tage machen das Ziel realistischer.", "Very ambitious – more days make the goal more realistic."),
  ob_ok: B("Das passt gut.", "That works well."),
  hello: B("Hallo", "Hi"),
  pdf_one: B("PDF herunterladen", "Download PDF"),
  pdf_day: B("Tages-PDF (alle Aufgaben)", "Day PDF (all tasks)"),
  pdf_test: B("Test als PDF", "Test as PDF"),
  pdf_all_words: B("Alle Wörter als PDF", "All words as PDF"),
  pdf_all_pat: B("Alle 100 Muster als PDF", "All 100 patterns as PDF"),
  pdf_making: B("PDF wird erstellt …", "Making the PDF …"),
  pdf_saved: B("PDF gespeichert ✓", "PDF saved ✓"),
  pdf_busy: B(
    "Ein Download-Fenster ist schon offen. Versuch es gleich nochmal.",
    "A download prompt is already open. Try again in a moment.",
  ),
  pdf_lib: B(
    "Der PDF-Baustein konnte nicht geladen werden. Prüf deine Internetverbindung.",
    "The PDF component couldn't load. Check your internet connection.",
  ),
  pdf_unavail: B(
    "Downloads sind in dieser Ansicht nicht möglich. Öffne die Seite in claude.ai oder der Claude-App.",
    "Downloads aren't available in this view. Open the page in claude.ai or the Claude app.",
  ),
  nav_syn: B("Satzbau", "Sentences"),
  syn_h: B("Satzbau: wie ein deutscher Satz funktioniert", "Sentence building: how a German sentence works"),
  syn_lead: B(
    "Subjekt, Verb, Objekt – und warum das Verb auf Position 2 steht. Oben die Regeln mit Audio, darunter die Übung von heute (sie ist auch eine Aufgabe auf der Seite „Heute“).",
    "Subject, verb, object – and why the verb sits in position 2. The rules with audio at the top, today's exercise below (it's also a task on the Today page).",
  ),
  nav_heute: B("Heute", "Today"),
  nav_plan: B("Plan", "Plan"),
  nav_uebung: B("Tagestest", "Daily test"),
  nav_wtest: B("Wochentest", "Weekly mock"),
  nav_wort: B("Wortschatz", "Vocabulary"),
  nav_serie: B("Hörspiel", "Audio drama"),
  nav_roman: B("Roman", "Novel"),
  nav_musik: B("Lieder", "Songs"),
  nav_muster: B("Muster", "Patterns"),
  nav_chat: B("Gespräch", "Conversation"),
  nav_pruef: B("Prüfung", "Exam"),
  prev: B("← Zurück", "← Back"),
  today: B("Heute", "Today"),
  next: B("Weiter →", "Next →"),
  progress: B("Fortschritt", "Progress"),
  s_days: B("Tage komplett", "Days complete"),
  s_streak: B("Serie (Tage)", "Streak (days)"),
  s_words: B("Wörter gelernt", "Words learned"),
  lvl_label: B("Niveau für neues Material", "Level for new material"),
  lvl_auto: B("Automatisch nach Plan", "Automatic, by plan"),
  lvl_hint: B(
    "Gilt für alles, was ab jetzt neu erstellt wird. Zu schwer? Stell auf A2 und erstelle den Inhalt neu.",
    "Applies to anything created from now on. Too hard? Switch to A2 and create the material again.",
  ),
  goal3000: () => B("Wortschatz-Ziel " + nf(wordGoal()), "Vocabulary goal " + nf(wordGoal())),
  levelpath: () =>
    B(
      "Dein Weg: " + LADDER[startIdx()] + " → " + prof().target + " in " + plan.total + " Tagen",
      "Your path: " + LADDER[startIdx()] + " → " + prof().target + " in " + plan.total + " days",
    ),
  notesLabel: B("Notizen: Fragen, Fehler, Gedanken", "Notes: questions, mistakes, thoughts"),
  notesPh: B("z. B. „sich gewöhnen an + Akk“ immer falsch.", "e.g. keep getting 'sich gewöhnen an + Akk' wrong."),
  plan_h: () =>
    B(plan.nweeks + " Wochen, " + plan.phases.length + " Abschnitte", plan.nweeks + " weeks, " + plan.phases.length + " stages"),
  plan_lead: B(
    "Jede Woche hat ein Thema und einen Grammatikblock. Tippe auf einen Tag, um ihn zu öffnen.",
    "Each week has a topic and a grammar block. Tap a day to open it.",
  ),
  vocab_h: () => B("Wortschatz: " + nf(wordGoal()) + " Wörter", "Vocabulary: " + nf(wordGoal()) + " words"),
  vocab_lead: () =>
    B(
      "Jeden Tag (außer Sonntag) erstellt Claude " +
        wordsPerDay() +
        " neue, häufige Wörter zum Wochenthema – mit Artikel, Plural, Beispielsatz und Aussprache. Hier wiederholst du sie mit Karteikarten nach dem Leitner-System. Bis Tag " +
        plan.total +
        " sind das rund " +
        nf(wordGoal()) +
        " Wörter.",
      "Every day except Sunday, Claude writes " +
        wordsPerDay() +
        " new high-frequency words on the week's topic – with article, plural, example sentence and pronunciation. Review them here with Leitner flashcards. By day " +
        plan.total +
        " that's about " +
        nf(wordGoal()) +
        " words.",
    ),
  vocab_chart: B("Gelernte Wörter vs. Ziel", "Words learned vs. target"),
  v_search: B("Wörter durchsuchen", "Search your words"),
  status: B("Stand", "Status"),
  learned: B("gelernt", "learned"),
  targetToday: B("Ziel bis heute", "target to date"),
  vocab_claim: B(
    "Zur Aussage „95 % mit 3.000 Wörtern“: Das passt ungefähr zur Forschung über Alltagssprache. Bei 95 % ist aber immer noch jedes zwanzigste Wort unbekannt – Zeitungstexte fühlen sich schwerer an. Deshalb liest du hier täglich.",
    "About the '95% with 3,000 words' claim: it roughly matches research on everyday speech. At 95% you still meet one unknown word in twenty, so newspaper texts feel harder. That's why you read here every day.",
  ),
  serie_h: B("Hörspiel: „Die WG am Main“", 'Audio drama: "Die WG am Main"'),
  serie_lead: B(
    "Eine Hörspielserie nur für dich: vier Mitbewohner in Frankfurt, eine Folge pro Tag, gesprochen von deinem Browser. Die Sprache wächst mit deinem Niveau. Alle Folgen findest du hier.",
    "An audio drama written just for you: four flatmates in Frankfurt, one episode a day, read aloud by your browser. The language grows with your level. All episodes are collected here.",
  ),
  serie_offline: B(
    "Echte Serien lassen sich hier nicht einbetten. Wenn du abends doch Netflix schaust: Dark, How to Sell Drugs Online (Fast) und Kleo sind gut für B1–B2 – mit deutschen Untertiteln.",
    "Real TV can't be embedded here. If you watch Netflix in the evening anyway: Dark, How to Sell Drugs Online (Fast) and Kleo are good for B1–B2 – with German subtitles.",
  ),
  roman_h: B("Fortsetzungsroman: „Neuanfang in Frankfurt“", 'Serial novel: "Neuanfang in Frankfurt"'),
  roman_lead: B(
    "Ein Roman, der Kapitel für Kapitel für dich geschrieben wird: Ravi, UX-Designer aus Ahmedabad, beginnt ein neues Leben in Deutschland. Jedes Kapitel hat Glossar und Verständnisfragen.",
    "A novel written for you chapter by chapter: Ravi, a UX designer from Ahmedabad, starts a new life in Germany. Every chapter has a glossary and comprehension questions.",
  ),
  roman_offline: B(
    "Wenn du später echte Bücher lesen willst: Tschick (Herrndorf), Gut gegen Nordwind (Glattauer) und Der Vorleser (Schlink) passen gut zu B1–B2.",
    "When you want real books later: Tschick (Herrndorf), Gut gegen Nordwind (Glattauer) and Der Vorleser (Schlink) suit B1–B2.",
  ),
  songs_h: B("Lied der Woche", "Song of the week"),
  songs_lead: B(
    "Jede Woche schreibt Claude einen neuen Liedtext zum Wochenthema. Hör ihn dir an, füll die Lücken und lies ihn laut mit Rhythmus.",
    "Each week Claude writes new song lyrics on the week's topic. Listen, fill the gaps and read it aloud with rhythm.",
  ),
  pat_h: B("100 Sprechmuster", "100 speaking patterns"),
  pat_lead: B(
    "Aus deinem Arbeitsheft – hier mit Ankerbeispiel, Aussprache und deinen eigenen Sätzen. Schreib drei Sätze über dein Leben, lass sie prüfen, sprich sie fünfmal laut. Hake das Muster ab, wenn es ohne Pause klappt.",
    "From your workbook – here with anchor example, pronunciation and your own sentences. Write three sentences about your life, get them checked, say them out loud five times. Tick the pattern once it comes without pausing.",
  ),
  pat_done: B("automatisiert", "automated"),
  chat_h: B("Gesprächspartner", "Conversation partner"),
  chat_lead: B(
    "Sprich (tippe oder diktiere) mit Claude auf Deutsch über das Wochenthema. Claude antwortet auf deinem Niveau, stellt Fragen und korrigiert deine Fehler kurz am Ende jeder Antwort.",
    "Talk (type or dictate) with Claude in German about the week's topic. Claude answers at your level, asks questions and briefly corrects your mistakes at the end of each reply.",
  ),
  ex_h: () => (EXAM[prof().target] || EXAM.B2).name,
  ex_lead: B(
    "Vier Module, jedes ist mit mindestens 60 % bestanden. Geübt wird alles hier: Tagestest, Wochentest und Gesprächspartner.",
    "Four modules; each is passed with at least 60%. You practise everything here: daily test, weekly mock and conversation partner.",
  ),
  th_mod: B("Modul", "Module"),
  th_dur: B("Dauer", "Time"),
  th_what: B("Was passiert", "What happens"),
  th_train: B("Training hier", "Training here"),
  th_level: B("Niveau", "Level"),
  place_h: B("Einstufungstest", "Placement test"),
  place_lead: B(
    "30 Fragen von A1 bis B2. Mach ihn an Tag 1 und nochmal an Tag 45, um deinen Fortschritt zu sehen.",
    "30 questions from A1 to B2. Take it on day 1 and again on day 45 to see your progress.",
  ),
  mock_h: B("Ergebnis-Log", "Results log"),
  mock_lead: B(
    "Wochentests landen automatisch hier. Du kannst auch Ergebnisse von echten Probeprüfungen eintragen.",
    "Weekly mocks land here automatically. You can also log results from real mock exams.",
  ),
  date: B("Datum", "Date"),
  m_l: B("Lesen %", "Reading %"),
  m_h: B("Hören %", "Listening %"),
  m_s: B("Schreiben %", "Writing %"),
  m_sp: B("Sprechen %", "Speaking %"),
  m_add: B("Eintragen", "Add"),
  m_none: B("Noch keine Ergebnisse. Dein erster Wochentest ist am Sonntag.", "No results yet. Your first weekly mock is on Sunday."),
  real_h: B("Ehrliche Zeitrechnung", "An honest time budget"),
  book_slot: () =>
    B(
      "Buch den Prüfungstermin (" +
        prof().target +
        ") direkt nach dem Zwischen-Check an Tag " +
        plan.check +
        " (" +
        short(dateOf(plan.check)) +
        "). Plan-Ende: " +
        short(dateOf(plan.total)) +
        ". Prüfungszentren sind oft Wochen im Voraus ausgebucht.",
      "Book the exam (" +
        prof().target +
        ") right after the checkpoint on day " +
        plan.check +
        " (" +
        short(dateOf(plan.check)) +
        "). Plan ends: " +
        short(dateOf(plan.total)) +
        ". Exam centres often fill weeks ahead.",
    ),
  saved_local: B("Gespeichert in diesem Browser", "Saved in this browser"),
  saved_sync: B("Mit deinem Konto synchronisiert", "Synced to your account"),
  saving: B("Speichert …", "Saving …"),
  saved_ok: B("Gespeichert ✓", "Saved ✓"),
  saved_fail: B("Nicht synchronisiert – nur in diesem Browser", "Not synced – saved in this browser only"),
  your_text: B("Dein Text", "Your text"),
  text_ph: B("Schreib hier. Der Text wird gespeichert.", "Write here. Your text is saved."),
  words_unit: B("Wörter", "words"),
  planned: B("Geplante Zeit heute", "Planned time today"),
  open_task: B("Öffnen", "Open"),
  close_task: B("Schließen", "Close"),
  go_to: B("Öffnen →", "Open →"),
  week: B("Woche", "Week"),
  day: B("Tag", "Day"),
  today_lc: B("heute", "today"),
  theme: B("Thema", "Topic"),
  grammar: B("Grammatik", "Grammar"),
  forum: B("Forum", "Forum post"),
  talk: B("Vortrag", "Talk"),
  stage: B("Abschnitt", "Stage"),
  left: B("Noch", "Left"),
  days: B("Tage", "days"),
  todayOf: B("Heute: {n} von {t} Aufgaben", "Today: {n} of {t} tasks"),
  cat: B("Kategorie", "Category"),
  open_day: B("Tag öffnen", "Open day"),
  create: B("Inhalt erstellen", "Create the material"),
  creating: B("Claude schreibt dein Material … meist 20–60 Sekunden.", "Claude is writing your material … usually 20–60 seconds."),
  regen: B("Neu erstellen", "Create a new version"),
  check: B("Prüfen", "Check"),
  reset: B("Nochmal", "Try again"),
  show_sol: B("Lösungen zeigen", "Show answers"),
  play: B("▶ Abspielen", "▶ Play"),
  stop: B("■ Stopp", "■ Stop"),
  plays: B("Abgespielt: ", "Played: "),
  speed: B("Tempo", "Speed"),
  transcript: B("Transkript anzeigen", "Show transcript"),
  hide_tr: B("Transkript ausblenden", "Hide transcript"),
  no_voice: B(
    "Dein Browser hat keine deutsche Stimme. Lies das Transkript einmal und beantworte dann die Fragen.",
    "Your browser has no German voice. Read the transcript once, then answer the questions.",
  ),
  hint2: B("Wie in der Prüfung: höchstens zweimal hören.", "Like the exam: listen at most twice."),
  true_: B("Richtig", "True"),
  false_: B("Falsch", "False"),
  grade: B("Bewerten lassen", "Get it marked"),
  grading: B("Claude bewertet …", "Claude is marking …"),
  timer_start: B("Timer starten", "Start timer"),
  timer_stop: B("Timer stoppen", "Stop timer"),
  errors: B("Deine Fehler", "Your mistakes"),
  corrected: B("Verbesserte Version", "Improved version"),
  unavailable: B(
    "Das Material wird von Claude geschrieben. Das klappt nur, wenn du diese Seite in claude.ai oder der Claude-App öffnest.",
    "The material is written by Claude. That only works when you open this page in claude.ai or the Claude app.",
  ),
  e_not_granted: B(
    "Du hast den Zugriff auf Claude abgelehnt. Lade die Seite neu, um ihn zu erlauben.",
    "You declined access to Claude. Reload the page to allow it.",
  ),
  e_rate: B(
    "Gerade zu viele Anfragen oder dein Nutzungslimit ist erreicht. Versuch es später nochmal.",
    "Too many requests right now, or you've reached your usage limit. Try again later.",
  ),
  e_json: B(
    "Das Material kam unvollständig zurück. Klick nochmal auf „Erstellen“.",
    "The material came back incomplete. Click Create again.",
  ),
  e_other: B("Das hat nicht geklappt. Versuch es nochmal.", "That didn't work. Try again."),
  fc_learn: B("Karteikarten lernen", "Study flashcards"),
  fc_due: B("Heute fällig: {n} Karten", "Due today: {n} cards"),
  fc_none: B(
    "Keine Karten fällig. Erstelle die Wörter des Tages oder komm morgen wieder.",
    "No cards due. Create today's words or come back tomorrow.",
  ),
  fc_show: B("Umdrehen", "Flip"),
  fc_again: B("Nochmal", "Again"),
  fc_good: B("Gewusst", "Knew it"),
  fc_easy: B("Leicht", "Easy"),
  fc_done: B("Fertig für jetzt! ✓", "Done for now! ✓"),
  fc_left: B("noch {n}", "{n} left"),
  words_list: B("Wortliste", "Word list"),
  glossary: B("Glossar", "Glossary"),
  examples: B("Beispiele", "Examples"),
  exercises: B("Übungen", "Exercises"),
  tips: B("Merke", "Remember"),
  ep: B("Folge", "Episode"),
  chapter: B("Kapitel", "Chapter"),
  not_yet: B("Noch nicht erstellt.", "Not created yet."),
  open_today: B("Heute öffnen", "Open on Today"),
  my_sent: B("Deine Sätze", "Your sentences"),
  check_sent: B("Sätze prüfen lassen", "Check my sentences"),
  chat_send: B("Senden", "Send"),
  chat_new: B("Neues Gespräch", "New conversation"),
  chat_ph: B("Schreib oder diktiere auf Deutsch …", "Type or dictate in German …"),
  chat_start: B("Gespräch beginnen", "Start the conversation"),
  place_start: B("Einstufungstest erstellen", "Create placement test"),
  place_result: B("Geschätztes Niveau: ", "Estimated level: "),
  u_title: B("Tagestest", "Daily test"),
  w_title: B("Wochentest", "Weekly mock"),
  gen_daily: B("Tagestest erstellen", "Create today's test"),
  gen_week: B("Wochentest erstellen", "Create this week's mock"),
  your_answer: B("Dein Text", "Your text"),
  minwords: B("mind. {n} Wörter · ca. {m} Minuten", "at least {n} words · about {m} minutes"),
  prep: B(
    "1 Min. Vorbereitung, dann {m} Min. sprechen. Nimm dich mit dem Handy auf.",
    "1 min to prepare, then speak for {m} min. Record yourself on your phone.",
  ),
  say_box: B(
    "Was hast du gesagt? Nutze die Diktierfunktion deines Handys oder schreib es aus der Aufnahme ab.",
    "What did you say? Use your phone's dictation, or type it from your recording.",
  ),
  phrases: B("Redemittel", "Useful phrases"),
  partner_q: B("Fragen deines Prüfungspartners – antworte laut:", "Your exam partner's questions – answer out loud:"),
  passmark: B("Bestanden ab 60 %", "Pass mark 60%"),
  to_log: B("Ins Ergebnis-Log übernehmen", "Add to the results log"),
  logged: B("Im Log ✓", "Logged ✓"),
  need_all: B(
    "Bearbeite alle vier Module, dann kannst du das Ergebnis ins Log übernehmen.",
    "Finish all four modules to add the result to the log.",
  ),
  includes_d: B(
    "Ein Lesetext mit 5 Fragen, ein Hörtext mit 5 Richtig/Falsch-Aufgaben, eine Schreib- und eine Sprechaufgabe – zum Wochenthema, auf deinem Niveau. Ca. 30 Minuten.",
    "A reading text with 5 questions, a listening script with 5 true/false items, a writing task and a speaking task – on the week's topic, at your level. About 30 minutes.",
  ),
  includes_w: B(
    "2 Lesetexte (10 Fragen), 2 Hörtexte (10 Aufgaben), Forumsbeitrag und formelle Nachricht, Vortrag mit Diskussionsfragen – im Stil des Goethe-Zertifikats. Ca. 2 Stunden.",
    "2 reading texts (10 questions), 2 listening scripts (10 items), a forum post and a formal message, a talk with discussion questions – in Goethe exam style. About 2 hours.",
  ),
  suggested: B("Empfohlene Zeit", "Suggested time"),
  level: B("Niveau", "Level"),
  lesen: B("Lesen", "Reading"),
  hoeren: B("Hören", "Listening"),
  schreiben: B("Schreiben", "Writing"),
  sprechen: B("Sprechen", "Speaking"),
  text: B("Text", "Text"),
  u_lead: B(
    "Jeden Tag ein kurzer Test in allen vier Modulen. Lesen und Hören werden sofort ausgewertet, Schreiben und Sprechen bewertet Claude nach Goethe-Kriterien.",
    "A short test in all four modules every day. Reading and listening score instantly; Claude marks writing and speaking against Goethe criteria.",
  ),
  w_lead: B(
    "Einmal pro Woche (sonntags) eine größere Probe im Prüfungsformat. Das Ergebnis kommt ins Log, damit du deinen Fortschritt siehst.",
    "Once a week (Sundays) a bigger mock in exam format. The result goes into the log so you can see your progress.",
  ),
  prevWeek: B("← Woche", "← Week"),
  nextWeek: B("Woche →", "Week →"),
  thisWeekBtn: B("Diese Woche", "This week"),
};
