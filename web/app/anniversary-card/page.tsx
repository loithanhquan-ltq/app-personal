"use client";

import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { CardCanvas } from "@/components/anniversary/CardCanvas";
import { daysSinceStart } from "@/lib/dateUtils";
import type { CardTemplate } from "@/lib/cardRender";

const PAD = 36;
const MAX_W = 900;

export default function AnniversaryCardPage() {
  const content = useAppStore((s) => s.content);
  const photos = useAppStore((s) => s.photos);
  const s = content.strings;
  const { memories } = content;
  const dayCount = daysSinceStart();

  const [selectedId, setSelectedId] = useState<string>(memories[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [template, setTemplate] = useState<CardTemplate>("minimal");
  const blobRef = useRef<Blob | null>(null);

  const selectedMem = memories.find((m) => m.id === selectedId);
  const photoUrl = selectedMem ? (photos[`hero-${selectedMem.id}`] ?? "") : "";

  const cardOpts = {
    photoUrl,
    title: selectedMem?.title ?? "",
    date: selectedMem?.date ?? "",
    dayCount,
    message,
    template,
  };

  const handleRendered = useCallback((blob: Blob) => {
    blobRef.current = blob;
  }, []);

  function download() {
    if (!blobRef.current) return;
    const url = URL.createObjectURL(blobRef.current);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anniversary-${selectedId}-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const TEMPLATES: { key: CardTemplate; label: string }[] = [
    { key: "minimal", label: s.cardTemplateMinimal },
    { key: "photo-heavy", label: s.cardTemplatePhotoHeavy },
    { key: "quote-centered", label: s.cardTemplateQuote },
  ];

  return (
    <div className="page-root" style={{ maxWidth: MAX_W, margin: "0 auto", padding: `14px ${PAD}px 80px` }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 10 }}>
          day {dayCount.toLocaleString()}
        </div>
        <h1 style={{
          fontFamily: "var(--font-serif)", fontSize: "clamp(28px, 4vw, 44px)", fontStyle: "italic",
          fontWeight: 600, color: "var(--color-ink)", margin: 0, letterSpacing: "-0.03em",
        }}>
          {s.sideAnniversaryCard}
        </h1>
      </motion.div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 32 }} className="mob-1">
        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Memory picker */}
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink3)", display: "block", marginBottom: 8 }}>
              {s.cardPickMemory}
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8,
                border: "0.5px solid var(--color-rule)", background: "var(--color-card)",
                fontFamily: "var(--font-serif)", fontSize: 14, fontStyle: "italic",
                color: "var(--color-ink)", cursor: "pointer",
              }}
            >
              {memories.map((m) => (
                <option key={m.id} value={m.id}>{m.title} — {m.date}</option>
              ))}
            </select>
          </div>

          {/* Template */}
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink3)", marginBottom: 8 }}>
              {s.cardPreview}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {TEMPLATES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setTemplate(key)}
                  style={{
                    flex: 1, padding: "8px 0", borderRadius: 8, border: "0.5px solid var(--color-rule)",
                    background: template === key ? "rgba(164,74,42,0.09)" : "var(--color-card)",
                    color: template === key ? "var(--color-accent)" : "var(--color-ink2)",
                    fontFamily: "var(--font-sans)", fontSize: 12, cursor: "pointer",
                    fontWeight: template === key ? 600 : 400,
                    borderColor: template === key ? "var(--color-accent)" : "var(--color-rule)",
                    transition: "all 0.12s",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-ink3)", display: "block", marginBottom: 8 }}>
              {s.cardCustomMessage}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={s.cardPlaceholder}
              rows={4}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8,
                border: "0.5px solid var(--color-rule)", background: "var(--color-card)",
                fontFamily: "var(--font-serif)", fontSize: 15, fontStyle: "italic",
                color: "var(--color-ink)", resize: "vertical", boxSizing: "border-box",
              }}
            />
          </div>

          {/* Download */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={download}
            style={{
              padding: "12px 24px", borderRadius: 10, border: "none",
              background: "var(--color-accent)", color: "#fff",
              fontFamily: "var(--font-serif)", fontSize: 16, fontStyle: "italic", fontWeight: 600,
              cursor: "pointer", letterSpacing: "-0.01em",
            }}
          >
            {s.cardDownload}
          </motion.button>
        </div>

        {/* Preview */}
        <div style={{ position: "sticky", top: 20, height: "fit-content" }}>
          <CardCanvas opts={cardOpts} onRendered={handleRendered} />
        </div>
      </div>
    </div>
  );
}
