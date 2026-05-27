# CSS 3D Page Flip — Implementation Plan

**Replaces:** WebGL book intro (`BookScene`, `PageMesh`, `curlShader`, `BookCover`, `PageStack`, `composePageTexture`)  
**With:** Pure CSS 3D + Framer Motion page flip (`CSSBookFlip.tsx`)  
**Reader audience:** Engineer or AI agent picking up this task cold.

---

## 1. Why this change

The WebGL implementation (`three` + `@react-three/fiber` + `@react-three/drei`) costs ~700KB of bundle for a single one-time intro animation. It causes shader-compile jank on first render, drains battery on mobile, and contains GLSL code that is hard to maintain. The physical vertex-curl shader is the one unique capability WebGL provides here — but a CSS 3D card flip delivers 95% of the emotional impact at a fraction of the cost.

**What we keep:** The `BookIntro.tsx` state machine, `PageFront` component, `PageDots` component, and all Framer Motion patterns are unchanged.  
**What we lose:** The vertex-deformation curl. The page flip becomes a flat card rotation, not a curved surface.

---

## 2. Visual design of the replacement

```
Dark overlay (#1a1108)

          "Our album"  (mono, small caps)

  ┌────┐  ┌─────────────────┐  ┌────┐
  │    │  │                 │  │    │
  │left│  │   photo (72%)   │  │rgt │   ← page stacks (CSS, no animation)
  │stk │  │                 │  │stk │
  │    │  │ Jun 14, 2023    │  │    │
  └────┘  │ *Our first      │  └────┘
          │  morning*       │
          └─────────────────┘
          [spine: left edge, pivot here]

          ● ● ○ ○ ○ ○ ○ ○    ← PageDots (unchanged)

               Skip · Esc
```

**The flip:** The page rotates around its left edge (`transformOrigin: "left center"`). The outgoing page flips from `rotateY: 0°` → `-180°`, revealing the warm gradient back face at `90°`. Meanwhile the incoming page sits static underneath, visible as the outgoing card lifts away.

**Spine shadow:** A CSS gradient overlay on the incoming page fades in as the outgoing page rises, simulating the shadow the current WebGL fragment shader computes.

**Closing:** When `phase === "closing"`, the entire book container scales down and fades to opacity 0 over 800ms, then calls `onClosed`.

---

## 3. Component architecture

```
CSSBookFlip.tsx
  └── <div> (container, perspective: 1400px)
        └── <div> (book stage, display: flex, align-items: center, gap: 0)
              ├── <PageStack side="left" count={flippedCount} />   (pure CSS)
              ├── <div> (page scene, position: relative)
              │     ├── <div> (incoming page, static, always behind)
              │     │     └── <PageFront page={pages[flipIdx + 1]} />
              │     ├── <motion.div> (shadow overlay, opacity tracks flip)
              │     └── <motion.div> (flip card, rotateY: 0 → -180)
              │           ├── <div> (front face, backfaceVisibility: hidden)
              │           │     └── <PageFront page={pages[flipIdx]} />
              │           └── <div> (back face, rotateY: 180deg, hidden)
              │                 └── <PageBack /> (warm gradient)
              └── <PageStack side="right" count={remainingCount} />  (pure CSS)
```

---

## 4. File structure after change

### Create
- `web/components/intro/CSSBookFlip.tsx`  ← new component (see §6)

### Modify
- `web/components/intro/BookIntro.tsx`  ← swap `BookScene` import for `CSSBookFlip` (see §7)
- `web/package.json`  ← remove three deps (see §8)

### Delete
- `web/components/intro/BookScene.tsx`
- `web/components/intro/PageMesh.tsx`
- `web/components/intro/curlShader.ts`
- `web/components/intro/BookCover.tsx`
- `web/components/intro/PageStack.tsx`
- `web/components/intro/composePageTexture.ts`

---

## 5. Constants and sizing

Match existing timing exactly:

