"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

const EMOJIS = [
  { key: "heart", glyph: "♥" },
  { key: "happy", glyph: "🥰" },
  { key: "laugh", glyph: "😂" },
  { key: "blossom", glyph: "🌸" },
];

const LOCAL_KEY = (memId: string) => `reactions-local-${memId}`;

export function ReactionBar({ memId }: { memId: string }) {
  const reactions = useAppStore((s) => s.reactions);
  const addReaction = useAppStore((s) => s.addReaction);
  const githubToken = useAppStore((s) => s.githubToken);
  const content = useAppStore((s) => s.content);
  const s = content.strings;

  // local reactions (for anonymous viewers) keyed by emoji
  const [localReactions, setLocalReactions] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_KEY(memId));
      if (stored) setLocalReactions(JSON.parse(stored));
    } catch { /* */ }
  }, [memId]);

  function handleReact(emoji: string) {
    if (githubToken) {
      addReaction(memId, emoji);
    } else {
      const updated = { ...localReactions, [emoji]: (localReactions[emoji] ?? 0) + 1 };
      setLocalReactions(updated);
      try { localStorage.setItem(LOCAL_KEY(memId), JSON.stringify(updated)); } catch { /* */ }
    }
  }

  const remoteMemReactions = reactions[memId] ?? {};
  const isAnon = !githubToken;

  return (
    <div style={{ marginTop: 28, marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        {EMOJIS.map(({ key, glyph }) => {
          const remoteCount = remoteMemReactions[key] ?? 0;
          const localCount = localReactions[key] ?? 0;
          const count = isAnon ? localCount : remoteCount;
          const hasReacted = isAnon ? localCount > 0 : false;

          return (
            <motion.button
              key={key}
              onClick={() => handleReact(key)}
              whileTap={{ scale: 0.82 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              title={hasReacted ? "Your reaction" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "6px 12px",
                borderRadius: 20,
                border: "0.5px solid var(--color-rule)",
                background: hasReacted ? "rgba(164,74,42,0.08)" : "var(--color-card)",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: "var(--color-ink2)",
                opacity: isAnon && !hasReacted ? 0.75 : 1,
                transition: "background 0.12s, opacity 0.12s",
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>{glyph}</span>
              {count > 0 && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: count > 0 ? "var(--color-accent)" : "var(--color-ink3)" }}>
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      {isAnon && (
        <div style={{
          marginTop: 8,
          fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--color-ink3)",
          letterSpacing: "0.04em",
        }}>
          {s.reactionConnectPrompt}
        </div>
      )}
    </div>
  );
}
