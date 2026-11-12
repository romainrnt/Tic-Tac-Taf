import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME, ACCESS_PATH, isValidAccessCookie } from "@/lib/access";

/**
 * Redirects browsers without a valid access cookie to the access page.
 * API routes are excluded and check their own bearer token.
 *
 * @param request Incoming request
 * @returns Redirect to the access page, or the untouched request
 */
export function proxy(request: NextRequest) {
  const cookieValue = request.cookies.get(ACCESS_COOKIE_NAME)?.value;

  if (isValidAccessCookie(cookieValue)) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(ACCESS_PATH, request.url));
}

export const config = {
  matcher: ["/((?!api|acces|_next/static|_next/image|favicon.ico).*)"],
};
