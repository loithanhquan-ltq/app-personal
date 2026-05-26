"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const START_MS = new Date("2022-06-09").getTime();
const END_MS   = new Date("2026-06-09").getTime();
const YEARS    = [2022, 2023, 2024, 2025, 2026];

const TOTAL_JOURNEY_DAYS = (END_MS - START_MS) / 86400000;

interface JourneySliderProps {
  yearCounts: Record<number, number>;
  animatedDays: number;
  totalDays: number;
}

export function JourneySlider({ yearCounts: _yearCounts, animatedDays, totalDays }: JourneySliderProps) {
  const [reduced, setReduced]         = useState(false);
  const [currentYear, setCurrentYear] = useState(0);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setCurrentYear(new Date().getFullYear());
  }, []);

  const fillPct  = Math.min(100, (animatedDays / TOTAL_JOURNEY_DAYS) * 100);
  const finalPct = Math.min(100, (totalDays / TOTAL_JOURNEY_DAYS) * 100);
  const settled  = animatedDays >= totalDays;
  const activePct = reduced ? finalPct : fillPct;

  return (
    <div
      aria-label={`Journey progress: ${Math.round(fillPct)}% complete`}
      style={{ userSelect: "none" }}
    >
      {/* Track */}
      <div style={{ position: "relative", height: 4 }}>
        {/* Future: dots */}
        <div style={{
          position: "absolute",
          left: `${activePct}%`, top: 0, right: 0, bottom: 0,
          background: "repeating-linear-gradient(90deg, rgba(164,74,42,0.22) 0, rgba(164,74,42,0.22) 3px, transparent 3px, transparent 10px)",
        }} />
        {/* Past: gradient fill */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          borderRadius: "2px 0 0 2px",
          background: "linear-gradient(90deg, #a44a2a, #c96b3f)",
          width: `${activePct}%`,
        }} />
        {/* ♥ — standalone, glow pulse when settled */}
        <div style={{
          position: "absolute", top: "50%", left: `${activePct}%`,
          transform: "translate(-50%, -50%)",
        }}>
          <motion.span
            animate={settled && !reduced ? {
              scale:  [1, 1.22, 1],
              filter: [
                "drop-shadow(0 0 0px rgba(164,74,42,0))",
                "drop-shadow(0 0 9px rgba(164,74,42,0.65))",
                "drop-shadow(0 0 0px rgba(164,74,42,0))",
              ],
            } : { scale: 1 }}
            transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            style={{ fontSize: 24, color: "var(--color-accent)", display: "block", lineHeight: 1 }}
          >♥</motion.span>
        </div>
      </div>

      {/* Bookend dates */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em",
          color: "var(--color-accent)", opacity: 0.6,
        }}>Jun 9, 2022</span>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em",
          color: "var(--color-ink3)", opacity: 0.4,
        }}>Jun 9, 2026</span>
      </div>

      {/* Year links — flex row, evenly spaced */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        {YEARS.map((year) => {
          const isCurrent = currentYear > 0 && year === currentYear;
          const isFuture  = currentYear > 0 && year > currentYear;
          return (
            <Link
              key={year}
              href={`/timeline#year-${year}`}
              style={{ textDecoration: "none" }}
              title={`Jump to ${year}`}
            >
              <motion.span
                whileHover={{ y: -2, scale: 1.1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
                style={{
                  display: "block",
                  fontFamily: "var(--font-mono)",
                  fontSize: 9,
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                  color: isCurrent ? "var(--color-accent)" : isFuture ? "var(--color-ink3)" : "var(--color-ink2)",
                  fontWeight: isCurrent ? 600 : 400,
                  opacity: isFuture ? 0.38 : 1,
                  cursor: "pointer",
                }}
              >{year}</motion.span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
