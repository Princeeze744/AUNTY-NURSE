"use client";

import Link from "next/link";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/* The frame around every screen of the mother's app:
   it keeps time with her, remembers her language,
   and keeps "I'm worried" in the same place on every screen. */

export type Lang = "en" | "pcm";

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function useLang() {
  return useContext(LangContext);
}

/** Night is 7pm to 6am on her own phone. ?time=day or ?time=night previews either. */
function timeOfDay(): "night" | "day" {
  const forced = new URLSearchParams(window.location.search).get("time");
  if (forced === "night" || forced === "day") return forced;
  const hour = new Date().getHours();
  return hour >= 19 || hour < 6 ? "night" : "day";
}

export default function MotherShell({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("an-lang");
      if (saved === "en" || saved === "pcm") setLangState(saved);
    } catch {
      // Storage can be blocked. English is a safe start.
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem("an-lang", next);
    } catch {
      // Not remembered this time. The switch still works.
    }
  };

  // Re-check the clock every minute, so evening arrives while she is using it.
  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.time = timeOfDay();
    };
    apply();
    const id = window.setInterval(apply, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div className="app">
        <header className="app-bar">
          <Link href="/" className="app-mark">
            Aunty Nurse
          </Link>
          <div className="app-lang" role="group" aria-label="Language">
            <button
              type="button"
              aria-pressed={lang === "en"}
              onClick={() => setLang("en")}
            >
              English
            </button>
            <button
              type="button"
              aria-pressed={lang === "pcm"}
              onClick={() => setLang("pcm")}
            >
              Pidgin
            </button>
          </div>
        </header>

        <main className="app-main">{children}</main>

        <Link href="/check" className="worried">
          {lang === "en" ? "I'm worried" : "I dey worry"}
        </Link>
      </div>
    </LangContext.Provider>
  );
}
