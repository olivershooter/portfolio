# Oliver Shooter Portfolio — Design Workflow

## Project Brief
- **Type**: Personal portfolio / career showcase
- **Audience**: Senior engineering hiring managers, technical leads, recruiters at tech-forward companies
- **Purpose**: Showcase Oliver's journey from media production to software engineering at HM Government; convert visitors into conversations
- **Date**: 2026-03-24

---

## Design DNA
- **UI Style**: Dark Premium + Bold Typography — dark background, electric accent, oversized display type as the primary design element. Chosen because Oliver's background (filmmaker → engineer) demands visual authority, not a generic "dev portfolio" template.
- **Primary color**: #E8FF47 — Electric Yellow-Green (neon accent, CTAs, section labels)
- **Background**: #0A0A0A — Near-black
- **Surface**: #131313 / #1E1E1E / #262626 — Layered surface hierarchy
- **Text**: #F0F0F0 (base) / #666666 (muted)
- **Outline**: #2A2A2A — Structural borders
- **Headline font**: Syne 700/800/900 — Angular, aggressive. Sets the "engineered" tone.
- **Body font**: DM Sans 400/500 — Clean, readable
- **Label font**: JetBrains Mono — Technical credibility for dates, section numbers, tags
- **Spacing base**: 8px grid (Tailwind defaults)
- **Border radius**: 0px everywhere (sharp) — Intentional. No softness. Technical aesthetic.
- **Shadows**: None — Flat, direct. Premium without decoration.
- **Textures**: Scanline overlay (2px stripe, CRT effect) + kinetic grid (40px squares, 20% opacity)

### Anti-patterns avoided
- No rounded corners — would undercut the technical/premium feel
- No gradients as decorative elements — only for depth/fade effects
- No lorem ipsum — every word is real copy
- No stock-photo aesthetic imagery — all images generated with Gemini 3.1 Flash (neon geometric / abstract technical)

---

## Screens Generated (Stitch MCP)

| Screen | Stitch ID | Purpose |
|--------|-----------|---------|
| Hero | a555e9ad876b4bb491ce8b5bc932f96d | Split layout reference: nav, hero headline, right-side image |
| Experience | 40ffc263bd974d88adb8e71f45d94061 | Horizontal scroll card layout reference |

Stitch project ID: `15857892402032603934`
Stitch screens were used as layout/component reference only — translated to React/TypeScript + Tailwind.

---

## Images

All images generated with **Gemini 3.1 Flash Image Preview** via Nano Banana MCP. 3 variants generated per slot; best selected by design DNA alignment, composition, and absence of artifacts.

| Usage | File | Prompt summary | Why selected |
|-------|------|----------------|-------------|
| Hero (right panel) | `/public/images/hero.png` | Circuit board + 3D crystal geometry, #E8FF47 neon on black | Best composition: neon yellow lines exactly matched design accent; no text artifacts |
| Projects section bg | `/public/images/projects.png` | Aerial server room with diagonal electric streak | Strong diagonal energy; cinematic dark tone |
| Football Statistics | `/public/images/football.png` | Isometric wireframe stadium, neon yellow | Clean wireframe aesthetic matched the "no fluff, data-driven" project description |
| Candice | `/public/images/candice.png` | Multilingual character vortex with neon nodes | Abstract multilingual data flow — conceptually accurate to the translation app |

---

## Component Map

| Section | Component | Source |
|---------|-----------|--------|
| Nav | Fixed glassmorphism nav + mobile hamburger | Custom |
| Hero | Full-viewport split: content left, image right | Custom + Stitch ref |
| About | Chronological timeline (border-b rows) + stat grid | Custom |
| Experience | GSAP horizontal scroll (desktop) + vertical stack (mobile) | Custom |
| Projects | Full-bleed project cards (image + content, left-border accent) | Custom |
| Skills | Bento grid (gap-px bg-outline technique) | Custom |
| Contact | Oversized background text + CTA + footer | Custom |

---

## Stack
- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **CSS**: Tailwind CSS (custom design tokens in tailwind.config.js)
- **Animation**: GSAP + ScrollTrigger
- **Fonts**: Google Fonts (Syne, DM Sans, JetBrains Mono)
- **Image generation**: Gemini 3.1 Flash via Nano Banana MCP
- **Design reference**: Google Stitch MCP

---

## Key Decisions

- **GSAP over CSS animations**: ScrollTrigger's `pin + scrub` for horizontal experience scroll gives precise scroll-synced control that CSS can't match. Entry animations use `timeline()` for orchestrated stagger sequences.
- **Split mobile/desktop Experience**: GSAP pin completely breaks on mobile (wrong viewport assumptions). Mobile gets a clean vertical card stack — same content, zero JS complexity.
- **`gap-px bg-outline` bento grid trick**: Instead of adding borders to each cell individually (which causes double-borders and misaligned widths), the grid container uses a 1px gap with the outline colour as background — the gap *is* the border.
- **`mix-blend-luminosity` on images**: Strips colour from photos, letting the design palette dominate. The electric yellow scanline textures bleed through naturally.
- **No `border-radius` anywhere**: Enforced at the Tailwind config level (`DEFAULT: '0px'`). Sharp geometry is a core design constraint, not a default.
- **`clamp()` font sizes**: Typography scales fluidly between breakpoints without arbitrary pixel jumps. Prevents layout breaks at odd viewport widths.
- **Electric yellow on dark**: Passes WCAG AA contrast at ~12:1 ratio against #0A0A0A. Both aesthetic and accessible.

---

## What's Left

- [ ] LinkedIn URL (Oliver to confirm handle)
- [ ] olivershooter.com domain confirm (footer link)
- [ ] Production build test (`npm run build`) — verify col-span safelist works in prod bundle
- [ ] Deploy (Vercel / Netlify recommended — zero config for Vite)
