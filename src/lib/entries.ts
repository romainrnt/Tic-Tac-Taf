import { io } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildSnapshot, type TrackerSnapshot } from "@/lib/snapshot";
import { getStartOfParisDay } from "@/lib/time";
import {
  ENTRY_TYPE_ARRIVAL,
  ENTRY_TYPE_DEPARTURE,
  resolveNextEntryType,
} from "@/lib/time-entry";

export type PunchOutcome = {
  created: boolean;
  label: string;
  entry: {
    id: string;
    type: string;
    timestamp: Date;
  } | null;
};

/**
 * Reads the latest punch of the current Paris day.
 *
 * @returns Latest punch, or null when today has none
 */
async function findLatestEntryToday() {
  return prisma.timeEntry.findFirst({
    where: {
      timestamp: {
        gte: getStartOfParisDay(new Date()),
      },
    },
    orderBy: {
      timestamp: "desc",
    },
  });
}

/**
 * Stores one punch of the given type.
 *
 * @param type Punch label to store
 * @param label Text returned to the caller
 * @returns Outcome of the created punch
 */
async function createPunch(type: string, label: string): Promise<PunchOutcome> {
  const entry = await prisma.timeEntry.create({
    data: {
      type,
    },
  });

  return {
    created: true,
    label,
    entry,
  };
}

/**
 * Records the next punch for the current Paris day.
 *
 * @returns Created punch
 */
export async function recordToggle(): Promise<PunchOutcome> {
  const lastEntryToday = await findLatestEntryToday();
  const nextType = resolveNextEntryType(lastEntryToday?.type ?? null);
  return createPunch(nextType, nextType);
}

/**
 * Records an arrival unless one is already open today.
 * A repeated geofence event does not create a second arrival.
 *
 * @returns Arrival outcome, including a no-op when already clocked in
 */
export async function recordArrival(): Promise<PunchOutcome> {
  const lastEntryToday = await findLatestEntryToday();

  if (lastEntryToday?.type === ENTRY_TYPE_ARRIVAL) {
    return {
      created: false,
      label: "Déjà en poste",
      entry: lastEntryToday,
    };
  }

  return createPunch(ENTRY_TYPE_ARRIVAL, ENTRY_TYPE_ARRIVAL);
}

/**
 * Records a departure only when an arrival is still open today.
 * A repeated leave event does not create another departure.
 *
 * @returns Departure outcome, including a no-op when already clocked out
 */
export async function recordDeparture(): Promise<PunchOutcome> {
  const lastEntryToday = await findLatestEntryToday();

  if (lastEntryToday?.type !== ENTRY_TYPE_ARRIVAL) {
    return {
      created: false,
      label: "Déjà parti",
      entry: lastEntryToday,
    };
  }

  return createPunch(ENTRY_TYPE_DEPARTURE, ENTRY_TYPE_DEPARTURE);
}

/**
 * Loads the tracker snapshot for the current Paris day and week.
 *
 * @returns Dashboard data
 */
export async function loadTrackerSnapshot(): Promise<TrackerSnapshot> {
  await io();
  const entries = await prisma.timeEntry.findMany({
    orderBy: {
      timestamp: "asc",
    },
  });

  return buildSnapshot(entries, new Date());
}
