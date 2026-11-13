"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { formatClockDuration, formatHourMinutes } from "@/lib/time";

const DIAL_TICKS = 60;
const WORKDAY_LETTERS = ["L", "M", "M", "J", "V"] as const;

/**
 * Tracks the current instant, starting from the server render time.
 *
 * @param initialNow Server timestamp in milliseconds
 * @param ticking Whether the clock should advance
 * @returns Current timestamp in milliseconds
 */
export function useNow(initialNow: number, ticking: boolean): number {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    if (!ticking) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [ticking]);

  return now;
}

/**
 * Adds the open session elapsed time to already closed time.
 *
 * @param closedMs Closed duration in milliseconds
 * @param openStartedAt ISO start of the open session, if any
 * @param now Current timestamp in milliseconds
 * @returns Total elapsed milliseconds
 */
export function resolveLiveMs(closedMs: number, openStartedAt: string | null, now: number): number {
  if (!openStartedAt) {
    return closedMs;
  }

  return closedMs + Math.max(0, now - new Date(openStartedAt).getTime());
}

/**
 * Renders a duration that advances each second while a session is open.
 */
export function ElapsedTime({
  closedMs,
  openStartedAt,
  renderedAt,
  withSeconds,
  className,
}: {
  closedMs: number;
  openStartedAt: string | null;
  renderedAt: number;
  withSeconds: boolean;
  className?: string;
}) {
  const now = useNow(renderedAt, openStartedAt !== null);
  const elapsed = resolveLiveMs(closedMs, openStartedAt, now);
  const label = withSeconds ? formatClockDuration(elapsed) : formatHourMinutes(elapsed);

  return <span className={className}>{label}</span>;
}

/**
 * Shows a label whose digits roll like a scoreboard when they change.
 * Digits are keyed from the right so that 9:59:59 → 10:00:00 rolls cleanly.
 */
