"use client";

import { useActionState } from "react";
import { unlockTracker, type UnlockState } from "@/app/actions";

const INITIAL_STATE: UnlockState = { error: null };

/**
 * Renders the access code form that unlocks the tracker in this browser.
 */
export function AccessForm() {
  const [state, submit, pending] = useActionState(unlockTracker, INITIAL_STATE);

  return (
    <form action={submit} className="mt-8 flex max-w-md flex-col gap-4">
      <label htmlFor="code" className="text-sm text-muted">
        Code d&apos;accès
      </label>
      <input
        id="code"
        name="code"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        className="rounded-2xl border border-line bg-card px-4 py-4 font-mono text-base text-foreground outline-none"
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full border border-line bg-card px-3.5 py-1.5 text-sm text-foreground transition hover:border-stamp hover:text-stamp disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Vérification" : "Entrer"}
      </button>
      <p role="alert" className="min-h-5 text-sm text-stamp">
        {state.error}
      </p>
    </form>
  );
}
