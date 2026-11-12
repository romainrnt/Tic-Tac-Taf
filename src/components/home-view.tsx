import Link from "next/link";
import { DayBlock } from "@/components/day-block";
import { ElapsedTime, WeekMeter } from "@/components/live-figures";
import { PunchControls } from "@/components/punch-controls";
import ShinyText from "@/components/react-bits/shiny-text";
import type { TrackerSnapshot } from "@/lib/snapshot";

/**
 * Renders the daily dashboard: status, goal, week strip, and today's journal.
 */
export function HomeView({ snapshot }: { snapshot: TrackerSnapshot }) {
  const onDuty = snapshot.status === "en_poste";

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-5 pb-16">
      <section className="grid gap-8 py-8 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <p className="text-sm text-muted">
            {snapshot.weekLabel} · {snapshot.todayLabel}
          </p>
          <h1 className="mt-3 font-display text-5xl leading-none tracking-tight md:text-6xl">
            <ShinyText
              text={onDuty ? "En poste" : "Hors poste"}
              color={onDuty ? "var(--duty)" : "var(--foreground)"}
              shineColor="var(--stamp)"
              speed={6}
              shineWidth={24}
              softness={0.92}
              glow={0.18}
            />
          </h1>
          <p className="mt-6 font-mono text-4xl tabular-nums md:text-5xl">
            <ElapsedTime
              closedMs={snapshot.today.closedMs}
              openStartedAt={snapshot.today.openStartedAt}
              renderedAt={snapshot.renderedAt}
              withSeconds={onDuty}
            />
          </p>
          <p className="mt-2 text-sm text-muted">
            {snapshot.openSinceLabel ? `Depuis ${snapshot.openSinceLabel}` : "Aujourd'hui"}
          </p>
        </div>
        <WeekMeter
          closedMs={snapshot.weekClosedMs}
          openStartedAt={snapshot.weekOpenStartedAt}
          renderedAt={snapshot.renderedAt}
          goalMs={snapshot.goalMs}
          remainingWorkdays={snapshot.remainingWorkdays}
        />
      </section>

      <section className="py-2">
        <PunchControls nextType={snapshot.nextType} canUndo={snapshot.canUndo} />
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl">Semaine</h2>
        <ol className="mt-4 grid grid-cols-7 gap-1.5 md:gap-2">
          {snapshot.weekDays.map((day) => {
            const current = day.key === snapshot.todayKey;
            return (
              <li
                key={day.key}
                className={`min-w-0 rounded-2xl px-1.5 py-3 md:px-3 ${current ? "bg-stamp text-stamp-ink" : "border border-line bg-card"}`}
              >
                <p className={`text-[10px] ${current ? "text-stamp-ink" : "text-muted"}`}>{day.shortLabel}</p>
                <p className="mt-3 font-mono text-[11px] tabular-nums md:text-sm">
                  {day.displayMs === 0 && !day.openStartedAt ? (
                    "—"
                  ) : (
                    <ElapsedTime
                      closedMs={day.closedMs}
                      openStartedAt={day.openStartedAt}
                      renderedAt={snapshot.renderedAt}
                      withSeconds={false}
                    />
                  )}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-sm text-muted">Journal</h2>
        <div className="mt-4 rounded-3xl border border-line bg-card px-5 py-5 sm:px-6">
          <DayBlock day={snapshot.today} renderedAt={snapshot.renderedAt} live />
        </div>
      </section>

      <p className="mt-10 text-sm">
        <Link href="/raccourcis" className="text-stamp underline decoration-stamp/40 underline-offset-4">
          Configurer l’iPhone
        </Link>
      </p>
    </main>
  );
}
