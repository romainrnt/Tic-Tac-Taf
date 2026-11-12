"use client";

import { useFormStatus } from "react-dom";
import { togglePunch, undoLatestPunch } from "@/app/actions";
import { ENTRY_TYPE_ARRIVAL } from "@/lib/time-entry";

/**
 * Submits the punch form and reflects the pending state.
 */
function PunchSubmit({ label, filled }: { label: string; filled: boolean }) {
  const { pending } = useFormStatus();
  const tone = filled
    ? "border-stamp text-stamp"
    : "border-line text-foreground hover:border-stamp hover:text-stamp";

  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center gap-2 rounded-full border bg-card px-3.5 py-1.5 text-sm transition disabled:cursor-wait disabled:opacity-60 ${tone}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${filled ? "bg-stamp" : "bg-duty"}`} aria-hidden="true" />
      <span>{pending ? "Enregistrement" : label}</span>
    </button>
  );
}

/**
 * Submits the undo form.
 */
function UndoSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="text-sm text-muted underline decoration-line underline-offset-4 hover:text-foreground disabled:opacity-60"
    >
      {pending ? "Annulation" : "Annuler le dernier pointage"}
    </button>
  );
}

/**
 * Renders the punch button and the undo action.
 */
export function PunchControls({
  nextType,
  canUndo,
}: {
  nextType: string;
  canUndo: boolean;
}) {
  const arrival = nextType === ENTRY_TYPE_ARRIVAL;
  const label = arrival ? "Pointer l'arrivée" : "Pointer le départ";

  return (
    <div className="flex flex-col gap-4">
      <form action={togglePunch}>
        <PunchSubmit label={label} filled={arrival} />
      </form>
      {canUndo ? (
        <form action={undoLatestPunch}>
          <UndoSubmit />
        </form>
      ) : null}
    </div>
  );
}
