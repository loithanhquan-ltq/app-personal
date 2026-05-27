"use client";

import { useState, useEffect } from "react";

export function DedicationOverlay() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => dismiss(), 3800);
    return () => clearTimeout(timer);
  }, []);

  function dismiss() {
    setFading(true);
    setTimeout(() => setVisible(false), 700);
  }

  if (!visible) return null;

  const reduced = typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <>
      <style>{`
        @keyframes dedicationFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes dedicationTextIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "rgba(20, 12, 6, 0.92)",
          backdropFilter: "blur(6px)",
          cursor: "pointer",
          opacity: fading ? 0 : 1,
          transition: reduced ? "none" : "opacity 0.7s ease",
          animation: reduced ? "none" : "dedicationFadeIn 0.8s ease forwards",
        }}
      >
        <div style={{
          textAlign: "center",
          animation: reduced ? "none" : "dedicationTextIn 1.1s ease 0.3s both",
        }}>
          <div style={{
            fontFamily: "var(--font-script)",
            fontSize: "clamp(32px, 6vw, 58px)",
            color: "rgba(255, 235, 200, 0.95)",
            lineHeight: 1.3,
            letterSpacing: "0.01em",
            marginBottom: 16,
          }}>
            For you, always.
          </div>
          <div style={{
            fontFamily: "var(--font-hand)",
            fontSize: "clamp(18px, 3vw, 26px)",
            color: "rgba(200, 160, 120, 0.75)",
            letterSpacing: "0.04em",
          }}>
            ♡
          </div>
        </div>
        <div style={{
          position: "absolute",
          bottom: 32,
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "rgba(200,160,120,0.45)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          animation: reduced ? "none" : "dedicationTextIn 1s ease 1.2s both",
        }}>
          tap anywhere to continue
        </div>
      </div>
    </>
  );
}
