"use client";

import { useAppStore } from "@/store/useAppStore";
import { AnimatePresence, motion } from "framer-motion";

export function Toast() {
  const toast = useAppStore((s) => s.toast);

  return (
    <div style={{
      position: "fixed",
      top: 16,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      pointerEvents: "none",
    }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 10,
              background: "var(--color-card)",
              border: "0.5px solid var(--color-rule)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--color-ink)",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: "var(--color-accent)", fontSize: 13 }}>✓</span>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
