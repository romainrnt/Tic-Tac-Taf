"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

const LOCKED_PATH = "/acces";

const LINKS = [
  { href: "/", label: "Aujourd'hui" },
  { href: "/historique", label: "Historique" },
  { href: "/raccourcis", label: "iPhone" },
];

/**
 * Renders the clock wordmark, the primary navigation, and the theme switch.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const locked = pathname === LOCKED_PATH;

  return (
    <header className="sticky top-0 z-20 border-b border-line/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="relative grid h-8 w-8 place-items-center">
            <span className="tick-ring absolute inset-0 rounded-full border border-dashed border-stamp" />
            <span className="h-2 w-2 rounded-full bg-stamp" />
          </span>
          <span className="font-display text-lg tracking-tight sm:text-xl">Tic Tac Taf</span>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {locked ? null : (
            <nav className="flex gap-0.5 text-[11px] sm:gap-1 sm:text-sm">
              {LINKS.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "rounded-full bg-foreground px-2 py-1 text-background sm:px-3"
                        : "rounded-full px-2 py-1 text-muted hover:text-foreground sm:px-3"
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
