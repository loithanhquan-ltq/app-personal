"use client";

import type { Memory, Place, Person } from "@/data/types";

interface Props {
  memories: Memory[];
  places: Place[];
  people: Person[];
  placesLabel: string;
  peopleLabel: string;
}

function RankedList({ items, label }: { items: { name: string; count: number; sub?: string }[]; label: string }) {
  const max = items[0]?.count ?? 1;
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 14 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontStyle: "italic", color: "var(--color-ink)" }}>
                {item.name}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-ink3)" }}>
                {item.count}
              </span>
            </div>
            <div style={{ height: 3, background: "var(--color-rule)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${(item.count / max) * 100}%`,
                background: `hsl(${18 - i * 10}, 55%, 60%)`,
                borderRadius: 2,
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopPlacesPeople({ memories, places, people, placesLabel, peopleLabel }: Props) {
  const placeCounts: Record<string, number> = {};
  const personCounts: Record<string, number> = {};
  memories.forEach((m) => {
    placeCounts[m.placeId] = (placeCounts[m.placeId] ?? 0) + 1;
    m.peopleIds.forEach((pid) => { personCounts[pid] = (personCounts[pid] ?? 0) + 1; });
  });

  const topPlaces = Object.entries(placeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ name: places.find((p) => p.id === id)?.label ?? id, count }));

  const topPeople = Object.entries(personCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ name: people.find((p) => p.id === id)?.name ?? id, count }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
      <RankedList items={topPlaces} label={placesLabel} />
      <RankedList items={topPeople} label={peopleLabel} />
    </div>
  );
}
