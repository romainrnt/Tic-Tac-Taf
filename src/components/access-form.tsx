"use client";

import { useActionState, useState } from "react";
import { motion } from "motion/react";
import { unlockTracker, type UnlockState } from "@/app/actions";

const INITIAL_STATE: UnlockState = { error: null };

/**
 * Renders the access code form that unlocks the tracker in this browser.
 * A rejected code shakes the field.
 */
export function AccessForm() {
  const [state, submit, pending] = useActionState(unlockTracker, INITIAL_STATE);
  const [seenState, setSeenState] = useState(state);
  const [rejections, setRejections] = useState(0);

  if (seenState !== state) {
    setSeenState(state);
    if (state.error) {
      setRejections((count) => count + 1);
    }
  }

  return (
    <form action={submit} className="mt-8 flex flex-col gap-3">
      <label htmlFor="code" className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        Code d&apos;accès
      </label>
      <motion.div
        key={rejections}
        initial={false}
        animate={rejections > 0 ? { x: [0, -12, 10, -7, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
      >
        <input
          id="code"
          name="code"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          aria-invalid={state.error ? true : undefined}
          aria-describedby="code-error"
          className={`w-full rounded-2xl border-2 bg-surface-2 px-5 py-4 font-mono text-xl tracking-[0.3em] text-foreground outline-none transition-colors placeholder:text-muted/50 focus:border-foreground ${
            state.error ? "border-alert" : "border-transparent"
          }`}
          placeholder="••••••"
        />
      </motion.div>
      <button
        type="submit"
        disabled={pending}
        data-variant="arrival"
        className="punch-key relative mt-3 overflow-hidden rounded-2xl px-5 py-4 font-display text-2xl font-black uppercase tracking-tight disabled:cursor-wait"
      >
        {pending ? <span className="stripes absolute inset-0" aria-hidden="true" /> : null}
        <span className="relative">{pending ? "Vérification…" : "Entrer"}</span>
      </button>
      <p id="code-error" role="alert" className="min-h-5 text-sm font-medium text-alert">
        {state.error}
      </p>
    </form>
  );
}
