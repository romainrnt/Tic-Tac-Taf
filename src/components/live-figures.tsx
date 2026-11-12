"use client";

import { useEffect, useState } from "react";
import GlareHover from "@/components/react-bits/glare-hover";
import { formatClockDuration, formatHourMinutes } from "@/lib/time";

/**
 * Tracks the current instant, starting from the server render time.
 *
 * @param initialNow Server timestamp in milliseconds
 * @param ticking Whether the clock should advance
 * @returns Current timestamp in milliseconds
 */
function useNow(initialNow: number, ticking: boolean): number {
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
function resolveLiveMs(closedMs: number, openStartedAt: string | null, now: number): number {
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
 * Shows weekly progress against the 36h30 goal.
 */
export function WeekMeter({
  closedMs,
  openStartedAt,
  renderedAt,
  goalMs,
  remainingWorkdays,
}: {
  closedMs: number;
  openStartedAt: string | null;
  renderedAt: number;
  goalMs: number;
  remainingWorkdays: number;
}) {
  const now = useNow(renderedAt, openStartedAt !== null);
  const liveMs = resolveLiveMs(closedMs, openStartedAt, now);
  const remainingMs = goalMs - liveMs;
  const width = goalMs === 0 ? 0 : Math.min(100, (liveMs / goalMs) * 100);
  const reached = remainingMs <= 0;
  const dayLabel = remainingWorkdays > 1 ? "jours" : "jour";
  const detail = reached
    ? `Objectif atteint · +${formatHourMinutes(Math.abs(remainingMs))}`
    : remainingWorkdays > 0
      ? `Reste ${formatHourMinutes(remainingMs)} sur ${remainingWorkdays} ${dayLabel}`
      : `Reste ${formatHourMinutes(remainingMs)}`;

  const percent = Math.round(width);

  return (
    <GlareHover
      className="w-full rounded-3xl border border-line text-left"
      width="100%"
      background="var(--card)"
      borderColor="var(--line)"
      borderRadius="1.5rem"
      glareColor="#d85a32"
      glareOpacity={0.22}
      glareSize={18}
      softness={0.85}
      rimGlint={false}
      intro
      playOnce
    >
    <div className="w-full p-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display text-2xl">Cette semaine</p>
        <p className="font-mono text-sm tabular-nums text-stamp">{percent}%</p>
      </div>
      <p className="mt-3 font-mono text-3xl tabular-nums md:text-4xl">
        <span>{formatHourMinutes(liveMs)}</span>
        <span className="text-muted"> / {formatHourMinutes(goalMs)}</span>
      </p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div className="h-full rounded-full bg-stamp transition-[width]" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-3 text-sm text-muted">{detail}</p>
    </div>
    </GlareHover>
  );
}
