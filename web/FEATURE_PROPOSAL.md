# Feature Proposal — Love Story Web App v2

**Owner:** Loi
**Last updated:** 2026-05-26
**Status:** Draft, awaiting approval

---

## 1. Context

The app today is a static Next.js export deployed to GitHub Pages (`/app-personal/`). Memories are authored in TS data files and at runtime by the owner via a personal GitHub token (`useAppStore.syncRemotePhotos`, `useAppStore.syncUserMemories`, `app/add-memory/`). Photos are HEAD-checked against `raw.githubusercontent.com` and rendered through `PhotoSlot`.

This proposal extends the app across three pillars chosen by the owner:

1. **Multimedia** — multi-photo galleries, voice notes, "on this day" widget
2. **Games & stats** — year-in-review dashboard, places heatmap
3. **Partner participation & sharing** — reactions, anniversary card image generator

**Hard constraint:** the site must stay a static export. No backend, no Supabase. All persistence rides on the existing GitHub-token + `Contents API` plumbing that already ships user memories and photos. Anyone the owner gives a token to can write; the public can read.

**Out of scope (deliberate):** real-time comments, full PDF photo book, video clips (storage cost / LFS), quiz/match games (cute but lower ROI given the rest of the list). These are noted in §6 for a later phase.

---

## 2. Phasing

Three phases, each independently shippable. Suggested order — phase 1 has the highest day-to-day value, phase 2 is the technical lift, phase 3 is the surprise/gift moment.

| Phase | Features | Effort | Risk |
|-------|----------|--------|------|
| **P1 — Memory richness** | Multi-photo gallery, "on this day" widget, reactions | M | low |
| **P2 — Voice notes** | Audio uploads + waveform player | M-L | medium (GitHub Contents API size limits) |
| **P3 — Anniversary moments** | Year-in-review dashboard, places heatmap, anniversary card generator | M | low |

Each phase below is self-contained and can be handed to a separate agent.

---

## 3. Phase 1 — Memory Richness

### 3.1 Multi-photo gallery per memory

**Goal:** A memory can carry more than one photo. The first remains the hero; the rest appear as a swipeable gallery on the detail page and a `+N` badge on tiles.

**Data model change** — `data/types.ts`:
```ts
export interface Memory {
  // ... existing fields
  photoCount?: number;  // optional; defaults to 1 (the hero)
}
```

Naming convention for slot IDs stays the existing `hero-${m.id}` for slot 0; new slots are `gallery-${m.id}-${idx}` for `idx >= 1`. This keeps `PhotoSlot` and the GitHub sync pipeline unchanged — they just need to know which slot IDs to fetch.

**Files affected:**
- `data/types.ts` — add `photoCount?: number`
- `data/content.en.ts`, `content.fr.ts`, `content.vi.ts` — leave existing memories at the default; populate `photoCount` only when a memory has extra photos
- `store/useAppStore.ts` — extend `expectedSlotIds()` (search for `hero-${m.id}` enumeration) to also enumerate gallery slots based on `photoCount`
- `components/shared/MemoryDetailClient.tsx` — below the hero, render a `<MemoryGallery memory={mem} />`
- **New:** `components/shared/MemoryGallery.tsx` — swipeable carousel (Framer Motion drag + snap), arrow keys, thumbnail strip, click to lightbox
- **New (optional):** `components/shared/Lightbox.tsx` — full-bleed photo viewer with prev/next
- `components/shared/MemoryTile.tsx` — show a small `+N` badge in the top-right corner when `photoCount > 1`
- `app/add-memory/AddMemoryForm.tsx` — multi-file upload, drag-to-reorder, set hero

**Edge cases:**
- Photo upload partial failures: existing `uploadingSlots` / `uploadErrors` already cover this — gallery should surface errors per slot
- Reorder must update both `hero-${id}` and `gallery-${id}-${idx}` blobs atomically — easiest is to re-PUT all of them on save
- Mobile gallery: must respect 44px touch targets for nav arrows; swipe should be primary interaction

**Acceptance:**
- Memory detail with `photoCount=4` shows hero + 3-thumb strip + lightbox on click
- Tile shows `+3` badge
- Reduce-motion users get instant snap instead of drag inertia

