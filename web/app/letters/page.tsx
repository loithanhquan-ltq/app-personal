"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 220, damping: 24 } },
};

function RuledLines({ height }: { height: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.offsetWidth;
    canvas.width = w;
    canvas.height = height;
    ctx.strokeStyle = "rgba(140,100,60,0.10)";
    ctx.lineWidth = 0.5;
    for (let y = 33; y < height; y += 33) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }, [height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}

function WaxSeal({ text }: { text: string }) {
  return (
    <div style={{
      position: "absolute",
      top: -14,
      right: -28,
      width: 56,
      height: 56,
      borderRadius: "50%",
      background: "radial-gradient(circle at 30% 30%, #c05a2e, #8b3520, #5a1e0e)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: "rotate(-8deg)",
      boxShadow: "0 3px 12px rgba(100,30,10,0.40)",
      flexShrink: 0,
    }}>
      <span style={{
        fontFamily: "var(--font-script)",
        fontSize: 16,
        color: "rgba(255,235,200,0.90)",
        letterSpacing: "0.02em",
      }}>
        {text}
      </span>
    </div>
  );
}

function LetterCard({ letter, index, waxText }: { letter: { id: string; date: string; occasion: string; salutation: string; body: string; signature: string; signedName: string }; index: number; waxText: string }) {
  const tilt = index % 2 === 0 ? -0.4 : 0.5;
  const bodyParagraphs = letter.body.split("\n\n");
  const estHeight = 120 + bodyParagraphs.length * 80;

  return (
    <div style={{
      maxWidth: 560,
      margin: "0 auto",
      transform: `rotate(${tilt}deg)`,
      position: "relative",
    }}>
      <div style={{
        background: `linear-gradient(180deg, var(--color-paper-cream1) 0%, var(--color-paper-cream2) 100%)`,
        borderRadius: 4,
        padding: "36px 40px 40px",
        boxShadow: "0 18px 40px -8px rgba(80,55,30,0.25), 0 4px 8px rgba(80,55,30,0.10)",
        position: "relative",
        overflow: "hidden",
        minHeight: estHeight,
      }}>
        <RuledLines height={estHeight} />
        <WaxSeal text={waxText} />

        {/* Occasion */}
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(100,70,40,0.6)",
          marginBottom: 20,
        }}>
          {letter.date} · {letter.occasion}
        </div>

        {/* Salutation */}
        <div style={{
          fontFamily: "var(--font-hand)",
          fontSize: 22,
          color: "var(--color-ink-brown)",
          marginBottom: 20,
          lineHeight: 1.4,
        }}>
          {letter.salutation}
        </div>

        {/* Body */}
        <div style={{ marginBottom: 28 }}>
          {bodyParagraphs.map((p, i) => (
            <p key={i} style={{
              fontFamily: "var(--font-hand)",
              fontSize: 18,
              color: "var(--color-ink-brown)",
              lineHeight: 2.0,
              margin: i > 0 ? "16px 0 0" : "0",
            }}>
              {p}
            </p>
          ))}
        </div>

        {/* Signature */}
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontFamily: "var(--font-hand)",
            fontSize: 18,
            color: "var(--color-ink-brown)",
            marginBottom: 4,
          }}>
            {letter.signature}
          </div>
          <div style={{
            fontFamily: "var(--font-script)",
            fontSize: 26,
            color: "var(--color-ink-brown)",
          }}>
            {letter.signedName}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LettersPage() {
  const content = useAppStore((s) => s.content);
  const s = content.strings;
  const reduced = useReducedMotion();

  return (
    <div style={{
      minHeight: "100%",
      background: `linear-gradient(180deg, var(--color-wood-dark) 0%, var(--color-wood-light) 100%)`,
    }}>
      <div className="page-root" style={{ maxWidth: 680, margin: "0 auto", padding: "36px 36px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(80,55,30,0.65)",
            marginBottom: 10,
          }}>
            {s.lettersEyebrow(content.letters.length)}
          </div>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: 44,
            fontStyle: "italic",
            fontWeight: 600,
            color: "rgba(40,20,10,0.85)",
            margin: "0 0 10px",
            letterSpacing: "-0.02em",
          }}>
            {s.lettersHeadline}
          </h1>
          <p style={{
            fontFamily: "var(--font-serif)",
            fontSize: 15,
            fontStyle: "italic",
            color: "rgba(80,55,30,0.75)",
            margin: 0,
            maxWidth: 440,
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            {s.lettersSubtitle}
          </p>
        </div>

        {/* Letters */}
        <motion.div
          variants={reduced ? undefined : containerVariants}
          initial={reduced ? undefined : "hidden"}
          animate={reduced ? undefined : "show"}
          style={{ display: "flex", flexDirection: "column", gap: 48 }}
        >
          {content.letters.map((letter, i) => (
            <motion.div key={letter.id} variants={reduced ? undefined : cardVariants}>
              <LetterCard letter={letter} index={i} waxText={s.waxSeal} />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}
