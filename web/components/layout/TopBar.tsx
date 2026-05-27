"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Language } from "@/data";

// ─── Desktop nav tab ──────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export function TopBar() {
  const pathname         = usePathname();
  const router           = useRouter();
  const content          = useAppStore((s) => s.content);
  const language         = useAppStore((s) => s.language);
  const setLanguage      = useAppStore((s) => s.setLanguage);
  const setFilterChapter = useAppStore((s) => s.setFilterChapter);
  const query            = useAppStore((s) => s.query);
  const setQuery         = useAppStore((s) => s.setQuery);
  const s                = content.strings;

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef  = useRef<HTMLInputElement>(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  function isActive(path: string) {
    return pathname === `/app-personal${path}` || pathname === path;
  }

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    if (v.trim()) router.push("/search");
  }

  function openMobileSearch() {
    setMobileSearchOpen(true);
    // Focus after animation frame so the element exists
    requestAnimationFrame(() => mobileInputRef.current?.focus());
  }

  function closeMobileSearch() {
    setMobileSearchOpen(false);
    setQuery("");
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
      position: "relative", // needed for mobile search overlay
    }}>

      {/* ── Desktop: nav tabs ── */}
      <div className="topbar-nav topbar-desktop" style={{ display: "flex", gap: 2, alignItems: "center" }}>
        <NavTab href="/library"  label={s.tabLibrary}  active={isActive("/library")} />
        <NavTab href="/timeline" label={s.tabTimeline} active={isActive("/timeline")} onClick={() => setFilterChapter(null)} />
        <NavTab href="/letters"  label={s.tabLetters}  active={isActive("/letters")} />
        <NavTab href="/atlas"    label={s.tabAtlas}    active={isActive("/atlas")} />
        <NavTab href="/people"   label={s.tabPeople}   active={isActive("/people")} />
      </div>

      {/* ── Desktop: spacer ── */}
      <div className="topbar-desktop" style={{ flex: 1 }} />

      {/* ── Desktop: search input ── */}
      <div className="topbar-desktop" style={{ position: "relative" }}>
        <input
          ref={desktopInputRef}
          value={query}
          onChange={handleSearch}
          onKeyDown={(e) => {
            if (e.key === "Escape") { setQuery(""); desktopInputRef.current?.blur(); }
          }}
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

      {/* ── Desktop: language switcher ── */}
      <div className="topbar-desktop" style={{ display: "flex", gap: 2 }}>
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

      {/* ─────────────────────────────────────────────────────── */}
      {/* ── Mobile: wordmark ── */}
      <div
        className="topbar-mobile"
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: 17,
          fontStyle: "italic",
          fontWeight: 600,
          color: "var(--color-ink)",
          letterSpacing: "-0.03em",
          lineHeight: 1,
          alignItems: "center",
          gap: 4,
        }}
      >
        {s.wordmark}
        <span style={{ color: "var(--color-accent)", marginLeft: 5, fontSize: 14, fontStyle: "normal" }}>♡</span>
      </div>

      {/* ── Mobile: spacer ── */}
      <div className="topbar-mobile" style={{ flex: 1 }} />

      {/* ── Mobile: search icon button ── */}
      <button
        className="topbar-mobile"
        onClick={openMobileSearch}
        aria-label="Search"
        style={{
          display: "none", // shown via CSS
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          borderRadius: 10,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          color: query ? "var(--color-accent)" : "var(--color-ink3)",
          fontSize: 18,
          WebkitTapHighlightColor: "transparent",
        }}
      >
        ⌕
      </button>

      {/* ── Mobile: expandable search overlay ── */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            key="mobile-search"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 40,
              background: "var(--color-bg)",
              borderBottom: "1px solid var(--color-rule)",
              padding: "10px 12px",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <input
              ref={mobileInputRef}
              value={query}
              onChange={handleSearch}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeMobileSearch();
              }}
              placeholder={s.searchPlaceholder}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid var(--color-rule)",
                background: "var(--color-card)",
                fontFamily: "var(--font-sans)",
                fontSize: 15,
                color: "var(--color-ink)",
                outline: "none",
                minHeight: 44,
              }}
            />
            <button
              onClick={closeMobileSearch}
              style={{
                minWidth: 44,
                minHeight: 44,
                borderRadius: 10,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--color-ink3)",
                padding: "0 8px",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              Done
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