---

### 3.2 "On this day" widget

**Goal:** Library hero gets a small card: *"On May 26, three years ago — Beach in Da Nang"*. Surfaces memories sharing today's calendar date in earlier years.

**Files affected:**
- **New:** `components/shared/OnThisDay.tsx` — client component, computes today's MM-DD, filters `content.memories` for matching `date` substring, picks one (or up to 3) to display
- `app/library/page.tsx` — render above the day-counter hero or below the journey slider
- `data/content.en.ts` strings — add `onThisDayLabel: (yearsAgo: number) => string`

**Edge cases:**
- No memories on today's date → render nothing (don't show an empty state, it'd feel sad)
- Multiple matches → show one rotating per page load, or display all if ≤3
- Date format in memories is human-readable (`"Aug 14, 2024"`) — needs a parser, ideally store/derive a `mmdd` field at build time or parse in `dateUtils.ts`

**Acceptance:**
- On a date with no matches → widget absent
- On a date with one match → shows a small card linking to that memory
- Today (May 26) — verify with the actual data

---

### 3.3 Reactions on memories

**Goal:** A small reaction bar (`♥ 🥰 😂 🌸`) on each memory detail page. Local-only for anonymous viewers (`localStorage`); persisted to the repo for the token holder so reactions are shared across devices and visible to her.

**Storage model:**

Single JSON file: `assets/reactions.json`
```json
{
  "m01": { "heart": 3, "happy": 1 },
  "m05": { "heart": 5 }
}
```

**Files affected:**
- **New:** `components/shared/ReactionBar.tsx` — 4 emoji buttons with count, optimistic update + GitHub commit on token holder, localStorage-only otherwise
- **New:** `lib/githubReactions.ts` — `fetchReactions()`, `commitReaction(memId, emoji)` — sibling to `lib/githubMemories.ts`
- `store/useAppStore.ts` — add `reactions: Record<string, Record<string, number>>` slice + `addReaction(memId, emoji)` action
- `components/shared/MemoryDetailClient.tsx` — render `<ReactionBar memId={mem.id} />` below the metadata strip

**Edge cases:**
- Two devices reacting at the same second → GitHub returns 409 on stale SHA; retry with fresh fetch (single retry, then surface a toast)
- Anonymous viewer reactions are localStorage only and clearly visually distinct (slightly lower opacity, "your reactions" tooltip)
- Rate limit: GitHub unauthenticated reads are 60/hr — reactions.json should be read once per session and cached; writes are token-authenticated

**Acceptance:**
- Anonymous viewer can click ♥ — count updates locally, persists across page reloads on same browser
- Token holder clicks ♥ — count updates locally, commit to `assets/reactions.json` succeeds, visible to other viewers on next load

---

## 4. Phase 2 — Voice Notes

### 4.1 Audio uploads per memory

**Goal:** A memory can attach a 10-60s voice note (a whispered "happy birthday", a song fragment, ambient sound from the place). Plays inline on the detail page with a warm waveform.

**Storage:**
- Files: `assets/audio/${slotId}.m4a` (Safari/iOS-friendly format, fallback to mp3)
- Slot ID: `audio-${m.id}`
- Same GitHub Contents API path as photos — handled by extending `useAppStore.setPhoto` flow into a generic `setAsset(slotId, file, kind)` or by adding a parallel `setAudio()`

**Files affected:**
- `data/types.ts` — add `hasAudio?: boolean` to `Memory`
- `store/useAppStore.ts` — `audioUrls` map (parallel to `photos`), `setAudio()`, `clearAudio()`, extend `syncRemotePhotos` to HEAD-check audio slots too (rename to `syncRemoteAssets`)
- `lib/rawURL.ts` (or wherever `rawURL` lives) — add `rawAudioURL(slotId)` helper
- **New:** `components/shared/AudioSlot.tsx` — sibling to `PhotoSlot`; drag-and-drop, upload progress, native `<audio>` controls in a styled wrapper
- **New (optional):** `components/shared/Waveform.tsx` — render canvas waveform from decoded `AudioBuffer`; expensive so lazy-load and cache the decoded peaks in localStorage by slot ID
- `components/shared/MemoryDetailClient.tsx` — render `<AudioSlot slotId={`audio-${mem.id}`} />` between hero and body when `hasAudio`
- `app/add-memory/AddMemoryForm.tsx` — audio file input

