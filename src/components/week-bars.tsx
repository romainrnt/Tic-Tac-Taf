"use client";

import { motion } from "motion/react";
import { resolveLiveMs, useNow } from "@/components/live-figures";
import type { DayView } from "@/lib/snapshot";
import { formatHourMinutes } from "@/lib/time";

const WORKDAYS = 5;
/** Share of the daily target from which a day counts as "close". */
const CLOSE_RATIO = 0.85;
/** Head room kept above the tallest bar for its value label. */
const HEAD_ROOM = 1.18;

type Tone = "met" | "close" | "short" | "running";

const TONES: Record<Tone, { bar: string; text: string }> = {
  met: { bar: "bg-live", text: "text-live" },
  close: { bar: "bg-warn", text: "text-warn" },
  short: { bar: "bg-alert", text: "text-alert" },
  running: { bar: "bg-accent", text: "text-muted" },
};

/**
 * Grades a day against the daily target.
 *
 * @param value Worked time in milliseconds
 * @param target Daily target in milliseconds
 * @param isToday Whether the day is still running
 * @returns Tone used to colour the day
 */
function gradeDay(value: number, target: number, isToday: boolean): Tone {
  if (value >= target) {
    return "met";
  }
  if (isToday) {
    return "running";
  }
  return value >= target * CLOSE_RATIO ? "close" : "short";
}

/**
 * Draws Monday to Friday as slim bars coloured by how they compare to the daily target.
 */
export function WeekBars({
  days,
  todayKey,
  renderedAt,
  goalMs,
}: {
  days: DayView[];
  todayKey: string;
  renderedAt: number;
  goalMs: number;
}) {
  const workdays = days.slice(0, WORKDAYS);
  const today = workdays.find((day) => day.key === todayKey) ?? null;
  const now = useNow(renderedAt, today?.openStartedAt != null);
  const dailyTarget = goalMs / WORKDAYS;
  const values = workdays.map((day) =>
    day.key === todayKey ? resolveLiveMs(day.closedMs, day.openStartedAt, now) : day.displayMs,
  );
  const scale = Math.max(dailyTarget, ...values) * HEAD_ROOM;
  const targetRatio = dailyTarget / scale;
  const worked = values.filter((value) => value > 0);
  const averageMs = worked.length > 0 ? worked.reduce((sum, value) => sum + value, 0) / worked.length : 0;

  return (
    <div className="rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm font-medium">Par jour</p>
        <p className="text-sm tabular-nums text-muted">
          {worked.length > 0 ? `moyenne ${formatHourMinutes(averageMs)}` : "aucun pointage"}
        </p>
      </div>

      <div className="relative mt-8 h-44 border-b border-line sm:h-52">
        <div
          className="pointer-events-none absolute inset-x-0 border-t border-dashed border-muted/50"
          style={{ bottom: `${targetRatio * 100}%` }}
          aria-hidden="true"
        >
          <span className="absolute -top-2.5 left-0 bg-surface pr-2 text-[11px] tabular-nums text-muted">
            {formatHourMinutes(dailyTarget)}
          </span>
        </div>

        <ol className="relative grid h-full grid-cols-5 pl-10">
          {workdays.map((day, index) => {
            const value = values[index];
            const isToday = day.key === todayKey;
            const tone = TONES[gradeDay(value, dailyTarget, isToday)];

            return (
              <li
                key={day.key}
                className={`flex h-full flex-col items-center justify-end rounded-t-xl ${isToday ? "bg-surface-2/60" : ""}`}
                aria-hidden="true"
              >
                {value > 0 ? (
                  <>
                    <motion.span
                      className="mb-1.5 text-xs font-medium tabular-nums"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                    >
                      {formatHourMinutes(value)}
                    </motion.span>
                    <motion.span
                      className={`block w-5 origin-bottom rounded-t-sm sm:w-6 ${tone.bar}`}
                      style={{ height: `${Math.max((value / scale) * 100, 2)}%` }}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 + index * 0.05 }}
                    />
                  </>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      <ol className="mt-3 grid grid-cols-5 pl-10">
        {workdays.map((day, index) => {
          const value = values[index];
          const isToday = day.key === todayKey;
          const tone = TONES[gradeDay(value, dailyTarget, isToday)];
          const delta = value - dailyTarget;
          const running = isToday && delta < 0;

          return (
            <li key={day.key} className={`flex flex-col items-center text-center ${day.key > todayKey ? "opacity-45" : ""}`}>
              <span className="sr-only">
                {day.longLabel} : {formatHourMinutes(value)}
              </span>
              <span aria-hidden="true" className={`text-xs ${isToday ? "font-semibold text-foreground" : "text-muted"}`}>
                {day.shortLabel.charAt(0) + day.shortLabel.slice(1).toLowerCase()}
              </span>
              <span aria-hidden="true" className={`mt-0.5 min-h-4 text-[11px] tabular-nums ${tone.text}`}>
                {value === 0
                  ? ""
                  : running
                    ? "en cours"
                    : `${delta >= 0 ? "+" : "−"}${formatHourMinutes(Math.abs(delta))}`}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
