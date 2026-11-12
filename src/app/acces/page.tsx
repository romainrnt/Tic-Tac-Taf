import { AccessForm } from "@/components/access-form";

/**
 * Renders the access page shown to browsers that are not unlocked yet.
 */
export default function AccessPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8">
      <p className="text-sm text-muted">Accès privé</p>
      <h1 className="mt-3 font-display text-5xl tracking-tight md:text-6xl">Verrouillé</h1>
      <AccessForm />
    </main>
  );
}
