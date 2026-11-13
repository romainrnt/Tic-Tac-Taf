"use client";

/**
 * Renders a recoverable failure for the tracker pages.
 */
export default function TrackerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-6xl px-5 pt-14 pb-32">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-alert">Erreur</p>
      <h1 className="mt-2 font-display text-[clamp(4rem,16vw,9rem)] font-black uppercase leading-[0.82] tracking-tight">
        Grain de <span className="outline-text">sable</span>
      </h1>
      <p className="mt-5 max-w-xl text-muted">Le pointage n&apos;a pas pu être chargé.</p>
      {error.message ? (
        <p className="mt-3 max-w-xl rounded-xl bg-surface-2 px-4 py-3 font-mono text-xs text-muted">{error.message}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        data-variant="departure"
        className="punch-key mt-8 rounded-2xl px-6 py-3 font-display text-2xl font-black uppercase"
      >
        Réessayer
      </button>
    </main>
  );
}
