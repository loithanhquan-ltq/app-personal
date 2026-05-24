"use client";

import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { ANNIVERSARY_IDS } from "@/data";
import { daysSinceStart } from "@/lib/dateUtils";
import { MemoryTile } from "@/components/shared/MemoryTile";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { PhotoSlot } from "@/components/shared/PhotoSlot";
import Link from "next/link";

const MAX_W = 1100;
const PAD = 36;

export default function LibraryPage() {
  const content = useAppStore((s) => s.content);
  const userFavorites = useAppStore((s) => s.userFavorites);
  const setFilterChapter = useAppStore((s) => s.setFilterChapter);
  const router = useRouter();
  const s = content.strings;
  const days = daysSinceStart();

  const dayOne = content.memories.find((m) => m.id === "m01");
  const anniversaries = ANNIVERSARY_IDS.map((id) => content.memories.find((m) => m.id === id)).filter(Boolean) as typeof content.memories;
  const favMems = content.memories.filter((m) => m.favorite || userFavorites.includes(m.id));
  const recent = [...content.memories].sort((a, b) => b.sortKey.localeCompare(a.sortKey)).slice(0, 9);

  const yearCounts: Record<number, number> = {};
  content.memories.forEach((m) => { yearCounts[m.year] = (yearCounts[m.year] || 0) + 1; });

  return (
    <div style={{ maxWidth: MAX_W, margin: "0 auto", padding: `14px ${PAD}px 80px` }}>
      {/* Hero */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-ink3)",
          marginBottom: 12,
        }}>
          {s.libraryEyebrow(content.memories.length)}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 0, flexWrap: "wrap", marginBottom: 12 }}>
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: 64,
            fontStyle: "italic",
            fontWeight: 600,
            color: "var(--color-accent)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}>
            {days.toLocaleString()}
          </span>
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: 64,
            fontStyle: "italic",
            fontWeight: 400,
            color: "var(--color-ink)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}>
            &nbsp;{s.libraryHeadlineA}{s.libraryHeadlineB}
          </span>
        </div>
        <p style={{
          fontFamily: "var(--font-serif)",
          fontSize: 17,
          fontStyle: "italic",
          color: "var(--color-ink2)",
          margin: 0,
          maxWidth: 520,
        }}>
          {s.librarySubtitle}
        </p>

        {/* Year chips */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
          {Object.entries(yearCounts).sort(([a], [b]) => Number(a) - Number(b)).map(([year, count]) => (
            <div key={year} style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: "var(--color-card)",
              border: "0.5px solid var(--color-rule)",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-ink2)",
            }}>
              <span style={{ fontWeight: 600, color: "var(--color-ink)" }}>{year}</span>
              <span style={{ marginLeft: 6, color: "var(--color-ink3)" }}>{s.memoriesCount(count)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Where it began */}
      {dayOne && (
        <div style={{ marginBottom: 48 }}>
          <SectionHeader title={s.sectionWhereItBegan} />
          <Link href={`/memory/${dayOne.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{
              background: "var(--color-card)",
              borderRadius: 14,
              overflow: "hidden",
              border: "0.5px solid var(--color-rule)",
              display: "flex",
              gap: 0,
            }}>
              <div style={{ flex: "0 0 300px", height: 220 }}>
                <PhotoSlot slotId="hero-m01" height={220} borderRadius={0} width={300} />
              </div>
              <div style={{ flex: 1, padding: "28px 32px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, color: "var(--color-ink3)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
                  {s.dayOnePrefix} · {dayOne.date}
                </div>
                <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontStyle: "italic", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
                  {dayOne.title}
                </h2>
                <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, color: "var(--color-ink2)", lineHeight: 1.7, margin: 0 }}>
                  {dayOne.body}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Anniversaries */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeader title={s.sectionAnniversaries} subtitle={s.sectionAnniversariesSub} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {anniversaries.map((m, i) => (
            <Link key={m.id} href={`/memory/${m.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{
                borderRadius: 12,
                overflow: "hidden",
                background: `linear-gradient(135deg, hsl(${354 - i * 10}, 55%, 72%), hsl(${354 - i * 10}, 40%, 60%))`,
                padding: "20px 18px",
                minHeight: 120,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.8)", letterSpacing: "0.08em", marginBottom: 6 }}>
                  {m.date}
                </div>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontStyle: "italic", fontWeight: 600, color: "#fff" }}>
                  {m.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Chapters */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeader title={s.sectionChaptersTitle} subtitle={s.sectionChaptersSub} />
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
          {content.chapters.map((c) => {
            const count = content.memories.filter((m) => m.chapterId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => { setFilterChapter(c.id); router.push("/timeline"); }}
                style={{
                  flexShrink: 0,
                  padding: "18px 20px",
                  borderRadius: 12,
                  background: `hsl(${c.hue}, 20%, 92%)`,
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  minWidth: 140,
                }}
              >
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontStyle: "italic", fontWeight: 600, color: `hsl(${c.hue}, 30%, 30%)`, marginBottom: 4 }}>
                  {c.label}
                </div>
                <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: `hsl(${c.hue}, 25%, 45%)` }}>
                  {s.memoriesCount(count)}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: `hsl(${c.hue}, 20%, 55%)`, marginTop: 4 }}>
                  {c.span}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Favorites */}
      {favMems.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <SectionHeader title={s.sectionFavorites} subtitle={s.sectionFavoritesSub} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {favMems.map((m) => <MemoryTile key={m.id} memory={m} />)}
          </div>
        </div>
      )}

      {/* Recent */}
      <div style={{ marginBottom: 48 }}>
        <SectionHeader title={s.sectionRecent} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {recent.map((m) => <MemoryTile key={m.id} memory={m} />)}
        </div>
      </div>
    </div>
  );
}
