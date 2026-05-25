"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { Language } from "@/data";

function NavTab({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="nav-tab"
      style={{
        padding: "6px 10px 4px",
        textDecoration: "none",
        fontFamily: "var(--font-serif)",
        fontSize: 14,
        fontStyle: "italic",
        fontWeight: active ? 600 : 500,
        color: active ? "var(--color-ink)" : "var(--color-ink3)",
        borderBottom: active
          ? "2px solid var(--color-accent)"
          : "2px solid transparent",
        transition: "color 0.15s, border-color 0.15s",
        whiteSpace: "nowrap",
        letterSpacing: "0.01em",
        lineHeight: 1.2,
      }}
    >
      {label}
    </Link>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const content = useAppStore((s) => s.content);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setFilterChapter = useAppStore((s) => s.setFilterChapter);
  const query = useAppStore((s) => s.query);
  const setQuery = useAppStore((s) => s.setQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const s = content.strings;

  function isActive(path: string) {
    return pathname === `/app-personal${path}` || pathname === path;
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    if (v.trim()) router.push("/search");
  }

  const LANGS: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "fr", label: "FR" },
    { code: "vi", label: "VI" },
  ];

  return (
    <header style={{
      height: "var(--topbar-h)",
      borderBottom: "1px solid var(--color-rule)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "0 16px",
      background: "var(--color-bg)",
      flexShrink: 0,
    }}>
      {/* Nav tabs */}
      <div className="topbar-nav" style={{ display: "flex", gap: 2, alignItems: "center" }}>
        <NavTab href="/library"  label={s.tabLibrary}  active={isActive("/library")} />
        <NavTab href="/timeline" label={s.tabTimeline} active={isActive("/timeline")} onClick={() => setFilterChapter(null)} />
        <NavTab href="/letters"  label={s.tabLetters}  active={isActive("/letters")} />
        <NavTab href="/atlas"    label={s.tabAtlas}    active={isActive("/atlas")} />
        <NavTab href="/people"   label={s.tabPeople}   active={isActive("/people")} />
      </div>

      <div style={{ flex: 1 }} />

      {/* Search */}
      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          value={query}
          onChange={handleSearch}
          onKeyDown={(e) => { if (e.key === "Escape") { setQuery(""); inputRef.current?.blur(); } }}
          placeholder={s.searchPlaceholder}
          style={{
            width: 180,
            padding: "4px 10px",
            borderRadius: 6,
            border: "1px solid var(--color-rule)",
            background: "var(--color-card)",
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            color: "var(--color-ink)",
            outline: "none",
          }}
        />
      </div>

      {/* Language switcher */}
      <div style={{ display: "flex", gap: 2 }}>
        {LANGS.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => setLanguage(code)}
            style={{
              padding: "3px 7px",
              borderRadius: 5,
              border: "0.5px solid",
              borderColor: language === code ? "var(--color-accent)" : "transparent",
              background: language === code ? "rgba(164,74,42,0.08)" : "transparent",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              fontWeight: 600,
              color: language === code ? "var(--color-accent)" : "var(--color-ink3)",
              cursor: "pointer",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  );
}