```ts
const FLIP_MS = 500;      // duration of rotateY 0 → -180
const HOLD_MS = 200;      // pause before next flip starts
const CLOSE_MS = 800;     // book container scale-out on closing phase
const CLOSE_HOLD_MS = 200; // wait after scale-out before calling onClosed

// Page card dimensions (same proportions as existing PageFront fallback)
// PAGE_W × PAGE_H ≈ 1.6 : 2.1 aspect ratio
const CARD_W = "min(46vw, 300px)";
const CARD_H = "min(62vh, 495px)";  // or use aspect-ratio: 1.6 / 2.1
```

---

## 6. Full component code — `CSSBookFlip.tsx`

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Page {
  id: string;
  title: string;
  date: string;
  photoUrl?: string;
}

interface CSSBookFlipProps {
  pages: Page[];
  currentIdx: number;   // kept in sync for PageDots in parent; not used internally
  phase: string;
  onAdvance: () => void;
  onFinishedFlipping: () => void;
  onClosed: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FLIP_MS   = 500;
const HOLD_MS   = 200;
const CLOSE_MS  = 800;
const CLOSE_HOLD_MS = 200;
const EASE: [number, number, number, number] = [0.42, 0, 0.58, 1]; // cubic in-out

// ─── Main component ───────────────────────────────────────────────────────────

export function CSSBookFlip({
  pages,
  phase,
  onAdvance,
  onFinishedFlipping,
  onClosed,
}: CSSBookFlipProps) {
  // Index of the page currently on top (the "outgoing" card)
  const [flipIdx, setFlipIdx] = useState(0);

  // Framer Motion value driving the flip card rotation
  const rotateY = useMotionValue(0);

  // Shadow opacity peaks at 90° (rotateY = -90)
  const shadowOpacity = useTransform(rotateY, [-180, -90, 0], [0, 0.28, 0]);

  // Stable refs for callbacks (avoid effect re-runs)
  const onAdvanceRef       = useRef(onAdvance);
  const onFinishedRef      = useRef(onFinishedFlipping);
  const onClosedRef        = useRef(onClosed);
  useEffect(() => { onAdvanceRef.current = onAdvance; },         [onAdvance]);
  useEffect(() => { onFinishedRef.current = onFinishedFlipping; },[onFinishedFlipping]);
  useEffect(() => { onClosedRef.current = onClosed; },           [onClosed]);

  const containerRef = useRef<HTMLDivElement>(null);

  // ── Playing phase: drive the flip sequence ──
  useEffect(() => {
    if (phase !== "playing" || pages.length === 0) return;

    let cancelled = false;

    const runSequence = async () => {
      let localIdx = 0;

      while (localIdx < pages.length && !cancelled) {
        // Animate the flip card from 0° → -180°
        await animate(rotateY, -180, {
          duration: FLIP_MS / 1000,
          ease: EASE,
        });
        if (cancelled) return;

        // Hold at fully flipped position
        await new Promise<void>((r) => setTimeout(r, HOLD_MS));
        if (cancelled) return;

        // Advance: show next page, reset card instantly
        localIdx++;
        rotateY.set(0);
        setFlipIdx(localIdx);
        onAdvanceRef.current();

        if (localIdx >= pages.length) {
          onFinishedRef.current();
          return;
        }

        // Tiny gap so React can paint the new page before the next flip starts
        await new Promise<void>((r) => setTimeout(r, 16));
      }
    };

    runSequence();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, pages.length]);

  // ── Closing phase: scale-out the container ──
  useEffect(() => {
    if (phase !== "closing" || !containerRef.current) return;
    animate(
      containerRef.current,
      { opacity: 0, scale: 0.94 },
      { duration: CLOSE_MS / 1000, ease: EASE }
    );
    const t = setTimeout(() => onClosedRef.current(), CLOSE_MS + CLOSE_HOLD_MS);
    return () => clearTimeout(t);
  }, [phase]);

  const outgoingPage = pages[flipIdx] ?? null;
  const incomingPage = pages[flipIdx + 1] ?? null;
  const flippedCount = flipIdx;
  const remainingCount = Math.max(0, pages.length - 1 - flipIdx);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        perspective: "1400px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      {/* Book stage */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          width: "min(86vw, 560px)",
          height: "min(65vh, 520px)",
          justifyContent: "center",
        }}
      >
        {/* Left stack (pages already flipped) */}
        <PageStack count={flippedCount} side="left" />

        {/* Page scene */}
        <div
          style={{
            position: "relative",
            width: "min(46vw, 280px)",
            height: "min(62vh, 490px)",
            flexShrink: 0,
          }}
        >
          {/* Incoming page — static, sits underneath */}
          {incomingPage && (
            <div style={{ position: "absolute", inset: 0 }}>
              <PageFront page={incomingPage} />
            </div>
          )}

          {/* Spine shadow overlay — fades in as outgoing page lifts */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 35%)",
              pointerEvents: "none",
              zIndex: 5,
              opacity: shadowOpacity,
            }}
          />

          {/* Flip card (outgoing page) */}
          {outgoingPage && (
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                transformStyle: "preserve-3d",
                transformOrigin: "left center",
                rotateY,
                zIndex: 10,
              }}
            >
              {/* Front face */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                <PageFront page={outgoingPage} />
              </div>

              {/* Back face — warm gradient, mirrored */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <PageBack />
              </div>
            </motion.div>
          )}
        </div>

        {/* Right stack (pages remaining) */}
        <PageStack count={remainingCount} side="right" />
      </div>
    </div>
  );
}

