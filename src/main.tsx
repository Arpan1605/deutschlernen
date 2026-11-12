import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { bootLocal, bootRemote } from "./lib/boot";
import { warmVoices } from "./lib/speech";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/modules.css";
import "./styles/features.css";

bootLocal();
warmVoices();

/** Render immediately from local data; show onboarding only once remote storage has answered. */
function Root() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    bootRemote().finally(() => setReady(true));
  }, []);
  return <App ready={ready} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
