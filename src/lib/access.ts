import { createHash, timingSafeEqual } from "node:crypto";

export const ACCESS_COOKIE_NAME = "tictactaf_access";
export const ACCESS_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
export const ACCESS_PATH = "/acces";

const COOKIE_DERIVATION_PREFIX = "tictactaf-cookie:";

/**
 * Hashes a value with SHA-256.
 *
 * @param value Text to hash
 * @returns Raw digest
 */
function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/**
 * Compares two strings without leaking their content through timing.
 *
 * @param left First value
 * @param right Second value
 * @returns Whether both values are identical
 */
function safeEqual(left: string, right: string): boolean {
  return timingSafeEqual(digest(left), digest(right));
}

/**
 * Reads the configured access secret.
 *
 * @returns Secret, or null when the app has no secret configured
 */
function readConfiguredSecret(): string | null {
  const secret = process.env.ACCESS_TOKEN;
  return secret && secret.length > 0 ? secret : null;
}

/**
 * Checks a submitted secret against the configured one.
 * Always fails when no secret is configured.
 *
 * @param candidate Secret received from a client
 * @returns Whether the secret grants access
 */
export function isValidAccessToken(candidate: string | null | undefined): boolean {
  const secret = readConfiguredSecret();

  if (!secret || !candidate) {
    return false;
  }

  return safeEqual(candidate, secret);
}

/**
 * Derives the browser cookie value from the configured secret.
 * The cookie never contains the secret itself.
 *
 * @returns Cookie value, or null when no secret is configured
 */
export function buildAccessCookieValue(): string | null {
  const secret = readConfiguredSecret();

  if (!secret) {
    return null;
  }

  return digest(`${COOKIE_DERIVATION_PREFIX}${secret}`).toString("hex");
}

/**
 * Checks the value of the browser access cookie.
 *
 * @param cookieValue Value sent by the browser
 * @returns Whether the cookie grants access
 */
export function isValidAccessCookie(cookieValue: string | null | undefined): boolean {
  const expected = buildAccessCookieValue();

  if (!expected || !cookieValue) {
    return false;
  }

  return safeEqual(cookieValue, expected);
}

/**
 * Checks the bearer token of an API request.
 *
 * @param request Incoming request
 * @returns Whether the Authorization header grants access
 */
export function hasValidBearerToken(request: Request): boolean {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme?.toLowerCase() !== "bearer") {
    return false;
  }

  return isValidAccessToken(token);
}

/**
 * Checks every accepted way to present the access secret.
 * Shortcuts can send it as a bearer token, an header, or a query parameter.
 *
 * @param request Incoming request
 * @returns Whether the request is allowed to punch
 */
export function hasRequestAccess(request: Request): boolean {
  if (hasValidBearerToken(request)) {
    return true;
  }

  if (isValidAccessToken(request.headers.get("x-access-token"))) {
    return true;
  }

  return isValidAccessToken(new URL(request.url).searchParams.get("token"));
}
