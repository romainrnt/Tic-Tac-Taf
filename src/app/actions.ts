"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isValidAccessToken } from "@/lib/access";
import { recordToggle, removeLatestEntry } from "@/lib/entries";
import { grantBrowserAccess, requireActionAccess } from "@/lib/session";

export type UnlockState = {
  error: string | null;
};

/**
 * Records the next punch and refreshes the tracker pages.
 */
export async function togglePunch(): Promise<void> {
  await requireActionAccess();
  await recordToggle();
  revalidatePath("/");
  revalidatePath("/historique");
}

/**
 * Deletes the latest punch and refreshes the tracker pages.
 */
export async function undoLatestPunch(): Promise<void> {
  await requireActionAccess();
  await removeLatestEntry();
  revalidatePath("/");
  revalidatePath("/historique");
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
