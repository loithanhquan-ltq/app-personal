"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { chapter } from "@/data";
import { MemoryWideCard } from "@/components/shared/MemoryWideCard";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { FadeIn } from "@/components/shared/FadeIn";

export default function TimelinePage() {
  const content = useAppStore((s) => s.content);
  const filterChapter = useAppStore((s) => s.filterChapter);
  const s = content.strings;
  const [currentYear, setCurrentYear] = useState(0);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const filtered = filterChapter
    ? content.memories.filter((m) => m.chapterId === filterChapter)
    : content.memories;

  const sorted = [...filtered].sort((a, b) => b.sortKey.localeCompare(a.sortKey));

  const byYear: Record<number, typeof sorted> = {};
  sorted.forEach((m) => {
    if (!byYear[m.year]) byYear[m.year] = [];
    byYear[m.year].push(m);
  });
  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a);

  const ch = filterChapter ? chapter(content, filterChapter) : null;
  const title = ch ? ch.label : s.timelineAllTitle;
  const subtitle = ch ? ch.span : s.timelineAllRange;

  return (
    <div className="page-root" style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 36px 80px" }}>
      <SectionHeader title={title} subtitle={subtitle} />
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--color-ink3)",
        marginBottom: 24,
      }}>
        {s.memoriesCount(filtered.length)}
      </div>

      {years.map((year) => (
        <div key={year} id={`year-${year}`}>
        <FadeIn style={{ marginBottom: 32 }}>
          {/* Year mark */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <span style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.12em",
              color: "var(--color-ink3)",
              textTransform: "uppercase",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              {s.yearLabel} {year}
              {currentYear === year && (
                <motion.span
                  animate={{ opacity: [1, 0.25, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ fontSize: 8, color: "var(--color-accent)", display: "inline-block" }}
                >●</motion.span>
              )}
            </span>
            <div style={{ flex: 1, height: 1, background: "var(--color-rule)" }} />
          </div>

          {/* Memories */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {byYear[year].map((m) => <MemoryWideCard key={m.id} memory={m} />)}
          </div>
        </FadeIn>
        </div>
      ))}
    </div>
  );
}
