"use client";

import { useAppStore } from "@/store/useAppStore";
import { Avatar } from "@/components/shared/Avatar";
import { PhotoSlot } from "@/components/shared/PhotoSlot";
import { FadeIn } from "@/components/shared/FadeIn";
import Link from "next/link";

export default function PeoplePage() {
  const content = useAppStore((s) => s.content);
  const s = content.strings;

  const mainPerson = content.people.find((p) => p.id === "you");
  const castMembers = content.people.filter((p) => p.id !== "you");
  const totalMemories = content.memories.length;

  const memoriesWithYou = content.memories.filter((m) => m.peopleIds.includes("you"));

  function memoriesForPerson(personId: string) {
    return content.memories.filter((m) => m.peopleIds.includes(personId) && personId !== "you");
  }

  return (
    <div className="page-root" style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 36px 80px" }}>
      {/* Header */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 32 }}>
        {s.peopleEyebrow}
      </div>

      {/* "You" hero card */}
      {mainPerson && (
        <div style={{
          background: `radial-gradient(circle at 30% 30%, hsl(354, 30%, 88%), hsl(340, 25%, 78%))`,
          borderRadius: 16,
          padding: "40px 48px",
          marginBottom: 48,
          boxShadow: "0 18px 40px -8px rgba(164,74,42,0.20)",
          display: "flex",
          gap: 40,
          alignItems: "center",
        }}>
          <div style={{ flexShrink: 0, width: 160, height: 200, borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 28px rgba(164,74,42,0.22)" }}>
            <PhotoSlot slotId="portrait-you" height={200} borderRadius={0} width={160} />
          </div>
          <div>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 52, fontStyle: "italic", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 8px", letterSpacing: "-0.03em" }}>
              {mainPerson.name}
            </h1>
            <p style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontStyle: "italic", color: "var(--color-ink2)", margin: "0 0 20px" }}>
              {s.peopleInAll(memoriesWithYou.length, totalMemories)}
            </p>
            {/* Flow of memory links */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {memoriesWithYou.slice(0, 8).map((m) => (
                <Link key={m.id} href={`/memory/${m.id}`} style={{
                  padding: "5px 12px",
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.55)",
                  border: "0.5px solid rgba(164,74,42,0.25)",
                  fontFamily: "var(--font-serif)",
                  fontSize: 13,
                  fontStyle: "italic",
                  color: "var(--color-ink)",
                  textDecoration: "none",
                }}>
                  {m.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Cast */}
      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: 28, fontStyle: "italic", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
        {s.peopleAlsoIn}
      </h2>
      <p style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontStyle: "italic", color: "var(--color-ink3)", margin: "0 0 24px" }}>
        {s.peopleSubtitle}
      </p>

      <div className="mob-1" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {castMembers.map((person, i) => {
          const mems = memoriesForPerson(person.id);
          return (
            <FadeIn key={person.id} delay={i * 40}>
            <div style={{
              background: "var(--color-card)",
              borderRadius: 12,
              padding: "20px",
              border: "0.5px solid var(--color-rule)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <Avatar initials={person.initials} size={44} index={i + 1} />
                <div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 500, color: "var(--color-ink)" }}>
                    {person.name}
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-ink3)" }}>
                    {person.role}
                  </div>
                </div>
              </div>
              {mems.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {mems.map((m) => (
                    <Link key={m.id} href={`/memory/${m.id}`} style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: 13,
                      fontStyle: "italic",
                      color: "var(--color-ink2)",
                      textDecoration: "none",
                    }}>
                      — {m.title}
                    </Link>
                  ))}
                </div>
              ) : (
                <span style={{ fontFamily: "var(--font-serif)", fontSize: 13, fontStyle: "italic", color: "var(--color-ink3)" }}>
                  {s.peopleMentioned}
                </span>
              )}
            </div>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
