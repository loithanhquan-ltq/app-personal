"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Page {
  id: string;
  title: string;
  date: string;
  photoUrl?: string;
}

interface CSSBookFlipProps {
  pages: Page[];
  currentIdx: number;
  phase: string;
  onAdvance: () => void;
  onFinishedFlipping: () => void;
  onClosed: () => void;
  onSkip: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FADE_MS  = 700;    // crossfade between photos
const HOLD_MS  = 1100;   // viewing time after fade-in completes
const CLOSE_MS = 400;    // brief pause in "closing" before BookIntro fades overlay

// ─── Main component ───────────────────────────────────────────────────────────

export function CSSBookFlip({
  pages, phase, currentIdx,
  onAdvance, onFinishedFlipping, onClosed, onSkip,
}: CSSBookFlipProps) {
  const [flipIdx, setFlipIdx] = useState(0);

  const onAdvanceRef   = useRef(onAdvance);
  const onFinishedRef  = useRef(onFinishedFlipping);
  const onClosedRef    = useRef(onClosed);
  useEffect(() => { onAdvanceRef.current  = onAdvance; },          [onAdvance]);
  useEffect(() => { onFinishedRef.current = onFinishedFlipping; }, [onFinishedFlipping]);
  useEffect(() => { onClosedRef.current   = onClosed; },           [onClosed]);

  // ── Playing phase: wait (fade-in + hold) then advance ─────────────────────
  useEffect(() => {
    if (phase !== "playing" || pages.length === 0) return;
    let cancelled = false;

    const run = async () => {
      let idx = 0;

      while (idx < pages.length && !cancelled) {
        // Let the current photo fade in fully, then hold
        await new Promise<void>(r => setTimeout(r, FADE_MS + HOLD_MS));
        if (cancelled) return;

        idx++;
        if (idx >= pages.length) {
          onFinishedRef.current();
          return;
        }

        setFlipIdx(idx);
        onAdvanceRef.current();
      }
    };

    run();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pages.length]);

  // ── Closing phase: brief hold, then hand off to BookIntro for the fade ────
  useEffect(() => {
    if (phase !== "closing") return;
    const t = setTimeout(() => onClosedRef.current(), CLOSE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  const page = pages[Math.min(flipIdx, pages.length - 1)] ?? null;

  // Alternate Ken Burns direction for visual variety
  const zoomsIn = flipIdx % 2 === 0;

  return (
    <div style={{ position: "absolute", inset: 0 }} aria-hidden="true">

      {/* ── Full-screen photos — crossfade via AnimatePresence ── */}
      <AnimatePresence mode="sync">
        {page && (
          <motion.div
            key={flipIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_MS / 1000, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            {page.photoUrl ? (
              <motion.img
                src={page.photoUrl}
                alt=""
                initial={{ scale: zoomsIn ? 1.0  : 1.09 }}
                animate={{ scale: zoomsIn ? 1.07 : 1.0  }}
                transition={{ duration: 4.5, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            ) : (
              // Placeholder when no photo
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(160deg, #2e1d0f 0%, #1a1108 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 140,
                color: "rgba(164,74,42,0.1)",
              }}>
                ♡
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cinematic gradient overlays (always on top of photo) ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: [
            // Top: darkens so "Our album" label is always legible
            "linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.15) 18%, transparent 38%)",
            // Bottom: darkens for text legibility
            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.5) 22%, rgba(0,0,0,0.1) 45%, transparent 60%)",
            // Vignette: draws the eye to the center
            "radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,0.45) 100%)",
          ].join(", "),
          pointerEvents: "none",
          zIndex: 10,
        }}
      />

      {/* ── "Our album" label — top center ── */}
      <div
        style={{
          position: "absolute",
          top: 28,
          left: 0, right: 0,
          zIndex: 20,
          textAlign: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        Our album
      </div>

      {/* ── Bottom: metadata + navigation ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          zIndex: 20,
          padding: "0 clamp(20px, 5vw, 48px) clamp(24px, 5vh, 44px)",
        }}
      >
        {/* Memory text — animates per page */}
        <AnimatePresence mode="wait">
          {page && (
            <motion.div
              key={flipIdx}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              style={{ marginBottom: 20 }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 500,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 9,
                }}
              >
                {page.date}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(22px, 3.8vw, 40px)",
                  fontWeight: 600,
                  fontStyle: "italic",
                  color: "rgba(255,255,255,0.92)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.2,
                  textShadow: "0 2px 24px rgba(0,0,0,0.45)",
                  maxWidth: "min(65vw, 600px)",
                }}
              >
                {page.title}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress dots + skip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <CinematicDots total={pages.length} current={flipIdx} />

          <button
            onClick={onSkip}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.28)",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
              padding: "8px 0",
              flexShrink: 0,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
          >
            Skip · Esc
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cinematic progress dots ──────────────────────────────────────────────────

function CinematicDots({ total, current }: { total: number; current: number }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 5,
        flexWrap: "wrap",
        maxWidth: "70vw",
        opacity: 0.8,
      }}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 10 : 5,
            height: 4,
            borderRadius: 999,
            background: i <= current
              ? "rgba(255,255,255,0.85)"
              : "rgba(255,255,255,0.22)",
            transition: "all 0.35s ease",
          }}
        />
      ))}
    </div>
  );
}