export function RollingDigits({ text, className = "" }: { text: string; className?: string }) {
  const chars = text.split("");

  return (
    <span className={`relative inline-flex items-baseline ${className}`}>
      <span className="sr-only">{text}</span>
      {chars.map((char, index) => {
        const slot = chars.length - index;
        if (!/\d/.test(char)) {
          return (
            <span key={`sep-${slot}`} aria-hidden="true" className="inline-block">
              {char}
            </span>
          );
        }

        return (
          <span
            key={`digit-${slot}`}
            aria-hidden="true"
            className="relative inline-block h-[1em] w-[0.56em] overflow-hidden text-center leading-none"
          >
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={char}
                className="absolute inset-0"
                initial={{ y: "40%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-40%", opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}

/**
 * Renders today's worked time as a giant scoreboard that ticks while on duty.
 */
export function HeroClock({
  closedMs,
  openStartedAt,
  renderedAt,
}: {
  closedMs: number;
  openStartedAt: string | null;
  renderedAt: number;
}) {
  const now = useNow(renderedAt, openStartedAt !== null);
  const elapsed = resolveLiveMs(closedMs, openStartedAt, now);

  if (!openStartedAt) {
    return <span>{formatHourMinutes(elapsed)}</span>;
  }

  const clock = formatClockDuration(elapsed);
  return (
    <span>
      {clock.slice(0, -3)}
      <span className="text-[0.4em] font-normal text-muted">{clock.slice(-3)}</span>
    </span>
  );
}

/**
 * Shows today's progress toward the daily target as a slim bar with its two figures.
 */
export function DayProgress({
  closedMs,
  openStartedAt,
  renderedAt,
  targetMs,
}: {
  closedMs: number;
  openStartedAt: string | null;
  renderedAt: number;
  targetMs: number;
}) {
  const now = useNow(renderedAt, openStartedAt !== null);
  const elapsed = resolveLiveMs(closedMs, openStartedAt, now);
  const ratio = targetMs === 0 ? 0 : Math.min(1, elapsed / targetMs);
  const remainingMs = targetMs - elapsed;
  const reached = remainingMs <= 0;

  return (
    <div className="mt-6">
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
        <motion.div
          className={`h-full origin-left rounded-full ${reached ? "bg-live" : "bg-accent"}`}
          style={{ width: `${ratio * 100}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </div>
      <p className="mt-2 flex justify-between gap-4 text-xs tabular-nums text-muted">
        <span>Objectif du jour {formatHourMinutes(targetMs)}</span>
        <span className={reached ? "text-live" : undefined}>
          {reached ? `+${formatHourMinutes(-remainingMs)}` : `reste ${formatHourMinutes(remainingMs)}`}
        </span>
      </p>
    </div>
  );
}

/**
 * Converts a dial position into SVG coordinates, 0 being twelve o'clock.
 *
 * @param ratio Position around the dial, from 0 to 1
 * @param radius Distance from the centre
 * @param center Centre coordinate
 * @returns x and y in the SVG space
 */
function polar(ratio: number, radius: number, center: number): { x: number; y: number } {
  const angle = ratio * Math.PI * 2 - Math.PI / 2;
  // Rounded so that the server and the browser print the same coordinates.
  const round = (value: number) => Math.round(value * 100) / 100;
  return { x: round(center + radius * Math.cos(angle)), y: round(center + radius * Math.sin(angle)) };
}

/**
 * Shows the week as a clock dial split into five workdays, filling toward 36h30.
 */
export function WeekDial({
  weekLabel,
  closedMs,
  openStartedAt,
  renderedAt,
  goalMs,
  remainingWorkdays,
}: {
  weekLabel: string;
  closedMs: number;
  openStartedAt: string | null;
  renderedAt: number;
  goalMs: number;
  remainingWorkdays: number;
}) {
  const live = openStartedAt !== null;
  const now = useNow(renderedAt, live);
  const liveMs = resolveLiveMs(closedMs, openStartedAt, now);
  const remainingMs = goalMs - liveMs;
  const ratio = goalMs === 0 ? 0 : Math.min(1, liveMs / goalMs);
  const reached = remainingMs <= 0;
  const pace =
    !reached && remainingWorkdays > 0 ? formatHourMinutes(remainingMs / remainingWorkdays) : null;
  const size = 300;
  const center = size / 2;
  const ringRadius = 112;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium">Cette semaine</p>
        <p className="text-sm tabular-nums text-muted">
          {weekLabel}
        </p>
      </div>

      <div className="relative mx-auto my-auto aspect-square w-full max-w-64 py-2">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full" aria-hidden="true">
          {Array.from({ length: DIAL_TICKS }, (_, index) => {
            const at = index / DIAL_TICKS;
            const major = index % (DIAL_TICKS / 5) === 0;
            const outer = polar(at, 140, center);
            const inner = polar(at, major ? 124 : 131, center);
            const lit = at < ratio;
            return (
              <motion.line
                key={index}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={lit ? "var(--muted)" : "var(--line)"}
                strokeWidth={major ? 2 : 1}
                strokeLinecap="round"
                style={{ transition: "stroke 0.4s ease" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + index * 0.012, duration: 0.25 }}
              />
            );
          })}

          {WORKDAY_LETTERS.map((letter, index) => {
            const spot = polar(index / 5 + 0.1, 92, center);
            return (
              <text
                key={`${letter}-${index}`}
                x={spot.x}
                y={spot.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-muted font-mono text-[11px]"
              >
                {letter}
              </text>
            );
          })}

          <circle cx={center} cy={center} r={ringRadius} fill="none" stroke="var(--surface-2)" strokeWidth="8" />
          <motion.circle
            cx={center}
            cy={center}
            r={ringRadius}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: ratio, opacity: ratio > 0 ? 1 : 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          />

          {live ? (
            <g className="tick-hand" style={{ transformOrigin: `${center}px ${center}px` }}>
              <circle cx={center} cy={center - ringRadius} r="2.5" fill="var(--muted)" />
            </g>
          ) : null}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="font-display text-5xl font-semibold leading-none tracking-tight tabular-nums">
            <RollingDigits text={formatHourMinutes(liveMs)} />
          </p>
          <p className="mt-1.5 text-xs text-muted">sur {formatHourMinutes(goalMs)}</p>
        </div>
      </div>

      {reached ? null : (
        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted">Reste</p>
            <p className="mt-1 font-display text-3xl font-semibold leading-none tabular-nums">
              {formatHourMinutes(remainingMs)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted">{pace ? `Par jour (${remainingWorkdays} j)` : "Week-end"}</p>
            <p className="mt-1 font-display text-3xl font-semibold leading-none tabular-nums">{pace ?? "—"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
