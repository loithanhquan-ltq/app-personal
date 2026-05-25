"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { daysSinceStart } from "@/lib/dateUtils";

const START_MS = new Date("2022-06-09").getTime();
const END_MS   = new Date("2026-06-09").getTime();

export function DayCounterFooter() {
  const content = useAppStore((s) => s.content);
  const githubToken = useAppStore((s) => s.githubToken);
  const setShowGitHubSetup = useAppStore((s) => s.setShowGitHubSetup);
  const disconnectGithub = useAppStore((s) => s.disconnectGithub);
  const [days, setDays] = useState(0);
  const [animated, setAnimated] = useState(false);

  const reduced = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const progress = Math.min(100, Math.max(0,
    (Date.now() - START_MS) / (END_MS - START_MS) * 100
  ));

  useEffect(() => {
    setDays(daysSinceStart());
    const id = setInterval(() => setDays(daysSinceStart()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 80);
    return () => clearTimeout(t);
  }, []);

  const s = content.strings;

  return (
    <div style={{
      padding: "12px 16px",
      borderTop: "1px solid var(--color-rule)",
      background: "rgba(164, 74, 42, 0.06)",
      flexShrink: 0,
    }}>
      <style>{`
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14% { transform: scale(1.06); }
          28% { transform: scale(1); }
          42% { transform: scale(1.04); }
          56% { transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .day-counter-num { animation: none !important; }
        }
      `}</style>

      {/* Day number */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          className="day-counter-num"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 22,
            fontWeight: 500,
            color: "var(--color-accent)",
            fontStyle: "italic",
            display: "inline-block",
            animation: "heartbeat 3.6s ease-in-out infinite",
            animationDelay: "2s",
          }}
        >
          {days.toLocaleString()}
        </span>
        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          fontWeight: 600,
          color: "var(--color-ink3)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          {s.footerDays}
        </span>
      </div>

      {/* Journey progress bar — directly below the number */}
      <div style={{ marginTop: 10, marginBottom: 8 }}>
        <div style={{ position: "relative", height: 4, borderRadius: 2, background: "rgba(164,74,42,0.12)" }}>
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0,
            width: `${animated ? progress : 0}%`,
            background: "var(--color-accent)",
            borderRadius: 2,
            transition: reduced ? "none" : "width 1.2s cubic-bezier(0.16,1,0.3,1)",
          }} />
          <div style={{
            position: "absolute",
            top: "50%",
            left: `${progress}%`,
            transform: "translate(-50%, -50%)",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--color-accent)",
            boxShadow: "0 0 0 2px var(--color-bg)",
            animation: reduced ? "none" : "heartbeat 3.6s ease-in-out 2s infinite",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          {[2022, 2023, 2024, 2025, 2026].map((y) => (
            <span key={y} style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "var(--color-ink3)",
              letterSpacing: "0.04em",
            }}>
              {y}
            </span>
          ))}
        </div>
      </div>

      {/* Since text */}
      <div style={{
        fontFamily: "var(--font-sans)",
        fontSize: 11,
        color: "var(--color-ink3)",
        marginBottom: 6,
      }}>
        {s.footerSince}
      </div>

      <button
        onClick={() => githubToken ? disconnectGithub() : setShowGitHubSetup(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          color: githubToken ? "var(--color-accent2)" : "var(--color-ink3)",
        }}
        title={githubToken ? "Disconnect GitHub" : "Connect GitHub for photo sync"}
      >
        <span>{githubToken ? "☁ Synced" : "☁ Connect photos"}</span>
      </button>
    </div>
  );
}
