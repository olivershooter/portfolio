# Portfolio v3: "The Late Shift" + "The Quick Read"

**Date:** 2026-09-27
**Status:** Design approved in brainstorming; awaiting written-spec review
**Branch:** `redesign/late-shift`
**Prototypes (reference implementation, not production code):**
`docs/superpowers/specs/2026-09-27-portfolio-v3-prototypes/`
- `late-shift-room.html`: working room renderer (GPU ink compositor, all objects, desktop + phone layouts, hover/tags/chips, time of day, camera push, radio toggle)
- `landing-section-quickread.html`: landing chooser, an example section page (Experience), and the Quick Read page

Both are HTML fragments made for the brainstorm companion. They use its CSS variables (`--text-primary`, `--border`, …), so for standalone viewing wrap them in a page that defines those variables.

---

## 1. Goal

Replace the current single-page portfolio with:

1. **A landing page** where visitors choose how to view the portfolio.
2. **The Late Shift**: an interactive, showy, cosy lofi "room" in a risograph-inspired style, for showing off.
3. **The Quick Read**: a simple, fast, single-page version that meets WCAG 2.2 AA.

The positioning changes from "Software Engineer" to **"Software & Android Engineer"**. Oliver's Deloitte role has shifted to native Android (Kotlin + Jetpack Compose).

**Audience:** engineering hiring managers, tech leads and recruiters, on both desktop and phone.

**Success looks like this:**
- Someone picks a version within seconds of landing.
- The Late Shift is memorable, obviously interactive and smooth (60fps on a mid-range laptop).
- The Quick Read passes automated accessibility checks, and anyone can read it in about 30 seconds.
- Both versions show the same, accurate content.

### Non-goals
- No CMS or backend. Content lives in TypeScript modules.
- No blog.
- No 3D (Three.js/WebGL). The room is 2D canvas.
- No pre-rendered video. The room is rendered live so that hover, time of day and the dynamic phone screen keep working.
- The Late Shift is accessible on a best-effort basis (§6.9). Only The Quick Read is claimed and verified as AA.

---

## 2. Design direction (agreed)

- **Aesthetic:** crisp, flat lofi illustration using a *risograph ink palette* with multiply overprint.
  - Inspired by `sevenevesai/riso-windowseat` (MIT), **not a copy**.
  - It must **stay sharp**: heavy halftone and grain read as "blurry" and were rejected. Only a faint paper tooth (grain at about 12%) and ≤1px misregistration are used.
  - Rejected directions: neon/cyber, glitch, clean WebGL blobs, "phone OS" UI.
- **Ink palette** (shared by both versions):

  | Token | Hex | Use |
  |---|---|---|
  | `paper` | `#f4ecdd` | Page and canvas background |
  | `ink-blue` | `#3255a4` | Primary ink, text on paper in The Late Shift |
  | `ink-pink` | `#ff48b0` | Accent, shadows and focus rings. **Never text in The Quick Read** |
  | `ink-yellow` | `#ffe200` | Highlights, hover state and lamp light |

  In the room, colours are *coverages* of these three inks multiplied onto paper. That's where the purples, oranges and greens come from.
- **Motion:** gentle and continuous, never frantic.
  - The Manchester rain, a Metrolink tram, drifting clouds, mug steam, the radio's spinning reels and floating notes, and scrolling code on the laptop.
  - Headings "print in": two misaligned ink layers (pink and blue) slide into register.
