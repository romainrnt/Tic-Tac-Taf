"use client";

const THEME_KEY = "tictactaf-theme";

/**
 * Switches the document between the default light theme and the dark theme.
 */
export function ThemeToggle() {
  function toggleTheme() {
    const nextDark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.setItem(THEME_KEY, nextDark ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Basculer entre le mode clair et le mode sombre"
      className="rounded-full border border-line bg-card px-2.5 py-1.5 text-[11px] text-foreground sm:px-3"
    >
      <span className="dark:hidden">Sombre</span>
      <span className="hidden dark:inline">Clair</span>
    </button>
  );
}
