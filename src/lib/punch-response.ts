import { NextResponse } from "next/server";
import { hasRequestAccess } from "@/lib/access";
import type { PunchOutcome } from "@/lib/entries";

/**
 * Runs a punch and answers either plain text for Shortcuts or JSON for other clients.
 *
 * @param request Incoming request
 * @param punch Operation that records or ignores the punch
 * @returns HTTP response
 */
export async function respondToPunch(
  request: Request,
  punch: () => Promise<PunchOutcome>,
): Promise<Response> {
  if (!hasRequestAccess(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const outcome = await punch();
    const wantsText = new URL(request.url).searchParams.get("format") === "text";

    if (wantsText) {
      return new Response(outcome.label, {
        status: outcome.created ? 201 : 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }

    return NextResponse.json(
      {
        ok: true,
        created: outcome.created,
        label: outcome.label,
        entry: outcome.entry,
      },
      { status: outcome.created ? 201 : 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to record time entry";

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
