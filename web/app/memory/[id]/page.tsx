import { MemoryDetailClient } from "@/components/shared/MemoryDetailClient";
import { english } from "@/data/content.en";

export function generateStaticParams() {
  return english.memories.map((m) => ({ id: m.id }));
}

export default async function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MemoryDetailClient id={id} />;
}
