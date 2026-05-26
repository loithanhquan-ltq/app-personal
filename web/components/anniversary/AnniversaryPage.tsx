"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, animate } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { memoriesByChapter } from "@/data";
import { daysSinceStart } from "@/lib/dateUtils";
import { MemoryTile } from "@/components/shared/MemoryTile";
import { FadeIn } from "@/components/shared/FadeIn";
import type { Memory, Chapter } from "@/data";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--color-ink3)",
      marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "var(--font-serif)",
      fontSize: "clamp(28px, 5vw, 40px)",
      fontStyle: "italic",
      fontWeight: 600,
      color: "var(--color-ink)",
      margin: "0 0 32px",
      letterSpacing: "-0.02em",
      lineHeight: 1.1,
    }}>
      {children}
    </h2>
  );
}

function ChapterBlock({ chapter, memories }: { chapter: Chapter; memories: Memory[] }) {
  const shown = memories.slice(0, 2);
  return (
    <div style={{ marginBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <span style={{
          width: 10, height: 10, borderRadius: 3, flexShrink: 0,
          background: `hsl(${chapter.hue}, 45%, 55%)`,
        }} />
        <span style={{
          fontFamily: "var(--font-serif)",
          fontSize: 18,
          fontStyle: "italic",
          fontWeight: 600,
          color: "var(--color-ink)",
          letterSpacing: "-0.01em",
        }}>
          {chapter.label}
        </span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          color: "var(--color-ink3)",
          letterSpacing: "0.06em",
          marginLeft: 4,
        }}>
          {chapter.span}
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
        {shown.map((m) => (
          <MemoryTile key={m.id} memory={m} />
        ))}
      </div>
    </div>
  );
}

function PhotoMomentCard({ memory, photoUrl }: { memory: Memory; photoUrl?: string }) {
  return (
    <Link href={`/memory/${memory.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
      <motion.div
        whileTap={{ scale: 0.96 }}
        style={{
          width: 200,
          height: 280,
          borderRadius: 12,
          overflow: "hidden",
          position: "relative",
          cursor: "pointer",
          scrollSnapAlign: "start",
          background: "var(--color-wood-dark)",
        }}
      >
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={memory.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: `hsl(${Math.abs(memory.title.charCodeAt(0) * 7) % 360}, 25%, 78%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontFamily: "var(--font-hand)", fontSize: 18, color: "rgba(0,0,0,0.3)", textAlign: "center", padding: "0 16px" }}>
              {memory.title}
            </span>
          </div>
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 50%)",
        }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 14px" }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "rgba(255,255,255,0.65)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 3,
          }}>
            {memory.date}
          </div>
          <div style={{
            fontFamily: "var(--font-serif)",
            fontSize: 14,
            fontStyle: "italic",
            fontWeight: 600,
            color: "#fff",
            lineHeight: 1.3,
          }}>
            {memory.title}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function StatNumber({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ textAlign: "center", flex: 1, padding: "16px 8px" }}>
      <div style={{
        fontFamily: "var(--font-serif)",
        fontSize: "clamp(36px, 8vw, 56px)",
        fontStyle: "italic",
        fontWeight: 600,
        color: "var(--color-accent)",
        letterSpacing: "-0.03em",
        lineHeight: 1,
        marginBottom: 6,
      }}>
        {value.toLocaleString()}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--color-ink3)",
      }}>
        {label}
      </div>
    </div>
  );
}

