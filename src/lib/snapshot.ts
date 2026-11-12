import {
  ENTRY_TYPE_ARRIVAL,
  ENTRY_TYPE_DEPARTURE,
  resolveNextEntryType,
} from "@/lib/time-entry";
import {
  SHORT_WEEKDAYS,
  WEEKLY_GOAL_MS,
  addCivilDays,
  civilDateKey,
  countRemainingWorkdays,
  dateKeyToNoon,
  formatHourMinutes,
  formatParisClock,
  formatParisLongDate,
  parisDateKey,
  readIsoWeek,
  readParisParts,
  shiftDateKey,
  startOfDateKey,
  weekdayIndexForKey,
} from "@/lib/time";

export type StoredEntry = {
  id: string;
  type: string;
  timestamp: Date;
};

export type JournalSessionState = "open" | "closed" | "capped" | "interrupted";

export type JournalSession = {
  id: string;
  arrivalLabel: string;
  endLabel: string;
  arrivalRatio: number;
  spanRatio: number;
  durationMs: number;
  openStartedAt: string | null;
  state: JournalSessionState;
};

export type DayView = {
  key: string;
  weekdayIndex: number;
  shortLabel: string;
  longLabel: string;
  closedMs: number;
  displayMs: number;
  openStartedAt: string | null;
  totalLabel: string;
  sessions: JournalSession[];
};

export type WeekGroup = {
  id: string;
  label: string;
  totalLabel: string;
  totalMs: number;
  days: DayView[];
};

export type TrackerSnapshot = {
  renderedAt: number;
  status: "en_poste" | "hors_poste";
  nextType: typeof ENTRY_TYPE_ARRIVAL | typeof ENTRY_TYPE_DEPARTURE;
  todayKey: string;
  todayLabel: string;
  weekLabel: string;
  weekdayIndex: number;
  remainingWorkdays: number;
  openSinceLabel: string | null;
  today: DayView;
  weekDays: DayView[];
  weekClosedMs: number;
  weekOpenStartedAt: string | null;
  goalMs: number;
  historyWeeks: WeekGroup[];
  canUndo: boolean;
};

type SessionDraft = {
  arrival: StoredEntry;
  departure: StoredEntry | null;
  endAt: Date;
  open: boolean;
  capped: boolean;
  interrupted: boolean;
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Places an instant on the Paris day, from midnight to the next midnight.
 *
 * @param date Instant to place
 * @returns Fraction of the civil day, between 0 and 1
 */
function parisDayRatio(date: Date): number {
  const parts = readParisParts(date);
  return (parts.hour * 60 + parts.minute + parts.second / 60) / 1440;
}

/**
 * Describes how a paired session ended.
 *
 * @param session Closed or open pair
 * @returns Journal state
 */
function resolveSessionState(session: SessionDraft): JournalSessionState {
  if (session.open) {
    return "open";
  }
  if (session.capped) {
    return "capped";
  }
  if (session.interrupted) {
    return "interrupted";
  }
  return "closed";
}

/**
 * Names the end of a session in the journal.
 *
 * @param session Closed or open pair
 * @returns Clock, midnight, or the open-session word
 */
function resolveSessionEndLabel(session: SessionDraft): string {
  if (session.open) {
    return "en cours";
  }
  if (session.capped) {
    return "minuit";
  }
  if (session.departure) {
    return formatParisClock(session.departure.timestamp);
  }
  return formatParisClock(session.endAt);
}

/**
 * Pairs arrivals and departures that share the same Paris day.
 *
 * @param entries Punches of a single day, oldest first
 * @param dayEnd Exclusive end of that Paris day
 * @param now Current instant used to keep today's session open
 * @param isToday Whether the day is the current Paris day
 * @returns Closed and possibly open sessions
 */
function pairDaySessions(
  entries: StoredEntry[],
  dayEnd: Date,
  now: Date,
  isToday: boolean,
): SessionDraft[] {
  const sessions: SessionDraft[] = [];
  let openArrival: StoredEntry | null = null;

  for (const entry of entries) {
    if (entry.type === ENTRY_TYPE_ARRIVAL) {
      if (openArrival) {
        sessions.push({
          arrival: openArrival,
          departure: null,
          endAt: entry.timestamp,
          open: false,
          capped: false,
          interrupted: true,
        });
      }
      openArrival = entry;
      continue;
    }

    if (entry.type === ENTRY_TYPE_DEPARTURE && openArrival) {
      sessions.push({
        arrival: openArrival,
        departure: entry,
        endAt: entry.timestamp,
        open: false,
        capped: false,
        interrupted: false,
      });
      openArrival = null;
    }
  }

  if (openArrival) {
    sessions.push({
      arrival: openArrival,
      departure: null,
      endAt: isToday ? now : dayEnd,
      open: isToday,
      capped: !isToday,
      interrupted: false,
    });
  }

  return sessions;
}

/**
 * Builds the visible journal and totals for one Paris day.
 *
 * @param dateKey YYYY-MM-DD civil date
 * @param entries Punches recorded on that day
 * @param now Current instant
 * @returns Day ready for the dashboard and the history
 */
export function buildDayView(dateKey: string, entries: StoredEntry[], now: Date): DayView {
  const noon = dateKeyToNoon(dateKey);
  const dayEnd = startOfDateKey(shiftDateKey(dateKey, 1));
  const todayKey = parisDateKey(now);
  const isToday = dateKey === todayKey;
  const pairs = pairDaySessions(entries, dayEnd, now, isToday);
  const sessions: JournalSession[] = [];
  let closedMs = 0;
  let openStartedAt: string | null = null;

  for (const pair of pairs) {
    const durationMs = Math.max(0, pair.endAt.getTime() - pair.arrival.timestamp.getTime());
    const state = resolveSessionState(pair);
    const startedAt = pair.open ? pair.arrival.timestamp.toISOString() : null;

    sessions.push({
      id: pair.arrival.id,
      arrivalLabel: formatParisClock(pair.arrival.timestamp),
      endLabel: resolveSessionEndLabel(pair),
      arrivalRatio: parisDayRatio(pair.arrival.timestamp),
      spanRatio: Math.min(1, durationMs / DAY_MS),
      durationMs,
      openStartedAt: startedAt,
      state,
    });

    if (startedAt) {
      openStartedAt = startedAt;
    } else {
      closedMs += durationMs;
    }
  }

  const openMs = openStartedAt
    ? Math.max(0, now.getTime() - new Date(openStartedAt).getTime())
    : 0;
  const displayMs = closedMs + openMs;
  const weekdayIndex = weekdayIndexForKey(dateKey);

  return {
    key: dateKey,
    weekdayIndex,
    shortLabel: SHORT_WEEKDAYS[weekdayIndex],
    longLabel: formatParisLongDate(noon),
    closedMs,
    displayMs,
    openStartedAt,
    totalLabel: formatHourMinutes(displayMs),
    sessions,
  };
}

/**
 * Groups recorded days into ISO weeks, newest week first.
 *
 * @param days Days that contain at least one punch
 * @returns Week sections for the history page
 */
function groupHistory(days: DayView[]): WeekGroup[] {
  const groups = new Map<string, WeekGroup>();

  for (const day of days) {
    const iso = readIsoWeek(day.key);
    const id = `${iso.year}-W${String(iso.week).padStart(2, "0")}`;
    const existing = groups.get(id);
    if (existing) {
      existing.days.push(day);
      existing.totalMs += day.displayMs;
      existing.totalLabel = formatHourMinutes(existing.totalMs);
      continue;
    }

    groups.set(id, {
      id,
      label: `Semaine ${iso.week}`,
      totalLabel: formatHourMinutes(day.displayMs),
      totalMs: day.displayMs,
      days: [day],
    });
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      days: [...group.days].sort((left, right) => left.key.localeCompare(right.key)),
    }))
    .sort((left, right) => right.id.localeCompare(left.id));
}

