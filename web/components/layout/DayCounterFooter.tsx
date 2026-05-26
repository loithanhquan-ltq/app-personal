"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { daysSinceStart } from "@/lib/dateUtils";

export function DayCounterFooter() {
  const content = useAppStore((s) => s.content);
  const githubToken = useAppStore((s) => s.githubToken);
  const setShowGitHubSetup = useAppStore((s) => s.setShowGitHubSetup);
  const disconnectGithub = useAppStore((s) => s.disconnectGithub);
  const [days, setDays] = useState(0);

  useEffect(() => {
    setDays(daysSinceStart());
    const id = setInterval(() => setDays(daysSinceStart()), 60000);
    return () => clearInterval(id);
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
