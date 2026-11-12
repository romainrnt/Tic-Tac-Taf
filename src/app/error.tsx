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
    <main className="mx-auto max-w-5xl px-5 py-16">
      <p className="text-sm text-muted">Erreur</p>
      <h1 className="mt-3 font-display text-4xl">Le pointage n&apos;a pas pu être chargé.</h1>
      <p className="mt-4 text-sm text-muted">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 rounded-full border border-line bg-card px-3.5 py-1.5 text-sm transition hover:border-stamp hover:text-stamp"
      >
        Réessayer
      </button>
    </main>
  );
}
