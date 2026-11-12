import { recordToggle } from "@/lib/entries";
import { respondToPunch } from "@/lib/punch-response";

/**
 * Toggles a work punch for the current Paris day.
 * Creates an arrival when none or the last punch is a departure; otherwise a departure.
 *
 * @param request Incoming webhook request
 * @returns JSON or plain-text payload with the punch label
 */
export async function POST(request: Request) {
  return respondToPunch(request, recordToggle);
}
