"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidAccessToken } from "@/lib/access";
import { recordArrival, recordDeparture } from "@/lib/entries";
import { grantBrowserAccess, requireActionAccess } from "@/lib/session";

export type UnlockState = {
  error: string | null;
};

/**
 * Refreshes the pages that show punches.
 */
function refreshTrackerPages(): void {
  revalidatePath("/");
}

/**
 * Records an arrival, then refreshes the tracker pages.
 */
export async function arrivePunch(): Promise<void> {
  await requireActionAccess();
  await recordArrival();
  refreshTrackerPages();
}

/**
 * Records a departure, then refreshes the tracker pages.
 */
export async function leavePunch(): Promise<void> {
  await requireActionAccess();
  await recordDeparture();
  refreshTrackerPages();
}

/**
 * Checks the submitted access code and opens the tracker for this browser.
 *
 * @param _previousState State of the previous submission
 * @param formData Form containing the access code
 * @returns Error state when the code is rejected
 */
export async function unlockTracker(
  _previousState: UnlockState,
  formData: FormData,
): Promise<UnlockState> {
  const code = formData.get("code");

  if (typeof code !== "string" || !isValidAccessToken(code.trim())) {
    return { error: "Code refusé." };
  }

  await grantBrowserAccess();
  redirect("/");
}
