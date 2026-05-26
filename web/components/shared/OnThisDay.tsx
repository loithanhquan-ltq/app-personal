"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { PhotoSlot } from "./PhotoSlot";
import type { Memory } from "@/data/types";

const MONTH_MAP: Record<string, string> = {
  January: "01", February: "02", March: "03", April: "04",
  May: "05", June: "06", July: "07", August: "08",
  September: "09", October: "10", November: "11", December: "12",
};

function extractMmdd(dateStr: string): string | null {
  const m = dateStr.match(/^(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}$/);
  if (!m) return null;
  const day = m[1].padStart(2, "0");
  const month = MONTH_MAP[m[2]];
  return `${month}-${day}`;
}

function todayMmdd(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function yearsAgo(dateStr: string): number {
  const m = dateStr.match(/\d{4}$/);
  if (!m) return 0;
  return new Date().getFullYear() - parseInt(m[0], 10);
}

function OnThisDayCard({ memory: m, yearsAgoLabel }: { memory: Memory; yearsAgoLabel: string }) {
  return (
    <Link href={`/memory/${m.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <motion.div
        whileHover={{ y: -2, boxShadow: "0 6px 20px rgba(0,0,0,0.12)" }}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
        style={{
          display: "flex",
          gap: 0,
          borderRadius: 12,
          overflow: "hidden",
          background: "var(--color-card)",
          border: "0.5px solid var(--color-rule)",
          cursor: "pointer",
        }}
      >
        <div style={{ width: 88, flexShrink: 0 }}>
          <PhotoSlot slotId={`hero-${m.id}`} height={88} borderRadius={0} width={88} />
        </div>
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 3 }}>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)", opacity: 0.85,
          }}>
            {yearsAgoLabel}
          </div>
          <div style={{
            fontFamily: "var(--font-serif)", fontSize: 15, fontStyle: "italic", fontWeight: 600,
            color: "var(--color-ink)", lineHeight: 1.2,
          }}>
            {m.title}
          </div>
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--color-ink3)",
          }}>
            {m.date}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function OnThisDay() {
  const content = useAppStore((s) => s.content);
  const s = content.strings;
  const today = todayMmdd();

  const matches = content.memories
    .filter((m) => {
      const mmdd = extractMmdd(m.date);
      return mmdd === today;
    })
    .slice(0, 3);

  if (matches.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      style={{ marginBottom: 36 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 9, fontWeight: 600,
          letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)",
        }}>
          ♡ {s.onThisDayLabel}
        </span>
        <div style={{ flex: 1, height: "0.5px", background: "var(--color-rule)" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {matches.map((m) => (
          <OnThisDayCard key={m.id} memory={m} yearsAgoLabel={s.onThisDayYearsAgo(yearsAgo(m.date))} />
        ))}
      </div>
    </motion.div>
  );
}