- **Personal props** (what makes it Oliver's):

  | Prop | What it is | Role |
  |---|---|---|
  | Window | Manchester: Beetham Tower, mill and chimney, terraces, yellow Metrolink tram, constant rain | Contact |
  | Super 8 camera | Film origins | About |
  | Laptop running Kotlin/Compose-looking code | | Experience |
  | Phone showing a Salah-Times-style screen whose sky follows the room's time | | Android |
  | Screendle poster | Project | |
  | Sticky notes (*hola / merci / سلام / ciao*) | Candice project | |
  | Football | Football Stats project | |
  | Book stack (KOTLIN / REACT / K8S · HELM) | | Skills |
  | Cassette "LOFI FM" radio | | Audio toggle |
  | Lamp, mug ("MCR"), plant | Ambient, not interactive | |

- **Time of day:** the room follows the visitor's local clock (dawn 05–08, day 08–17, dusk 17–20, night otherwise). This is a nod to Salah Times's changing sky.

---

## 3. Routes and information architecture

| Route | What |
|---|---|
| `/` | Landing chooser |
| `/late-shift` | The room |
| `/late-shift/:section` | The room, zoomed into an object, with that section's page open. Sections: `about`, `android`, `experience`, `skills`, `contact`, `projects/screendle`, `projects/candice`, `projects/football` |
| `/quick` | The Quick Read (one page, with anchors `#about`, `#android`, `#experience`, `#projects`, `#skills`, `#contact`) |
| `*` | Redirect to `/` |

- **Remembered choice:**
  - The landing page has a "Remember my choice" checkbox, which stores the choice under `localStorage` key `os-portfolio:version` (value `late-shift` or `quick`).
  - On `/`, a remembered choice redirects to that version, unless the URL has `?choose`.
  - Both versions always show a "switch version" link. It goes to `/?choose` and clears the remembered choice.
  - Every `localStorage` access is wrapped in try/catch.
- SPA fallback already exists (`public/_redirects`, `vercel.json`). No change is needed.
- **Analytics:** keep Umami. Add events with `umami.track`, guarded because the script may be blocked: `version-chosen` `{version}`, `section-opened` `{section, version}`, and `radio-toggled` `{on}`.

---

## 4. Shared content model

Everything both versions display comes from typed modules in `src/content/`. Neither UI hard-codes copy.

```
src/content/
  profile.ts      name, title ("Software & Android Engineer"), location ("Manchester, UK"),
                  email, links {github, linkedin?}, shortBio, origin story beats
  experience.ts   Role[]: { id, title, org, start, end|null, summary, bullets[], stack[] }
  projects.ts     Project[]: { id, name, tagline, description, stack[], platform,
                  links {live?, appStore?, playStore?, github?}, image, alt }
  skills.ts       SkillGroup[]: { title, items[] }
  index.ts        re-exports + derived helpers (e.g. currentRole)
```

**Content carried over from v2:** roles (Government Junior SE, Government SE), projects (Football Stats, Salah Times, Screendle, Candice), skills, contact details and links.

**Content changes:**
- Title: "Software & Android Engineer". Tagline and bio are rewritten around the Android move and the film-to-code story.
- Deloitte role: the title and bullets reflect native Android (Kotlin + Jetpack Compose). Specifics are still to come from Oliver; until then there's a truthful fallback (§11.1).
- Skills: add Kotlin, Jetpack Compose and Android SDK groups/items.
- Salah Times is **React Native (Expo)**. It's described accurately as a mobile app and not claimed as Kotlin. It appears under Android/mobile work.
- Candice is native Android (Java + ML Kit).

**Integrity test:** a unit test asserts that:
- every project has at least one link and non-empty alt text;
- every role has at least one bullet;
- no string contains a placeholder marker (`TODO`, `PLACEHOLDER`, `lorem`, `your real bullets`).

---

## 5. Landing page (`/`)

Prototype section 1:
- On paper: an eyebrow line "OLIVER SHOOTER · MANCHESTER", then the H1 "Software & Android Engineer", printed as blue ink with a pink offset shadow. The shadow is a static CSS effect; the H1 text meets AA contrast.
- The prompt "How would you like to look around?", then two large "door" cards. Each is a single `<a>` with a descriptive accessible name:
  - **The Late Shift →**: a small live preview (a CSS-animated room miniature), the text "Step into my room…", and the meta line "WORKS ON DESKTOP & MOBILE · SOUND OPTIONAL · ~2 MIN".
  - **The Quick Read →**: a text-skeleton preview, the text "Everything on one clean page…", and the meta line "ANY DEVICE · NO MOTION · ~30 SEC".
- The "Remember my choice" checkbox.
- **Layout:** two columns at ≥ 720px; stacked below that.
- **The landing page itself meets AA.** It gets the same automated checks as The Quick Read. The preview animation stops under `prefers-reduced-motion`.
- The landing page and The Quick Read **must not load** the room renderer. It's code-split (§8).

---

## 6. The Late Shift (`/late-shift`)

### 6.1 Rendering engine
The architecture is proved out in the prototype.

- **Virtual coordinate space per layout:**

  | Layout | Virtual size | Desk top (`deskY`) |
  |---|---|---|
  | desktop | 1000 × 560 | 410 |
  | phone | 420 × 780 | 600 |

  Scene code only ever draws in virtual units.
- **Three ink plates** (`yellow`, `pink`, `blue`) are offscreen canvases, sized to CSS size × `min(devicePixelRatio, 2)`.
- **Per frame, for each plate:**
  1. Clear the plate.
  2. Apply that ink's misregistration offset: `OFF[ink] × grain`, plus a boil jitter re-rolled 6 times a second.
  3. Scale virtual units to pixels, then apply the camera transform.
  4. Call `scene(ink, plateCtx, t)`, which draws **coverage as alpha**.
  5. Tint the plate with `source-in` and the ink colour.
  6. Draw it onto the main canvas with `globalCompositeOperation = 'multiply'`.
- **Paper and grain:** start by filling paper, and finish with a precomputed grain canvas multiplied at alpha `0.25 + 0.75 × grain`. `grain` is fixed at 0.12 in production; there's no user slider.
- **Paint helpers**, ported from the prototype:
  - `own(ctx, path, coverage)`: clear a region with `destination-out`, then fill it at that coverage. The shape then "owns" its value on that plate.
  - `knock(ctx, draw, amount)`: `destination-out` only, for rain, steam and stars.
  - `C(coverage)`: returns an alpha colour.
  - `K(triple)`: picks this ink's coverage from a `[y, p, b]` triple.
- **Loop:** `requestAnimationFrame`, with `dt` clamped to ≤ 50ms. All motion is time-based.
  - Time-of-day values ease towards their target: `1 − e^(−2.5·dt)`.
  - Hover values ease with `1 − e^(−14·dt)`.
- **Pausing:** rendering stops when `document.hidden`, when the canvas is off-screen (IntersectionObserver), or when a section page fully covers the room.
- **Determinism:** random-looking placement uses the integer `hash(x, y, seed)` from the prototype, never `Math.random`, so frames are stable and testable.

### 6.2 Module layout

```
src/late-shift/
  engine/
    compositor.ts      plates, grain, DPR, multiply compositing, render(t)
    paint.ts           own, knock, C, K, ease, mix, hash
    loop.ts            rAF loop with dt, pause/resume, visibility + intersection handling
  scene/
    palette.ts         ink hexes, misregistration offsets
    timeOfDay.ts       TOD presets (skyT, skyB, wall, sil, lamp, lit, n), autoTod(date), lerp
    layouts.ts         LAYOUTS {desk, phone}: VW, VH, deskY, zoom, place{id → {x,y,s,ox,oy}}
                       + applyPlace, transformPoint, transformBox
    camera.ts          camera state (focus id, progress 0..1) → transform; zoom targets per object
    room.ts            draw order, wall, desk, lamp glow, drawObj (place + hover lift/glow/outline)
    objects/           one file per object: window, poster, stickies, shelf, camera, football,
                       radio, mug, books, laptop, phone, lamp. Each exports
                       { id, box, draw(ctx, t, K, state) } in desktop virtual units
    objects.ts         interactive object registry: id, label, number, section route, tag side
  ui/
    RoomCanvas.tsx     mounts the canvas, owns engine lifecycle, resize → re-setup
    Tags.tsx           masking-tape labels (real <button>s) positioned from transformBox
    SectionChips.tsx   numbered chips under the scene
    RadioBadge.tsx     "♪ lofi fm · rain on oxford road" and the toggle state
    SectionPage.tsx    overlay shell: back button, Esc handling, focus management, heading
    PrintHeading.tsx   CSS two-layer "print-in" heading (pink/blue spans, multiply, slide into register)
  sections/            one skin per section (§6.5)
  audio/
    lofiRadio.ts       Web Audio: procedural lofi loop + rain + vinyl crackle (§6.7)
  LateShift.tsx        route component; lazy-loaded
```

### 6.3 Interaction model
- **Discoverability** (all agreed in brainstorming):
  - Every interactive object has an always-visible **masking-tape tag**: cream fill, blue mono text, pink offset shadow, a pulsing pink dot and a slight rotation. The tags pop in one after another on load.
  - On desktop, a hint reads "✦ CLICK ANYTHING WITH A TAG". It fades after the first interaction and is hidden on phones.
  - **On hover or focus:** the object lifts by 4 units and scales to 1.035, with a yellow glow behind it and a pink dashed "marching ants" outline. Its tag and chip turn yellow, and the cursor becomes a pointer.
  - **Section chips** sit under the scene (`01 · ABOUT ME` … `05 · CONTACT`, projects `P1–P4`, `♪ LOFI RADIO`). Hovering or focusing a chip highlights its object.
- **Hit-testing:** pointer position → virtual coordinates → the top-most object whose *transformed* box contains the point. Disabled while the camera is zoomed.
- **Keyboard:** tags and chips are `<button>`s in a logical tab order. Enter/Space activates; Esc closes a section.
- **Activating an object:**
  1. Push the URL `/late-shift/<section>`.
  2. Animate the camera from the room to that object's zoom target over about 900ms (ease-in-out).
  3. The section page fades in over the zoomed canvas (§6.5).
  4. **Back** (button, Esc or browser back) reverses this.

  Deep-linking to `/late-shift/<section>` starts already zoomed in, with the page open.
- **Scrolling in the room:** a wheel, swipe or keyboard scroll-down in the room scrubs the camera into the **phone**. At progress 1 the Android section opens (the "scroll = camera" beat from the prototype). Scrolling up at the top of the Android section scrubs back out.
  - Implemented with GSAP ScrollTrigger on a 100vh spacer, with the canvas pinned.
- **Radio:** clicking the radio toggles audio. The reels spin and notes float up only while it's playing. Audio is **off by default**.

### 6.4 Camera
- Every interactive object has a zoom target: a focus point and a zoom level, so the object's "screen" or face fills about 90% of the viewport's short edge.
- **Phone target:** desktop zoom = 1 + 3.9·e², phone layout zoom = 1 + 5.6·e², where e is the eased progress. These values are validated in the prototype.
- The other targets are tuned per object during implementation.
- **During zoom:** the tags and hint fade out and hit-testing is off.

### 6.5 Section pages ("skins")
- Each section opens as an HTML overlay styled as the object's surface.
- **Body text is real, sharp, selectable HTML.** Only the heading uses the print-in effect.
- Every section page has a "← BACK TO THE ROOM (ESC)" control and a "switch to Quick Read" link.

| Section | Object | Skin |
|---|---|---|
| About | Super 8 camera | A film strip of story beats (2014 film → 2020 MSc → 2021 Government → 2026 Deloitte/Android). Frames scroll horizontally on desktop and vertically on phones. Sprocket holes, and frame numbers in mono |
| Android | Phone | An app-like screen: "02 / KOTLIN · JETPACK COMPOSE", then Android-focused cards (Deloitte Android work, Candice, Salah Times), each with stack chips and links |
| Experience | Laptop | A code editor. On desktop, the sidebar "EXPLORER" lists roles as files (`deloitte.kt`, `government_se.kt`, `government_jr.kt`, `msc_birmingham.md`, `film_2014.mov`). The main pane shows the selected role: period/org line, title, bullets styled as a Kotlin `listOf(...)`, stack chips. On phones, the sidebar becomes swipeable tabs |
| Skills | Book stack | Book spines on a shelf, one spine per skill group. Opening a spine lists its items |
| Projects (Screendle, Candice, Football) | Poster / stickies / football | A zine-style case study: title, tagline, description, stack, links and screenshot (existing images in `public/images/`) |
| Contact | Window | A postcard from Manchester, with a stamp, an email link, GitHub, LinkedIn (if provided) and a location line |

- **Focus management:** on open, focus moves to the section's `<h1>`. On close, focus returns to the tag or chip that opened it.
- The overlay is a `role="dialog"` with `aria-modal="true"` and an `aria-labelledby` pointing at the heading.

### 6.6 Mobile (portrait)
- **Layout selection:** the phone layout is used when the viewport is portrait **and** narrower than 700px. Landscape phones and tablets use the desktop layout. The layout is re-evaluated on resize or orientation change, which re-runs setup and rebuilds the tags.
- **Phone placements** (validated in the prototype; `ox, oy` is the object's desktop origin):

  | Object(s) | x | y | s | ox | oy |
  |---|---|---|---|---|---|
  | contact (window) | 23 | 40 | 0.9 | 62 | 42 |
  | screendle | 22 | 345 | 0.85 | 508 | 62 |
  | candice | 118 | 352 | 0.85 | 622 | 80 |
  | shelf, about, football | 240 | 372 | 0.8 | 770 | 140 |
  | experience | 96 | 469 | 0.78 | 456 | 246 |
  | android | 318 | 490 | 0.95 | 738 | 296 |
  | lamp | 8 | 504 | 0.7 | 878 | 275 |
  | radio | 24 | 627 | 0.85 | 146 | 326 |
  | mug | 190 | 635 | 0.9 | 330 | 334 |
  | skills | 250 | 652 | 1 | 388 | 364 |

- Tags are always visible, which matters because touch has no hover. Tags are smaller, but each tag's hit area is ≥ 44×44 CSS px (the visible label can be smaller; padding extends the target).
- The hint is hidden. The radio badge shrinks to a "♪" icon.
- Section pages are full-screen and scroll normally.
- Phones get lighter rain (half the streaks).

### 6.7 Audio: "LOFI FM"
- **Procedural Web Audio**, so there are no licensing questions and it's personal. It's lazy-created on the first radio tap, which also satisfies iOS's rule that audio starts from a user gesture.
- **Music loop:** a slow 4-chord jazzy progression (Rhodes-like: sine plus a soft triangle, with a low-pass and a gentle tremolo), a soft kick/snare/hat pattern at about 72 BPM with swing, and vinyl crackle (sparse filtered noise clicks).
- **Rain bed:** band-passed noise with a slow volume modulation.
- **Controls:** master gain around 0.35, fading in and out over 600ms. The state persists per session in `sessionStorage`.
- **Fallback:** if procedural quality is judged not good enough during implementation, swap in CC0 loop files (for example from Freesound or Pixabay) behind the same `lofiRadio` interface. Record the sources in `public/audio/SOURCES.md`.

### 6.8 Performance budget
- **60fps target** on a mid-range laptop, and 30fps or more on a mid-range phone.
- **JavaScript:**
  - The landing page plus The Quick Read are ≤ 90 KB gzipped.
  - The Late Shift chunk is ≤ 120 KB gzipped, excluding GSAP (which is shared).
- **Per frame:** no `getImageData`. Rendering is GPU compositing only.
- **Resource creation:** grain and plates are created once per setup, never per frame.

### 6.9 Reduced motion and baseline accessibility
- **`prefers-reduced-motion: reduce`:**
  - The room renders **one static frame**, and re-renders only on hover, time-of-day change or layout change.
  - Tags don't pulse.
  - The camera "zoom" becomes a 200ms cross-fade.
  - Print-in headings appear already in register.
  - Scroll-scrubbing is disabled; scrolling acts like a normal page with the chips as navigation.
- The canvas is `aria-hidden="true"`. A visually hidden description of the room sits beside it, and the tags and chips provide full keyboard and screen-reader navigation.
- Contrast: tag and chip text is blue on paper (≥ 4.5:1).

---

## 7. The Quick Read (`/quick`)

Prototype section 3.

- **One page with semantic landmarks:**
  - skip link → `<header>` (name + `<nav>` with in-page links) → `<main>` → `<footer>`
  - Sections in `<main>`, in order: intro (H1 "Software & Android Engineer in Manchester" plus a short bio), Android, Experience, Projects, Skills, Contact.
- **Content:** the same `src/content` data as The Late Shift. Projects get real links and images with meaningful `alt` text.
- **Visual design:** warm but plain.
  - Light theme: `#fbf8f2` background, `#1f2233` text, `#2a4a9a` links (underlined).
  - Dark theme under `prefers-color-scheme: dark`: `#16171f` background, `#ecebf2` text, `#9db4ff` links.
  - Pink appears only as the focus ring and decoration, never as text.
  - Body 16–18px, line-height 1.6, measure ≤ 72ch.
- **WCAG 2.2 AA requirements, each one verified:**
  - 1.4.3 contrast ≥ 4.5:1 for text, and 1.4.11 ≥ 3:1 for UI and focus indicators.
  - 2.4.7 and 2.4.11: a visible focus ring (3px pink outline, 3px offset) that is never obscured.
  - 2.4.1: a skip link.
  - 1.3.1: a correct heading hierarchy and landmarks.
  - 2.5.8: targets ≥ 24×24.
  - 1.4.10: reflow at 320px with no horizontal scroll.
  - 1.4.4: text resizes to 200%.
  - 3.1.1: `lang="en-GB"`.
  - External links say so: "(opens in new tab)" as visually hidden text, or they open in the same tab.
  - No motion at all.
- A "Want the interactive version? Visit The Late Shift" link, and a "switch version" link in the footer.

---

## 8. Technical architecture

- **Stack:** keep React 18, Vite 5, TypeScript (strict), Tailwind 3 and GSAP (ScrollTrigger is only used in The Late Shift).
- **Routing:** add `react-router-dom` v6.
  - `App.tsx` becomes the router.
  - `LateShift` is `React.lazy`, so the room engine, GSAP ScrollTrigger and the audio live in a separate chunk. The landing page and The Quick Read never import `src/late-shift/**`.
- **Fonts:** self-host with `@fontsource`. Remove the Google Fonts `<link>`s.
  - Headings, print-in and doors: **Archivo Black**.
  - Tags, chips and mono labels: **JetBrains Mono** (already in use).
  - Body: **DM Sans** (already in use).
  - Syne is removed.
- **Styling:** Tailwind config tokens for the palette in §2, plus The Quick Read's light and dark tokens.
  - The current design tokens (neon `#E8FF47` and so on) and the `.scanline` and `.kinetic-grid` CSS are removed.
  - The Tailwind rule forcing `borderRadius 0` is removed. The new look uses small radii.
- **Removed code:** the existing `src/components/*` (Nav, Hero, About, Experience, Projects, Skills, Contact), the empty `src/hooks/`, and `TODO.md` (every item in it refers to components being deleted).
  - `WORKFLOW.md` is replaced by a short pointer to this spec.
  - The unused v2 images stay until confirmed unused.
- **Linting:** the repo runs a very strict ESLint setup (`eslint:all`, `@typescript-eslint/all`, `unicorn/all`, airbnb) inside the Vite dev server. All new code must pass it. Canvas drawing modules may need a small scoped override (for example `@typescript-eslint/no-magic-numbers` is already off, and `max-statements` or `max-lines` may need to be relaxed for `objects/*`). Any overrides are narrow, per-directory, and live in `.eslintrc.json`.
- **PWA:** keep `vite-plugin-pwa`. Make sure the lazy Late Shift chunk and the fonts are precached.
- **Umami:** keep the script tag; add the events from §3.

---

## 9. Testing and verification

The test setup exists in `vite.config.ts` but is broken: `src/setupTests.ts` is missing and there are no tests. It gets fixed first.

- **Setup:**
  - Create `src/setupTests.ts` (jest-dom matchers plus `vitest-axe` matchers).
  - Coverage stays on, with the current **100% threshold kept for logic modules**. Excluded from coverage: `src/late-shift/scene/objects/**`, `src/late-shift/engine/compositor.ts` and `src/late-shift/audio/**`. These are canvas and Web Audio side effects, which are verified visually instead.
- **Unit tests** (pure logic):
  - `timeOfDay.autoTod` hour boundaries.
  - `layouts` transforms (`transformPoint`, `transformBox`) for both layouts.
  - Hit-testing, including top-most order and zoom disabling hits.
  - Camera maths (progress → transform, phone targets).
  - Remembered-choice logic, including `?choose` and `localStorage` throwing.
  - Content integrity (§4).
  - Contrast-ratio checks computed from the actual token hexes, for every Quick Read and landing text/background pair in both themes.
- **Component tests** (Testing Library):
  - Landing: both doors link correctly, and "remember" stores and redirects.
  - The Quick Read: landmarks, heading order, skip link target, all content rendered from data.
  - The Late Shift UI shell (canvas mocked): tags render as buttons with names; Enter opens a section and focus moves to the heading; Esc closes and focus returns; chips mirror tags.
  - **axe** (`vitest-axe`) has zero violations on the landing page and The Quick Read.
- **Visual verification** of the canvas code: a headless Chrome screenshot script (like the brainstorm harness) captures:
  - desktop and phone layouts at each time of day;
  - hover state;
  - camera at progress 0, 0.5 and 1.

  Screenshots are reviewed before each milestone is called done.
- **Manual checks before calling it done:**
  - A Lighthouse accessibility score of 100 on `/` and `/quick`.
  - Keyboard-only walkthrough of all three routes.
  - Reduced-motion walkthrough.
  - Phone check at 390px portrait.
  - An FPS check with the DevTools performance panel.
  - `npm run build` succeeds, and the chunk sizes are within §6.8.

---

## 10. Build milestones (for the implementation plan)

1. **Foundation:** router, content modules (with current data), tokens, fonts, test setup fixed, old components removed, placeholder routes.
2. **The Quick Read:** complete, with AA tests passing.
3. **Landing:** doors, remembered choice, analytics events.
4. **Room engine:** compositor, paint, loop, time of day, desktop layout, all objects ported from the prototype, rendering at 60fps.
5. **Room interaction:** tags, chips, hover/focus effects, hit-testing, keyboard, radio visuals.
6. **Camera and sections:** zoom targets, routing to `/late-shift/:section`, section shell, the six skins, print-in headings, scroll-scrub into the phone.
7. **Mobile, performance and reduced motion:** phone layout, orientation handling, pausing, lighter rain, reduced-motion path.
8. **Audio:** procedural LOFI FM, plus the fallback hook.
9. **Polish and verification:** the full §9 checklist, bundle budgets, PWA precache, README/WORKFLOW update.

---

## 11. Open items

### 11.1 Content needed from Oliver
The site ships with truthful fallback content, so none of these block a deploy. The fallback strings carry no placeholder markers; the open items are tracked here only.

1. **Deloitte Android role:** exact title, plus 2–4 bullets on what's been built or done. Until then, the title is "Senior Consultant · Software Engineer" and the summary says the work is now native Android in Kotlin + Jetpack Compose. The existing Deloitte bullets are reworded so they don't claim specifics that aren't confirmed yet.
2. **LinkedIn URL**, or confirmation that it should be left out.
3. **Salah Times on Android:** is there a Play Store link? The App Store link exists.
4. **Personal touches** for the room (a pet, team scarf, own camera, poster). Optional; the default is none. Props are easy to add later as new `objects/*` files.

### 11.2 Decisions deferred to implementation (with defaults)
- Zoom targets for objects other than the phone: tuned visually. Default: fit the object's box to 90% of the short edge.
- Procedural audio quality: if it's not good enough, fall back to CC0 files (§6.7).
