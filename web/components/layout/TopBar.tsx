"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { Language } from "@/data";

function NavTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        padding: "4px 12px",
        borderRadius: 6,
        textDecoration: "none",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 500,
        color: active ? "var(--color-ink)" : "var(--color-ink3)",
        background: active ? "var(--color-card)" : "transparent",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
        border: active ? "0.5px solid var(--color-rule)" : "0.5px solid transparent",
        transition: "all 0.12s",
        whiteSpace: "nowrap",
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
      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
        <NavTab href="/library"  label={s.tabLibrary}  active={isActive("/library")} />
        <NavTabWithClick href="/timeline" label={s.tabTimeline} active={isActive("/timeline")} onClick={() => setFilterChapter(null)} />
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

// Augment NavTab to accept onClick
function NavTabWithClick({ href, label, active, onClick }: { href: string; label: string; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        padding: "4px 12px",
        borderRadius: 6,
        textDecoration: "none",
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 500,
        color: active ? "var(--color-ink)" : "var(--color-ink3)",
        background: active ? "var(--color-card)" : "transparent",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
        border: active ? "0.5px solid var(--color-rule)" : "0.5px solid transparent",
        transition: "all 0.12s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Link>
  );
}
