"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/* ─────────────────────────────────────────────
   Aunty Nurse — the "2:14am" page.
   Night at the top, morning at the bottom.

   CLINICAL NOTE: the midwife's reply and the three demonstration
   questions are DRAFTS drawn from WHO danger-sign guidance. They must be
   approved by the midwife and reviewed by a doctor before anyone outside
   the team sees this page.
   ───────────────────────────────────────────── */

type Lang = "en" | "pcm";
type Outcome = "NOW" | "SOON" | "NONE";

const COPY: Record<
  Lang,
  {
    message: string;
    reply: string;
    tonight: string;
    demo: string;
    voice: string;
    placeholder: string;
  }
> = {
  en: {
    message: "Aunty, the baby has not moved since evening.",
    reply:
      "I'm here. Thank you for telling me now. When a baby has not moved since evening, we do not wait for morning. Answer three quick questions for me.",
    tonight: "Tonight",
    demo: "Demonstration. Not a real conversation.",
    voice: "Voice note",
    placeholder: "Write to Aunty Nurse",
  },
  pcm: {
    message: "Aunty, the pikin never move since evening.",
    reply:
      "I dey here. Thank you say you tell me now. If pikin never move since evening, we no dey wait till morning. Answer three quick questions for me.",
    tonight: "This night",
    demo: "Na demonstration. No be real chat.",
    voice: "Voice note",
    placeholder: "Write give Aunty Nurse",
  },
};

/* The background at each point of the story. */
const STAGES: { bg: string; tone: "night" | "day" }[] = [
  { bg: "#0b1712", tone: "night" }, // 2:14am
  { bg: "#10241b", tone: "night" }, // the reply
  { bg: "#1d4d38", tone: "night" }, // the check
  { bg: "#e3e4d3", tone: "day" }, // the number
  { bg: "#f6f1e6", tone: "day" }, // morning
];

const QUESTIONS: { text: string; ifYes: Outcome }[] = [
  {
    text: "Is there bleeding from the vagina, a fit, a severe headache with blurred vision, or fast or difficult breathing?",
    ifYes: "NOW",
  },
  {
    text: "Has the baby stopped moving, or is the baby moving much less than usual?",
    ifYes: "NOW",
  },
  {
    text: "Is there a fever, or swelling of the face or hands?",
    ifYes: "SOON",
  },
];

const WAVE = [30, 55, 80, 45, 95, 60, 35, 70, 100, 50, 75, 40, 85, 55, 30, 65, 90, 45, 70, 35, 55, 25];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Types text one character at a time, the way a worried thumb does. */
function useTyped(text: string) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
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

/** True once the element has scrolled into view. */
function useSeen<T extends Element>() {
  const ref = useRef<T | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return [ref, seen] as const;
}

/**
 * Plays the conversation once it is on screen.
 * 0 nothing · 1 her message · 2 midwife typing · 3 reply arriving · 4 voice note
 */
