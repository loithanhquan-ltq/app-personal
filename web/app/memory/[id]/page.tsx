import { MemoryDetailClient } from "@/components/shared/MemoryDetailClient";
import { english } from "@/data/content.en";

export function generateStaticParams() {
  return english.memories.map((m) => ({ id: m.id }));
}

export default function DetailPage({ params }: { params: { id: string } }) {
  return <MemoryDetailClient id={params.id} />;
}
