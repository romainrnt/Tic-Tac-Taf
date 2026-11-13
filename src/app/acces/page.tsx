import { AccessForm } from "@/components/access-form";
import { Reveal } from "@/components/reveal";
import { ClockMark } from "@/components/site-header";

/**
 * Renders the access page shown to browsers that are not unlocked yet.
 */
export default function AccessPage() {
  return (
    <main className="mx-auto grid min-h-[calc(100dvh-4.5rem)] w-full max-w-6xl place-items-center px-5 py-10">
      <Reveal className="w-full max-w-md">
        <div className="rounded-4xl border border-line bg-surface p-6 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.35)] sm:p-8">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Accès privé</p>
            <ClockMark size={40} />
          </div>
          <h1 className="mt-6 font-display text-7xl font-black uppercase leading-[0.82] tracking-tight">
            Ver<br />
            <span className="outline-text">rouillé</span>
          </h1>
          <AccessForm />
        </div>
      </Reveal>
    </main>
  );
}