// ─── Page stacks ──────────────────────────────────────────────────────────────

function PageStack({ count, side }: { count: number; side: "left" | "right" }) {
  const visible = Math.min(count, 5); // max 5 visible layers
  if (visible === 0) return <div style={{ width: 10 }} />;

  return (
    <div
      style={{
        position: "relative",
        width: Math.max(6, visible * 2.5),
        height: "min(62vh, 490px)",
        flexShrink: 0,
        alignSelf: "stretch",
      }}
    >
      {Array.from({ length: visible }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 1 + i * 0.5,
            bottom: 1 + i * 0.5,
            [side === "left" ? "left" : "right"]: 0,
            width: 8,
            background: i === 0 ? "#e8d9c0" : `hsl(${30 + i * 3}, ${28 - i * 2}%, ${80 - i * 2}%)`,
            borderRadius: side === "left" ? "0 2px 2px 0" : "2px 0 0 2px",
            boxShadow:
              side === "left"
                ? "2px 0 4px rgba(0,0,0,0.18)"
                : "-2px 0 4px rgba(0,0,0,0.18)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Page front face (reuses same markup as the reduced-motion fallback) ──────

function PageFront({ page }: { page: Page }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "var(--color-paper-cream1)",
        borderRadius: 4,
        boxShadow:
          "0 18px 40px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.05)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Photo area — 72% */}
      <div style={{ height: "72%", overflow: "hidden", borderRadius: "4px 4px 0 0" }}>
        {page.photoUrl ? (
          <img
            src={page.photoUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "linear-gradient(160deg, #e8d8c0 0%, #cebfa0 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              color: "rgba(164,74,42,0.2)",
            }}
          >
            ♡
          </div>
        )}
      </div>

      {/* Metadata */}
      <div
        style={{
          padding: "14px 18px 18px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-ink3)",
            marginBottom: 6,
          }}
        >
          {page.date}
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: 20,
            fontWeight: 600,
            fontStyle: "italic",
            color: "var(--color-ink)",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          {page.title}
        </div>
      </div>
    </div>
  );
}

// ─── Page back face ───────────────────────────────────────────────────────────

function PageBack() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(160deg, #f0e4cc 0%, #d4b898 50%, #c9a87c 100%)",
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 48,
          color: "rgba(164,74,42,0.15)",
          fontFamily: "var(--font-serif)",
          userSelect: "none",
        }}
      >
        ♡
      </div>
    </div>
  );
}
```

---

## 7. Changes to `BookIntro.tsx`

The only change needed is swapping `BookScene` for `CSSBookFlip`. The state machine, `PageDots`, `PageFront` (reduced-motion fallback), and `skip` logic are all identical.

**Diff:**

```diff
- const BookScene = dynamic(
-   () => import("./BookScene").then((m) => m.BookScene),
-   { ssr: false }
- );
+ import { CSSBookFlip } from "./CSSBookFlip";
```

```diff
- {mounted && displayPages.length > 0 && !reduced && (
-   <>
-     <BookScene
-       pages={displayPages}
-       currentIdx={currentIdx}
-       phase={phase}
-       onAdvance={() => setCurrentIdx((i) => i + 1)}
-       onFinishedFlipping={() => setPhase("closing")}
-       onClosed={() => setPhase("fading")}
-     />
-     <PageDots total={displayPages.length} current={currentIdx} />
-   </>
- )}
+ {mounted && displayPages.length > 0 && !reduced && (
+   <>
+     <CSSBookFlip
+       pages={displayPages}
+       currentIdx={currentIdx}
+       phase={phase}
+       onAdvance={() => setCurrentIdx((i) => i + 1)}
+       onFinishedFlipping={() => setPhase("closing")}
+       onClosed={() => setPhase("fading")}
+     />
+     <PageDots total={displayPages.length} current={currentIdx} />
+   </>
+ )}
```

Note: `dynamic()` is no longer needed for `CSSBookFlip` since it has no WebGL/canvas. Remove the `dynamic` import if it's only used for `BookScene`.

---

## 8. Remove WebGL dependencies

```bash
cd web
npm uninstall three @react-three/fiber @react-three/drei
```

Also remove from `devDependencies`:
```bash
npm uninstall @types/three
```

---

## 9. Delete WebGL files

```bash
cd web/components/intro
rm BookScene.tsx PageMesh.tsx curlShader.ts BookCover.tsx PageStack.tsx composePageTexture.ts
```

---

## 10. Known edge cases

| Case | Handling |
|---|---|
| 0 pages | `BookIntro` already guards: calls `dismissIntro()` immediately |
| 1 page | Loop runs once, `onFinishedFlipping` called after single flip |
| `phase` changes to `"fading"` mid-flip (skip pressed) | Cancels sequence via `cancelled = true` ref; `BookIntro` handles fade |
| `prefers-reduced-motion` | `BookIntro` already renders the CSS crossfade fallback — `CSSBookFlip` not mounted |
| iOS Safari `backface-visibility` | `-webkit-backface-visibility: hidden` included on both faces |
| Fast React re-renders (Strict Mode) | `cancelled = true` cleanup prevents double animation sequences |

---

## 11. Verification checklist

1. `cd web && npm run dev` → open `http://localhost:3000`
2. **Normal flow**: intro plays, each page flips with CSS 3D, dots advance, app reveals after last page
3. **Skip**: press Esc or click "Skip · Esc" → intro fades immediately
4. **Reduced motion**: in DevTools → Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce` → crossfade fallback plays (no flip card rendered)
5. **Mobile**: DevTools CPU throttle 6× → flip should be smooth (no jank from WebGL init)
6. **1 page**: test with a single-memory dataset → single flip, then app reveals
7. **Build**: `npm run build` completes without Three.js import errors
8. **Bundle**: `npx @next/bundle-analyzer` (optional) — `three` chunk should be absent

---

## 12. Design notes / future enhancements

- **Flip direction**: Currently flips left (rotateY 0 → -180, spine on left). Could be reversed for RTL layouts.
- **Swipe to skip page**: Add `onPanEnd` to the flip card for manual swipe gestures.
- **Sound**: A subtle paper-rustle audio cue could be added on `animate` start.
- **Book cover**: Removed in this version. Could add a CSS-only cover (a dark brown div that rotates open at the start, closes at the end) using the same `rotateY` + `transformOrigin: "left center"` pattern.
- **Page curl approximation**: Webkit's `-webkit-transform` with `skew` can add a subtle non-linear feel to the flat flip if desired later.
