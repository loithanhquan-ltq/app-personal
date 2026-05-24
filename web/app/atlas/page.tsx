"use client";

import dynamic from "next/dynamic";
import { useAppStore } from "@/store/useAppStore";
import { PhotoSlot } from "@/components/shared/PhotoSlot";
import Link from "next/link";

const VietnamMap = dynamic(() => import("@/components/atlas/VietnamMap"), { ssr: false, loading: () => (
  <div style={{ height: 400, background: "var(--color-card)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--color-ink3)" }}>Loading map…</span>
  </div>
) });

export default function AtlasPage() {
  const content = useAppStore((s) => s.content);
  const s = content.strings;

  const uniquePlaces = content.places.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
  const placeMemories: Record<string, typeof content.memories> = {};
  uniquePlaces.forEach((p) => {
    placeMemories[p.id] = content.memories.filter((m) => m.placeId === p.id);
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 36px 80px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 8 }}>
          {s.atlasEyebrow(uniquePlaces.length, content.memories.length)}
        </div>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 44, fontStyle: "italic", fontWeight: 600, color: "var(--color-ink)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
          {s.atlasHeadline}
        </h1>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontStyle: "italic", color: "var(--color-ink3)", margin: 0 }}>
          {s.atlasSubtitle}
        </p>
      </div>

      {/* Map */}
      <div style={{ marginBottom: 40, borderRadius: 12, overflow: "hidden", border: "0.5px solid var(--color-rule)" }}>
        <VietnamMap places={uniquePlaces} memories={content.memories} />
      </div>

      {/* Place cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {uniquePlaces.map((p) => {
          const mems = placeMemories[p.id] ?? [];
          const firstMem = mems[0];
          return (
            <Link key={p.id} href={firstMem ? `/memory/${firstMem.id}` : "#"} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={{
                background: "var(--color-card)",
                borderRadius: 12,
                overflow: "hidden",
                border: "0.5px solid var(--color-rule)",
              }}>
                <div style={{ height: 140 }}>
                  <PhotoSlot slotId={`place-${p.id}`} height={140} borderRadius={0} width={340} />
                </div>
                <div style={{ padding: "14px 16px" }}>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, fontStyle: "italic", fontWeight: 600, color: "var(--color-ink)", marginBottom: 2 }}>
                    {p.label}
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: "var(--color-ink3)", marginBottom: 8 }}>
                    {p.country}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink3)", letterSpacing: "0.08em" }}>
                    {s.memoriesCount(mems.length)}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
