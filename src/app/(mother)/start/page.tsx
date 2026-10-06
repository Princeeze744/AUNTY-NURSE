"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useLang, type Lang } from "../mother-shell";
import "./start.css";

/* ─────────────────────────────────────────────
   Page 1: sign-up and sign-in.
   Her number → a code → consent, one point per screen.

   NOT YET WIRED: no code is sent and nothing is saved. That needs the SMS
   provider decision and an additive database change.
   CONSENT WORDING IS A DRAFT. A lawyer writes the final words.
   ───────────────────────────────────────────── */

type Step = "phone" | "code" | "consent" | "declined" | "done";

type ConsentPoint = {
  key: string;
  required: boolean;
  title: string;
  body: string;
  yes: string;
  no: string;
};

const T: Record<
  Lang,
  {
    phoneAsk: string;
    phoneHint: string;
    phoneLabel: string;
    sendCode: string;
    incomplete: string;
    same: string;
    codeAsk: string;
    codeHint: (number: string) => string;
    codeLabel: string;
    codeShort: string;
    codeDemo: string;
    continue: string;
    changeNumber: string;
    listen: string;
    of: string;
    declinedAsk: string;
    declinedBody: string;
    readAgain: string;
    goCheck: string;
    doneAsk: string;
    doneBody: string;
    doneNote: string;
    points: ConsentPoint[];
  }
