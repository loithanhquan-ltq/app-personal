"use client";

import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { place } from "@/data";
import type { Memory } from "@/data";
import { PhotoSlot } from "./PhotoSlot";

const SPRING = { stiffness: 260, damping: 28 };

export function MemoryTile({ memory }: { memory: Memory }) {
  const content = useAppStore((s) => s.content);
  const pl = place(content, memory.placeId);
  const reduced = useReducedMotion();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), SPRING);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), SPRING);
  const cardScale = useSpring(1, SPRING);

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function onMouseEnter() { if (!reduced) cardScale.set(1.04); }
  function onMouseLeave() { mouseX.set(0); mouseY.set(0); cardScale.set(1); }

  return (
    <Link href={`/memory/${memory.id}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div style={{ perspective: 800 }}>
        <motion.div
          onMouseMove={onMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          whileTap={{ scale: 0.96 }}
          style={{
            rotateX: reduced ? 0 : rotateX,
            rotateY: reduced ? 0 : rotateY,
            scale: reduced ? undefined : cardScale,
            background: "var(--color-card)",
            borderRadius: 10,
            overflow: "hidden",
            border: "0.5px solid var(--color-rule)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
            transformStyle: "preserve-3d",
            cursor: "pointer",
          }}
        >
          <div style={{ height: 160, position: "relative", pointerEvents: "none" }}>
            <PhotoSlot slotId={`hero-${memory.id}`} height={160} borderRadius={0} width={300} />
            {(memory.photoCount ?? 0) > 1 && (
              <div style={{
                position: "absolute", top: 7, right: 7,
                background: "rgba(0,0,0,0.55)", borderRadius: 5, padding: "2px 6px",
                fontFamily: "var(--font-mono)", fontSize: 9, color: "#fff", fontWeight: 600,
                letterSpacing: "0.04em",
              }}>
                +{(memory.photoCount ?? 1) - 1}
              </div>
            )}
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
        </motion.div>
      </div>
    </Link>
  );
}
