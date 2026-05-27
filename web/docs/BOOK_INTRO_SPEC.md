# Book-Flip Intro Animation — Implementation Spec

**Reader audience:** Engineer or AI agent picking up this task cold. No prior conversation context required.

---

## 1. Overview

The app is a personal love-story archive built in Next.js 16 (with `output: "export"`, `basePath: "/app-personal"`). It has a warm vintage scrapbook aesthetic. On app load, we want to play a cinematic 3D **book-flip intro** that turns through every memory photo in the database — each "page" showing the photo, the memory title, and the memory date — before revealing the main app.

After this intro finishes, the user sees the main app (whatever route they navigated to, default `/library`).

## 2. Goals

- Open the app like opening a physical photo album
- Show **every memory's hero photo** in chronological order, one per page
- Each page has photo + title + date
- Use a **realistic 3D page-turn** (curl + spine), not a flat card flip
- Total duration ≈ **14 seconds** (slow & ceremonial; ~700ms per page × 20 memories)
- **No skip button.** Plays in full on every visit.
- Must respect `prefers-reduced-motion`

## 3. Non-goals

- Not a permanent photo viewer — it's an intro that plays then disappears
- Not interactive (no manual flip / swipe controls in v1)
- Not sound-enabled (no page-turn audio in v1)
- Not configurable per-user (no preferences UI)

## 4. User flow

```
                ┌─────────────────────────────────┐
   App loads ──►│ AppShell mounts; photos sync    │
                │ in background via                │
                │ syncRemotePhotos()              │
                └────────────────┬────────────────┘
                                 │
                ┌────────────────▼─────────────────┐
                │ DedicationOverlay (first visit   │
                │ only — localStorage gated)        │
                │ "For you, always."                │
                └────────────────┬─────────────────┘
                                 │ user taps (or 3.8s timer)
                                 ▼
                ┌──────────────────────────────────┐
                │ BookIntro overlays the app       │
                │  • Wait up to 2s for photos      │
                │  • Then flip through pages 1..N  │
                │  • Each flip: 500ms flip +        │
                │    200ms pause                   │
                │  • After last page, 500ms fade   │
                └────────────────┬─────────────────┘
                                 │ dismissIntro()
                                 ▼
                ┌──────────────────────────────────┐
                │ Main app visible. Intro will     │
                │ replay on next page reload.      │
                └──────────────────────────────────┘
```

**Important:** `DedicationOverlay` uses `localStorage("memories-visited")` and only shows on the first visit. The `BookIntro` plays on **every reload**. On repeat visits, only the book plays.

## 5. Files to create / modify

| Action | File | Purpose |
|---|---|---|
| Create | `web/components/intro/BookIntro.tsx` | The animation component |
| Modify | `web/components/layout/AppShell.tsx` | Render `<BookIntro />`; gate visibility on `introDismissed` store flag |
| Modify | `web/store/useAppStore.ts` | Add `introDismissed: boolean` state + `dismissIntro()` action |

No changes to `web/data/*` or any other files.

## 6. Store changes (`web/store/useAppStore.ts`)

Add to the state shape (next to `showGitHubSetup`):
```ts
introDismissed: boolean;  // in-memory only, not persisted
```

In the initial state:
```ts
introDismissed: false,
```

Add an action:
```ts
dismissIntro: () => set({ introDismissed: true }),
```

**Do not** persist `introDismissed` in the `persist()` middleware partialize — it must reset every load.

## 7. `BookIntro.tsx` — complete component spec

### 7.1. Imports
```ts
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
```

### 7.2. Constants
```ts
const FLIP_MS = 500;            // single page flip duration
const HOLD_MS = 200;            // pause after each flip
const PAGE_MS = FLIP_MS + HOLD_MS;  // 700ms per page
const FADE_OUT_MS = 500;        // intro fade-out at the end
const PHOTO_WAIT_MAX_MS = 2000; // max time to wait for photos before starting
const MIN_PHOTOS_TO_START = 6;  // start once at least this many are loaded
const REDUCED_FLIP_MS = 200;    // for prefers-reduced-motion
```

### 7.3. Data preparation
```ts
const content = useAppStore((s) => s.content);
const photos = useAppStore((s) => s.photos);
const dismissIntro = useAppStore((s) => s.dismissIntro);
const reduced = useReducedMotion();

// Sorted chronologically by sortKey
const pages = useMemo(() => {
  return [...content.memories]
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
    .map((m) => ({
      id: m.id,
      title: m.title,
      date: m.date,
      photoUrl: photos[`hero-${m.id}`],
    }))
    .filter((p) => Boolean(p.photoUrl));
}, [content.memories, photos]);
```

Pages are derived live from the store — as more photos load, `pages` grows. We snapshot the count when we start.

### 7.4. Phased lifecycle (state machine)

```ts
type Phase = "waiting" | "playing" | "fading" | "done";
const [phase, setPhase] = useState<Phase>("waiting");
const [currentIdx, setCurrentIdx] = useState(0);
const startedAtRef = useRef<number>(Date.now());
```

