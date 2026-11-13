"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle";

const LOCKED_PATH = "/acces";

const LINKS = [
  { href: "/", label: "Aujourd'hui", icon: "clock" },
  { href: "/raccourcis", label: "iPhone", icon: "phone" },
] as const;

type IconName = (typeof LINKS)[number]["icon"];

/**
 * Draws a small navigation glyph.
 */
function NavIcon({ name }: { name: IconName }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

/**
 * Draws the clock mark: a dial whose second hand ticks for real.
 */
export function ClockMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="var(--accent)" />
      <circle cx="20" cy="20" r="18" fill="none" stroke="var(--accent-ink)" strokeWidth="2.5" />
      {Array.from({ length: 12 }, (_, index) => (
        <line
          key={index}
          x1="20"
          y1="5"
          x2="20"
          y2={index % 3 === 0 ? 9 : 7}
          stroke="var(--accent-ink)"
          strokeWidth={index % 3 === 0 ? 2.2 : 1.4}
          strokeLinecap="round"
          transform={`rotate(${index * 30} 20 20)`}
        />
      ))}
      <g className="sweep-hand" style={{ transformOrigin: "20px 20px" }}>
        <line x1="20" y1="20" x2="20" y2="11" stroke="var(--accent-ink)" strokeWidth="2.6" strokeLinecap="round" />
      </g>
      <g className="tick-hand" style={{ transformOrigin: "20px 20px" }}>
        <line x1="20" y1="23" x2="20" y2="7" stroke="var(--alert)" strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <circle cx="20" cy="20" r="2.2" fill="var(--accent-ink)" />
    </svg>
  );
}

/**
 * Renders the navigation pills with a highlight that slides between them.
 */
function NavPills({ pathname, layoutId, compact }: { pathname: string; layoutId: string; compact: boolean }) {
  return (
    <>
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center justify-center gap-2 rounded-full font-medium transition-colors ${
              compact ? "flex-1 flex-col gap-0.5 px-2 py-2 text-[11px]" : "px-4 py-2 text-sm"
            } ${active ? "text-background dark:text-foreground" : "text-muted hover:text-foreground"}`}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-foreground dark:bg-surface-2"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            ) : null}
            <span className="relative">
              <NavIcon name={link.icon} />
            </span>
            <span className="relative">{link.label}</span>
          </Link>
        );
      })}
    </>
  );
}

/**
 * Renders the clock wordmark, the navigation, and the theme switch.
 * On phones, navigation moves to a floating bar within thumb reach.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const locked = pathname === LOCKED_PATH;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line/70 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Tic Tac Taf, accueil">
            <span className="transition-transform duration-300 group-hover:-rotate-12">
              <ClockMark />
            </span>
            <span className="font-display text-2xl font-black uppercase leading-none tracking-tight">
              Tic<span className="blink text-muted">·</span>Tac<span className="blink-alt text-muted">·</span>Taf
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {locked ? null : (
              <nav aria-label="Navigation principale" className="hidden gap-1 rounded-full border border-line bg-surface p-1 md:flex">
                <NavPills pathname={pathname} layoutId="nav-pill-desktop" compact={false} />
              </nav>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>
      {locked ? null : (
        <nav
          aria-label="Navigation principale"
          className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 mx-auto flex max-w-sm gap-1 rounded-full border border-line bg-surface/90 p-1.5 shadow-[0_20px_40px_-16px_rgb(0_0_0/0.45)] backdrop-blur-xl md:hidden"
        >
          <NavPills pathname={pathname} layoutId="nav-pill-mobile" compact />
        </nav>
      )}
    </>
  );
}
