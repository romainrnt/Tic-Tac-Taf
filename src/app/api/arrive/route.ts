import { recordArrival } from "@/lib/entries";
import { respondToPunch } from "@/lib/punch-response";

/**
 * Records an arrival for a location automation.
 * Does nothing when an arrival is already open today.
 *
 * @param request Incoming webhook request
 * @returns JSON or plain-text payload with the punch label
 */
export async function POST(request: Request) {
  return respondToPunch(request, recordArrival);
}