/**
 * Builds the full tracker view from raw punches.
 *
 * @param entries Every stored punch, in any order
 * @param now Instant used as "today" and as the end of an open session
 * @returns Dashboard and history snapshot
 */
export function buildSnapshot(entries: StoredEntry[], now: Date): TrackerSnapshot {
  const sorted = [...entries].sort(
    (left, right) => left.timestamp.getTime() - right.timestamp.getTime(),
  );
  const byDay = new Map<string, StoredEntry[]>();

  for (const entry of sorted) {
    const key = parisDateKey(entry.timestamp);
    const bucket = byDay.get(key) ?? [];
    bucket.push(entry);
    byDay.set(key, bucket);
  }

  const todayParts = readParisParts(now);
  const todayKey = civilDateKey(todayParts.year, todayParts.month, todayParts.day);
  const weekdayIndex = weekdayIndexForKey(todayKey);
  const monday = addCivilDays(todayParts.year, todayParts.month, todayParts.day, -weekdayIndex);
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const civil = addCivilDays(monday.year, monday.month, monday.day, index);
    const key = civilDateKey(civil.year, civil.month, civil.day);
    return buildDayView(key, byDay.get(key) ?? [], now);
  });
  const today = weekDays[weekdayIndex] ?? buildDayView(todayKey, [], now);
  const recordedDays = [...byDay.keys()]
    .filter((key) => key <= todayKey)
    .sort((left, right) => right.localeCompare(left))
    .map((key) => buildDayView(key, byDay.get(key) ?? [], now));
  const lastToday = byDay.get(todayKey)?.at(-1) ?? null;
  const weekClosedMs = weekDays.reduce((sum, day) => sum + day.closedMs, 0);
  const iso = readIsoWeek(todayKey);

  return {
    renderedAt: now.getTime(),
    status: today.openStartedAt ? "en_poste" : "hors_poste",
    nextType: resolveNextEntryType(lastToday?.type ?? null),
    todayKey,
    todayLabel: today.longLabel,
    weekLabel: `Semaine ${iso.week}`,
    weekdayIndex,
    remainingWorkdays: countRemainingWorkdays(weekdayIndex),
    openSinceLabel: today.openStartedAt
      ? formatParisClock(new Date(today.openStartedAt))
      : null,
    today,
    weekDays,
    weekClosedMs,
    weekOpenStartedAt: today.openStartedAt,
    goalMs: WEEKLY_GOAL_MS,
    historyWeeks: groupHistory(recordedDays),
    canUndo: sorted.length > 0,
  };
}
