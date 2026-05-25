"use client";

import Link from "next/link";
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
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "4px 8px",
        borderRadius: 6,
        textDecoration: "none",
        background: active ? "rgba(22,38,69,0.92)" : "transparent",
        color: active ? "#fff" : "var(--color-ink)",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        transition: "background 0.12s",
        cursor: "pointer",
      }}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span style={{ fontSize: 11, opacity: 0.65, fontFamily: "var(--font-mono)" }}>{count}</span>
      )}
    </Link>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--color-ink3)",
      padding: "12px 8px 4px",
    }}>
      {label}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const content = useAppStore((s) => s.content);
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
        padding: "16px 16px 8px",
        fontFamily: "var(--font-serif)",
        fontSize: 18,
        fontStyle: "italic",
        fontWeight: 600,
        color: "var(--color-ink)",
        letterSpacing: "-0.03em",
        flexShrink: 0,
      }}>
        {s.wordmark}
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "0 8px" }}>
        {/* Library */}
        <SectionLabel label={s.sectionLibrary} />
        <SideItem href="/library" label={s.sideAll} active={isActive("/library") && !filterChapter} />
        <SideItem href="/letters" label={s.sideLetters} active={isActive("/letters")} />
        <SideItem href="/library" label={s.sideFavorites} active={false} />
        {githubToken && (
          <SideItem href="/add-memory" label={`+ ${s.newMemory}`} active={isActive("/add-memory")} />
        )}

        {/* Chapters */}
        <SectionLabel label={s.sectionChapters} />
        {content.chapters.map((c) => (
          <div
            key={c.id}
            onClick={() => { setFilterChapter(c.id); router.push("/timeline"); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 8px",
              borderRadius: 6,
              cursor: "pointer",
              background: chapterActive(c.id) ? "rgba(22,38,69,0.92)" : "transparent",
              transition: "background 0.12s",
            }}
          >
            <span style={{
              width: 9,
              height: 9,
              borderRadius: 2,
              flexShrink: 0,
              background: `hsl(${c.hue}, 45%, 55%)`,
            }} />
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 500,
              color: chapterActive(c.id) ? "#fff" : "var(--color-ink)",
              flex: 1,
            }}>{c.label}</span>
            <span style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: chapterActive(c.id) ? "rgba(255,255,255,0.65)" : "var(--color-ink3)",
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
      </nav>

      <DayCounterFooter />
    </aside>
  );
}
