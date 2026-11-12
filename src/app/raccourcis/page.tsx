import { requirePageAccess } from "@/lib/session";

const PHRASES = [
  {
    href: `/fichier/${encodeURIComponent("Je commence au bureau.shortcut")}`,
    title: "Installer Je commence au bureau",
    phrase: "Dis Siri, je commence au bureau",
    detail: "Siri affiche Arrivée ou Déjà en poste.",
  },
  {
    href: `/fichier/${encodeURIComponent("Je pars du bureau.shortcut")}`,
    title: "Installer Je pars du bureau",
    phrase: "Dis Siri, je pars du bureau",
    detail: "Siri affiche Départ ou Déjà parti.",
  },
];

/**
 * Renders the two Siri shortcuts used to clock in and clock out.
 */
export default async function IphonePage() {
  await requirePageAccess();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-5 pb-20">
      <header className="py-8">
        <p className="text-sm text-muted">Siri</p>
        <h1 className="mt-3 font-display text-5xl tracking-tight md:text-6xl">iPhone</h1>
        <p className="mt-4 max-w-xl text-sm text-muted">
          Dis « Je commence au bureau » pour l’arrivée et « Je pars du bureau » pour le départ.
        </p>
      </header>

      <section className="flex flex-col gap-3 py-8">
        {PHRASES.map((phrase) => (
          <a key={phrase.href} href={phrase.href} className="rounded-2xl border border-line bg-card px-4 py-4 transition hover:border-stamp">
            <span className="flex items-center justify-between text-sm">
              {phrase.title}
              <span aria-hidden="true">→</span>
            </span>
            <span className="mt-3 block font-mono text-lg">{phrase.phrase}</span>
            <span className="mt-2 block text-sm text-muted">{phrase.detail}</span>
          </a>
        ))}
      </section>
    </main>
  );
}
