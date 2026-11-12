import { NextResponse } from "next/server";
import { hasRequestAccess } from "@/lib/access";
import { loadTrackerSnapshot } from "@/lib/entries";
import { formatClockDuration, formatHourMinutes } from "@/lib/time";

/**
 * Returns the current punch status, today's time, and the weekly goal.
 * Requires the access secret.
 *
 * @param request Incoming request
 * @returns JSON status payload for Shortcuts and other clients
 */
export async function GET(request: Request) {
  if (!hasRequestAccess(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await loadTrackerSnapshot();
    const todayMs = snapshot.today.displayMs;
    const weekMs = snapshot.weekClosedMs + (snapshot.weekOpenStartedAt
      ? Math.max(0, snapshot.renderedAt - new Date(snapshot.weekOpenStartedAt).getTime())
      : 0);

    return NextResponse.json({
      ok: true,
      status: snapshot.status,
      label: snapshot.status === "en_poste" ? "En poste" : "Hors poste",
      next: snapshot.nextType,
      today: formatHourMinutes(todayMs),
      todayClock: formatClockDuration(todayMs),
      week: formatHourMinutes(weekMs),
      goal: formatHourMinutes(snapshot.goalMs),
      remaining: formatHourMinutes(Math.max(0, snapshot.goalMs - weekMs)),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read tracker status";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
