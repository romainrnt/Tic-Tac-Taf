import { DayBlock } from "@/components/day-block";
import type { TrackerSnapshot } from "@/lib/snapshot";
import { formatHourMinutes } from "@/lib/time";

/**
 * Renders past weeks and their punch journals.
 */
export function HistoryView({ snapshot }: { snapshot: TrackerSnapshot }) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-5 pb-16">
      <header className="py-8">
        <p className="text-sm text-muted">Archives</p>
        <h1 className="mt-3 font-display text-5xl tracking-tight md:text-6xl">Historique</h1>
        <p className="mt-4 max-w-xl text-sm text-muted">
          Objectif {formatHourMinutes(snapshot.goalMs)} par semaine. Une arrivée sans départ est
          plafonnée à minuit.
        </p>
      </header>

      {snapshot.historyWeeks.length === 0 ? (
        <p className="rounded-3xl border border-line bg-card px-5 py-8 text-sm text-muted">Aucun pointage.</p>
      ) : (
        snapshot.historyWeeks.map((week) => (
          <section key={week.id} className="mt-6 rounded-3xl border border-line bg-card p-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl">{week.label}</h2>
              <p className="font-mono text-sm tabular-nums">
                {week.totalLabel}
                <span className="text-muted"> / {formatHourMinutes(snapshot.goalMs)}</span>
              </p>
            </div>
            <div className="mt-6 divide-y divide-line">
              {week.days.map((day) => (
                <DayBlock
                  key={day.key}
                  day={day}
                  renderedAt={snapshot.renderedAt}
                  live={day.key === snapshot.todayKey}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
