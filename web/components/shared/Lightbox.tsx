"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  urls: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Lightbox({ urls, index, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      <motion.div
        key="lightbox"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "rgba(10,5,2,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {/* Prev */}
        {index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            style={navBtn("left")}
            aria-label="Previous photo"
          >‹</button>
        )}

        {/* Image */}
        <motion.img
          key={index}
          src={urls[index]}
          alt=""
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "90vw", maxHeight: "88vh",
            objectFit: "contain", borderRadius: 8,
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          }}
        />

        {/* Next */}
        {index < urls.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            style={navBtn("right")}
            aria-label="Next photo"
          >›</button>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 8,
            color: "#fff", fontSize: 20, cursor: "pointer", padding: "6px 12px",
            fontFamily: "var(--font-sans)", lineHeight: 1,
            minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center",
          }}
          aria-label="Close"
        >✕</button>

        {/* Counter */}
        {urls.length > 1 && (
          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.55)",
            letterSpacing: "0.08em",
          }}>
            {index + 1} / {urls.length}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function navBtn(side: "left" | "right"): React.CSSProperties {
  return {
    position: "absolute",
    [side]: 16,
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.12)",
    border: "none",
    borderRadius: 8,
    color: "#fff",
    fontSize: 32,
    cursor: "pointer",
    padding: "4px 14px",
    minWidth: 44,
    minHeight: 44,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    lineHeight: 1,
  };
}
