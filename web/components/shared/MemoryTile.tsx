"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { place, chapter } from "@/data";
import type { Memory } from "@/data";
import { PhotoSlot } from "./PhotoSlot";

export function MemoryTile({ memory }: { memory: Memory }) {
  const [hovered, setHovered] = useState(false);
  const content = useAppStore((s) => s.content);
  const pl = place(content, memory.placeId);
  const ch = chapter(content, memory.chapterId);

  return (
    <Link
      href={`/memory/${memory.id}`}
      style={{ textDecoration: "none", color: "inherit" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: "var(--color-card)",
        borderRadius: 10,
        overflow: "hidden",
        border: "0.5px solid var(--color-rule)",
        boxShadow: hovered ? "0 5px 15px -3px rgba(0,0,0,0.10)" : "0 1px 3px rgba(0,0,0,0.05)",
        transform: hovered ? "scale(1.018)" : "scale(1)",
        transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out",
      }}>
        <div style={{ height: 120, position: "relative", pointerEvents: "none" }}>
          <PhotoSlot slotId={`hero-${memory.id}`} height={120} borderRadius={0} width={300} />
        </div>
        <div style={{ padding: "10px 12px 12px" }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 500,
            color: "var(--color-ink3)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}>
            {memory.date}
          </div>
          <div style={{
            fontFamily: "var(--font-serif)",
            fontSize: 15,
            fontWeight: 600,
            color: "var(--color-ink)",
            lineHeight: 1.3,
            marginBottom: 4,
          }}>
            {memory.title}
          </div>
          {pl && (
            <div style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              color: "var(--color-ink3)",
            }}>
              {pl.label}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
