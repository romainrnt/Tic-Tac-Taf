import { ClockMark } from "@/components/site-header";

/**
 * Renders the fallback shown while the tracker data is loading.
 */
export default function Loading() {
  return (
    <main className="mx-auto grid min-h-[60dvh] max-w-6xl place-items-center px-5">
      <div className="flex flex-col items-center gap-4">
        <ClockMark size={64} />
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          Tic<span className="blink">…</span> tac<span className="blink-alt">…</span>
        </p>
      </div>
    </main>
  );
}
