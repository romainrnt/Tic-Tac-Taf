import { ElapsedTime } from "@/components/live-figures";
import type { DayView, JournalSession, JournalSessionState } from "@/lib/snapshot";
import { formatSessionReading } from "@/lib/time";

const DAY_HOURS = [0, 6, 12, 18, 24] as const;

const SESSION_NOTE: Record<JournalSessionState, string | null> = {
  open: null,
  closed: null,
  capped: "Coupé à minuit",
  interrupted: "Départ manquant",
};

/**
 * Names how many passages a day contains.
 *
 * @param count Number of paired sessions
 * @returns French count label
 */
function describePassages(count: number): string {
  if (count === 0) {
    return "Aucun passage";
  }
  if (count === 1) {
    return "Un passage";
  }
  return `${count} passages`;
}

/**
 * Picks the ink of a session on the day trace and its weight bar.
 *
 * @param state How the session ended
 * @returns Tailwind color class
 */
function sessionInk(state: JournalSessionState): string {
  if (state === "open") {
    return "bg-duty";
  }
  if (state === "interrupted") {
    return "bg-foreground/35";
  }
  if (state === "capped") {
    return "bg-stamp/55";
  }
  return "bg-stamp";
}

/**
 * Draws the day as a ruler, with each passage placed from midnight.
 */
function DayTrace({ sessions }: { sessions: JournalSession[] }) {
  return (
    <div className="mt-5" aria-hidden="true">
      <div className="relative h-3 overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
        {sessions.map((session) => (
          <span
            key={session.id}
            className={`absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full ${sessionInk(session.state)}`}
            style={{
              left: `${session.arrivalRatio * 100}%`,
              width: `max(4px, ${session.spanRatio * 100}%)`,
            }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] tracking-wide text-muted">
        {DAY_HOURS.map((hour) => (
          <span key={hour}>{hour}h</span>
        ))}
      </div>
    </div>
  );
}

/**
 * Renders one passage: its clocks, a spoken duration, and its weight in the day.
 */
function SessionRow({
  session,
  index,
  weight,
  renderedAt,
}: {
  session: JournalSession;
  index: number;
  weight: number;
  renderedAt: number;
}) {
  const note = SESSION_NOTE[session.state];
  const open = session.state === "open";

  return (
    <li className="border-t border-line py-4">
      <div className="flex items-baseline justify-between gap-4">
        <p className="min-w-0 font-mono text-sm tabular-nums">
          <span className="mr-3 text-[11px] text-muted">{String(index + 1).padStart(2, "0")}</span>
          {session.arrivalLabel}
          <span className="px-2 text-muted">→</span>
          <span className={open ? "text-duty" : undefined}>{session.endLabel}</span>
        </p>
        <p className="shrink-0 font-display text-sm">
          {open ? (
            <ElapsedTime
              closedMs={0}
              openStartedAt={session.openStartedAt}
              renderedAt={renderedAt}
              withSeconds={false}
            />
          ) : (
            formatSessionReading(session.durationMs)
          )}
        </p>
      </div>
      {note ? <p className="mt-1 pl-7 text-xs text-muted">{note}</p> : null}
      <span className="mt-3 block h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <span
          className={`block h-full rounded-full ${sessionInk(session.state)}`}
          style={{ width: `${Math.max(weight * 100, 4)}%` }}
        />
      </span>
    </li>
  );
}

/**
 * Renders one day's passages as a readable sheet, with a trace of the whole day.
 */
export function DayBlock({
  day,
  renderedAt,
  live,
}: {
  day: DayView;
  renderedAt: number;
  live: boolean;
}) {
  const longest = day.sessions.reduce((max, session) => Math.max(max, session.durationMs), 0);

  return (
    <article className="py-5 first:pt-0 last:pb-0">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl tracking-tight">{day.longLabel}</h3>
          <p className="mt-1 text-xs text-muted">{describePassages(day.sessions.length)}</p>
        </div>
        {live ? (
          <ElapsedTime
            closedMs={day.closedMs}
            openStartedAt={day.openStartedAt}
            renderedAt={renderedAt}
            withSeconds={false}
            className="font-mono text-sm tabular-nums"
          />
        ) : (
          <p className="font-mono text-sm tabular-nums">{day.totalLabel}</p>
        )}
      </div>
      <DayTrace sessions={day.sessions} />
      {day.sessions.length > 0 ? (
        <ol className="mt-4">
          {day.sessions.map((session, index) => (
            <SessionRow
              key={session.id}
              session={session}
              index={index}
              weight={longest === 0 ? 1 : session.durationMs / longest}
              renderedAt={renderedAt}
            />
          ))}
        </ol>
      ) : null}
    </article>
  );
}
