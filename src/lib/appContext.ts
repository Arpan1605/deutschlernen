import { createContext, useContext } from "react";

/** UI-level state shared between pages: which day/week is being viewed, and opening the profile editor. */
export interface AppCtx {
  day: number;
  setDay: (d: number) => void;
  week: number;
  setWeek: (w: number) => void;
  openProfile: () => void;
}
export const AppContext = createContext<AppCtx | null>(null);
export const useApp = () => {
  const c = useContext(AppContext);
  if (!c) throw new Error("AppContext missing");
  return c;
};