function usePlayback(active: boolean, totalWords: number) {
  const [phase, setPhase] = useState(0);
  const [shown, setShown] = useState(0);
  const total = useRef(totalWords);

  useEffect(() => {
    total.current = totalWords;
  }, [totalWords]);

  useEffect(() => {
    if (!active) return;

    if (prefersReducedMotion()) {
      setPhase(4);
      setShown(9999);
      return;
    }

    const timers: number[] = [];
    const after = (ms: number, fn: () => void) => {
      timers.push(window.setTimeout(fn, ms));
    };

    after(300, () => setPhase(1));
    after(1400, () => setPhase(2));
    after(2900, () => {
      setPhase(3);
      let n = 0;
      const step = () => {
        n += 1;
        setShown(n);
        if (n < total.current) {
          after(105, step);
        } else {
          after(700, () => setPhase(4));
        }
      };
      step();
    });

    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [active]);

  return { phase, shown };
}

function Phone({
  time,
  label,
  children,
}: {
  time: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="phone" role="img" aria-label={label}>
      <div className="phone-screen" aria-hidden="true">
        <div className="phone-status">
          <span>{time}</span>
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
        {children}
      </div>
    </div>
  );
}

function SendButton() {
  return (
    <span className="composer-send">
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
  );
}

function LangSwitch({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <div className="lang-switch" role="group" aria-label="Chat language">
      <button
        type="button"
        aria-pressed={lang === "en"}
        onClick={() => onChange("en")}
      >
        English
      </button>
      <button
        type="button"
        aria-pressed={lang === "pcm"}
        onClick={() => onChange("pcm")}
      >
        Pidgin
      </button>
    </div>
  );
}

function DangerDemo() {
  const [step, setStep] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const answer = (yes: boolean) => {
    if (yes) {
      setOutcome(QUESTIONS[step].ifYes);
    } else if (step === QUESTIONS.length - 1) {
      setOutcome("NONE");
    } else {
      setStep(step + 1);
    }
  };

  const restart = () => {
    setStep(0);
    setOutcome(null);
  };

  return (
    <div className="sheet">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-green-soft">
        Demonstration
      </p>

      <div aria-live="polite">
        {outcome === null ? (
          <div key={step} className="appear">
            <p className="mt-4 text-sm font-medium text-green-soft">
              Question {step + 1} of {QUESTIONS.length}
            </p>
            <p className="mt-2 font-display text-[1.4rem] font-medium leading-snug sm:text-2xl">
              {QUESTIONS[step].text}
            </p>
            <div className="mt-6 flex gap-3">
              <button type="button" className="choice" onClick={() => answer(true)}>
                Yes
              </button>
              <button type="button" className="choice" onClick={() => answer(false)}>
                No
              </button>
            </div>
          </div>
        ) : (
          <div className="appear mt-4">
            {outcome === "NOW" && (
              <div className="result result-now">
                <p className="font-display text-3xl font-semibold leading-tight">
                  Go to hospital now.
                </p>
                <p className="mt-2 text-lg leading-7">
                  Do not wait for morning. Wake someone to go with you.
                </p>
              </div>
            )}
            {outcome === "SOON" && (
              <div className="result">
                <p className="font-display text-3xl font-semibold leading-tight">
                  See a midwife or doctor within 24 hours.
                </p>
                <p className="mt-2 text-lg leading-7">
                  Do not leave it. If anything gets worse, go to hospital at once.
                </p>
              </div>
            )}
            {outcome === "NONE" && (
              <div className="result">
                <p className="font-display text-3xl font-semibold leading-tight">
                  None of these danger signs.
                </p>
                <p className="mt-2 text-lg leading-7">
                  Keep your antenatal visits. If anything changes, ask again.
                </p>
              </div>
            )}
            {outcome === "NOW" && (
              <p className="mt-4 text-sm leading-6 text-green-soft">
                In the real app, this screen also shows the nearest hospital and a
                button to call it.
              </p>
            )}
            <button type="button" className="text-link mt-3" onClick={restart}>
              Start again
            </button>
          </div>
        )}
      </div>

      <p className="mt-6 border-t border-ivory-dim pt-4 text-xs leading-5 text-green-soft">
        {"Demonstration only. Sample questions drawn from WHO danger-sign guidance, awaiting clinical sign-off. Do not use this to decide about a real pregnancy. If you are worried, go to the nearest hospital."}
      </p>
    </div>
  );
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [stage, setStage] = useState(0);
  const pageRef = useRef<HTMLDivElement | null>(null);

  const copy = COPY[lang];
  const typed = useTyped(copy.message);

  const replyWords = copy.reply.split(" ");
  const [chatRef, chatSeen] = useSeen<HTMLDivElement>();
  const { phase, shown } = usePlayback(chatSeen, replyWords.length);

  // The section crossing the middle of the screen sets the colour of the page.
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const sections = root.querySelectorAll<HTMLElement>("[data-stage]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setStage(Number(entry.target.getAttribute("data-stage")));
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((section) => io.observe(section));
    return () => io.disconnect();
  }, []);

  const current = STAGES[stage];

  return (
    <div
      ref={pageRef}
      className={`page tone-${current.tone} flex flex-1 flex-col`}
      style={{ backgroundColor: current.bg }}
    >
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7">
        <span className="font-display text-xl font-semibold tracking-tight">
          Aunty Nurse
        </span>
        <span className="rounded-full border border-rule px-3 py-1.5 text-xs font-medium text-fg-muted">
          Demonstration
        </span>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 sm:px-8">
        {/* ── 2:14am ── */}
        <section
          data-stage="0"
          className="grid min-h-[calc(100svh-5rem)] items-center gap-10 py-10 lg:grid-cols-[1fr_auto] lg:gap-20 lg:py-6"
        >
          <div>
            <p className="text-sm font-medium text-fg-muted">
              Somewhere in Nigeria, tonight
            </p>
            <h1 className="clock mt-3">
              2:14<small>am</small>
            </h1>
            <p className="mt-6 max-w-md font-display text-2xl font-medium leading-snug sm:text-3xl">
              Everyone in the house is asleep. She is not.
            </p>
            <p className="mt-4 max-w-md text-lg leading-8 text-fg-muted">
              She is 31 weeks pregnant, and she is afraid to wait for morning.
            </p>
            <div className="mt-10 hidden items-center gap-4 text-sm text-fg-muted lg:flex">
              <span className="scroll-cue-line" aria-hidden="true" />
              Scroll to stay with her
            </div>
          </div>

          <div className="flex flex-col items-center gap-6">
            <Phone
              time="2:14"
              label={`A phone showing a chat with Aunty Nurse at 2:14am. A message is being typed: ${copy.message}`}
            >
              <div className="chat-thread">
                <span className="chat-chip">{copy.tonight}</span>
                <span className="mt-auto text-center text-[11px] leading-4 text-green-soft">
                  {copy.demo}
                </span>
              </div>
              <div className="composer">
                <div className="composer-field">
                  {copy.message.slice(0, typed)}
                  <span className="caret" />
                </div>
                <SendButton />
              </div>
            </Phone>

            <LangSwitch lang={lang} onChange={setLang} />

            <div className="flex items-center gap-4 text-sm text-fg-muted lg:hidden">
              <span className="scroll-cue-line" aria-hidden="true" />
              Scroll to stay with her
            </div>
          </div>
        </section>

        {/* ── 2:15am: the reply ── */}
        <section
          data-stage="1"
          className="grid min-h-[100svh] items-center gap-10 py-16 lg:grid-cols-[auto_1fr] lg:gap-20"
        >
          <div ref={chatRef} className="order-2 flex flex-col items-center gap-6 lg:order-1">
            <Phone
              time="2:15"
              label={`The chat at 2:15am. She has sent: ${copy.message} Aunty Nurse replies: ${copy.reply} A voice note follows.`}
            >
              <div className="chat-thread">
                <span className="chat-chip">{copy.tonight}</span>

                {phase >= 1 && (
                  <div className="bubble-out appear mt-auto">{copy.message}</div>
                )}

                {phase === 2 && (
                  <div className="bubble-in appear">
                    <span className="dots">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                )}

                {phase >= 3 && (
                  <div className="bubble-in">
                    {replyWords.slice(0, shown).join(" ")}
                  </div>
                )}

                {phase >= 4 && (
                  <div className="bubble-in appear">
                    <div className="voice">
                      <span className="voice-play">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M2.5 1.2v9.6L10.5 6z" />
                        </svg>
                      </span>
                      <span className="wave">
                        {WAVE.map((height, index) => (
                          <i
                            key={index}
                            style={{
                              height: `${height}%`,
                              animationDelay: `${(index % 7) * 0.12}s`,
                            }}
                          />
                        ))}
                      </span>
                      <span className="text-xs tabular-nums text-green-soft">0:14</span>
                    </div>
                    <span className="mt-1 block text-[11px] text-green-soft">
                      {copy.voice}
                    </span>
                  </div>
                )}
              </div>
              <div className="composer">
                <div className="composer-field text-green-soft">{copy.placeholder}</div>
                <SendButton />
              </div>
            </Phone>

            <LangSwitch lang={lang} onChange={setLang} />
          </div>

          <div className="order-1 lg:order-2">
            <p className="clock clock-sm">
              2:15<small>am</small>
            </p>
            <h2 className="mt-5 max-w-lg font-display text-3xl font-medium leading-tight sm:text-4xl">
              She presses send. A midwife answers.
            </h2>
            <p className="mt-4 max-w-md text-lg leading-8 text-fg-muted">
              {"Not a chatbot. A licensed nurse-midwife, in words she understands, in a voice she can hear."}
            </p>
          </div>
        </section>

        {/* ── 2:17am: the check ── */}
        <section
          data-stage="2"
          className="grid min-h-[100svh] items-center gap-10 py-16 lg:grid-cols-2 lg:gap-20"
        >
          <div>
            <p className="clock clock-sm">
              2:17<small>am</small>
            </p>
            <h2 className="mt-5 max-w-lg font-display text-3xl font-medium leading-tight sm:text-4xl">
              Three questions. One clear answer.
            </h2>
            <p className="mt-4 max-w-md text-lg leading-8 text-fg-muted">
              Try it yourself. Answer as she would, or any way you like.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <DangerDemo />
          </div>
        </section>

        {/* ── the number ── */}
        <section
          data-stage="3"
          className="flex min-h-[100svh] flex-col justify-center py-16"
        >
          <p className="stat-number">75,000</p>
          <p className="mt-6 max-w-2xl font-display text-2xl font-medium leading-snug sm:text-4xl">
            Nigerian women died from causes related to pregnancy and childbirth in
            2023.
          </p>
          <p className="mt-4 max-w-xl text-lg leading-8 text-fg-muted">
            More than one in every four such deaths in the world.
          </p>
          <p className="mt-10 max-w-xl text-sm leading-6 text-fg-muted">
            Source: Trends in maternal mortality 2000 to 2023. Estimates by WHO,
            UNICEF, UNFPA, World Bank Group and UNDESA/Population Division,
            published 2025. Figure is an estimate for the year 2023.
          </p>
        </section>

        {/* ── 7:05am: morning ── */}
        <section
          data-stage="4"
          className="flex min-h-[100svh] flex-col justify-center py-16"
        >
          <p className="clock clock-sm">
            7:05<small>am</small>
          </p>

          <div className="mt-8 max-w-md rounded-[22px_22px_6px_22px] bg-green px-5 py-4 text-lg leading-7 text-ivory">
            {"We reached the hospital. They are checking the baby now. Thank you for not letting me wait."}
          </div>

          <h2 className="mt-14 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Aunty Nurse dey for you.
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-fg-muted">
            {"A licensed nurse-midwife you can reach from your phone, through pregnancy, birth and your baby's first weeks. Opening first in Rivers State."}
          </p>

          <div className="trust mt-14 text-base">
            <p className="font-semibold">Licensed nurse-midwife</p>
            <p className="text-fg-muted">NMCN licence no. to be added</p>
            <p className="font-semibold">
              For emergencies, go to the nearest hospital.
            </p>
          </div>

          <p className="mt-10 text-sm text-fg-muted">© 2026 Aunty Nurse</p>
        </section>
      </main>
    </div>
  );
}
