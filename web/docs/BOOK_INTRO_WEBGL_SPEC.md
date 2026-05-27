# Book-Flip Intro — WebGL Upgrade Spec (v2)

**Status:** Ready for implementation
**Replaces:** the `<Book>` mechanic inside [`BookIntro.tsx`](../components/intro/BookIntro.tsx)
**Reader audience:** engineer/agent picking this up cold. No prior conversation context required.

---

## 1. Why this exists

`BookIntro.tsx` v1 uses a CSS `rotateY` flip. It reads as "card flip," not "paper turning." This v2 upgrades the `<Book>` mechanic to a **WebGL scene** with a real 3D book and a **cylindrical curl** vertex shader on the turning page. Everything outside the canvas (dark stage, "OUR ALBUM" label, dot indicator, phase lifecycle, store integration) stays as-is.

**Goals**
- Real paper-like curl (cylindrical bend, no flat rotation)
- Visible book body — left + right page stacks with thickness, 3D spine, cover
- 1.2s per page-turn (slow, cinematic)
- Ends with a **cover close** then fade to the app
- Honors `prefers-reduced-motion` by falling back to v1 CSS flip (no WebGL canvas at all)

**Non-goals**
- No manual flip / drag interaction (v1 stays auto-play)
- No audio
- No texture-mapped paper grain (subtle; out of scope for v1.0 of WebGL)
- No physics-based gravity droop (we picked cylindrical, not bezier)

---

## 2. References & prior art

