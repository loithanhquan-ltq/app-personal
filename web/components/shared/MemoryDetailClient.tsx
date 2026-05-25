"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { chapter, place, person, memory as findMemory } from "@/data";
import { PhotoSlot } from "./PhotoSlot";
import { ChipView } from "./ChipView";
import { Avatar } from "./Avatar";
import { MemoryTile } from "./MemoryTile";

export function MemoryDetailClient({ id }: { id: string }) {
  const router = useRouter();
  const content = useAppStore((s) => s.content);
  const isFavorite = useAppStore((s) => s.isFavorite);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const githubToken = useAppStore((s) => s.githubToken);
  const s = content.strings;

  const mem = findMemory(content, id);

  const ch = mem ? chapter(content, mem.chapterId) : null;
  const pl = mem ? place(content, mem.placeId) : null;
  const people = mem
    ? mem.peopleIds.map((pid) => person(content, pid)).filter(Boolean)
    : [];

  const sorted = [...content.memories].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  const idx = mem ? sorted.findIndex((m) => m.id === id) : -1;
  const prevMem = idx > 0 ? sorted[idx - 1] : null;
  const nextMem = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  const related = mem
    ? content.memories.filter((m) => m.chapterId === mem.chapterId && m.id !== id).slice(0, 3)
    : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && prevMem) router.push(`/memory/${prevMem.id}`);
      if (e.key === "ArrowRight" && nextMem) router.push(`/memory/${nextMem.id}`);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prevMem, nextMem, router]);

  if (!mem) {
    return (
      <div style={{ padding: 40, fontFamily: "var(--font-serif)", fontSize: 17, color: "var(--color-ink3)" }}>
        Memory not found.
      </div>
    );
  }

  const bodyParagraphs = mem.body.split("\n\n");
  const fav = isFavorite(mem.id);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 36px 80px" }}>
      <Link href="/timeline" style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-ink3)",
        textDecoration: "none", marginBottom: 24,
      }}>
        ← {s.back}
      </Link>

      <div style={{ marginBottom: 28, borderRadius: 12, overflow: "hidden" }}>
        <PhotoSlot slotId={`hero-${mem.id}`} height={340} borderRadius={12} width={720} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, color: "var(--color-ink3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {mem.date}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {githubToken && mem.id.startsWith("um-") && (
            <Link href={`/add-memory?edit=${mem.id}`} style={{
              fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink3)",
              textDecoration: "none", padding: "4px 8px", borderRadius: 6,
              border: "1px solid var(--color-rule)", background: "var(--color-card)",
            }}>
              Edit
            </Link>
          )}
          <button
            onClick={() => toggleFavorite(mem.id)}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: fav ? "var(--color-accent)" : "var(--color-ink3)" }}
          >
            {fav ? "♥" : "♡"}
          </button>
        </div>
      </div>

      <h1 style={{
        fontFamily: "var(--font-serif)", fontSize: 44, fontStyle: "italic", fontWeight: 600,
        color: "var(--color-ink)", margin: "0 0 20px", letterSpacing: "-0.02em", lineHeight: 1.15,
      }}>
        {mem.title}
      </h1>

      <div style={{
        display: "flex", flexWrap: "wrap", gap: 16, padding: "16px 0",
        borderTop: "1px solid var(--color-rule)", borderBottom: "1px solid var(--color-rule)", marginBottom: 28,
      }}>
        {ch && (
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 4 }}>{s.metaChapter}</div>
            <ChipView label={ch.label} accent />
          </div>
        )}
        {pl && (
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 4 }}>{s.metaPlace}</div>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontStyle: "italic", color: "var(--color-ink2)" }}>{pl.label}</span>
          </div>
        )}
        {mem.tags.length > 0 && (
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 4 }}>{s.metaTags}</div>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {mem.tags.map((t) => <ChipView key={t} label={t} small />)}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        {bodyParagraphs.map((p, i) => (
          <p key={i} style={{
            fontFamily: "var(--font-serif)", fontSize: 17, lineHeight: 1.8, color: "var(--color-ink)",
            margin: i > 0 ? "20px 0 0" : "0",
          }}>
            {p}
          </p>
        ))}
      </div>

      {people.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 12 }}>{s.withPeople}</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {people.map((p, i) => p && (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--color-card)", borderRadius: 10, border: "0.5px solid var(--color-rule)" }}>
                <Avatar initials={p.initials} size={32} index={i} />
                <div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontWeight: 500, color: "var(--color-ink)" }}>{p.name}</div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-ink3)" }}>{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 14 }}>
            {ch ? `${s.moreFrom} ${ch.label}` : s.moreFrom}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {related.map((m) => <MemoryTile key={m.id} memory={m} />)}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, justifyContent: "space-between", borderTop: "1px solid var(--color-rule)", paddingTop: 20 }}>
        {prevMem ? (
          <Link href={`/memory/${prevMem.id}`} style={{
            flex: 1, padding: "14px 16px", borderRadius: 10, background: "var(--color-card)",
            border: "0.5px solid var(--color-rule)", textDecoration: "none", color: "inherit",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 6 }}>← {s.earlier}</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontStyle: "italic", color: "var(--color-ink)" }}>{prevMem.title}</div>
          </Link>
        ) : <div style={{ flex: 1 }} />}

        {nextMem ? (
          <Link href={`/memory/${nextMem.id}`} style={{
            flex: 1, padding: "14px 16px", borderRadius: 10, background: "var(--color-card)",
            border: "0.5px solid var(--color-rule)", textDecoration: "none", color: "inherit", textAlign: "right",
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 6 }}>{s.later} →</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontStyle: "italic", color: "var(--color-ink)" }}>{nextMem.title}</div>
          </Link>
        ) : <div style={{ flex: 1 }} />}
      </div>
    </div>
  );
}
