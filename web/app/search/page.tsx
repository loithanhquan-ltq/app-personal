"use client";

import { useAppStore } from "@/store/useAppStore";
import { searchMemories } from "@/data";
import { MemoryWideCard } from "@/components/shared/MemoryWideCard";

export default function SearchPage() {
  const content = useAppStore((s) => s.content);
  const query = useAppStore((s) => s.query);
  const s = content.strings;

  const results = searchMemories(content, query);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 36px 80px" }}>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 8 }}>
        {s.searchResults(results.length)}
      </div>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: 36, fontWeight: 400, color: "var(--color-ink)", margin: "0 0 28px", letterSpacing: "-0.02em" }}>
        {s.searchResultsFor(query)}
      </h1>

      {results.length === 0 ? (
        <p style={{ fontFamily: "var(--font-serif)", fontSize: 15, fontStyle: "italic", color: "var(--color-ink3)" }}>
          {s.searchEmpty}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {results.map((m) => <MemoryWideCard key={m.id} memory={m} />)}
        </div>
      )}
    </div>
  );
}