> = {
  en: {
    phoneAsk: "Welcome. What is your phone number?",
    phoneHint:
      "We will send a code to this number to be sure it is you. There is no password to remember.",
    phoneLabel: "Your phone number",
    sendCode: "Send my code",
    incomplete:
      "That number does not look complete. A Nigerian mobile number has 11 digits, like 0803 123 4567. Please check it.",
    same: "New here or coming back, it is the same: your number, then a code.",
    codeAsk: "Enter the 6 numbers we sent you.",
    codeHint: (number) => `We sent them by SMS to ${number}. It can take a minute.`,
    codeLabel: "Your code",
    codeShort: "The code has 6 numbers. Please check the SMS and type all 6.",
    codeDemo: "Demonstration: no SMS is sent yet. Type any 6 numbers to continue.",
    continue: "Continue",
    changeNumber: "Change my number",
    listen: "Listen",
    of: "of",
    declinedAsk: "That is all right. It is your choice.",
    declinedBody:
      "Without this, Aunty cannot open the chat for you. The \"I'm worried\" check is still yours to use, at any time, without signing up.",
    readAgain: "Read it again",
    goCheck: "Open the \"I'm worried\" check",
    doneAsk: "Thank you. You are in.",
    doneBody: "Next, Aunty will ask a few short questions about you and your baby.",
    doneNote: "That part is the next one being built.",
    points: [
      {
        key: "HEALTH_DATA_PROCESSING",
        required: true,
        title: "We keep what you tell us, and we keep it private.",
        body: "To help you, Aunty needs to keep your messages and what you tell her about your pregnancy. Only your midwife, and the few people who keep Aunty Nurse running safely, can see it. We do not sell it.",
        yes: "I agree",
        no: "I do not agree",
      },
      {
        key: "TERMS_OF_SERVICE",
        required: true,
        title: "Aunty is a nurse-midwife, not a hospital.",
        body: "She can listen, advise you, and tell you when to go to hospital. She cannot treat an emergency through a phone. If you are in danger, go to the nearest hospital.",
        yes: "I understand",
        no: "I do not agree",
      },
      {
        key: "REMINDERS_AND_MESSAGES",
        required: false,
        title: "May Aunty send you reminders?",
        body: "Short notes about your clinic visits. On your lock screen they only say \"A note from Aunty\". You can stop them at any time.",
        yes: "Yes, remind me",
        no: "No, thank you",
      },
      {
        key: "SERVICE_IMPROVEMENT",
        required: false,
        title: "May we learn from your information to make Aunty Nurse better?",
        body: "With your name removed. If you say no, nothing changes for you. You get the same care.",
        yes: "Yes, you may",
        no: "No, thank you",
      },
    ],
  },
  pcm: {
    phoneAsk: "Welcome. Wetin be your phone number?",
    phoneHint:
      "We go send code to this number make we sure say na you. No password to remember.",
    phoneLabel: "Your phone number",
    sendCode: "Send my code",
    incomplete:
      "That number never complete. Nigerian mobile number get 11 digits, like 0803 123 4567. Abeg check am.",
    same: "Whether you be new or you dey come back, na the same: your number, then code.",
    codeAsk: "Put the 6 numbers wey we send you.",
    codeHint: (number) => `We send am by SMS to ${number}. E fit take one minute.`,
    codeLabel: "Your code",
    codeShort: "The code get 6 numbers. Abeg check the SMS, type all 6.",
    codeDemo: "Demonstration: we never dey send SMS. Type any 6 numbers to continue.",
    continue: "Continue",
    changeNumber: "Change my number",
    listen: "Listen",
    of: "of",
    declinedAsk: "No wahala. Na your choice.",
    declinedBody:
      "Without this one, Aunty no fit open chat for you. But the \"I dey worry\" check still dey for you, any time, even if you no sign up.",
    readAgain: "Read am again",
    goCheck: "Open the \"I dey worry\" check",
    doneAsk: "Thank you. You don enter.",
    doneBody: "Next, Aunty go ask you small questions about you and your pikin.",
    doneNote: "Na that part we dey build next.",
    points: [
      {
        key: "HEALTH_DATA_PROCESSING",
        required: true,
        title: "We go keep wetin you tell us, and we go keep am private.",
        body: "To help you, Aunty need to keep your messages and wetin you tell am about your belle. Na only your midwife, and the few people wey dey make Aunty Nurse work well, fit see am. We no dey sell am.",
        yes: "I agree",
        no: "I no agree",
      },
      {
        key: "TERMS_OF_SERVICE",
        required: true,
        title: "Aunty na nurse-midwife, no be hospital.",
        body: "She fit listen, advise you, and tell you when to go hospital. She no fit treat emergency through phone. If you dey for danger, go the nearest hospital.",
        yes: "I understand",
        no: "I no agree",
      },
      {
        key: "REMINDERS_AND_MESSAGES",
        required: false,
        title: "Make Aunty dey send you reminder?",
        body: "Short notes about your clinic visits. For your lock screen e go just talk \"A note from Aunty\". You fit stop am any time.",
        yes: "Yes, remind me",
        no: "No, thank you",
      },
      {
        key: "SERVICE_IMPROVEMENT",
        required: false,
        title: "Make we learn from your information to make Aunty Nurse better?",
        body: "We go remove your name. If you talk no, nothing go change for you. You go get the same care.",
        yes: "Yes, you fit",
        no: "No, thank you",
      },
    ],
  },
};

/** Strips spaces, a leading +234 or 234, and the leading 0. */
function coreDigits(raw: string) {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

function isNigerianMobile(core: string) {
  return /^[789][01]\d{8}$/.test(core);
}

function pretty(core: string) {
  const full = `0${core}`;
  return `${full.slice(0, 4)} ${full.slice(4, 7)} ${full.slice(7)}`;
}

/* Interim "listen": the phone's own reading voice. To be replaced by the
   midwife's recorded voice for each point, in English and Pidgin. */
function ListenButton({ text, label }: { text: string; label: string }) {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported("speechSynthesis" in window);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  const speak = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-NG";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button type="button" className="listen" onClick={speak}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
        <path d="M2.5 1.2v9.6L10.5 6z" />
      </svg>
      {label}
    </button>
  );
}

