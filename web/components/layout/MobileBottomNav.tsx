"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import type { Language } from "@/data";

const LANGS: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "vi", label: "VI" },
];

export function MobileBottomNav() {
  const pathname   = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const content            = useAppStore((s) => s.content);
  const language           = useAppStore((s) => s.language);
  const setLanguage        = useAppStore((s) => s.setLanguage);
  const setFilterChapter   = useAppStore((s) => s.setFilterChapter);
  const githubToken        = useAppStore((s) => s.githubToken);
  const setShowGitHubSetup = useAppStore((s) => s.setShowGitHubSetup);
  const disconnectGithub   = useAppStore((s) => s.disconnectGithub);
  const s = content.strings;

  function isActive(href: string) {
    return pathname === href || pathname === `/app-personal${href}`;
  }

  const anyMoreActive = ["/people", "/stats", "/anniversary-card", "/anniversary"].some(isActive);

  // Close drawer when navigating
  useEffect(() => { setMoreOpen(false); }, [pathname]);

  // Trap scroll when drawer is open
  useEffect(() => {
    if (moreOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [moreOpen]);

  const MAIN_ITEMS = [
    { href: "/library",  label: s.tabLibrary  ?? "Library"  },
    { href: "/timeline", label: s.tabTimeline ?? "Timeline" },
    { href: "/letters",  label: s.tabLetters  ?? "Letters"  },
    { href: "/atlas",    label: s.tabAtlas    ?? "Atlas"    },
  ];

  const MORE_ITEMS = [
    { href: "/people",           label: s.sideEveryone          ?? "People"           },
    { href: "/stats",            label: s.sideStats             ?? "Stats"            },
    { href: "/anniversary",      label: s.sideAnniversary       ?? "Anniversary"      },
    { href: "/anniversary-card", label: s.sideAnniversaryCard   ?? "Anniversary Card" },
    ...(githubToken ? [{ href: "/add-memory", label: `+ ${s.newMemory ?? "New Memory"}` }] : []),
  ];

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────── */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMoreOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(20,12,6,0.3)",
              zIndex: 58,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── "More" drawer ────────────────────────────────────── */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            key="drawer"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 38, restDelta: 0.5 }}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: "calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px))",
              zIndex: 59,
              background: "var(--color-bg)",
              borderRadius: "18px 18px 0 0",
              borderTop: "1px solid var(--color-rule)",
              paddingTop: 20,
              boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
            }}
          >
            {/* Drag handle */}
            <div style={{
              position: "absolute",
              top: 8,
              left: "50%",
              transform: "translateX(-50%)",
              width: 36,
              height: 4,
              borderRadius: 2,
              background: "rgba(0,0,0,0.14)",
            }} />

            {/* Nav links */}
            <div style={{ padding: "4px 12px 12px" }}>
              {MORE_ITEMS.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      display: "block",
                      padding: "14px 12px",
                      borderRadius: 10,
                      textDecoration: "none",
                      fontFamily: "var(--font-serif)",
                      fontSize: 17,
                      fontStyle: "italic",
                      fontWeight: active ? 600 : 500,
                      color: active ? "var(--color-accent)" : "var(--color-ink)",
                      background: active ? "rgba(164,74,42,0.07)" : "transparent",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div style={{ height: "0.5px", background: "var(--color-rule)", margin: "0 12px 16px" }} />

            {/* Language + GitHub row */}
            <div style={{ padding: "0 12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-ink3)",
                marginRight: 4,
                flexShrink: 0,
              }}>
                Lang
              </span>
              {LANGS.map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => { setLanguage(code); }}
                  style={{
                    minWidth: 52,
                    minHeight: 44,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid",
                    borderColor: language === code ? "var(--color-accent)" : "var(--color-rule)",
                    background: language === code ? "rgba(164,74,42,0.08)" : "var(--color-card)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: language === code ? "var(--color-accent)" : "var(--color-ink3)",
                    cursor: "pointer",
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <button
                onClick={() => { githubToken ? disconnectGithub() : setShowGitHubSetup(true); }}
                style={{
                  minHeight: 44,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "0.5px solid var(--color-rule)",
                  background: "var(--color-card)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  color: githubToken ? "var(--color-accent2)" : "var(--color-ink3)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {githubToken ? "☁ Synced" : "☁ Connect"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom tab bar ───────────────────────────────────── */}
      <nav
        className="mobile-bottom-nav"
        aria-label="Main navigation"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          display: "none", // shown via CSS on mobile only
          alignItems: "stretch",
          height: "calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
          borderTop: "1px solid var(--color-rule)",
          background: "rgba(247, 243, 236, 0.96)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {MAIN_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => { if (item.href === "/timeline") setFilterChapter(null); }}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                padding: "10px 4px",
                gap: 0,
                color: active ? "var(--color-accent)" : "var(--color-ink3)",
                position: "relative",
                minHeight: 44,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {/* Active top indicator — animated with layoutId */}
              {active && (
                <motion.div
                  layoutId="bottom-tab-indicator"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: "20%",
                    right: "20%",
                    height: 2,
                    borderRadius: "0 0 2px 2px",
                    background: "var(--color-accent)",
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 38 }}
                />
              )}
              <span style={{
                fontFamily: "var(--font-serif)",
                fontSize: 12,
                fontStyle: "italic",
                fontWeight: active ? 600 : 500,
                letterSpacing: "0.01em",
                lineHeight: 1,
              }}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={() => setMoreOpen((o) => !o)}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "10px 4px",
            color: anyMoreActive || moreOpen ? "var(--color-accent)" : "var(--color-ink3)",
            minHeight: 44,
            WebkitTapHighlightColor: "transparent",
            gap: 0,
          }}
          aria-expanded={moreOpen}
          aria-label="More navigation options"
        >
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: 12,
            fontStyle: "italic",
            fontWeight: anyMoreActive || moreOpen ? 600 : 500,
            letterSpacing: "0.01em",
            lineHeight: 1,
          }}>
            More
          </span>
        </button>
      </nav>
    </>
  );
}
