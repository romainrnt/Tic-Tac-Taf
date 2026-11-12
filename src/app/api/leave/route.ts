import { recordDeparture } from "@/lib/entries";
import { respondToPunch } from "@/lib/punch-response";

/**
 * Records a departure for a location automation.
 * Does nothing unless an arrival is still open today.
 *
 * @param request Incoming webhook request
 * @returns JSON or plain-text payload with the punch label
 */
export async function POST(request: Request) {
  return respondToPunch(request, recordDeparture);
}
