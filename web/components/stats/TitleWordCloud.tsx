"use client";

import { useMemo } from "react";
import type { Memory } from "@/data/types";

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","as","is","was","are","were","be","been","being",
  "i","we","you","he","she","it","they","this","that","our","my","your","his","her","its","their",
  "un","une","le","la","les","et","de","du","des","en","au","aux","ce","qui","que","dans",
  "một","và","của","là","có","được","đã","cho","với","về","khi","những","các",
  "first","last","day","days","time","one","two","three","just","like","make","made","well","still","back",
]);

interface Props {
  memories: Memory[];
  label: string;
}

export function TitleWordCloud({ memories, label }: Props) {
  const words = useMemo(() => {
    const freq: Record<string, number> = {};
    memories.forEach((m) => {
      m.title.toLowerCase().replace(/[^a-z0-9àáâãäåæçèéêëìíîïðñòóôõöùúûüýÿăắặấầảẳẵặắẹẻẽếềệểễồổỗộốợởờọỏõôùúụủũưứựừ\s]/g, "").split(/\s+/).forEach((w) => {
        if (w.length > 2 && !STOP_WORDS.has(w)) {
          freq[w] = (freq[w] ?? 0) + 1;
        }
      });
    });
    return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 30);
  }, [memories]);

  const max = words[0]?.[1] ?? 1;

  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 16 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", lineHeight: 1.4 }}>
        {words.map(([word, count]) => {
          const size = 12 + (count / max) * 22;
          const opacity = 0.45 + (count / max) * 0.55;
          return (
            <span
              key={word}
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: size,
                color: "var(--color-accent)",
                opacity,
                letterSpacing: "-0.01em",
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}
