"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { arrivePunch, leavePunch } from "@/app/actions";

const NOTICE_MS = 4000;

const PARIS_CLOCK = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  hour: "2-digit",
  minute: "2-digit",
});

type Notice = { id: number; text: string };

/**
 * Submits the punch form and reflects its pending state.
 */
function PunchKey({ arrival }: { arrival: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      data-variant={arrival ? "arrival" : "departure"}
      className="punch-key inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium disabled:cursor-wait disabled:opacity-70"
    >
      <span>{pending ? "Enregistrement…" : arrival ? "Pointer l'arrivée" : "Pointer le départ"}</span>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {arrival ? (
          <path d="M5 12h13M13 7l5 5-5 5" />
        ) : (
          <>
            <path d="M9 4H5v16h4" />
            <path d="M14 8l4 4-4 4M18 12H9" />
          </>
        )}
      </svg>
    </button>
  );
}

/**
 * Renders the punch key for the current status and a short confirmation line.
 */
export function PunchControls({ onDuty }: { onDuty: boolean }) {
  const [seenOnDuty, setSeenOnDuty] = useState(onDuty);
  const [submittedAt, setSubmittedAt] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // The server answers with a new status: confirm what was recorded.
  if (seenOnDuty !== onDuty) {
    setSeenOnDuty(onDuty);
    if (submittedAt !== null) {
      const clock = PARIS_CLOCK.format(submittedAt);
      setNotice({
        id: submittedAt,
        text: onDuty ? `Arrivée enregistrée à ${clock}.` : `Départ enregistré à ${clock}.`,
      });
      setSubmittedAt(null);
    }
  }

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = window.setTimeout(() => setNotice(null), NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      <form action={onDuty ? leavePunch : arrivePunch} onSubmit={() => setSubmittedAt(Date.now())}>
        <PunchKey arrival={!onDuty} />
      </form>
      <p aria-live="polite" className="text-sm text-muted">
        <AnimatePresence mode="wait">
          {notice ? (
            <motion.span
              key={notice.id}
              className="inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {notice.text}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </p>
    </div>
  );
}
