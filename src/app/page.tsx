"use client";

import { useEffect, useState } from "react";

type Lang = "en" | "pcm";

const COPY: Record<
  Lang,
  { message: string; tonight: string; demo: string; send: string }
> = {
  en: {
    message: "Aunty, the baby has not moved since evening.",
    tonight: "Tonight",
    demo: "Demonstration. Not a real conversation.",
    send: "Send",
  },
  pcm: {
    message: "Aunty, the pikin never move since evening.",
    tonight: "This night",
    demo: "Na demonstration. No be real chat.",
    send: "Send am",
  },
};

/** Types the text out one character at a time, the way a worried thumb does. */
function useTyped(text: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setCount(text.length);
      return;
    }

    setCount(0);
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      i += 1;
      setCount(i);
      if (i < text.length) {
        const justTyped = text[i - 1];
        const pause = justTyped === "," ? 420 : 55 + Math.random() * 65;
        timer = setTimeout(tick, pause);
      }
    };

    timer = setTimeout(tick, 1100);
    return () => clearTimeout(timer);
  }, [text]);

  return count;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const copy = COPY[lang];
  const count = useTyped(copy.message);

  return (
    <div className="flex flex-1 flex-col bg-night text-text-night">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7">
        <span className="font-display text-xl font-semibold tracking-tight">
          Aunty Nurse
        </span>
        <span className="rounded-full border border-night-line px-3 py-1.5 text-xs font-medium text-mist">
          Demonstration
        </span>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 sm:px-8">
        <section className="grid min-h-[calc(100svh-5rem)] items-center gap-10 py-10 lg:grid-cols-[1fr_auto] lg:gap-20 lg:py-6">
          <div>
            <p className="text-sm font-medium text-mist">
              Somewhere in Nigeria, tonight
            </p>

            <h1 className="clock mt-3">
              2:14<small>am</small>
            </h1>

            <p className="mt-6 max-w-md font-display text-2xl font-medium leading-snug sm:text-3xl">
              Everyone in the house is asleep. She is not.
            </p>

            <p className="mt-4 max-w-md text-lg leading-8 text-mist">
              She is 31 weeks pregnant, and she is afraid to wait for morning.
            </p>

            <div className="mt-10 hidden items-center gap-4 text-sm text-mist lg:flex">
              <span className="scroll-cue-line" aria-hidden="true" />
              Scroll to stay with her
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div
              className="phone"
              role="img"
              aria-label={`A phone showing a chat with Aunty Nurse at 2:14am. A message is being typed: ${copy.message}`}
            >
              <div className="phone-screen" aria-hidden="true">
                <div className="phone-status">
                  <span>2:14</span>
                  <span className="battery" />
                </div>

                <div className="chat-head">
                  <span className="chat-avatar">AN</span>
                  <span>
                    <span className="block text-[15px] font-semibold leading-tight">
                      Aunty Nurse
                    </span>
                    <span className="block text-xs text-green-soft">
                      Licensed nurse-midwife
                    </span>
                  </span>
                </div>

                <div className="chat-thread">
                  <span className="chat-chip">{copy.tonight}</span>
                  <span className="mt-auto text-center text-[11px] leading-4 text-green-soft">
                    {copy.demo}
                  </span>
                </div>

                <div className="composer">
                  <div className="composer-field">
                    {copy.message.slice(0, count)}
                    <span className="caret" />
                  </div>
                  <span className="composer-send" title={copy.send}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 19V5" />
                      <path d="M5 12l7-7 7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <div className="lang-switch" role="group" aria-label="Chat language">
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

            <div className="flex items-center gap-4 text-sm text-mist lg:hidden">
              <span className="scroll-cue-line" aria-hidden="true" />
              Scroll to stay with her
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