**Waiting phase:** poll `pages.length` on every render. Start when either:
- `pages.length >= MIN_PHOTOS_TO_START`, OR
- `Date.now() - startedAtRef.current >= PHOTO_WAIT_MAX_MS`

Transition to `"playing"` and snapshot `pages` into a ref so it doesn't grow during the animation.

**Playing phase:** `setInterval` every `PAGE_MS` (or `REDUCED_FLIP_MS + 100` for reduced motion). Each tick increments `currentIdx`. When `currentIdx >= pages.length`, clear interval and transition to `"fading"`.

**Fading phase:** wait `FADE_OUT_MS`, then call `dismissIntro()` and set `phase = "done"`. Component returns `null` after that (or AppShell unmounts it because `introDismissed === true`).

### 7.5. Render structure
```tsx
<motion.div
  role="dialog"
  aria-label="Opening our album"
  initial={{ opacity: 1 }}
  animate={{ opacity: phase === "fading" ? 0 : 1 }}
  transition={{ duration: FADE_OUT_MS / 1000 }}
  style={{
    position: "fixed", inset: 0, zIndex: 90,
    background: "#1a1108",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 28,
  }}
>
  <AmbientLabel />        {/* "Our album" mono uppercase, fading opacity */}
  <Book pages={pages} currentIdx={currentIdx} reduced={reduced} />
  <PageDots total={pages.length} current={currentIdx} />
</motion.div>
```

### 7.6. `<Book>` — the 3D mechanic

Stack of absolutely positioned pages inside a perspective container. Each page hinges on the **left edge** (the spine) and flips 180° when its index is below `currentIdx`.

```tsx
function Book({ pages, currentIdx, reduced }) {
  const W = "min(78vw, 380px)";
  const H = "min(60vh, 500px)";
  return (
    <div style={{
      position: "relative",
      width: W, height: H,
      perspective: 1500,
    }}>
      {/* Spine shadow */}
      <div style={{
        position: "absolute", top: 0, bottom: 0, left: -4, width: 8,
        background: "linear-gradient(90deg, rgba(0,0,0,0.5), rgba(0,0,0,0))",
        filter: "blur(3px)",
        zIndex: 0,
      }} />

      {pages.map((p, i) => (
        <motion.div
          key={p.id}
          animate={{
            rotateY: i < currentIdx ? -180 : 0,
          }}
          transition={{
            duration: reduced ? REDUCED_FLIP_MS / 1000 : FLIP_MS / 1000,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
            zIndex: pages.length - i,
          }}
        >
          <PageFront page={p} />
          <PageBack />
        </motion.div>
      ))}
    </div>
  );
}
```

For `prefers-reduced-motion`, the alternative animation should be a cross-fade between `currentIdx` photos in a single non-rotating page. Skip the 3D entirely.

### 7.7. `<PageFront>` — the visible side
```tsx
function PageFront({ page }: { page: Page }) {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      background: "var(--color-paper-cream1)",
      borderRadius: 4,
      boxShadow:
        "0 18px 40px rgba(0,0,0,0.45), " +
        "inset 0 0 0 1px rgba(0,0,0,0.05)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{ height: "72%", overflow: "hidden", borderRadius: "4px 4px 0 0" }}>
        <img
          src={page.photoUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ padding: "14px 18px 18px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{
          fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 500,
          letterSpacing: "0.12em", textTransform: "uppercase",
          color: "var(--color-ink3)", marginBottom: 6,
        }}>
          {page.date}
        </div>
        <div style={{
          fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600,
          fontStyle: "italic", color: "var(--color-ink)",
          letterSpacing: "-0.01em", lineHeight: 1.2,
        }}>
          {page.title}
        </div>
      </div>
    </div>
  );
}
```

### 7.8. `<PageBack>` — the reverse side seen during flip
```tsx
function PageBack() {
  return (
    <div style={{
      position: "absolute",
      inset: 0,
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
      transform: "rotateY(180deg)",
      background:
        "linear-gradient(135deg, var(--color-wood-light) 0%, var(--color-wood-dark) 100%)",
      borderRadius: 4,
      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
    }} />
  );
}
```

### 7.9. `<PageDots>` — progress indicator
```tsx
function PageDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: "flex", gap: 5, opacity: 0.65 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 8 : 5,
          height: 5,
          borderRadius: 999,
          background: i <= current ? "var(--color-accent)" : "rgba(255,255,255,0.25)",
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );
}
```

### 7.10. `<AmbientLabel>`
```tsx
<div style={{
  fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500,
  letterSpacing: "0.2em", textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
}}>
  Our album
</div>
```

## 8. Wire-up in `AppShell.tsx`

Find where `<DedicationOverlay />` is rendered (currently around line 47). Add the intro **after** it. Use the store flag to control visibility.

