"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

const FILL_TARGET  = 98.97;
const TOTAL_DAYS   = 1461;
const YEARS        = [2022, 2023, 2024, 2025, 2026];
const CURR_YEAR    = 2026;

function useAnimatedFill(target: number, duration = 1400) {
  const [fill, setFill] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    function step(now: number) {
      const p = Math.min((now - start) / duration, 1);
      setFill((1 - Math.pow(1 - p, 3)) * target);
      if (p < 1) raf.current = requestAnimationFrame(step);
    }
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return fill;
}

function SectionLabel({ letter, title, desc }: { letter: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.14em",
          color: "var(--color-accent)", textTransform: "uppercase", flexShrink: 0,
        }}>{letter}</span>
        <span style={{
          fontFamily: "var(--font-serif)", fontSize: 20, fontStyle: "italic",
          fontWeight: 600, color: "var(--color-ink)", letterSpacing: "-0.01em",
        }}>{title}</span>
      </div>
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: 12, color: "var(--color-ink3)",
        margin: 0, lineHeight: 1.5,
      }}>{desc}</p>
    </div>
  );
}

function Badge({ fillPct, animatedDays }: { fillPct: number; animatedDays: number }) {
  if (animatedDays <= 0) return null;
  return (
    <div style={{
      position: "absolute",
      bottom: "calc(100% + 8px)",
      left: `${Math.max(8, Math.min(92, fillPct))}%`,
      transform: "translateX(-50%)",
      whiteSpace: "nowrap",
      background: "rgba(164,74,42,0.07)",
      border: "0.5px solid rgba(164,74,42,0.2)",
      borderRadius: 20,
      padding: "2px 9px",
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      color: "var(--color-accent)",
      letterSpacing: "0.05em",
      pointerEvents: "none",
    }}>
      Day {animatedDays.toLocaleString()}
    </div>
  );
}

function Bookends() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em",
        color: "var(--color-accent)", opacity: 0.6,
      }}>Jun 9, 2022</span>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em",
        color: "var(--color-ink3)", opacity: 0.4,
      }}>Jun 9, 2026</span>
    </div>
  );
}

