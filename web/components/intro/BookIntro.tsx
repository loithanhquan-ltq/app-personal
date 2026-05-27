"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { CSSBookFlip } from "./CSSBookFlip";

const FLIP_MS = 500;
const HOLD_MS = 200;
const FADE_OUT_MS = 500;
const PHOTO_WAIT_MAX_MS = 800;  // wait up to 0.8s for photos; show placeholders for the rest
const REDUCED_FLIP_MS = 200;

interface Page {
  id: string;
  title: string;
  date: string;
  photoUrl?: string;
}

type Phase = "waiting" | "playing" | "closing" | "fading" | "done";

export function BookIntro() {
  const content = useAppStore((s) => s.content);
  const photos = useAppStore((s) => s.photos);
  const dismissIntro = useAppStore((s) => s.dismissIntro);
  const reduced = useReducedMotion();

  // Include ALL memories — photoUrl may be undefined; placeholder texture shown when missing
  const pages = useMemo(() => {
    return [...content.memories]
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .map((m) => ({
        id: m.id,
        title: m.title,
        date: m.date,
        photoUrl: photos[`hero-${m.id}`],
      }));
  }, [content.memories, photos]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [phase, setPhase] = useState<Phase>("waiting");
  const [currentIdx, setCurrentIdx] = useState(0);
  const snapshotRef = useRef<Page[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep refs fresh so interval callbacks don't close over stale values
  const pagesRef = useRef(pages);
  pagesRef.current = pages;
  const dismissRef = useRef(dismissIntro);
  dismissRef.current = dismissIntro;

  const skip = useCallback(() => {
    setPhase((p) => (p === "done" ? "done" : "fading"));
  }, []);

  // Escape key skips the intro
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") skip(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  // Waiting phase: snapshot pages after PHOTO_WAIT_MAX_MS and start playing
  useEffect(() => {
    if (phase !== "waiting") return;
    const t = setTimeout(() => {
      const p = pagesRef.current;
      if (p.length === 0) { dismissRef.current(); return; }
      snapshotRef.current = [...p];
      setPhase("playing");
    }, PHOTO_WAIT_MAX_MS);
    return () => clearTimeout(t);
  }, [phase]);

  // v1 CSS playing phase (only when reduced motion)
  useEffect(() => {
    if (phase !== "playing" || !reduced) return;
    const tickMs = REDUCED_FLIP_MS + 100;
    intervalRef.current = setInterval(() => {
      setCurrentIdx((prev) => {
        const next = prev + 1;
        if (next >= snapshotRef.current.length) {
          clearInterval(intervalRef.current!);
          setPhase("fading");
          return prev;
        }
        return next;
      });
    }, tickMs);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, reduced]);

  // v1 CSS playing phase (non-reduced, no WebGL — fallback if dynamic fails)
  useEffect(() => {
    if (phase !== "playing" || reduced) return;
    // WebGL scene drives its own timing via useFrame. Nothing to do here.
  }, [phase, reduced]);

  // Fading phase: wait then dismiss
  useEffect(() => {
    if (phase !== "fading") return;
    const t = setTimeout(() => { dismissIntro(); }, FADE_OUT_MS);
    return () => clearTimeout(t);
  }, [phase, dismissIntro]);

  if (phase === "done") return null;

  const displayPages = snapshotRef.current.length > 0 ? snapshotRef.current : pages;

  return (
    <motion.div
      role="dialog"
      aria-label="Opening our album"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fading" ? 0 : 1 }}
      transition={{ duration: FADE_OUT_MS / 1000 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        background: "#1a1108",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}
    >
      {/* Loading state */}
      {displayPages.length === 0 && (
        <>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
            Our album
          </div>
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Loading…</div>
        </>
      )}

      {/* Reduced-motion fallback — card crossfade with its own label/dots/skip */}
      {mounted && displayPages.length > 0 && reduced && (
        <>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)" }}>
            Our album
          </div>
          <div style={{ position: "relative", width: "min(78vw, 380px)", height: "min(60vh, 500px)" }}>
            {displayPages.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: i === currentIdx ? 1 : 0 }}
                transition={{ duration: REDUCED_FLIP_MS / 1000 }}
                style={{ position: "absolute", inset: 0 }}
              >
                <PageFront page={p} />
              </motion.div>
            ))}
          </div>
          <PageDots total={displayPages.length} current={currentIdx} />
          <button
            onClick={skip}
            style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.28)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", padding: "8px 20px", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}
            aria-label="Skip intro"
          >
            Skip · Esc
          </button>
        </>
      )}

      {/* Full-screen cinematic slideshow — owns its own label, dots, and skip */}
      {mounted && displayPages.length > 0 && !reduced && (
        <CSSBookFlip
          pages={displayPages}
          currentIdx={currentIdx}
          phase={phase}
          onAdvance={() => setCurrentIdx((i) => i + 1)}
          onFinishedFlipping={() => setPhase("closing")}
          onClosed={() => setPhase("fading")}
          onSkip={skip}
        />
      )}
    </motion.div>
  );
}

// --- v1 CSS helpers (kept for reduced-motion fallback) ---

function PageFront({ page }: { page: Page }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--color-paper-cream1)",
        borderRadius: 4,
        boxShadow: "0 18px 40px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ height: "72%", overflow: "hidden", borderRadius: "4px 4px 0 0" }}>
        {page.photoUrl ? (
          <img src={page.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(160deg, #e8d8c0 0%, #cebfa0 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 64, color: "rgba(164,74,42,0.2)",
          }}>♡</div>
        )}
      </div>
      <div style={{ padding: "14px 18px 18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 6 }}>
          {page.date}
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600, fontStyle: "italic", color: "var(--color-ink)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
          {page.title}
        </div>
      </div>
    </div>
  );
}

function PageDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: "flex", gap: 5, opacity: 0.65, flexWrap: "wrap", justifyContent: "center", maxWidth: "min(86vw, 560px)" }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 8 : 5,
            height: 5,
            borderRadius: 999,
            background: i <= current ? "var(--color-accent)" : "rgba(255,255,255,0.25)",
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
}
