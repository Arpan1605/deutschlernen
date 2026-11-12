import { useEffect, useMemo, useState } from "react";
import { state, useStore } from "./lib/store";
import { todayIdx, weekOf } from "./lib/plan";
import { getLang } from "./lib/i18n";
import { AppContext } from "./lib/appContext";
import { useRoute, type Route } from "./lib/router";
import { Header } from "./components/layout/Header";
import { RouteBar } from "./components/layout/RouteBar";
import { Onboarding } from "./components/onboarding/Onboarding";
import { TodayPage } from "./pages/TodayPage";
import { PlanPage } from "./pages/PlanPage";
import { DailyTestPage } from "./pages/DailyTestPage";
import { WeeklyTestPage } from "./pages/WeeklyTestPage";
import { SentencesPage } from "./pages/SentencesPage";
import { VocabularyPage } from "./pages/VocabularyPage";
import { AudioDramaPage, NovelPage, SongsPage } from "./pages/ArchivePage";
import { PatternsPage } from "./pages/PatternsPage";
import { ConversationPage } from "./pages/ConversationPage";
import { ExamPage } from "./pages/ExamPage";

const PAGES: Record<Route, () => JSX.Element> = {
  heute: TodayPage,
  plan: PlanPage,
  uebung: DailyTestPage,
  wochentest: WeeklyTestPage,
  satzbau: SentencesPage,
  wortschatz: VocabularyPage,
  serie: AudioDramaPage,
  roman: NovelPage,
  musik: SongsPage,
  muster: PatternsPage,
  gespraech: ConversationPage,
  pruefung: ExamPage,
};

export function App({ ready }: { ready: boolean }) {
  useStore();
  const route = useRoute();
  const [day, setDay] = useState(todayIdx());
  const [week, setWeek] = useState(weekOf(todayIdx()));
  const [profileOpen, setProfileOpen] = useState(false);
  const needsOnboarding = ready && !state.profile?.name;
  const startKey = state.profile?.start + ":" + state.profile?.days;

  // When the plan's dates change, jump back to today.
  useEffect(() => {
    setDay(todayIdx());
    setWeek(weekOf(todayIdx()));
  }, [startKey, ready]);
  useEffect(() => {
    document.documentElement.lang = getLang();
  });

  const ctx = useMemo(() => ({ day, setDay, week, setWeek, openProfile: () => setProfileOpen(true) }), [day, week]);
  const Page = PAGES[route];
  return (
    <AppContext.Provider value={ctx}>
      <Header route={route} />
      <RouteBar current={day} />
      <main className="wrap">
        <Page />
      </main>
      {(needsOnboarding || profileOpen) && <Onboarding edit={!needsOnboarding} onClose={() => setProfileOpen(false)} />}
    </AppContext.Provider>
  );
}