// ─── A: Delicate Thread ───────────────────────────────────────────────────────
function VariantA({ fillPct, settled, animatedDays }: { fillPct: number; settled: boolean; animatedDays: number }) {
  return (
    <div style={{ padding: "0 2px" }}>
      {/* Badge + track wrapper */}
      <div style={{ position: "relative", paddingTop: 28 }}>
        <Badge fillPct={fillPct} animatedDays={animatedDays} />

        {/* Track */}
        <div style={{ position: "relative", height: 3 }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: 999,
            background: "repeating-linear-gradient(90deg, rgba(164,74,42,0.15) 0, rgba(164,74,42,0.15) 4px, transparent 4px, transparent 11px)",
          }} />
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 999,
            background: "linear-gradient(90deg, #a44a2a, #c96b3f)",
            width: `${fillPct}%`,
          }} />
          <div style={{
            position: "absolute", top: "50%", left: `${fillPct}%`,
            transform: "translate(-50%, -50%)", lineHeight: 1,
          }}>
            <motion.span
              animate={settled ? { scale: [1, 1.2, 1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              style={{
                fontSize: 26, color: "var(--color-accent)", display: "block",
                filter: "drop-shadow(0 2px 8px rgba(164,74,42,0.45))",
              }}
            >♥</motion.span>
          </div>
        </div>

        <Bookends />
      </div>

      {/* Year labels */}
      <div style={{ position: "relative", height: 16, marginTop: 10 }}>
        {YEARS.map((year, i) => {
          const pct   = (i / 4) * 100;
          const xform = i === 0 ? "translateX(0)" : i === 4 ? "translateX(-100%)" : "translateX(-50%)";
          const past  = year < CURR_YEAR;
          const curr  = year === CURR_YEAR;
          return (
            <span key={year} style={{
              position: "absolute", left: `${pct}%`, transform: xform,
              fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 11,
              fontWeight: curr ? 600 : 400, whiteSpace: "nowrap",
              color: curr ? "var(--color-accent)" : past ? "var(--color-ink2)" : "var(--color-ink3)",
              opacity: !past && !curr ? 0.35 : 1,
            }}>{year}</span>
          );
        })}
      </div>
    </div>
  );
}

// ─── B: Film Strip ────────────────────────────────────────────────────────────
function VariantB({ fillPct, settled, animatedDays }: { fillPct: number; settled: boolean; animatedDays: number }) {
  return (
    <div style={{ padding: "0 2px" }}>
      {/* Badge + track wrapper */}
      <div style={{ position: "relative", paddingTop: 28 }}>
        <Badge fillPct={fillPct} animatedDays={animatedDays} />

        {/* Track */}
        <div style={{ position: "relative", height: 4 }}>
          <div style={{
            position: "absolute",
            left: `${fillPct}%`, top: 0, right: 0, bottom: 0,
            background: "repeating-linear-gradient(90deg, rgba(164,74,42,0.22) 0, rgba(164,74,42,0.22) 3px, transparent 3px, transparent 10px)",
          }} />
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            borderRadius: "2px 0 0 2px",
            background: "linear-gradient(90deg, #a44a2a, #c96b3f)",
            width: `${fillPct}%`,
          }} />
          <div style={{
            position: "absolute", top: "50%", left: `${fillPct}%`,
            transform: "translate(-50%, -50%)",
          }}>
            <motion.span
              animate={settled ? {
                scale:  [1, 1.22, 1],
                filter: [
                  "drop-shadow(0 0 0px rgba(164,74,42,0))",
                  "drop-shadow(0 0 9px rgba(164,74,42,0.65))",
                  "drop-shadow(0 0 0px rgba(164,74,42,0))",
                ],
              } : { scale: 1 }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              style={{ fontSize: 20, color: "var(--color-accent)", display: "block", lineHeight: 1 }}
            >♥</motion.span>
          </div>
        </div>

        <Bookends />
      </div>

      {/* Tick marks + mono labels */}
      <div style={{ position: "relative", height: 26, marginTop: 6 }}>
        {YEARS.map((year, i) => {
          const pct    = (i / 4) * 100;
          const future = year > CURR_YEAR;
          const curr   = year === CURR_YEAR;
          const align  = i === 0 ? "flex-start" : i === 4 ? "flex-end" : "center";
          const xform  = i === 0 ? "translateX(0)" : i === 4 ? "translateX(-100%)" : "translateX(-50%)";
          return (
            <div key={year} style={{
              position: "absolute", left: `${pct}%`, top: 0, transform: xform,
              display: "flex", flexDirection: "column", alignItems: align, gap: 3,
            }}>
              <div style={{
                width: 1, height: 8,
                background: future ? "rgba(164,74,42,0.18)" : "rgba(164,74,42,0.4)",
              }} />
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: "0.06em",
                whiteSpace: "nowrap",
                color: curr ? "var(--color-accent)" : future ? "var(--color-ink3)" : "var(--color-ink2)",
                fontWeight: curr ? 600 : 400, opacity: future ? 0.38 : 1,
              }}>{year}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── C: Ribbon (SVG wave) ─────────────────────────────────────────────────────
function VariantC({ fillPct, settled, animatedDays }: { fillPct: number; settled: boolean; animatedDays: number }) {
  const W        = 600;
  const H        = 34;
  const mid      = H / 2;
  const wavePath = `M 0,${mid} Q 150,${mid - 7} 300,${mid} Q 450,${mid + 7} ${W},${mid}`;
  const fillX    = (fillPct / 100) * W;

  return (
    <div style={{ padding: "0 2px" }}>
      {/* Badge + track wrapper */}
      <div style={{ position: "relative", paddingTop: 28 }}>
        <Badge fillPct={fillPct} animatedDays={animatedDays} />

        {/* SVG ribbon */}
        <div style={{ position: "relative" }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: "100%", height: H, overflow: "visible", display: "block" }}
          >
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#a44a2a" />
                <stop offset="100%" stopColor="#c96b3f" />
              </linearGradient>
              <clipPath id="cp-past">
                <rect x={0} y={0} width={fillX} height={H} />
              </clipPath>
              <clipPath id="cp-future">
                <rect x={fillX} y={0} width={W - fillX} height={H} />
              </clipPath>
            </defs>
            <path d={wavePath} stroke="rgba(164,74,42,0.2)" strokeWidth="2"
              fill="none" strokeDasharray="5 9" clipPath="url(#cp-future)" />
            <path d={wavePath} stroke="url(#rg)" strokeWidth="3"
              fill="none" strokeLinecap="round" clipPath="url(#cp-past)" />
          </svg>
          <div style={{
            position: "absolute", top: "50%", left: `${fillPct}%`,
            transform: "translate(-50%, -50%)",
          }}>
            <motion.span
              animate={settled ? { scale: [1, 1.2, 1, 1.1, 1] } : { scale: 1 }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              style={{
                fontSize: 22, color: "var(--color-accent)", display: "block", lineHeight: 1,
                filter: "drop-shadow(0 2px 7px rgba(164,74,42,0.42))",
              }}
            >♥</motion.span>
          </div>
        </div>

        <Bookends />
      </div>

      {/* Year labels */}
      <div style={{ position: "relative", height: 16, marginTop: 10 }}>
        {YEARS.map((year, i) => {
          const pct    = (i / 4) * 100;
          const xform  = i === 0 ? "translateX(0)" : i === 4 ? "translateX(-100%)" : "translateX(-50%)";
          const future = year > CURR_YEAR;
          const curr   = year === CURR_YEAR;
          return (
            <span key={year} style={{
              position: "absolute", left: `${pct}%`, transform: xform,
              fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 11,
              fontWeight: curr ? 600 : 400, whiteSpace: "nowrap",
              color: curr ? "var(--color-accent)" : future ? "var(--color-ink3)" : "var(--color-ink2)",
              opacity: future ? 0.35 : 1,
            }}>{year}</span>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const fillPct     = useAnimatedFill(FILL_TARGET);
  const settled     = fillPct >= FILL_TARGET * 0.99;
  const animatedDays = Math.round((fillPct / 100) * TOTAL_DAYS);

  return (
    <div className="page-root" style={{ maxWidth: 680, margin: "0 auto", padding: "48px 40px 100px" }}>
      <div style={{
        fontFamily: "var(--font-hand)", fontSize: 20, color: "var(--color-accent)",
        opacity: 0.7, marginBottom: 8, transform: "rotate(-0.5deg)",
      }}>
        pick one ♡
      </div>
      <h1 style={{
        fontFamily: "var(--font-serif)", fontSize: 28, fontStyle: "italic",
        fontWeight: 600, color: "var(--color-ink)", margin: "0 0 52px",
        letterSpacing: "-0.02em",
      }}>
        Journey slider — three directions
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>
        <section>
          <SectionLabel letter="A" title="Delicate Thread"
            desc="No border or card. 3px track, bare ♥ riding the line — quiet, precious, minimal." />
          <VariantA fillPct={fillPct} settled={settled} animatedDays={animatedDays} />
        </section>

        <section>
          <SectionLabel letter="B" title="Film Strip"
            desc="Solid past, dotted future, tick marks at each year — cinematic and textured." />
          <VariantB fillPct={fillPct} settled={settled} animatedDays={animatedDays} />
        </section>

        <section>
          <SectionLabel letter="C" title="Ribbon"
            desc="Wavy SVG path — handcrafted, flowing, like a thread stitching moments together." />
          <VariantC fillPct={fillPct} settled={settled} animatedDays={animatedDays} />
        </section>
      </div>
    </div>
  );
}
