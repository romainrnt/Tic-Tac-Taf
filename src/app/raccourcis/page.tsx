import { Reveal } from "@/components/reveal";
import { requirePageAccess } from "@/lib/session";

const PHRASES = [
  {
    href: `/fichier/${encodeURIComponent("Je commence au bureau.shortcut")}`,
    kicker: "Arrivée",
    title: "Installer « Je commence au bureau »",
    phrase: "Je commence au bureau",
    detail: "Siri répond Arrivée, ou Déjà en poste.",
    tone: "bg-accent text-accent-ink",
  },
  {
    href: `/fichier/${encodeURIComponent("Je pars du bureau.shortcut")}`,
    kicker: "Départ",
    title: "Installer « Je pars du bureau »",
    phrase: "Je pars du bureau",
    detail: "Siri répond Départ, ou Déjà parti.",
    tone: "bg-foreground text-background",
  },
];

const STEPS = [
  "Ouvre cette page sur l'iPhone.",
  "Touche une carte, puis « Ajouter le raccourci ».",
  "Dis la phrase. Le pointage tombe tout seul.",
];

const WAVE = [0.35, 0.7, 1, 0.55, 0.85, 0.4, 0.95, 0.6, 0.3, 0.75, 0.5, 0.9];

/**
 * Draws a voice waveform that pulses like Siri listening.
 */
function Waveform() {
  return (
    <span className="flex h-10 items-center gap-1" aria-hidden="true">
      {WAVE.map((height, index) => (
        <span
          key={index}
          className="wave-bar w-1.5 rounded-full bg-current"
          style={{ height: `${height * 100}%`, animationDelay: `${index * -0.13}s` }}
        />
      ))}
    </span>
  );
}

/**
 * Renders the two Siri shortcuts used to clock in and clock out.
 */
export default async function IphonePage() {
  await requirePageAccess();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-32 md:pb-20">
      <Reveal>
        <header className="pt-10 md:pt-14">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Mains libres</p>
          <h1 className="mt-2 font-display text-[clamp(4rem,16vw,9rem)] font-black uppercase leading-[0.82] tracking-tight">
            Dis <span className="outline-text">Siri</span>.
          </h1>
          <p className="mt-5 max-w-xl text-muted">
            Deux raccourcis, deux phrases. Le téléphone reste dans la poche, le pointage se fait quand même.
          </p>
        </header>
      </Reveal>

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {PHRASES.map((phrase, index) => (
          <Reveal key={phrase.href} delay={0.1 + index * 0.08}>
            <a
              href={phrase.href}
              aria-label={phrase.title}
              className={`group relative flex h-full min-h-72 flex-col justify-between overflow-hidden rounded-4xl p-6 transition-transform duration-300 hover:-translate-y-1 active:translate-y-0 sm:p-8 ${phrase.tone}`}
            >
              <span className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] opacity-70">
                  {phrase.kicker}
                </span>
                <Waveform />
              </span>
              <span className="mt-10 block">
                <span className="block font-mono text-sm opacity-70">« Dis Siri,</span>
                <span className="mt-1 block font-display text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-6xl">
                  {phrase.phrase} »
                </span>
              </span>
              <span className="mt-8 flex items-center justify-between gap-4">
                <span className="text-sm opacity-75">{phrase.detail}</span>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-current px-4 py-2 text-sm font-semibold transition-transform duration-300 group-hover:scale-105">
                  Installer
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 4v12M6 10l6 6 6-6M5 20h14" />
                  </svg>
                </span>
              </span>
            </a>
          </Reveal>
        ))}
      </section>

      <Reveal onView className="mt-14">
        <ol className="grid gap-3 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step} className="flex items-start gap-4 rounded-3xl border border-line bg-surface p-5">
              <span className="font-display text-5xl font-black leading-none text-muted/50">{index + 1}</span>
              <span className="pt-1 text-sm">{step}</span>
            </li>
          ))}
        </ol>
      </Reveal>
    </main>
  );
}
