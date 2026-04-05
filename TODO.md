# Portfolio v2 — Code Review TODO

Issues found acting as a hostile senior dev. Ordered by severity.

---

## Critical Bugs

### 1. `Experience.tsx` nukes ALL ScrollTriggers on cleanup

`ScrollTrigger.getAll().forEach(t => t.kill())` is a nuclear option.
When `Experience` unmounts (or React StrictMode double-invokes effects), it kills the
ScrollTriggers belonging to `About`, `Projects`, `Skills`, and `Contact` too — those
animations will never fire.
**Fix:** Store refs to only the triggers created in this component and kill those.

---

## Significant Bugs

### 2. `gsap.registerPlugin(ScrollTrigger)` called in every component file

`About`, `Experience`, `Projects`, `Skills`, `Contact` all call this at module level.
GSAP deduplicates it, but it's noise and suggests cargo-culting rather than design.
**Fix:** Call once in `main.tsx`, remove from components.

### 3. Nav "Work" link scrolls to the Hero section, not Experience

`Nav.tsx` has `{ label: 'Work', id: 'work' }`.
`id="work"` lives on the **Hero** `<section>` — clicking "Work" just bounces you to the top.
The Experience section sits at `id="work-detail"` which is never linked from the nav.
**Fix:** Move `id="work"` to the Experience section (or change the nav target).

### 4. "Live Project" hover text appears on Candice card (no live URL)

`Projects.tsx` shows `"Live Project"` on hover for **all** cards unconditionally.
Candice only has a GitHub link. Lying to the user on a portfolio site is bad.
**Fix:** Gate the hover label on `project.live` being truthy.

### 5. Broken favicon reference

`index.html` references `/favicon.png` but `public/favicon.png` was deleted.
Browsers will log a 404 on every page load.
**Fix:** Remove the `<link rel="icon">` tag until a real favicon exists.

---

## Dead Code

### 6. Unused `sectionRef` in `About.tsx` and `Contact.tsx`

Both declare `const sectionRef = useRef<HTMLDivElement>(null)` and attach it to the
outer section, but no GSAP animation or logic ever uses it.
**Fix:** Delete both.

### 7. Dead CSS in `index.css`

Three classes defined, never used anywhere in the codebase:

- `.font-mono-label` — duplicates `font-mono` Tailwind utility, zero usages
- `.gsap-target` — declared as a will-change hint, zero usages
- `.h-scroll-track` — horizontal scroll helper, zero usages (Experience uses inline flex)
  **Fix:** Delete all three.

### 8. `darkMode: 'class'` in tailwind config with `class="dark"` hardcoded in HTML

There is no dark mode toggle. There are no `dark:` variant classes anywhere in the
components. The design is dark-only. This is dead configuration.
**Fix:** Remove `darkMode: 'class'` from `tailwind.config.js` and `class="dark"` from
`index.html`.

### 9. `react-router-dom` in dependencies but never imported

The routing layer was deleted in the rewrite (Root.tsx, pages/ gone), but the package
remains in `package.json`. Also `@types/react-router-dom@5.3.3` — wrong version for RRD v6
(v6 ships its own types). Both are dead weight.
**Fix:** Remove from `package.json`.

---
