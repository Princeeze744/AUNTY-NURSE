"use client";

import { useLang } from "../mother-shell";

/* Placeholder for page 5, the danger-signs check.
   It exists now so "I'm worried" never leads to a dead end.
   No red here: red is reserved for the "go to hospital now" result. */

export default function CheckPlaceholder() {
  const { lang } = useLang();

  return (
    <div>
      <h1 className="ask">
        {lang === "en"
          ? "The danger-signs check is being built."
          : "We still dey build the danger-signs check."}
      </h1>
      <p className="plain-note mt-6">
        {lang === "en"
          ? "If you or your baby are in danger now, go to the nearest hospital. Do not wait."
          : "If you or your pikin dey for danger now, go the nearest hospital. No wait."}
      </p>
    </div>
  );
}
