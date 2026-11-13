"use client";

const THEME_KEY = "tictactaf-theme";

/**
 * Switches the document between the light and the dark theme, with a sun / moon swap.
 */
export function ThemeToggle() {
  function toggleTheme() {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    try {
      localStorage.setItem(THEME_KEY, nextDark ? "dark" : "light");
    } catch {
      // Storage can be blocked: the switch still applies to this page.
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Basculer entre le mode clair et le mode sombre"
      className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-line bg-surface text-foreground transition hover:border-foreground active:scale-90"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
        className="absolute transition-all duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] dark:translate-y-8 dark:rotate-90 dark:opacity-0"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="absolute -translate-y-8 -rotate-90 opacity-0 transition-all duration-500 ease-[cubic-bezier(.34,1.56,.64,1)] dark:translate-y-0 dark:rotate-0 dark:opacity-100"
      >
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
      </svg>
    </button>
  );
}
