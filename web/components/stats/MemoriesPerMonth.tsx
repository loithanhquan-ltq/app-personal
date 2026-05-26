"use client";

import type { Memory } from "@/data/types";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

interface Props {
  memories: Memory[];
  label: string;
}

export function MemoriesPerMonth({ memories, label }: Props) {
  const counts = Array(12).fill(0);
  memories.forEach((m) => {
    const match = m.sortKey.match(/-(\d{2})-/);
    if (match) counts[parseInt(match[1], 10) - 1]++;
  });

  const max = Math.max(...counts, 1);
  const BAR_H = 100;

  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 16 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
        {counts.map((c, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{
              fontFamily: "var(--font-mono)", fontSize: 9, color: c > 0 ? "var(--color-accent)" : "var(--color-ink3)",
              minHeight: 14, display: "flex", alignItems: "flex-end",
            }}>
              {c > 0 ? c : ""}
            </div>
            <div style={{
              width: "100%",
              height: Math.max(4, (c / max) * BAR_H),
              borderRadius: "3px 3px 0 0",
              background: c > 0
                ? `hsl(18, 55%, ${70 - (c / max) * 28}%)`
                : "var(--color-rule)",
              transition: "height 0.4s ease",
            }} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "var(--color-ink3)", textTransform: "uppercase" }}>
              {MONTHS[i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
