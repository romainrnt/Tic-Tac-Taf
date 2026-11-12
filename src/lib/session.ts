import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE_MAX_AGE_SECONDS,
  ACCESS_COOKIE_NAME,
  ACCESS_PATH,
  buildAccessCookieValue,
  isValidAccessCookie,
} from "@/lib/access";

/**
 * Tells whether the current browser holds a valid access cookie.
 *
 * @returns Whether the visitor is allowed in
 */
export async function hasBrowserAccess(): Promise<boolean> {
  const cookieStore = await cookies();
  return isValidAccessCookie(cookieStore.get(ACCESS_COOKIE_NAME)?.value);
}

/**
 * Sends visitors without a valid access cookie to the access page.
 */
export async function requirePageAccess(): Promise<void> {
  if (!(await hasBrowserAccess())) {
    redirect(ACCESS_PATH);
  }
}

/**
 * Rejects server actions called without a valid access cookie.
 */
export async function requireActionAccess(): Promise<void> {
  if (!(await hasBrowserAccess())) {
    throw new Error("Unauthorized");
  }
}

/**
 * Stores the access cookie in the current browser.
 */
export async function grantBrowserAccess(): Promise<void> {
  const value = buildAccessCookieValue();

  if (!value) {
    throw new Error("ACCESS_TOKEN is not configured");
  }

  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_COOKIE_MAX_AGE_SECONDS,
  });
}
