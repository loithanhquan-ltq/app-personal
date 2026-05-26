"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { DayCounterFooter } from "./DayCounterFooter";

function SideItem({
  href,
  label,
  count,
  active,
  onClick,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="side-item"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "5px 10px 5px 10px",
        borderRadius: 6,
        textDecoration: "none",
        background: active ? "rgba(164,74,42,0.09)" : "transparent",
        color: active ? "var(--color-accent)" : "var(--color-ink2)",
        fontFamily: "var(--font-serif)",
        fontSize: 13.5,
        fontStyle: "italic",
        fontWeight: active ? 600 : 500,
        borderLeft: active ? "2px solid var(--color-accent)" : "2px solid transparent",
        marginLeft: -2,
        transition: "background 0.12s, color 0.12s, border-color 0.12s",
        cursor: "pointer",
      }}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span style={{ fontSize: 10, opacity: 0.55, fontFamily: "var(--font-mono)", fontStyle: "normal" }}>{count}</span>
      )}
    </Link>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: "var(--font-sans)",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "var(--color-ink3)",
      padding: "10px 8px 4px",
      borderTop: "0.5px solid var(--color-rule)",
      marginTop: 4,
    }}>
      {label}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const content = useAppStore((s) => s.content);
  const reduced = useReducedMotion();
  const filterChapter = useAppStore((s) => s.filterChapter);
  const setFilterChapter = useAppStore((s) => s.setFilterChapter);
  const githubToken = useAppStore((s) => s.githubToken);
  const s = content.strings;

  function isActive(path: string) {
    return pathname === `/app-personal${path}` || pathname === path;
  }

  function chapterActive(id: string) {
    return isActive("/timeline") && filterChapter === id;
  }

  return (
    <aside className="sidebar-root" style={{
      width: "var(--sidebar-w)",
      minWidth: "var(--sidebar-w)",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      borderRight: "1px solid var(--color-rule)",
      background: "var(--color-bg)",
      overflow: "hidden",
    }}>
      {/* Wordmark */}
      <div style={{
        padding: "16px 16px 10px",
        flexShrink: 0,
      }}>
        <div style={{
          fontFamily: "var(--font-serif)",
          fontSize: 19,
          fontStyle: "italic",
          fontWeight: 600,
          color: "var(--color-ink)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}>
          {s.wordmark}
          <motion.span
            animate={reduced ? {} : { y: [0, -3, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.4 }}
            style={{ color: "var(--color-accent)", marginLeft: 6, fontSize: 16, fontStyle: "normal", display: "inline-block" }}
          >♡</motion.span>
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        {/* Library */}
        <SectionLabel label={s.sectionLibrary} />
        <SideItem href="/library" label={s.sideAll} active={isActive("/library") && !filterChapter} />
        <SideItem href="/letters" label={s.sideLetters} active={isActive("/letters")} />
        {githubToken && (
          <SideItem href="/add-memory" label={`+ ${s.newMemory}`} active={isActive("/add-memory")} />
        )}

        {/* Chapters */}
        <SectionLabel label={s.sectionChapters} />
        {content.chapters.map((c) => (
          <div
            key={c.id}
            className="side-item"
            onClick={() => { setFilterChapter(c.id); router.push("/timeline"); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 10px 5px 10px",
              borderRadius: 6,
              cursor: "pointer",
              background: chapterActive(c.id) ? "rgba(164,74,42,0.09)" : "transparent",
              color: chapterActive(c.id) ? "var(--color-accent)" : "var(--color-ink2)",
              borderLeft: chapterActive(c.id) ? "2px solid var(--color-accent)" : "2px solid transparent",
              marginLeft: -2,
              transition: "background 0.12s, color 0.12s, border-color 0.12s",
            }}
          >
            <span style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              flexShrink: 0,
              background: `hsl(${c.hue}, 45%, 55%)`,
            }} />
            <span style={{
              fontFamily: "var(--font-serif)",
              fontSize: 13.5,
              fontStyle: "italic",
              fontWeight: 500,
              color: chapterActive(c.id) ? "var(--color-accent)" : "var(--color-ink2)",
              flex: 1,
            }}>{c.label}</span>
            <span style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              opacity: 0.55,
              color: "var(--color-ink3)",
            }}>
              {content.memories.filter((m) => m.chapterId === c.id).length}
            </span>
          </div>
        ))}

        {/* Atlas */}
        <SectionLabel label={s.sectionAtlas} />
        <SideItem href="/atlas" label={s.sidePlaces} active={isActive("/atlas")} />

        {/* People */}
        <SectionLabel label={s.sectionPeople} />
        <SideItem href="/people" label={s.sideEveryone} active={isActive("/people")} />

        {/* Reflections */}
        <SectionLabel label={s.sectionReflections} />
        <SideItem href="/stats" label={s.sideStats} active={isActive("/stats")} />
        <SideItem href="/anniversary-card" label={s.sideAnniversaryCard} active={isActive("/anniversary-card")} />
      </nav>

      <DayCounterFooter />
    </aside>
  );
}