**Edge cases:**
- **GitHub Contents API hard limit: 100MB per file, soft limit ~25MB recommended.** A 60s m4a at 128kbps is ~1MB — comfortably under. Reject uploads >5MB with a clear message
- iOS Safari blocks autoplay — audio must be user-initiated (no `autoplay`)
- Waveform decode is heavy: do it once, persist peaks to localStorage keyed by slot ID + size hash
- Reduce-motion: waveform progress bar should still update during playback (it's not decoration — it shows state)

**Acceptance:**
- Upload a 30s m4a — appears in `assets/audio/`, plays back on the memory detail page with a custom-styled control bar
- Waveform renders within ~300ms after audio loads
- Sync runs on app boot, missing audio slots resolve gracefully (no playback control shown)

---

## 5. Phase 3 — Anniversary Moments

### 5.1 Year-in-review dashboard

**Goal:** A `/stats` page that surfaces the shape of the relationship: memories per month, top places, top people, word cloud, photo collage.

**Files affected:**
- **New:** `app/stats/page.tsx` — client component
- **New:** `components/stats/MemoriesPerMonth.tsx` — simple bar chart, SVG, no chart library
- **New:** `components/stats/TopPlacesPeople.tsx` — ranked lists with counts
- **New:** `components/stats/TitleWordCloud.tsx` — SVG word cloud from `memories[].title` (use [d3-cloud](https://github.com/jasondavies/d3-cloud) or write a simple grid-packing layout — tiny dep, ~10KB)
- **New:** `components/stats/PhotoCollage.tsx` — Pinterest-masonry-style grid of all `hero-${m.id}` photos
- `components/layout/Sidebar.tsx` — add a "Stats" entry under a new "Reflections" section
- `data/content.en.ts` — add stats strings

**Edge cases:**
- Word cloud with English/French/Vietnamese stop words → maintain a small per-language stop list in `lib/stopwords.ts`
- Empty data (no memories in a month) → render `0` bar at minimum height for visual continuity
- Collage performance with 100+ photos → virtualize via `react-window` if it ever becomes a problem; not needed at current scale

**Acceptance:**
- `/stats` renders in <500ms with current dataset
- Word cloud avoids common words ("the", "and", "ngày", etc.)
- All sections degrade gracefully with missing photos

---

### 5.2 Places heatmap on Atlas

**Goal:** Enhance the existing `components/atlas/VietnamMap.tsx` so each place dot's size/intensity reflects how many memories are tied to it.

**Files affected:**
- `components/atlas/VietnamMap.tsx` — read `memories.filter(m => m.placeId === place.id).length`, scale the dot radius (e.g., 6px → 14px) and color saturation
- Add tooltip: place name + memory count
- Optional: animate a faint "ripple" out from the most-visited place

**Edge cases:**
- Place with zero memories → still rendered, smallest size, lowest opacity (don't hide — she may want to remember a place we haven't documented yet)

**Acceptance:**
- Dots are visibly proportional to memory count
- Tooltip works on touch (tap to reveal, tap elsewhere to dismiss)

---

### 5.3 Anniversary card image generator

**Goal:** Pick a memory, generate a beautiful 1080×1350 (Instagram portrait) image with photo + title + day count + a custom message. Downloadable as PNG.

**Files affected:**
- **New:** `app/anniversary-card/page.tsx` — flow: choose memory → optional message → preview → download
- **New:** `components/anniversary/CardCanvas.tsx` — `<canvas>` rendering, draws background, photo (cover-fit), overlay gradient, serif title, mono date, day count, optional handwritten message
- **New:** `lib/cardRender.ts` — pure function `renderCard(opts): Promise<Blob>`
- `components/layout/Sidebar.tsx` — link under "Reflections" section (alongside Stats)

**Edge cases:**
- Custom fonts (`Newsreader`, `Caveat`) must be loaded into the canvas — use `document.fonts.ready` before `drawText`
- High-DPI: render at 2× and downscale on display
- Photo download: use FileSaver.js or just a manual `<a download>` blob URL

**Acceptance:**
- User picks a memory → preview renders in <800ms
- Downloaded PNG is sharp on retina displays
- Three layout templates (minimal / photo-heavy / quote-centered) selectable

---

## 6. Deferred / Future

Not part of this proposal — reasoning included so we don't relitigate later.

| Feature | Why deferred |
|---------|--------------|
| Video clips per memory | GitHub Contents API + LFS adds operational complexity; voice notes deliver the same emotional payload at a fraction of the storage cost |
| Real-time comments | Needs a backend or comments-via-issues hack with moderation overhead; reactions cover the immediate need |
| PDF photo book export | High effort (`react-pdf` setup, pagination, font embedding); print-on-demand alternatives like Blurb exist for the real artifact |
| Memory match / quiz games | Cute but lower ROI than richness/sharing for this audience of one |
| Email digests | Requires a backend cron — out of scope for static-only |

---

## 7. Cross-cutting concerns

**Accessibility:** all new interactive elements need keyboard nav, focus rings, ≥4.5:1 contrast, `prefers-reduced-motion` support — match the patterns already in `MemoryDetailClient.tsx` and `JourneySlider.tsx`.

**i18n:** every new user-facing string lives in `data/content.{en,fr,vi}.ts`. No hard-coded strings in components.

**Token gating:** writes (multi-photo upload, audio upload, reactions for token holder, custom memories) all funnel through the existing `githubToken` check in `useAppStore`. Surface a "connect GitHub" CTA when an authenticated action is attempted by an anonymous viewer.

**Bundle size:** d3-cloud (~10KB) and `wavesurfer.js` (~30KB) are the only new deps. Both are lazy-loaded only on the pages that need them (`/stats`, memory detail with audio).

**Static export compatibility:** all routes added must work under `output: "export"` + `basePath: "/app-personal"`. No server components, no `dynamic = "force-dynamic"`, no API routes.

---

## 8. Delegation map

Each section below is self-contained enough to hand to a separate agent. Suggested order in parentheses.

| Section | Agent prompt seed | Phase |
|---------|------------------|-------|
| §3.1 Multi-photo gallery | "Implement `MemoryGallery` per §3.1 of `web/FEATURE_PROPOSAL.md`. Extend Memory type, update PhotoSlot enumeration, ship swipeable gallery + lightbox." | P1 (1) |
| §3.2 "On this day" widget | "Implement `OnThisDay` per §3.2 of `web/FEATURE_PROPOSAL.md`. Library hero placement, MM-DD matching against `memories[].date`." | P1 (2) |
| §3.3 Reactions | "Implement `ReactionBar` + `lib/githubReactions.ts` per §3.3 of `web/FEATURE_PROPOSAL.md`. localStorage for anonymous, GitHub commit for token holder." | P1 (3) |
| §4.1 Voice notes | "Implement `AudioSlot` + `Waveform` per §4.1 of `web/FEATURE_PROPOSAL.md`. Extend store sync, add to AddMemoryForm." | P2 (4) |
| §5.1 Stats dashboard | "Implement `/stats` per §5.1 of `web/FEATURE_PROPOSAL.md`. SVG-only charts, d3-cloud for word cloud." | P3 (5) |
| §5.2 Places heatmap | "Enhance `VietnamMap` per §5.2 of `web/FEATURE_PROPOSAL.md`. Memory count proportional dot sizing + tooltips." | P3 (6) |
| §5.3 Anniversary card | "Implement `/anniversary-card` per §5.3 of `web/FEATURE_PROPOSAL.md`. Canvas rendering, 3 templates, PNG download." | P3 (7) |

---

## 9. Open questions for owner before kickoff

1. **Voice note privacy** — should audio be uploaded as private gists (token-only) or public assets like photos? Public is simpler but anyone with the URL can stream it.
2. **Reactions visibility** — should anonymous viewers see the token-holder's persisted reaction counts, or only their own localStorage ones?
3. **Anniversary card templates** — any specific layouts you have in mind, or pick three sensible defaults?
4. **`/stats` placement** — sidebar link under a new "Reflections" section, or top-bar tab?