export default function StartPage() {
  const { lang } = useLang();
  const t = T[lang];

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [phoneBad, setPhoneBad] = useState(false);
  const [code, setCode] = useState("");
  const [codeBad, setCodeBad] = useState(false);
  const [index, setIndex] = useState(0);
  const [, setAnswers] = useState<Record<string, boolean>>({});

  const core = coreDigits(phone);

  const submitPhone = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isNigerianMobile(core)) {
      setPhoneBad(false);
      setStep("code");
    } else {
      setPhoneBad(true);
    }
  };

  const submitCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (code.length === 6) {
      setCodeBad(false);
      setIndex(0);
      setStep("consent");
    } else {
      setCodeBad(true);
    }
  };

  const answerConsent = (agreed: boolean) => {
    const point = t.points[index];
    setAnswers((previous) => ({ ...previous, [point.key]: agreed }));

    if (!agreed && point.required) {
      setStep("declined");
      return;
    }
    if (index === t.points.length - 1) {
      setStep("done");
    } else {
      setIndex(index + 1);
    }
  };

  if (step === "phone") {
    return (
      <form onSubmit={submitPhone} noValidate className="arrive">
        <h1 className="ask">{t.phoneAsk}</h1>
        <p className="hint">{t.phoneHint}</p>

        <div className="field-card">
          <label htmlFor="phone" className="field-label">
            {t.phoneLabel}
          </label>
          <div className="field-row">
            <span className="field-prefix" aria-hidden="true">
              +234
            </span>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="0803 123 4567"
              className="field-input"
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value);
                setPhoneBad(false);
              }}
            />
          </div>
          <button type="submit" className="btn-primary">
            {t.sendCode}
          </button>
        </div>

        <div aria-live="polite">
          {phoneBad && <p className="plain-note">{t.incomplete}</p>}
        </div>

        <p className="small-note mt-6">{t.same}</p>
      </form>
    );
  }

  if (step === "code") {
    return (
      <form onSubmit={submitCode} noValidate className="arrive">
        <h1 className="ask">{t.codeAsk}</h1>
        <p className="hint">{t.codeHint(pretty(core))}</p>

        <div className="field-card">
          <label htmlFor="code" className="field-label">
            {t.codeLabel}
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="code-input"
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
              setCodeBad(false);
            }}
          />
          <button type="submit" className="btn-primary">
            {t.continue}
          </button>
        </div>

        <div aria-live="polite">
          {codeBad && <p className="plain-note">{t.codeShort}</p>}
        </div>

        <p className="small-note mt-5">{t.codeDemo}</p>

        <button
          type="button"
          className="text-action mt-2"
          onClick={() => {
            setCode("");
            setStep("phone");
          }}
        >
          {t.changeNumber}
        </button>
      </form>
    );
  }

  if (step === "consent") {
    const point = t.points[index];
    const total = t.points.length;

    return (
      <div key={point.key} className="arrive">
        <p className="step-count">
          {index + 1} {t.of} {total}
        </p>
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>

        <h1 className="ask">{point.title}</h1>
        <p className="hint">{point.body}</p>

        <ListenButton text={`${point.title} ${point.body}`} label={t.listen} />

        <div className="mt-8">
          <button
            type="button"
            className="btn-primary"
            onClick={() => answerConsent(true)}
          >
            {point.yes}
          </button>
          <button
            type="button"
            className="btn-quiet"
            onClick={() => answerConsent(false)}
          >
            {point.no}
          </button>
        </div>
      </div>
    );
  }

  if (step === "declined") {
    return (
      <div className="arrive">
        <h1 className="ask">{t.declinedAsk}</h1>
        <p className="hint">{t.declinedBody}</p>

        <div className="mt-8">
          <button
            type="button"
            className="btn-primary"
            onClick={() => setStep("consent")}
          >
            {t.readAgain}
          </button>
          <Link href="/check" className="btn-quiet">
            {t.goCheck}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="arrive">
      <h1 className="ask">{t.doneAsk}</h1>
      <p className="hint">{t.doneBody}</p>
      <p className="small-note mt-6">{t.doneNote}</p>
    </div>
  );
}
