import { DayProgress, HeroClock, WeekDial } from "@/components/live-figures";
import { PunchControls } from "@/components/punch-controls";
import { Reveal } from "@/components/reveal";
import { WeekBars } from "@/components/week-bars";
import type { TrackerSnapshot } from "@/lib/snapshot";

/**
 * Renders the daily dashboard: today's counter, status and punch keys, the week dial, and the week bars.
 */
export function HomeView({ snapshot }: { snapshot: TrackerSnapshot }) {
  const onDuty = snapshot.status === "en_poste";

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-32 md:pb-20">
      <section className="grid gap-4 pt-8 md:grid-cols-[1.2fr_1fr] md:gap-6 md:pt-12">
        <Reveal className="relative z-10 h-full">
          <div className="flex h-full min-w-0 flex-col rounded-3xl border border-line bg-surface p-5 sm:p-6">
            <div className="flex flex-1 flex-col justify-center pb-8">
              <p className="text-sm text-muted">{snapshot.todayLabel}</p>
              <p className="mt-2 font-display text-[clamp(4.5rem,10vw,6.5rem)] font-semibold leading-[0.9] tracking-tight tabular-nums">
                <HeroClock
                  closedMs={snapshot.today.closedMs}
                  openStartedAt={snapshot.today.openStartedAt}
                  renderedAt={snapshot.renderedAt}
                />
              </p>
              <DayProgress
                closedMs={snapshot.today.closedMs}
                openStartedAt={snapshot.today.openStartedAt}
                renderedAt={snapshot.renderedAt}
                targetMs={snapshot.goalMs / 5}
              />
              <p className="mt-5 flex items-center gap-2 text-sm">
                <span className={`h-2 w-2 rounded-full ${onDuty ? "bg-live" : "bg-muted/50"}`} aria-hidden="true" />
                {onDuty ? (
                  <span>
                    En poste <span className="text-muted">depuis {snapshot.openSinceLabel}</span>
                  </span>
                ) : (
                  <span className="text-muted">Hors poste</span>
                )}
              </p>
            </div>

            <div>
              <PunchControls onDuty={onDuty} />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.05} className="h-full">
          <WeekDial
            weekLabel={snapshot.weekLabel}
            closedMs={snapshot.weekClosedMs}
            openStartedAt={snapshot.weekOpenStartedAt}
            renderedAt={snapshot.renderedAt}
            goalMs={snapshot.goalMs}
            remainingWorkdays={snapshot.remainingWorkdays}
          />
        </Reveal>
      </section>

      <Reveal onView className="mt-4 md:mt-6">
        <WeekBars
          days={snapshot.weekDays}
          todayKey={snapshot.todayKey}
          renderedAt={snapshot.renderedAt}
          goalMs={snapshot.goalMs}
        />
      </Reveal>
    </main>
  );
}
