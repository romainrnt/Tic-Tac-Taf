export const PARIS_TIME_ZONE = "Europe/Paris";
export const WEEKLY_GOAL_MINUTES = 36 * 60 + 30;
export const WEEKLY_GOAL_MS = WEEKLY_GOAL_MINUTES * 60 * 1000;

const WEEKDAY_INDEX: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

export const SHORT_WEEKDAYS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"] as const;

export type ParisParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: string;
};

/**
 * Reads calendar parts of an instant in Europe/Paris.
 *
 * @param date Instant to project onto the Paris calendar
 * @returns Civil date and clock parts in Paris
 */
export function readParisParts(date: Date): ParisParts {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: PARIS_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  });
  const parts = formatter.formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const hour = Number(read("hour"));

  return {
    year: Number(read("year")),
    month: Number(read("month")),
    day: Number(read("day")),
    hour: hour === 24 ? 0 : hour,
    minute: Number(read("minute")),
    second: Number(read("second")),
    weekday: read("weekday"),
  };
}

/**
 * Returns the Europe/Paris offset from UTC at a given instant.
 *
 * @param instant Instant used to resolve the offset
 * @returns Offset in milliseconds, positive when Paris is ahead of UTC
 */
function parisOffsetMs(instant: Date): number {
  const parts = readParisParts(instant);
  const asUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtc - instant.getTime();
}

/**
 * Converts a Europe/Paris civil time into a UTC instant.
 *
 * @param year Full year
 * @param month Month from 1 to 12
 * @param day Day of the month
 * @param hour Hour from 0 to 23
 * @param minute Minute from 0 to 59
 * @param second Second from 0 to 59
 * @returns Matching UTC instant
 */
export function parisCivilToUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
): Date {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  let instant = utcGuess;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    instant = utcGuess - parisOffsetMs(new Date(instant));
  }

  return new Date(instant);
}

/**
 * Shifts a civil date by a number of calendar days.
 *
 * @param year Full year
 * @param month Month from 1 to 12
 * @param day Day of the month
 * @param delta Number of days to add, negative to go backward
 * @returns Resulting civil date
 */
export function addCivilDays(
  year: number,
  month: number,
  day: number,
  delta: number,
): { year: number; month: number; day: number } {
  const shifted = new Date(Date.UTC(year, month - 1, day + delta));
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

/**
 * Formats a civil date as YYYY-MM-DD.
 *
 * @param year Full year
 * @param month Month from 1 to 12
 * @param day Day of the month
 * @returns Date key
 */
export function civilDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Returns the Europe/Paris calendar key of an instant.
 *
 * @param date Instant to classify
 * @returns YYYY-MM-DD key in Paris
 */
export function parisDateKey(date: Date): string {
  const parts = readParisParts(date);
  return civilDateKey(parts.year, parts.month, parts.day);
}

/**
 * Returns the UTC instant of midnight in Europe/Paris for the given moment's day.
 *
 * @param date Instant inside the target Paris day
 * @returns Start of that Paris day
 */
export function getStartOfParisDay(date: Date): Date {
  const parts = readParisParts(date);
  return parisCivilToUtc(parts.year, parts.month, parts.day);
}

/**
 * Returns Monday 00:00 Europe/Paris for the week containing the instant.
 *
 * @param date Instant inside the target week
 * @returns Start of the Paris week
 */
export function getStartOfParisWeek(date: Date): Date {
  const parts = readParisParts(date);
  const weekdayIndex = WEEKDAY_INDEX[parts.weekday] ?? 0;
  const monday = addCivilDays(parts.year, parts.month, parts.day, -weekdayIndex);
  return parisCivilToUtc(monday.year, monday.month, monday.day);
}

/**
 * Splits a YYYY-MM-DD key into civil parts.
 *
 * @param dateKey Civil date key
 * @returns Year, month, and day numbers
 */
function readDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split("-").map(Number);
  return { year, month, day };
}

/**
 * Returns midnight Europe/Paris for a civil date key.
 *
 * @param dateKey YYYY-MM-DD civil date
 * @returns Start of that Paris day
 */
export function startOfDateKey(dateKey: string): Date {
  const { year, month, day } = readDateKey(dateKey);
  return parisCivilToUtc(year, month, day);
}

/**
 * Shifts a civil date key by a number of days.
 *
 * @param dateKey YYYY-MM-DD civil date
 * @param delta Number of days to add
 * @returns Shifted date key
 */
export function shiftDateKey(dateKey: string, delta: number): string {
  const { year, month, day } = readDateKey(dateKey);
  const shifted = addCivilDays(year, month, day, delta);
  return civilDateKey(shifted.year, shifted.month, shifted.day);
}

/**
 * Builds a UTC instant at noon Paris for a date key, safe for labeling.
 *
 * @param dateKey YYYY-MM-DD civil date
 * @returns Noon on that Paris day
 */
export function dateKeyToNoon(dateKey: string): Date {
  const { year, month, day } = readDateKey(dateKey);
  return parisCivilToUtc(year, month, day, 12);
}

/**
 * Returns the Monday-based weekday index of a Paris date key.
 *
 * @param dateKey YYYY-MM-DD civil date
 * @returns 0 for Monday through 6 for Sunday
 */
export function weekdayIndexForKey(dateKey: string): number {
  const weekday = readParisParts(dateKeyToNoon(dateKey)).weekday;
  return WEEKDAY_INDEX[weekday] ?? 0;
}

/**
 * Formats a duration as `12h40`.
 *
 * @param durationMs Duration in milliseconds
 * @returns Hour and minute label
 */
export function formatHourMinutes(durationMs: number): string {
  const totalMinutes = Math.max(0, Math.floor(durationMs / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${String(minutes).padStart(2, "0")}`;
}

/**
 * Reads a finished span the way a person would say it.
 *
 * @param durationMs Duration in milliseconds
 * @returns Short French reading of the span
 */
export function formatSessionReading(durationMs: number): string {
  const minutes = Math.max(0, Math.floor(durationMs / 60000));
  if (minutes < 1) {
    return "un instant";
  }
  if (minutes === 1) {
    return "1 minute";
  }
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  return formatHourMinutes(durationMs);
}

/**
 * Formats a running duration as `4:12:08`.
 *
 * @param durationMs Duration in milliseconds
 * @returns Clock-style duration
 */
export function formatClockDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * Formats an instant as HH:MM in Europe/Paris.
 *
 * @param date Instant to display
 * @returns 24-hour clock label
 */
export function formatParisClock(date: Date): string {
  const parts = readParisParts(date);
  return `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
}

/**
 * Formats an instant as a French long date in Europe/Paris.
 *
 * @param date Instant to display
 * @returns Capitalized date label
 */
export function formatParisLongDate(date: Date): string {
  const label = new Intl.DateTimeFormat("fr-FR", {
    timeZone: PARIS_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Returns the ISO week number of a civil date key.
 *
 * @param dateKey YYYY-MM-DD civil date
 * @returns ISO week year and week number
 */
export function readIsoWeek(dateKey: string): { year: number; week: number } {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - weekday);
  const weekYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(weekYear, 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: weekYear, week };
}

/**
 * Counts remaining weekdays in the current week, including today.
 *
 * @param weekdayIndex Monday-based index of today
 * @returns Number of weekdays left, or 0 on the weekend
 */
export function countRemainingWorkdays(weekdayIndex: number): number {
  if (weekdayIndex >= 5) {
    return 0;
  }

  return 5 - weekdayIndex;
}
