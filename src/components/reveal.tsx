"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Slides content up into place, on load or when it scrolls into view.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  onView = false,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  onView?: boolean;
}) {
  const target = { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={onView ? undefined : target}
      whileInView={onView ? target : undefined}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
