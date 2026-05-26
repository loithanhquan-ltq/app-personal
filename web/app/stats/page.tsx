"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { FadeIn } from "@/components/shared/FadeIn";
import { MemoriesPerMonth } from "@/components/stats/MemoriesPerMonth";
import { TopPlacesPeople } from "@/components/stats/TopPlacesPeople";
import { TitleWordCloud } from "@/components/stats/TitleWordCloud";
import { PhotoCollage } from "@/components/stats/PhotoCollage";

const PAD = 36;
const MAX_W = 900;

function StatCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--color-card)",
      border: "0.5px solid var(--color-rule)",
      borderRadius: 14,
      padding: "24px 28px",
    }}>
      {children}
    </div>
  );
}

export default function StatsPage() {
  const content = useAppStore((s) => s.content);
  const s = content.strings;
  const { memories, places, people } = content;

  const byYear: Record<number, number> = {};
  memories.forEach((m) => { byYear[m.year] = (byYear[m.year] ?? 0) + 1; });

  return (
    <div className="page-root" style={{ maxWidth: MAX_W, margin: "0 auto", padding: `14px ${PAD}px 80px` }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 40 }}
      >
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
          letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 10,
        }}>
          {s.statsEyebrow}
        </div>
        <h1 style={{
          fontFamily: "var(--font-serif)", fontSize: "clamp(32px, 5vw, 52px)", fontStyle: "italic",
          fontWeight: 600, color: "var(--color-ink)", margin: 0, letterSpacing: "-0.03em", lineHeight: 1.1,
        }}>
          {s.statsHeadline}
        </h1>

        {/* Year chips */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
          {Object.entries(byYear).sort((a, b) => Number(a[0]) - Number(b[0])).map(([year, count]) => (
            <div key={year} style={{
              padding: "8px 16px", borderRadius: 20, background: "var(--color-card)",
              border: "0.5px solid var(--color-rule)",
            }}>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: 14, fontStyle: "italic", fontWeight: 600, color: "var(--color-ink)" }}>
                {year}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink3)", marginLeft: 6 }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <FadeIn delay={60}>
          <StatCard>
            <MemoriesPerMonth memories={memories} label={s.statsMemoriesPerMonth} />
          </StatCard>
        </FadeIn>

        <FadeIn delay={120}>
          <StatCard>
            <TopPlacesPeople
              memories={memories}
              places={places}
              people={people}
              placesLabel={s.statsTopPlaces}
              peopleLabel={s.statsTopPeople}
            />
          </StatCard>
        </FadeIn>

        <FadeIn delay={180}>
          <StatCard>
            <TitleWordCloud memories={memories} label={s.statsTitleCloud} />
          </StatCard>
        </FadeIn>

        <FadeIn delay={240}>
          <StatCard>
            <PhotoCollage memories={memories} label={s.statsPhotoCollage} />
          </StatCard>
        </FadeIn>
      </div>
    </div>
  );
}
