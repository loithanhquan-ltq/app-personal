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

  const fillPct = Math.min(100, (animatedDays / TOTAL_JOURNEY_DAYS) * 100);
  const settled = animatedDays >= totalDays;
  const finalPct = Math.min(100, (totalDays / TOTAL_JOURNEY_DAYS) * 100);

  return (
    <div
      aria-label={`Journey progress: ${Math.round(fillPct)}% complete`}
      style={{ userSelect: "none" }}
    >
      {/* Card */}
      <div style={{
        background: "rgba(164,74,42,0.04)",
        borderRadius: 12,
        border: "0.5px solid var(--color-rule)",
        padding: "20px 20px 18px",
      }}>

        {/* Year markers + labels above track */}
        <div style={{ position: "relative", height: 22, marginBottom: 10 }}>
          {YEARS.map((year, i) => {
            const pct       = (i / (YEARS.length - 1)) * 100;
            const isCurrent = currentYear > 0 && year === currentYear;
            const isFuture  = currentYear > 0 && year > currentYear;
            const isFirst   = i === 0;
            const isLast    = i === YEARS.length - 1;
            const xform     = isFirst ? "translateX(0)" : isLast ? "translateX(-100%)" : "translateX(-50%)";

            return (
              <Link
                key={year}
                href={`/timeline#year-${year}`}
                style={{
                  position: "absolute",
                  left: `${pct}%`,
                  top: 0,
                  transform: xform,
                  textDecoration: "none",
                }}
                title={`Jump to ${year}`}
              >
                <motion.div
                  style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 500, damping: 28 }}
                >
                  <div style={{
                    width: 5,
                    height: 5,
                    borderRadius: 2,
                    flexShrink: 0,
                    background: isFuture ? "var(--color-ink3)" : "var(--color-accent)",
                    opacity: isCurrent ? 1 : isFuture ? 0.25 : 0.5,
                  }} />
                  <span style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: 11,
                    fontWeight: isCurrent ? 600 : 400,
                    color: isCurrent
                      ? "var(--color-accent)"
                      : isFuture
                      ? "var(--color-ink3)"
                      : "var(--color-ink2)",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                  }}>
                    {year}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Track */}
        <div style={{
          position: "relative",
          height: 8,
          borderRadius: 999,
          background: "rgba(164,74,42,0.10)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
        }}>
          {/* Fill — gradient, width driven by animatedDays prop */}
          <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            borderRadius: 999,
            background: "linear-gradient(90deg, #a44a2a 0%, #c96b3f 100%)",
            width: `${reduced ? finalPct : fillPct}%`,
          }} />

          {/* Heart thumb — outer div positions, inner motion.div animates */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: `${reduced ? finalPct : fillPct}%`,
            transform: "translate(-50%, -50%)",
            width: 18,
            height: 18,
          }}>
            <motion.div
              animate={settled && !reduced ? {
                scale: [1, 1.28, 1, 1.14, 1],
                boxShadow: [
                  "0 0 0 2.5px var(--color-bg), 0 2px 8px rgba(164,74,42,0.28)",
                  "0 0 0 2.5px var(--color-bg), 0 0 14px 5px rgba(164,74,42,0.50)",
                  "0 0 0 2.5px var(--color-bg), 0 2px 8px rgba(164,74,42,0.28)",
                ],
              } : {
                scale: 1,
                boxShadow: "0 0 0 2.5px var(--color-bg), 0 2px 8px rgba(164,74,42,0.28)",
              }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 8,
                color: "rgba(255,255,255,0.92)",
              }}
            >
              ♥
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
