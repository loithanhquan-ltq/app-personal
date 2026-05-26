"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Lightbox } from "./Lightbox";
import type { Memory } from "@/data/types";

interface Props {
  memory: Memory;
}

export function MemoryGallery({ memory }: Props) {
  const photos = useAppStore((s) => s.photos);
  const reduced = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [dragStartX, setDragStartX] = useState<number | null>(null);

  const count = memory.photoCount ?? 1;
  if (count <= 1) return null;

  const slotIds = [
    `hero-${memory.id}`,
    ...Array.from({ length: count - 1 }, (_, i) => `gallery-${memory.id}-${i + 1}`),
  ];

  const loadedSlots = slotIds.filter((id) => photos[id]);
  if (loadedSlots.length <= 1) return null;

  const activeSlotId = loadedSlots[activeIdx] ?? loadedSlots[0];
  const activeUrl = photos[activeSlotId] ?? "";
  const urls = loadedSlots.map((id) => photos[id]).filter(Boolean) as string[];

  function prev() { setActiveIdx((i) => Math.max(0, i - 1)); }
  function next() { setActiveIdx((i) => Math.min(loadedSlots.length - 1, i + 1)); }

  function onPointerDown(e: React.PointerEvent) { setDragStartX(e.clientX); }
  function onPointerUp(e: React.PointerEvent) {
    if (dragStartX === null) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    setDragStartX(null);
  }

  return (
    <div style={{ marginTop: 20, marginBottom: 8 }}>
      {/* Main slide */}
      <div
        style={{ position: "relative", borderRadius: 12, overflow: "hidden", height: 340, cursor: "zoom-in", userSelect: "none" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onClick={() => setLightboxOpen(true)}
      >
        <motion.div
          key={activeIdx}
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22 }}
          style={{ width: "100%", height: "100%" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            draggable={false}
          />
        </motion.div>

        {/* Arrows */}
        {activeIdx > 0 && (
          <button onClick={(e) => { e.stopPropagation(); prev(); }} style={arrowBtn("left")} aria-label="Previous">‹</button>
        )}
        {activeIdx < loadedSlots.length - 1 && (
          <button onClick={(e) => { e.stopPropagation(); next(); }} style={arrowBtn("right")} aria-label="Next">›</button>
        )}

        {/* Counter badge */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(0,0,0,0.48)", borderRadius: 6, padding: "2px 8px",
          fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.85)",
          pointerEvents: "none",
        }}>
          {activeIdx + 1} / {loadedSlots.length}
        </div>
      </div>

      {/* Thumbnail strip */}
      <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto", paddingBottom: 2 }}>
        {loadedSlots.map((slotId, i) => (
          <button
            key={slotId}
            onClick={() => setActiveIdx(i)}
            style={{
              flexShrink: 0, width: 56, height: 56, borderRadius: 6, overflow: "hidden",
              border: i === activeIdx ? "2px solid var(--color-accent)" : "2px solid transparent",
              padding: 0, cursor: "pointer", transition: "border-color 0.12s",
            }}
            aria-label={`Photo ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[slotId]}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              draggable={false}
            />
          </button>
        ))}
      </div>

      {lightboxOpen && urls.length > 0 && (
        <Lightbox
          urls={urls}
          index={activeIdx}
          onClose={() => setLightboxOpen(false)}
          onPrev={prev}
          onNext={next}
        />
      )}
    </div>
  );
}

function arrowBtn(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    [side]: 10,
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.42)",
    backdropFilter: "blur(4px)",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 24,
    cursor: "pointer",
    minWidth: 44,
    minHeight: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
    padding: "0 8px",
  };
}