```tsx
import { BookIntro } from "@/components/intro/BookIntro";

// inside the component:
const introDismissed = useAppStore((s) => s.introDismissed);

// at the bottom of the render tree, after <DedicationOverlay />:
{!introDismissed && <BookIntro />}
```

The main app DOM remains mounted underneath the intro — this is important so that `syncRemotePhotos()` runs and the store populates while the intro waits.

## 9. Data model reference (from `web/data/types.ts`)

```ts
interface Memory {
  id: string;          // e.g. "m01"
  year: number;
  date: string;        // human-readable, e.g. "9 June 2022"
  sortKey: string;     // ISO-ish, e.g. "2022-06-09"
  chapterId: string;
  title: string;
  placeId: string;
  peopleIds: string[];
  tags: string[];
  body: string;
  favorite: boolean;
  photoCount?: number;
  hasAudio?: boolean;
}
```

Photo lookup: `photos["hero-" + memory.id]` returns `string | undefined`. URLs are remote GitHub raw URLs.

## 10. Design tokens used

All from `web/app/globals.css`:
- `--color-paper-cream1: #fdf8ec` (page background)
- `--color-wood-light: #e0d2b6` / `--color-wood-dark: #ebe0c9` (page back)
- `--color-ink: #1f1b16` (title text)
- `--color-ink3: #8b8175` (date label)
- `--color-accent: #a44a2a` (active page dot)
- `--font-serif` (Newsreader, title)
- `--font-mono` (date, label)

## 11. Edge cases

| Case | Behavior |
|---|---|
| No photos loaded after 2s | Start anyway with whatever's loaded; if zero photos, dismiss immediately to avoid stuck state |
| Memory has no hero photo | Filtered out (don't show blank pages) |
| User reloads mid-intro | Intro restarts from page 1 (in-memory state) |
| `prefers-reduced-motion` | No 3D; cross-fade between photos; ~6s total duration |
| Photo fails to load (broken URL) | Browser shows broken-image icon; consider `onError` to skip the page (v1.1) |
| Very tall photo (portrait) | `object-fit: cover` crops to fill — acceptable |
| User has 0 memories (theoretically) | `pages.length === 0` → immediately dismiss |
| Window resize during intro | Book scales via `vw`/`vh` — no special handling needed |

## 12. Accessibility

- `role="dialog"`, `aria-label="Opening our album"` on the root overlay
- Photos use `alt=""` (decorative within the intro context — the title is shown as text)
- The intro is purely visual; no keyboard navigation in v1 (it's auto-play)
- Reduced-motion variant is required, not optional
- Contrast: title `#1f1b16` on `#fdf8ec` = ~14:1 (passes AAA)

## 13. Verification

1. Run `cd web && npm run dev`
2. Open `http://localhost:3000/app-personal/` in browser
3. **First visit** (clear localStorage in DevTools): Dedication overlay shows → tap dismisses it → book intro plays → main app appears at `/library`
4. **Repeat reload**: No dedication; book intro plays immediately
5. **Throttle network to Slow 3G**: Intro waits up to 2s for photos, then starts. With zero photos loaded, it dismisses instantly without freezing
6. **Enable reduced-motion** in OS settings (macOS: System Settings → Accessibility → Display → Reduce motion): Reload — no 3D flip, cross-fades, total ~6s
7. **Mobile viewport (390px wide)**: Book fits, dots fit, no horizontal scroll
8. **Page count**: Should equal number of memories with loaded `hero-{id}` photos
9. **Type check & build**: `npm run build` passes with no TS errors
10. **No regression**: After the intro, all other routes (`/library`, `/timeline`, `/anniversary`, etc.) work normally; the intro does not replay on client-side navigation, only on full page reloads

## 14. Out of scope / design debt

- **Skip button** intentionally omitted. Strongly recommend adding `Esc`-to-skip and a visible "Skip" button after a few weeks of real use; a forced 14s gate on every reload is likely to feel heavy.
- **Once-per-session option** — if the intro becomes a chore, switch from in-memory `introDismissed` to `sessionStorage` so it plays once per browser session instead of every reload. Single-line change.
- **Audio** (page-turn sound) — out of scope; would need user-gesture audio policy handling.
- **Manual control / pause-on-hover** — not in v1.
- **Smooth photo preloading hook** — if `<img>` loading lag becomes visible during flips, add a 2-page-ahead preloader that creates throwaway `Image` objects.

## 15. Acceptance criteria

- [ ] `BookIntro.tsx` exists at the correct path and is type-safe
- [ ] Store has `introDismissed` + `dismissIntro` and is NOT persisted
- [ ] `AppShell` renders `<BookIntro />` after `<DedicationOverlay />` and gates it correctly
- [ ] Total intro duration is 12–18s for 20 memories, scaling linearly with photo count
- [ ] Page-turn animation uses 3D `rotateY` with `transform-origin: left center`
- [ ] Each page shows photo + title + date as specified
- [ ] `prefers-reduced-motion` variant works and is shorter
- [ ] No regression in other routes
- [ ] `npm run build` succeeds with no warnings or type errors
