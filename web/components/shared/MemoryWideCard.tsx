"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { place, chapter } from "@/data";
import type { Memory } from "@/data";
import { PhotoSlot } from "./PhotoSlot";
import { ChipView } from "./ChipView";

export function MemoryWideCard({ memory }: { memory: Memory }) {
  const content = useAppStore((s) => s.content);
  const pl = place(content, memory.placeId);
  const ch = chapter(content, memory.chapterId);

  return (
    <Link href={`/memory/${memory.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <motion.div
        whileHover={{ y: -2, backgroundColor: "var(--color-card)", boxShadow: "0 5px 18px -3px rgba(0,0,0,0.10)" }}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
        style={{
          display: "flex",
          gap: 20,
          padding: "16px 20px",
          borderRadius: 10,
          border: "0.5px solid var(--color-rule)",
          alignItems: "flex-start",
        }}>
        {/* Photo */}
        <div style={{ width: 140, height: 100, flexShrink: 0, borderRadius: 8, overflow: "hidden", pointerEvents: "none" }}>
          <PhotoSlot slotId={`hero-${memory.id}`} height={100} borderRadius={8} width={140} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            fontWeight: 500,
            color: "var(--color-ink3)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginBottom: 6,
          }}>
            {memory.date}
            {memory.favorite && <span style={{ marginLeft: 6, color: "var(--color-accent)" }}>★</span>}
          </div>
          <h3 style={{
            fontFamily: "var(--font-serif)",
            fontSize: 22,
            fontWeight: 500,
            fontStyle: "italic",
            color: "var(--color-ink)",
            margin: "0 0 6px",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}>
            {memory.title}
          </h3>
          <p style={{
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            color: "var(--color-ink2)",
            margin: "0 0 10px",
            lineHeight: 1.55,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {memory.body}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center" }}>
            {ch && <ChipView label={ch.label} accent />}
            {memory.tags.map((t) => <ChipView key={t} label={t} small />)}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
