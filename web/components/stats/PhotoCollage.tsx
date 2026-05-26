"use client";

import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import type { Memory } from "@/data/types";

interface Props {
  memories: Memory[];
  label: string;
}

export function PhotoCollage({ memories, label }: Props) {
  const photos = useAppStore((s) => s.photos);
  const withPhotos = memories.filter((m) => photos[`hero-${m.id}`]);

  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 16 }}>
        {label} ({withPhotos.length})
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
        gap: 6,
      }}>
        {withPhotos.map((m) => (
          <Link key={m.id} href={`/memory/${m.id}`} style={{ display: "block", aspectRatio: "1", borderRadius: 8, overflow: "hidden", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[`hero-${m.id}`]}
              alt={m.title}
              title={m.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.18s" }}
            />
          </Link>
        ))}
        {withPhotos.length === 0 && (
          <div style={{ gridColumn: "1/-1", fontFamily: "var(--font-serif)", fontSize: 15, fontStyle: "italic", color: "var(--color-ink3)", padding: "20px 0" }}>
            Photos appear here once synced from GitHub.
          </div>
        )}
      </div>
    </div>
  );
}