Read these before writing the shader:
- **Khronos GLSL spec** for sin/cos in vertex shaders
- Three.js `PlaneGeometry` docs (`node_modules/three/...` — we'll subdivide it)
- Existing v1 spec: [`BOOK_INTRO_SPEC.md`](./BOOK_INTRO_SPEC.md) — phase state machine, store integration, accessibility
- `@react-three/fiber` Canvas + frameloop docs (we set `frameloop="demand"` to save GPU when idle)
- "Real-time paper" — the canonical cylindrical bend model is: page wraps around an invisible cylinder along the spine, the cylinder's effective angle increases from 0 to π over the flip duration; vertices keep arc-length along the original page width

---

## 3. Files

| Action | Path | Notes |
|---|---|---|
| Add deps | `web/package.json` | `three`, `@react-three/fiber`, `@react-three/drei` |
| Create | `web/components/intro/BookScene.tsx` | r3f scene: book body, lighting, camera |
| Create | `web/components/intro/PageMesh.tsx` | Single turning page mesh + cylindrical curl shader |
| Create | `web/components/intro/PageStack.tsx` | Visible thickness on left + right (no per-page texture) |
| Create | `web/components/intro/BookCover.tsx` | Front & back covers (used for the close-then-fade exit) |
| Create | `web/components/intro/curlShader.ts` | GLSL vertex + fragment shader strings as exports |
| Modify | `web/components/intro/BookIntro.tsx` | Replace `<Book>` with `<BookScene>`; keep phase machine, stage, dots, label |

No store changes. No new routes.

---

## 4. Dependencies

```bash
cd web
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

Versions (current latest as of 2026-01):
- `three`: ^0.171
- `@react-three/fiber`: ^9.0
- `@react-three/drei`: ^10.0

Verify the `three` peer matches what `@react-three/fiber@9` expects. If not, pin to the version r3f requires.

**Bundle impact:** ~150 KB gzipped added. Acceptable for an intro that loads once per page reload. Code-split the Canvas behind a `dynamic()` import so the rest of the app isn't blocked.

---

## 5. Scene composition

```
                  ┌──────────────── canvas ────────────────┐
                  │                                          │
   camera (45°)   │            (warm key light)             │
        \         │                  ↓                       │
         \        │      ┌───────────┴───────────┐          │
          \       │      │   Cover (back, hidden) │          │
           \      │      │  ╔═══╤═══════════╗     │          │
           ↘      │      │  ║   │           ║     │          │
                  │      │  ║ L │  TURNING  ║ R   │          │
                  │      │  ║ stack  PAGE  ║stack │          │
                  │      │  ║   │  (curl)  ║     │          │
                  │      │  ╚═══╧═══════════╝     │          │
                  │      │   Cover (front, behind)│          │
                  │      └────────────────────────┘          │
                  │              ↑                            │
                  │         soft fill light                  │
                  └──────────────────────────────────────────┘
```

**Camera**
- `PerspectiveCamera`, fov **38°**, position `[0, 0.6, 3.2]`, lookAt `[0, 0, 0]`
- Slight downward tilt — like reading a book on a table
- Static during the flips. **Pulls back to `[0, 0.4, 3.8]` during the cover-close exit** (1s ease-out)

**Lights**
- `ambientLight` intensity 0.45, color `#f5e8d4` (warm cream)
- `directionalLight` intensity 0.9, color `#fff4dc`, position `[-1.5, 2.5, 1.8]` (upper-left, warm) — this is the "key" that makes the curl visible by shading the underside
- `directionalLight` intensity 0.2, color `#9fb6c8`, position `[2, -0.5, 1]` (fill, cool, very soft)
- No shadows (expensive; the lighting alone reads as 3D)

**Background**
- Canvas has `background: transparent` so the existing `#1a1108` stage shows through unchanged. Don't paint background inside three.

**Book dimensions** (world units)
- Page width: `1.6`
- Page height: `2.1`
- Cover slightly larger: `1.65 × 2.15`
- Total book thickness (closed): `0.12` (each stack is half)
- Spine width: `0.04`

---

## 6. The turning page — `<PageMesh>` and `curlShader.ts`

### 6.1 Mesh

```ts
// PageMesh.tsx — geometry
const geometry = new THREE.PlaneGeometry(1.6, 2.1, 60, 1);
```

- **60 width segments** → smooth bend without per-pixel cost
- **1 height segment** → cylindrical bend is along width only; no need to subdivide vertically
- Geometry is in the **page-local frame**: x ∈ [-0.8, +0.8], y ∈ [-1.05, +1.05]
- For the curl shader to be simple, **shift x so the spine is at x=0**: use `geometry.translate(0.8, 0, 0)` so x ∈ [0, 1.6], with x=0 at the spine and x=1.6 at the free edge. Restore symmetry later via the parent group's position.

### 6.2 Material

Use `ShaderMaterial`. **Two textures** per page:
- `uFrontTex` — the photo for this memory
- `uBackTex` — the "page back" (a flat cream/wood gradient generated once and reused for every page)

The fragment shader picks front or back based on which side of the curled normal the camera sees:
```glsl
gl_FragColor = vBackface > 0.5 ? texture2D(uBackTex, vUv) : texture2D(uFrontTex, vUv);
```

Where `vBackface` is set in the vertex shader by checking if the bent normal faces away.

### 6.3 Vertex shader — cylindrical bend (`curlShader.ts`)

The page wraps around an invisible cylinder along the **Y axis** (vertical, parallel to the spine). The cylinder's effective angle increases from 0 (flat) to π (fully flipped) over the flip animation.

**Math:**
- Let `t` = flip progress, 0 → 1
- Total angle subtended: `theta = t * PI`
- Page width `L = 1.6`
- Each vertex at original `x` ∈ `[0, L]` traverses arc length `x` around the cylinder
- Radius of bend cylinder: `R = L / theta` (when `theta > epsilon`)
- Angle along arc for this vertex: `phi = x / R = x * theta / L`
- New position:
  ```
  newX = R * sin(phi)
  newZ = R * (1.0 - cos(phi))   // page rises out of the plane during flip
  ```
- At `theta = 0`: degenerate — pass through `pos.x = x`, `pos.z = 0`.
- At `theta = π`: `newX = R * sin(phi)` evaluates to `0` at the edge (vertex is directly above the spine). To finish the flip flat onto the left side, **blend with a pure mirrored flat plane** as `theta` approaches π. See "edge case" below.

**Edge case — finishing flat on the left**

A pure cylindrical wrap with `theta = π` leaves the page rolled up like a tube. To land flat on the left side instead, apply a **post-bend rotation around the spine** scaled by `t`:
```glsl
// after computing newX, newZ from cylinder math
float flatRot = t * PI;          // pure rotation around Y axis at spine
// rotate (newX, newZ) by flatRot around Y:
float cosR = cos(flatRot);
float sinR = sin(flatRot);
float rotX = newX * cosR + newZ * sinR;
float rotZ = -newX * sinR + newZ * cosR;
```

But that double-rotates. **Better model:**
- Pick a single deformation: as `t` goes from 0 to 1, the page bends *and* rotates such that:
  - At `t=0`: flat on the right (x ∈ [0, L], z=0)
  - At `t=0.5`: half-bent, edge pointing up
  - At `t=1`: flat on the left (x ∈ [-L, 0], z=0)

The clean formulation is: **rotate the un-bent vertex around the spine first (by `t*π`)**, then **apply a curl that peaks at `t=0.5` and is zero at the endpoints**. The curl is a sine-pulse:
```glsl
float curlAmp = sin(t * PI);                  // 0 at t=0 and t=1, max at t=0.5
float bend = curlAmp * 0.4;                   // tune coefficient
// rotation around Y (spine):
float angle = t * PI;
float cosA = cos(angle), sinA = sin(angle);
float rx = position.x * cosA;                 // x rotates toward -x
float rz = -position.x * sinA;                // z lifts
// add a curl bulge: bend the page outward along its width in proportion to bend
// the bulge displaces along the page's local normal direction (z in the rotated frame)
float bulge = bend * sin(position.x / L * PI); // 0 at spine and edge, max at middle
rz += bulge;
```

This produces:
- Linear rotation around spine — page travels from right to left
- A sine-bulge along the width — page is most bent at its middle
- Zero bulge at start and end — page lies flat at both endpoints

**This is the model to implement.** It's ~30 lines of GLSL and looks great. The "true cylindrical arc-length-preserving wrap" sounds more correct but causes the tube-rolling artifact; the sine-bulge model sidesteps that and reads as paper.

### 6.4 Complete vertex shader sketch

```glsl
uniform float uFlip;       // 0 to 1, current page's flip progress
uniform float uPageWidth;  // L = 1.6
varying vec2 vUv;
varying float vBackface;

void main() {
  vUv = uv;

  float t = uFlip;
  float L = uPageWidth;
  float PI = 3.14159265;

  // Original position (x from 0 at spine to L at edge, y vertical, z=0)
  vec3 pos = position;

  // Rotation around spine (Y axis)
  float angle = t * PI;
  float cosA = cos(angle), sinA = sin(angle);
  float rx = pos.x * cosA;
  float rz = -pos.x * sinA;

  // Sine-bulge curl (peaks at t=0.5, zero at endpoints)
  float curlAmp = sin(t * PI);
  float bulge = curlAmp * 0.35 * sin(pos.x / L * PI);
  rz += bulge;

  vec3 worldPos = vec3(rx, pos.y, rz);

  // Approximate backface check: if the rotated normal's z is negative
  // (rough but good enough for cylindrical bend)
  vBackface = step(0.5, t);   // for t < 0.5 show front, t >= 0.5 show back

  gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
}
```

### 6.5 Fragment shader

```glsl
uniform sampler2D uFrontTex;
uniform sampler2D uBackTex;
varying vec2 vUv;
varying float vBackface;

void main() {
  vec3 color;
  if (vBackface > 0.5) {
    // when showing back, mirror UV horizontally
    vec2 backUv = vec2(1.0 - vUv.x, vUv.y);
    color = texture2D(uBackTex, backUv).rgb;
  } else {
    color = texture2D(uFrontTex, vUv).rgb;
  }
  gl_FragColor = vec4(color, 1.0);
}
```

### 6.6 What about the photo + title + date overlay?

The vertex shader operates on a single textured plane. We need photo, date label, and title on the page. Options:

- **A.** Pre-composite photo + text into a single canvas texture per page (offscreen `<canvas>` → `CanvasTexture`). Each page's texture is "baked" once when its photo loads.
- **B.** Render photo on the mesh, and overlay title/date as separate HTML positioned over the canvas. Won't curl with the page (breaks the illusion).

**Use option A.** When a page becomes a candidate for rendering, generate its texture by drawing:
- Background: `#fdf8ec`
- Photo at top 72%, `object-fit: cover` equivalent via `ctx.drawImage` with cover math
- Date in mono uppercase
- Title in italic serif

Cache textures by `memory.id`. Dispose textures of pages we've passed (memory pressure).

Helper file: `web/components/intro/composePageTexture.ts` that takes `{ photoUrl, title, date }` and returns a `Promise<THREE.CanvasTexture>`.

---

## 7. Stacks, spine, covers — `<PageStack>`, `<BookCover>`

### 7.1 PageStack

A thin `BoxGeometry` per side representing the visible thickness of remaining/already-read pages. **No per-page textures** — these are static volumes.

- **Left stack:** `BoxGeometry(0.06, 2.1, 1.6 + 0.02)` positioned at `x = -0.83`, faded cream color, slight `MeshStandardMaterial({ color: '#f0e6d0', roughness: 0.95 })`. Shows the pages already turned. Grows in thickness as the intro progresses (interpolate scale.x from 0.02 to 0.06 based on `currentIdx / total`).
- **Right stack:** same dimensions but at `x = +0.83`, grows thinner as the intro progresses (1.0 → 0.02).
- **Top + bottom face stripes:** add a darker line (gilded edge feel) — use a `BoxGeometry` with `MeshBasicMaterial({ color: '#c4b08a' })` for the top and bottom 1px-equivalent strips. Optional polish.

### 7.2 Spine

A thin `BoxGeometry(0.04, 2.15, 0.14)` in the center at `[0, 0, 0]`, dark leather color `#3b2a1c`. No texture; flat material.

### 7.3 Covers

Two `BoxGeometry(1.65, 2.15, 0.03)` boxes:
- **Front cover:** hinged at the right side of the spine, starts open at -180° (flipped out flat behind the right stack, invisible to camera). At exit, animates from -180° to 0° to close over the book.
- **Back cover:** hinged at the left side, lies flat under the left stack the whole time. Doesn't move.

Cover material: `MeshStandardMaterial({ color: '#5a3520', roughness: 0.7 })` — dark warm leather. Add a subtle bevel via a slightly larger second box behind, lighter color, for the cover-edge feel.

---

## 8. Page lifecycle in the WebGL scene

Phase machine (unchanged from v1): `waiting` → `playing` → `closing` → `fading` → `done`.

> Note: v1 has `waiting → playing → fading → done`. v2 inserts **`closing`** between `playing` and `fading` for the book-close animation.

### 8.1 What renders at any moment

For `pages = [p0, p1, ..., p_{N-1}]` and `currentIdx = i`:
- **Already-flipped (indices `< i`):** their textures don't need to render. Just contribute to left-stack thickness.
- **Currently flipping (index `i`):** rendered as a `<PageMesh>` with `uFlip` animating 0 → 1 over `FLIP_MS` (1000ms of the 1200ms page time).
- **Next page (index `i+1`):** rendered as a static, flat `<PageMesh>` with `uFlip = 0`, positioned beneath the flipping page so it's revealed as the top page curls away. Don't allocate it as a curl material — use a simple unlit material with the same texture compose.
- **Future pages (`> i+1`):** contribute to right-stack thickness only. Not rendered as meshes.

**Z-order:** flipping page must sit slightly above (`z = 0.001`) the static next page so there's no z-fighting at `uFlip = 0`.

### 8.2 Driving `uFlip`

Use a `useFrame` hook from r3f and a ref-based animation timeline (don't tie GLSL uniforms to React state — re-renders are too slow). The `<PageMesh>` reads its target `currentIdx` from a ref written by the parent's phase machine. Each frame:
```ts
useFrame((_, dt) => {
  // ease uFlip toward target with a cubic ease-out
  const target = isFlipping ? 1 : 0;
  uniforms.uFlip.value += (target - uniforms.uFlip.value) * 0.12 * dt * 60;
  // when reached ~1, signal parent to advance currentIdx
});
```

For deterministic timing, prefer an explicit timeline (`THREE.MathUtils.lerp` driven by `elapsed / FLIP_MS`) over loose interpolation. Pseudocode:
```ts
const FLIP_MS = 1000;   // active flip duration
const HOLD_MS = 200;    // pause between flips
const PAGE_MS = FLIP_MS + HOLD_MS;  // 1200 — matches the 1.2s per page

// inside useFrame
const localElapsed = clock - flipStartTime;
if (localElapsed < FLIP_MS) {
  const tRaw = localElapsed / FLIP_MS;
  const tEased = easeInOutCubic(tRaw);
  uniforms.uFlip.value = tEased;
} else if (localElapsed < PAGE_MS) {
  uniforms.uFlip.value = 1.0;   // page rests on the left stack
} else {
  // advance to next page
  currentIdxRef.current += 1;
  flipStartTimeRef.current = clock;
}
```

When `currentIdx >= pages.length`, transition phase to `closing`.

### 8.3 Closing phase

1. Last page settles flat on the left (uFlip = 1, held)
2. Camera tweens from `[0, 0.6, 3.2]` to `[0, 0.4, 3.8]` over 600ms (ease-out)
3. Simultaneously, the front cover rotates from -180° to 0° over 800ms (ease-in-out), swinging over the closed book
4. After cover settles, brief 200ms hold
5. Trigger `fading` phase — the outer overlay (not the canvas) fades to opacity 0 over `FADE_OUT_MS = 500`
6. Call `dismissIntro()`

Total exit time: ~1500ms.

---

## 9. Texture management

### 9.1 Loading

When `<BookIntro>` enters `waiting` phase, kick off texture composition in parallel for all pages whose photo URL is available. As each texture resolves, push to a `texturesRef` map keyed by `memory.id`.

```ts
const texturesRef = useRef<Record<string, THREE.CanvasTexture>>({});
useEffect(() => {
  pages.forEach((p) => {
    if (texturesRef.current[p.id]) return;
    composePageTexture(p).then((tex) => {
      texturesRef.current[p.id] = tex;
    });
  });
}, [pages]);
```

### 9.2 Wait-to-start condition

Identical to v1: start once `pages.length >= MIN_PHOTOS_TO_START` OR 2 seconds elapsed. Additionally, ensure at least the first 2 pages' textures are composed (if not, wait another frame).

### 9.3 Disposal

When a texture is no longer needed (e.g., 3+ pages behind), call `texture.dispose()` to free GPU memory. Keep the most recent 4 textures in memory (current + next 2 + prev 1) to handle any back-buffering.

---

## 10. Constants

```ts
// in BookIntro.tsx
const FLIP_MS = 1000;
const HOLD_MS = 200;
const PAGE_MS = 1200;
const PHOTO_WAIT_MAX_MS = 2000;
const MIN_PHOTOS_TO_START = 6;
const CLOSE_CAMERA_MS = 600;
const CLOSE_COVER_MS = 800;
const CLOSE_HOLD_MS = 200;
const FADE_OUT_MS = 500;
```

20 memories: 20 × 1200 = 24000ms + 1500ms exit ≈ **25.5s total**. Matches the chosen "cinematic" pace.

---

## 11. Reduced-motion fallback

If `useReducedMotion()` returns `true`:
- **Do not mount the `<Canvas>` at all.** Bundle is loaded but never run.
- Render the v1 CSS cross-fade variant (already in `BookIntro.tsx` as the `reduced` branch — keep it intact)
- This means no WebGL context spin-up on machines with reduced-motion preference, which is also a low-end-hardware proxy

---

## 12. Performance

- `frameloop="demand"` on `<Canvas>` would skip frames when nothing animates — but the curl uniform changes every frame during flips, so use `frameloop="always"` during `playing` and `closing`, switch to `"demand"` during `waiting`. r3f exposes `invalidate()` and `<Canvas frameloop>` for this.
- Texture size: 512×768 per page is plenty (book is ~380px tall at typical viewport). Don't upload 2K textures.
- Use `THREE.LinearFilter` + `THREE.LinearMipmapLinearFilter` for crisp edges on the curl.
- `dpr={[1, 2]}` on Canvas — supports retina, caps at 2× to avoid burning low-end GPUs.

**Target frame budget:** 60 fps on a 2020-era MacBook Air. If hitting <30 fps on iPhone SE2, knock segment count from 60 → 40 and drop the second directional light.

---

## 13. Wire-up — minimal diff to `BookIntro.tsx`

```diff
-import { motion, useReducedMotion } from "framer-motion";
+import { motion, useReducedMotion } from "framer-motion";
+import dynamic from "next/dynamic";
+
+const BookScene = dynamic(
+  () => import("./BookScene").then((m) => m.BookScene),
+  { ssr: false }
+);

   // ...inside render, in the !reduced branch, replace:
-  <Book pages={displayPages} currentIdx={currentIdx} reduced={!!reduced} />
+  <BookScene
+    pages={displayPages}
+    currentIdx={currentIdx}
+    phase={phase}
+    onAdvance={() => setCurrentIdx((i) => i + 1)}
+    onFinishedFlipping={() => setPhase("closing")}
+    onClosed={() => setPhase("fading")}
+  />
```

Add a new phase to the union: `type Phase = "waiting" | "playing" | "closing" | "fading" | "done"`.

The reduced branch keeps the current CSS cross-fade — delete nothing from the v1 implementation.

---

## 14. Accessibility

- Canvas needs `aria-hidden="true"` — it's purely decorative; the role/label on the outer overlay handles screen reader semantics
- Outer overlay keeps `role="dialog" aria-label="Opening our album"`
- Reduced-motion path is the accessible path; it must work perfectly

---

## 15. Verification

1. `npm install` + `npm run build` — no type errors, no peer warnings
2. `npm run dev` → `http://localhost:3000/app-personal/library`
3. **Visual check:**
   - Dark stage with "OUR ALBUM" label at top
   - 3D book visible — left + right stacks with thickness, spine in the middle
   - First page begins curling 1–2s after page load
   - Each curl peaks in the middle (sine bulge), 1s per active flip + 200ms rest
   - As pages turn, left stack thickens and right stack thins
   - After last page, camera pulls back slightly, front cover swings closed, scene fades
   - Main app visible underneath
4. **`prefers-reduced-motion`** on (System Settings → Accessibility → Reduce motion):
   - Reload — no canvas mounted (check React DevTools)
   - CSS cross-fade variant plays — same total duration shorter
5. **Mobile viewport (390 × 844):** book scales, no overflow
6. **Low-end check (Chrome DevTools throttle CPU 6×):** should still hit ~30 fps during flips; if not, drop segments
7. **`npm run build` static export still passes** — Canvas is `dynamic({ ssr: false })`, so SSR doesn't try to instantiate WebGL
8. **No regression** on other routes — the intro is the only consumer of three.js

---

## 16. Acceptance criteria

- [ ] `three`, `@react-three/fiber`, `@react-three/drei` installed; `@types/three` in devDeps
- [ ] `BookScene.tsx`, `PageMesh.tsx`, `PageStack.tsx`, `BookCover.tsx`, `curlShader.ts`, `composePageTexture.ts` exist with clean responsibilities (single concern each)
- [ ] Vertex shader implements the sine-bulge cylindrical curl described in §6.3
- [ ] Pages composite photo + title + date offscreen and upload as `CanvasTexture`
- [ ] Left and right page stacks visible with thickness that updates as `currentIdx` advances
- [ ] Front cover animates closed at end of intro
- [ ] Reduced-motion path bypasses the Canvas entirely
- [ ] `npm run build` succeeds (static export, no SSR errors)
- [ ] Total intro duration for 20 memories: 24–28 seconds
- [ ] 60 fps on a modern laptop during flips
- [ ] No console warnings (peer-dep, three.js, r3f)

---

## 17. Out of scope (future)

- Audio (paper rustle on each flip)
- Manual drag-to-flip — would require gesture handling + spring physics on `uFlip`
- Dog-ear / bookmark visuals
- Per-page paper grain normal map
- "Look inside" zoom on a specific page if user clicks during the intro

---

## 18. Open questions for the implementer

If any of these block progress, ask the user before defaulting:
- **Cover artwork:** should the front cover have a title ("Us", "Our Album") or be plain leather? Default to plain.
- **Page numbers / chapter dividers:** out of scope unless the user requests; default no.
- **Cover material:** the dark leather color `#5a3520` is a guess. If it clashes with the app palette in context, swap to `var(--color-ink-brown)` = `#3b2a1c`.

---

### Footer
This spec assumes the v1 spec ([`BOOK_INTRO_SPEC.md`](./BOOK_INTRO_SPEC.md)) is already implemented and the v1 component works. Do not delete the v1 CSS variant — it's the reduced-motion fallback.
