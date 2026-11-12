export const ENTRY_TYPE_ARRIVAL = "Arrivée";
export const ENTRY_TYPE_DEPARTURE = "Départ";

/**
 * Resolves the next punch type from the most recent entry of the day.
 *
 * @param lastEntryType Type of the last punch today, or null when none exists
 * @returns Next punch type to record
 */
export function resolveNextEntryType(
  lastEntryType: string | null,
): typeof ENTRY_TYPE_ARRIVAL | typeof ENTRY_TYPE_DEPARTURE {
  if (lastEntryType === ENTRY_TYPE_ARRIVAL) {
    return ENTRY_TYPE_DEPARTURE;
  }

  return ENTRY_TYPE_ARRIVAL;
}
