import { MemoryDetailClient } from "@/components/shared/MemoryDetailClient";
import { english } from "@/data/content.en";
import { rawUserMemoriesURL } from "@/lib/githubMemories";
import type { Memory } from "@/data/types";

export async function generateStaticParams() {
  const base = english.memories.map((m) => ({ id: m.id }));
  try {
    const res = await fetch(rawUserMemoriesURL(), { cache: "no-store" });
    if (res.ok) {
      const user: Memory[] = await res.json();
      return [...base, ...user.map((m) => ({ id: m.id }))];
    }
  } catch {
    // no user memories yet
  }
  return base;
}

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MemoryDetailClient id={id} />;
}