export function AnniversaryPage() {
  const content = useAppStore((s) => s.content);
  const photos = useAppStore((s) => s.photos);
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const dayCount = daysSinceStart();
  const heroPhoto = photos["hero-m01"];
  const hasPhoto = Boolean(heroPhoto);

  useEffect(() => {
    if (reduced) { setCount(dayCount); return; }
    const controls = animate(0, dayCount, {
      duration: 2.5,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setCount(Math.floor(v)),
    });
    return () => controls.stop();
  }, [dayCount, reduced]);

  const favorites = content.memories.filter((m) => m.favorite);
  const featuredMoments = favorites.length >= 4
    ? favorites
    : [...content.memories].filter((m) => m.photoCount !== undefined && m.photoCount > 0).slice(0, 8);

  const letter = content.letters.find((l) => l.id === "l06");
  const uniquePlaces = new Set(content.memories.map((m) => m.placeId)).size;

  const PAD = "clamp(20px, 5vw, 48px)";

  return (
    <div style={{ background: "var(--color-bg)" }}>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section style={{
        position: "relative",
        minHeight: "calc(100dvh - var(--topbar-h))",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: hasPhoto ? "#1a1108" : "var(--color-bg)",
      }}>
        {hasPhoto && (
          <motion.img
            src={heroPhoto}
            alt=""
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover",
              opacity: 0.65,
            }}
          />
        )}
        <div style={{
          position: "absolute", inset: 0,
          background: hasPhoto
            ? "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0.72) 100%)"
            : "linear-gradient(to bottom, transparent 0%, rgba(164,74,42,0.04) 100%)",
        }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{
            position: "relative",
            zIndex: 1,
            textAlign: "center",
            padding: "0 24px",
            maxWidth: 520,
          }}
        >
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: hasPhoto ? "rgba(255,255,255,0.65)" : "var(--color-ink3)",
            marginBottom: 16,
          }}>
            Together since June 9, 2022
          </div>

          <div style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(72px, 22vw, 108px)",
            fontStyle: "italic",
            fontWeight: 600,
            color: hasPhoto ? "#fff" : "var(--color-ink)",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            marginBottom: 8,
          }}>
            {count.toLocaleString()}
          </div>

          <div style={{
            fontFamily: "var(--font-serif)",
            fontSize: 20,
            fontStyle: "italic",
            color: hasPhoto ? "rgba(255,255,255,0.6)" : "var(--color-ink2)",
            marginBottom: 28,
          }}>
            days
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            style={{
              fontFamily: "var(--font-hand)",
              fontSize: 26,
              color: hasPhoto ? "rgba(255,255,255,0.85)" : "var(--color-accent)",
              letterSpacing: "0.01em",
            }}
          >
            Us ♡
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1,
          }}
        >
          <motion.div
            animate={reduced ? {} : { y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 16,
              color: hasPhoto ? "rgba(255,255,255,0.4)" : "var(--color-ink3)",
              lineHeight: 1,
            }}
          >
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* ── OUR STORY ──────────────────────────────────────── */}
      <section style={{ padding: `72px ${PAD} 48px`, maxWidth: 860, margin: "0 auto" }}>
        <FadeIn>
          <SectionLabel>Chapter by chapter</SectionLabel>
          <SectionHeading>Our Story</SectionHeading>
        </FadeIn>
        {content.chapters.map((ch, i) => (
          <FadeIn key={ch.id} delay={i * 80}>
            <ChapterBlock
              chapter={ch}
              memories={memoriesByChapter(content, ch.id)}
            />
          </FadeIn>
        ))}
      </section>

      {/* ── FAVORITE MOMENTS ───────────────────────────────── */}
      {featuredMoments.length > 0 && (
        <section style={{ padding: `48px 0 64px`, overflow: "hidden" }}>
          <div style={{ padding: `0 ${PAD} 24px`, maxWidth: 860, margin: "0 auto" }}>
            <FadeIn>
              <SectionLabel>The ones I keep coming back to</SectionLabel>
              <SectionHeading>Favorite Moments</SectionHeading>
            </FadeIn>
          </div>
          <div style={{
            display: "flex",
            gap: 12,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            paddingLeft: "clamp(20px, 5vw, 48px)",
            paddingRight: "clamp(20px, 5vw, 48px)",
            paddingBottom: 8,
            scrollbarWidth: "none",
          }}>
            {featuredMoments.map((m) => (
              <PhotoMomentCard
                key={m.id}
                memory={m}
                photoUrl={photos[`hero-${m.id}`]}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── LETTER ─────────────────────────────────────────── */}
      {letter && (
        <FadeIn>
          <section style={{ padding: `48px ${PAD} 72px`, maxWidth: 700, margin: "0 auto" }}>
            <SectionLabel>Written for you</SectionLabel>
            <SectionHeading>A Letter</SectionHeading>
            <div style={{
              background: "var(--color-paper-cream2)",
              borderLeft: "3px solid var(--color-accent)",
              borderRadius: "0 12px 12px 0",
              padding: "32px 28px 32px 32px",
            }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-ink3)",
                marginBottom: 16,
              }}>
                {letter.date} · {letter.occasion}
              </div>
              <div style={{
                fontFamily: "var(--font-hand)",
                fontSize: 22,
                color: "var(--color-ink)",
                marginBottom: 20,
                lineHeight: 1.4,
              }}>
                {letter.salutation}
              </div>
              <div style={{
                fontFamily: "var(--font-serif)",
                fontSize: 16,
                lineHeight: 1.75,
                color: "var(--color-ink2)",
              }}>
                {letter.body.split("\n\n").map((para, i) => (
                  <p key={i} style={{ margin: "0 0 16px" }}>{para}</p>
                ))}
              </div>
              <div style={{
                fontFamily: "var(--font-hand)",
                fontSize: 20,
                color: "var(--color-ink)",
                marginTop: 8,
                lineHeight: 1.5,
              }}>
                {letter.signature}<br />{letter.signedName}
              </div>
            </div>
          </section>
        </FadeIn>
      )}

      {/* ── BY THE NUMBERS ─────────────────────────────────── */}
      <FadeIn>
        <section style={{
          padding: `48px ${PAD} 80px`,
          borderTop: "0.5px solid var(--color-rule)",
          maxWidth: 700,
          margin: "0 auto",
        }}>
          <SectionLabel>By the numbers</SectionLabel>
          <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 8 }}>
            <StatNumber value={dayCount} label="days together" />
            <StatNumber value={content.memories.length} label="memories" />
            <StatNumber value={uniquePlaces} label="places" />
          </div>
        </section>
      </FadeIn>

    </div>
  );
}
