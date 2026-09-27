# Portfolio v3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-page portfolio with three things:
1. a landing chooser;
2. **The Late Shift**, an interactive riso/lofi room drawn on canvas;
3. **The Quick Read**, a single page that meets WCAG 2.2 AA.

Both versions are driven by one shared content module.

**Architecture:**
- **Stack:** React 18 + Vite + TypeScript + Tailwind, routed with `react-router-dom` v6.
- **Content:** lives in typed modules under `src/content/`.
- **The Late Shift is a lazy-loaded route.** Its layers:
  - Pure scene logic: layouts, hit-testing, camera maths and time of day.
  - Canvas "ink plate" drawing functions ported from the approved prototype.
  - A GPU compositor that multiplies three tinted plates onto paper.
  - A React UI shell: tags, chips and the section dialogs.
  - GSAP for camera tweens and scroll-scrub.
  - A procedural Web Audio radio.

**Tech Stack:** React 18.2, react-router-dom 6.30.6, Vite 5, TypeScript 5.4 (strict), Tailwind 3.4, GSAP 3.14 (+ScrollTrigger), Vitest 1.5 + Testing Library + axe-core, @fontsource (Archivo Black, DM Sans, JetBrains Mono).

**Spec:** `docs/superpowers/specs/2026-09-27-portfolio-v3-design.md`. Read it before starting any task.

**Prototype (reference for the canvas code):** `docs/superpowers/specs/2026-09-27-portfolio-v3-prototypes/late-shift-room.html`

## Global Constraints

**Shell:**
- The shell is Git Bash on Windows. Run tools through npm scripts. `node_modules` is reinstalled natively in Task 1.

**Commits:**
- Always commit with `git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "<type>: <message>"`.
- **Never mention Claude, AI, Anthropic or assistants in commits.** No co-author trailers.
- Work on branch `redesign/late-shift`.

**Formatting (Prettier):** tabs, no semicolons, single quotes, `jsxSingleQuote`, `printWidth` 80, `trailingComma` none, `arrowParens` avoid.
- Before every commit, run `npx prettier -w <changed files>`.

**Linting:** before every commit, run `npm run run-eslint -- <changed ts/tsx files>` (it has `--fix`) and `npm run run-stylelint` for CSS. Then fix whatever remains by hand. These rules are active and not auto-fixable:
- `@typescript-eslint/max-params` is 3. Use an object parameter when you need more. Canvas directories are exempted in Task 1.
- `react/boolean-prop-naming`: boolean props start with `is` or `has`.
- `react/jsx-handler-names`: handler props get `on*` functions. An inline arrow may only call an `on*` function, never `setX`.
- `unicorn/prevent-abbreviations`: write `reference`, not `ref`; `properties`, not `props`; `event`, not `e`; `index`, not `i`; `element`, not `el`; `current`, not `cur`; `parameters`, not `params`.
- Unions are sorted (`@typescript-eslint/sort-type-constituents`; auto-fixed).
- stylelint-config-standard:
  - modern colour notation, `rgb(0 0 0 / 50%)`;
  - range media queries, `(width >= 720px)`;
  - quote only multi-word font names.

**Tests:**
- Tests live only in `src/**/__tests__/*.test.ts(x)`. That's the Vitest include pattern.
- Run them with `npm run test:run`, and coverage with `npm run test:coverage`. Coverage has a 100% threshold on the logic files listed in `vite.config.ts`.

**Palette (exact hexes):**

| Token | Hex |
|---|---|
| paper | `#f4ecdd` |
| ink blue | `#3255a4` |
| ink pink | `#ff48b0` |
| ink yellow | `#ffe200` |
| ink text | `#22223a` |
| focus on paper | `#c2187a` |

| Quick Read | bg | text | muted | link | focus |
|---|---|---|---|---|---|
| light | `#fbf8f2` | `#1f2233` | `#3d4054` | `#2a4a9a` | `#c2187a` |
| dark | `#16171f` | `#ecebf2` | `#c4c3d0` | `#9db4ff` | `#ff48b0` |

Pink `#ff48b0` is never used as text.

**Fonts:** Archivo Black (display), DM Sans (body), JetBrains Mono (labels), all self-hosted via @fontsource. No Google Fonts.

**Routes:** `/`, `/quick`, `/late-shift`, `/late-shift/:section` (with the `*` splat), and `*` → `/`.
- Section ids: `about`, `android`, `experience`, `skills`, `contact`, `projects/screendle`, `projects/candice`, `projects/football`.

**Storage keys:**
- `localStorage` `os-portfolio:version` = `late-shift` | `quick`.
- `sessionStorage` `os-portfolio:radio` = `on` | `off`.
- Every storage access goes through `src/lib/storage.ts`, which never throws.

**Analytics events:** `version-chosen` `{version}`, `section-opened` `{section, version}`, `radio-toggled` `{on}`. All go through `src/lib/analytics.ts`, which never throws.

**Content:**
- Use the existing copy carried over in Task 2.
- The Deloitte role uses the fallback in spec §11.1: title "Senior Consultant · Software Engineer" and a summary about native Android with Kotlin + Jetpack Compose. Don't invent any other claims.
- Salah Times is React Native.
- `lang="en-GB"`.

**Performance budgets (gzipped):**
- The landing page plus The Quick Read are ≤ 90 KB of JavaScript.
- The Late Shift chunk is ≤ 120 KB, excluding the shared `gsap` chunk.
- No `getImageData` inside the render loop.

**Reduced motion (`prefers-reduced-motion: reduce`):**
- A static room frame, no scroll-scrub, no pulsing.
- Camera moves are instant.

## Review Focus

1. **The canvas can't be created** (no 2D context: blocked, old browser, jsdom). The Late Shift must still render its title, chips and fallback message, and every section must open from the chips. The test lives in Task 10.
2. **Nested deep links** like `/late-shift/projects/screendle` (a section id containing a slash). They must open the right section directly, already zoomed, with focus on its heading. The test lives in Task 12.
3. **Rapid double activation**: clicking a second tag while the camera is still flying to the first. Only the last section may open, and the first must never flash open later. The test lives in Task 12.
4. **A corrupted remembered version** (for example `localStorage['os-portfolio:version'] = 'fancy'`). `/` must show the chooser, not redirect or crash. The test lives in Task 3.
5. **Resizing or rotating while a section is open**: the dialog stays open, and the engine gets the new layout without losing its camera target. The test lives in Task 12.

---

## File Structure

```
index.html                         (modify) lang, title, fonts removed, umami kept
tailwind.config.js                 (rewrite) tokens from src/theme/tokens.json
vite.config.ts                     (modify) coverage include list, manualChunks, PWA globs
.eslintrc.json                     (modify) no-null off, for-of allowed, canvas-dir overrides
.gitignore                         (modify) screenshots/
package.json                       (modify) deps + scripts
WORKFLOW.md                        (rewrite) pointer to spec/plan
TODO.md                            (delete)
scripts/room-screenshots.sh        (create) headless Chrome captures of the room
src/main.tsx                       (rewrite) BrowserRouter, fonts
src/App.tsx                        (rewrite) routes
src/index.css                      (rewrite) tokens as CSS vars, base, landing + quick styles
src/setupTests.ts                  (create) jest-dom, browser API stubs
src/testUtils.tsx                  (create) renderRoute, setReducedMotion, axeViolations
src/theme/tokens.json              (create) single source of colour truth
src/content/{types,profile,experience,projects,skills,index}.ts
src/lib/{storage,versionChoice,analytics,contrast,useReducedMotion}.ts
src/components/{ExternalLink,SwitchVersionLink}.tsx
src/pages/{Landing,QuickRead}.tsx
src/late-shift/LateShift.tsx       route component (lazy)
src/late-shift/lateShift.css       Late Shift-only styles (code-split)
src/late-shift/sectionIds.ts       SectionId list + guard
src/late-shift/scene/              pure logic + canvas drawing
  math.ts palette.ts timeOfDay.ts objects.ts layouts.ts hitTest.ts camera.ts
  state.ts paint.ts room.ts
  objects/{window,wallArt,shelf,deskItems,laptop,phone}.ts
src/late-shift/engine/{compositor,loop,roomEngine}.ts
src/late-shift/ui/
  useRoomEngine.ts RoomStage.tsx Tags.tsx SectionChips.tsx RadioBadge.tsx debugParameters.ts
  useCameraTween.ts useFocusTrap.ts SectionPage.tsx useScrollIntoPhone.ts useLofiRadio.ts
src/late-shift/sections/
  PrintHeading.tsx AboutFilm.tsx AndroidScreen.tsx ExperienceEditor.tsx
  SkillsShelf.tsx ProjectZine.tsx ContactPostcard.tsx registry.tsx
src/late-shift/audio/lofiRadio.ts
```

**Deleted:** `src/components/{Nav,Hero,About,Experience,Projects,Skills,Contact}.tsx` and the empty `src/hooks/`.

---

### Task 1: Tooling reset and test harness

**Files:**
- Modify: `package.json`, `.eslintrc.json`, `vite.config.ts`
- Create: `src/setupTests.ts`, `src/testUtils.tsx`, `src/__tests__/setup.test.tsx`

**Interfaces:**
- Produces:
  - `setReducedMotion(isReduced: boolean): void`
  - `renderRoute(path: string, routes: ReactElement): RenderResult`, which also renders a `<output data-testid='location'>` showing pathname and search
  - `axeViolations(): Promise<string[]>`
  - `LocationProbe` component
  - npm scripts `test:run`, `test:coverage`, `lint`

- [ ] **Step 1: Reinstall dependencies natively.** The current `node_modules` came from another OS: it has no `.cmd` shims, and the lockfile lists `@gsap/react`, which isn't in `package.json`.

```bash
rm -rf node_modules && npm install
```
Expected: this finishes without errors, and `npx vite --version` prints `vite/5.2.8`.

- [ ] **Step 2: Add the new dependencies**

```bash
npm install react-router-dom@6.30.6 @fontsource/archivo-black@5.3.0 @fontsource/dm-sans@5.3.0 @fontsource/jetbrains-mono@5.3.0
npm install -D axe-core@^4.10.0
```

- [ ] **Step 3: Add scripts to `package.json`** (inside `"scripts"`, keeping the existing ones)

```json
"lint": "eslint --ext .ts,.tsx src",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage",
```

- [ ] **Step 4: Update `.eslintrc.json`.** Add these two entries to `"rules"`:

```json
"unicorn/no-null": "off",
"unicorn/no-useless-undefined": "off",
"import/prefer-default-export": "off",
"no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"],
```

Append this object to `"overrides"`:

```json
{
	"files": [
		"src/late-shift/engine/**/*.ts",
		"src/late-shift/scene/**/*.ts",
		"src/late-shift/audio/**/*.ts"
	],
	"rules": {
		"no-bitwise": "off",
		"no-param-reassign": ["error", { "props": false }],
		"unicorn/prefer-math-trunc": "off",
		"@typescript-eslint/max-params": "off"
	}
}
```

Why each override is needed:
- `unicorn/no-array-for-each` and airbnb's `for...of` ban contradict each other.
- React and DOM APIs return `null`.
- `unicorn/no-useless-undefined` contradicts airbnb's `consistent-return` in effects that bail out early (`return undefined`).
- Content and scene modules are named-export collections, so `import/prefer-default-export` doesn't fit them.
- Canvas code writes context properties and uses integer hashing.

- [ ] **Step 5: Replace the `test` block in `vite.config.ts`**

```ts
	test: {
		css: false,
		include: ['src/**/__tests__/*'],
		globals: true,
		environment: 'jsdom',
		setupFiles: 'src/setupTests.ts',
		clearMocks: true,
		coverage: {
			include: [
				'src/lib/**/*.ts',
				'src/content/**/*.ts',
				'src/late-shift/sectionIds.ts',
				'src/late-shift/scene/math.ts',
				'src/late-shift/scene/timeOfDay.ts',
				'src/late-shift/scene/objects.ts',
				'src/late-shift/scene/layouts.ts',
				'src/late-shift/scene/hitTest.ts',
				'src/late-shift/scene/camera.ts',
				'src/late-shift/engine/loop.ts',
				'src/late-shift/ui/debugParameters.ts'
			],
			exclude: ['**/__tests__/**'],
			thresholds: {
				'100': true
			},
			provider: 'istanbul',
			enabled: false,
			reporter: ['text', 'lcov'],
			reportsDirectory: 'coverage'
		}
	},
```

`src/lib/useReducedMotion.ts` is a hook. It's covered by its own test in Task 3, so keeping `src/lib/**` in the list is intended.

- [ ] **Step 6: Write the failing smoke test** `src/__tests__/setup.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'

describe('test harness', () => {
	it('has jest-dom matchers and browser API stubs', () => {
		render(<p>ready</p>)
		expect(screen.getByText('ready')).toBeInTheDocument()
		expect(
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		).toBe(false)
		expect(typeof ResizeObserver).toBe('function')
		expect(typeof IntersectionObserver).toBe('function')
	})
})
```

- [ ] **Step 7: Run it to verify it fails**

Run: `npm run test:run`
Expected: FAIL, because `src/setupTests.ts` doesn't exist.

- [ ] **Step 8: Create `src/testUtils.tsx`**

```tsx
import { render, type RenderResult } from '@testing-library/react'
import axe from 'axe-core'
import type { ReactElement } from 'react'
import { MemoryRouter, Routes, useLocation } from 'react-router-dom'
import { vi } from 'vitest'

export function setReducedMotion(isReduced: boolean): void {
	vi.stubGlobal('matchMedia', (query: string) => ({
		matches: isReduced && query.includes('prefers-reduced-motion'),
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(() => false)
	}))
}

export function LocationProbe() {
	const location = useLocation()
	return (
		<output data-testid='location'>
			{location.pathname + location.search}
		</output>
	)
}

export function renderRoute(path: string, routes: ReactElement): RenderResult {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>{routes}</Routes>
			<LocationProbe />
		</MemoryRouter>
	)
}

export async function axeViolations(): Promise<string[]> {
	const results = await axe.run(document.body, {
		rules: { 'color-contrast': { enabled: false } }
	})
	return results.violations.map(
		violation =>
			`${violation.id}: ${violation.nodes
				.map(node => node.target.join(' '))
				.join(', ')}`
	)
}
```

(jsdom can't compute colour contrast. Contrast is proven from the tokens instead, in Task 4.)

- [ ] **Step 9: Create `src/setupTests.ts`**

```ts
import '@testing-library/jest-dom/vitest'
import { beforeEach, vi } from 'vitest'
import { setReducedMotion } from './testUtils'

class ObserverStub {
	public observe = vi.fn()

	public unobserve = vi.fn()

	public disconnect = vi.fn()

	public takeRecords = vi.fn(() => [])
}

vi.stubGlobal('ResizeObserver', ObserverStub)
vi.stubGlobal('IntersectionObserver', ObserverStub)

beforeEach(() => {
	setReducedMotion(false)
	window.localStorage.clear()
	window.sessionStorage.clear()
})
```

- [ ] **Step 10: Run the tests, typecheck and build**

Run: `npm run test:run && npm run run-tsc && npm run build`
Expected: 1 test passes, `tsc` exits 0, and the build succeeds.

`npm run lint` still reports errors in `src/components/*`. That's expected: those files are deleted in Task 4.

- [ ] **Step 11: Commit**

```bash
npx prettier -w package.json .eslintrc.json vite.config.ts src/setupTests.ts src/testUtils.tsx src/__tests__/setup.test.tsx
git add package.json package-lock.json .eslintrc.json vite.config.ts src/setupTests.ts src/testUtils.tsx src/__tests__/setup.test.tsx
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "chore: reinstall deps natively, add router/fonts/axe, fix test harness"
```

---

### Task 2: Shared content modules

**Files:**
- Create: `src/content/types.ts`, `src/content/profile.ts`, `src/content/experience.ts`, `src/content/projects.ts`, `src/content/skills.ts`, `src/content/index.ts`
- Test: `src/content/__tests__/content.test.ts`

**Interfaces:**
- Produces:
  - Types: `Profile`, `StoryBeat`, `Role`, `Project`, `ProjectId` (`'candice' | 'football' | 'salah-times' | 'screendle'`), `SkillGroup`
  - Constants: `profile`, `experience: readonly Role[]` (newest first), `projects: readonly Project[]`, `skills: readonly SkillGroup[]`
  - Helpers: `currentRole(): Role`, `getProject(id: ProjectId): Project`, `mobileProjects(): readonly Project[]` (platform `android` or `mobile`)

- [ ] **Step 1: Write the failing test** `src/content/__tests__/content.test.ts`

```ts
import {
	currentRole,
	experience,
	getProject,
	mobileProjects,
	profile,
	projects,
	skills
} from '..'

const PLACEHOLDER = /todo|placeholder|lorem|your real bullets/i

function allStrings(value: unknown): string[] {
	if (typeof value === 'string') return [value]
	if (Array.isArray(value)) return value.flatMap(item => allStrings(item))
	if (value && typeof value === 'object')
		return Object.values(value).flatMap(item => allStrings(item))
	return []
}

describe('content', () => {
	it('positions Oliver as a Software & Android Engineer in Manchester', () => {
		expect(profile.title).toBe('Software & Android Engineer')
		expect(profile.location).toBe('Manchester, UK')
		expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[a-z]+$/)
	})

	it('has at least one bullet and a unique editor file for every role', () => {
		for (const role of experience) expect(role.bullets.length).toBeGreaterThan(0)
		const files = experience.map(role => role.file)
		expect(new Set(files).size).toBe(files.length)
	})

	it('treats the first role as current and mentions Android there', () => {
		expect(currentRole().isCurrent).toBe(true)
		expect(currentRole().org).toBe('Deloitte')
		expect(currentRole().summary).toMatch(/Kotlin/)
		expect(experience.filter(role => role.isCurrent)).toHaveLength(1)
	})

	it('gives every project a link, alt text, image size and https URLs', () => {
		for (const project of projects) {
			const links = Object.values(project.links)
			expect(links.length).toBeGreaterThan(0)
			for (const link of links) expect(link).toMatch(/^https:\/\//)
			expect(project.alt.length).toBeGreaterThan(20)
			expect(project.imageSize.width).toBeGreaterThan(0)
		}
	})

	it('finds projects by id and lists mobile work', () => {
		expect(getProject('candice').platform).toBe('android')
		expect(() => getProject('nope' as 'candice')).toThrow(/Unknown project/)
		expect(mobileProjects().map(project => project.id)).toEqual([
			'salah-times',
			'candice'
		])
	})

	it('lists Kotlin and Jetpack Compose among the skills', () => {
		const items = skills.flatMap(group => group.items)
		expect(items).toContain('Kotlin')
		expect(items).toContain('Jetpack Compose')
	})

	it('contains no placeholder text anywhere', () => {
		const strings = allStrings({ profile, experience, projects, skills })
		expect(strings.filter(text => PLACEHOLDER.test(text))).toEqual([])
	})
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:run -- src/content`
Expected: FAIL, because the module `..` can't be found.

- [ ] **Step 3: Create `src/content/types.ts`**

```ts
export interface StoryBeat {
	readonly year: string
	readonly title: string
	readonly text: string
}

export interface Profile {
	readonly name: string
	readonly title: string
	readonly location: string
	readonly email: string
	readonly shortBio: string
	readonly contactMessage: string
	readonly links: {
		readonly github: string
		readonly site: string
		readonly linkedin?: string
	}
	readonly story: readonly StoryBeat[]
}

export interface Role {
	readonly id: string
	readonly title: string
	readonly org: string
	readonly period: string
	readonly isCurrent: boolean
	readonly summary: string
	readonly bullets: readonly string[]
	readonly stack: readonly string[]
	readonly file: string
}

export type ProjectId = 'candice' | 'football' | 'salah-times' | 'screendle'

export interface Project {
	readonly id: ProjectId
	readonly name: string
	readonly tagline: string
	readonly description: string
	readonly stack: readonly string[]
	readonly platform: 'android' | 'mobile' | 'web'
	readonly links: {
		readonly live?: string
		readonly appStore?: string
		readonly playStore?: string
		readonly github?: string
	}
	readonly image: string
	readonly imageSize: { readonly width: number; readonly height: number }
	readonly alt: string
}

export interface SkillGroup {
	readonly title: string
	readonly spine: string
	readonly items: readonly string[]
}
```

- [ ] **Step 4: Create `src/content/profile.ts`**

```ts
import type { Profile } from './types'

export const profile: Profile = {
	name: 'Oliver Shooter',
	title: 'Software & Android Engineer',
	location: 'Manchester, UK',
	email: 'contact@olivershooter.com',
	shortBio:
		'I build native Android apps in Kotlin and Jetpack Compose at Deloitte. Before that I built full-stack systems for Government, and before that I worked in film.',
	contactMessage:
		"Looking for engineering roles where the problems are hard and the team gives a damn. If that sounds like yours, I'd like to hear about it.",
	links: {
		github: 'https://github.com/olivershooter',
		site: 'https://olivershooter.com'
	},
	story: [
		{
			year: '2014',
			title: 'Film sets',
			text: 'Started in media production. Learned to tell stories and think visually.'
		},
		{
			year: '2020',
			title: 'The pivot',
			text: 'MSc Computer Science at the University of Birmingham.'
		},
		{
			year: '2021',
			title: 'Government',
			text: 'Joined Government as a junior engineer and started shipping.'
		},
		{
			year: '2023',
			title: 'Owning systems',
			text: 'Promoted to Software Engineer. Owned full-stack systems and ran a team.'
		},
		{
			year: 'Now',
			title: 'Deloitte · Android',
			text: 'Consulting at Deloitte, now building native Android apps in Kotlin and Jetpack Compose.'
		}
	]
}
```

- [ ] **Step 5: Create `src/content/experience.ts`**

```ts
import type { Role } from './types'

export const experience: readonly Role[] = [
	{
		id: 'deloitte',
		title: 'Senior Consultant · Software Engineer',
		org: 'Deloitte',
		period: 'Feb 2026 – Present',
		isCurrent: true,
		summary:
			'Consulting at Deloitte, where my work is now native Android in Kotlin and Jetpack Compose.',
		bullets: [
			'Sit inside client delivery teams: build it, ship it, move on to the next one.',
			'Build apps that need to be fast and accessible, turning messy requirements into components that make sense.',
			'Work across design, product and backend to keep the front end consistent across projects.',
			'Have a say in technical direction, and mentor other engineers when I can.'
		],
		stack: ['Kotlin', 'Jetpack Compose', 'React', 'TypeScript', 'Next.js'],
		file: 'deloitte.kt'
	},
	{
		id: 'government-se',
		title: 'Software Engineer',
		org: 'Government',
		period: 'Jun 2023 – Feb 2026',
		isCurrent: false,
		summary: 'Owned full-stack systems end to end.',
		bullets: [
			'Built a full-stack onboarding app (React + Spring Boot + OpenShift). Every new starter now uses it.',
			'Rewrote a static HTML prototype as React/Vite + FastAPI + MongoDB. Added WCAG 2.1 compliance. All project customers use it.',
			'Wrote middleware that automates manual workflows between two internal services. MongoDB-backed, runs on OKD.',
			'Broke apart a monolithic monitoring stack into microservices with Helm, Kubernetes, Grafana, Loki, Mimir, and Tempo.'
		],
		stack: [
			'React',
			'FastAPI',
			'Spring Boot',
			'MongoDB',
			'Kubernetes',
			'Helm',
			'Grafana',
			'OpenShift'
		],
		file: 'government_se.kt'
	},
	{
		id: 'government-jr',
		title: 'Junior Software Engineer',
		org: 'Government',
		period: 'Oct 2022 – Jun 2023',
		isCurrent: false,
		summary: 'Learned to ship in a real team.',
		bullets: [
			'Migrated Create React App to Vite. Build times dropped, dependency vulnerabilities went with them.',
			'Turned Figma mockups into React/TypeScript components that actually shipped.',
			'Worked on Spring Boot backends: API integrations and data persistence.',
			'Lots of pair programming, code reviews, and sprint refinements.'
		],
		stack: ['React', 'TypeScript', 'Java', 'Spring Boot', 'AWS'],
		file: 'government_jr.kt'
	}
]
```

- [ ] **Step 6: Create `src/content/projects.ts`**

```ts
import type { Project } from './types'

export const projects: readonly Project[] = [
	{
		id: 'football',
		name: 'Football Statistics',
		tagline: 'Free sports analytics. No sign-ups, no paywalls.',
		description:
			'Match results, live stats, timelines, and highlights for football. React/TypeScript frontend, Python/FastAPI backend pulling from third-party APIs. Completely free to use.',
		stack: ['React', 'TypeScript', 'Vite', 'FastAPI', 'Python'],
		platform: 'web',
		links: { live: 'https://football.olivershooter.com' },
		image: '/images/football.png',
		imageSize: { width: 1408, height: 768 },
		alt: 'Wireframe illustration of a floodlit football stadium seen from above'
	},
	{
		id: 'salah-times',
		name: 'Salah Times',
		tagline: 'Prayer times app. Accurate, offline-ready.',
		description:
			'React Native app for prayer times. Sky backgrounds change from dawn to night. Picks the right calculation source for your country (JAKIM, Kemenag, Al-Adhan) automatically. Push notifications, countdowns, works offline.',
		stack: ['React Native', 'Expo', 'TypeScript'],
		platform: 'mobile',
		links: {
			appStore: 'https://apps.apple.com/gb/app/simple-salah-times/id6760982824'
		},
		image: '/images/salah.png',
		imageSize: { width: 1408, height: 768 },
		alt: 'Salah Times screen showing the next prayer, Fajr, with a countdown ring on a starry night sky'
	},
	{
		id: 'screendle',
		name: 'Screendle',
		tagline: 'Daily movie guessing game. Five clues, five guesses.',
		description:
			'Wordle but for films. You get clues one at a time (synopsis, release date, runtime, box office, actors) and five guesses to name the movie. Answers validated server-side, new games generated weekly, holiday themes for fun.',
		stack: ['React', 'TypeScript', 'Vite', 'Express', 'PostgreSQL'],
		platform: 'web',
		links: { live: 'https://screendle.com' },
		image: '/images/screendle.png',
		imageSize: { width: 1200, height: 630 },
		alt: 'Screendle title card: a clapperboard next to the line "Name that film before the credits roll. Five clues. Five guesses."'
	},
	{
		id: 'candice',
		name: 'Candice',
		tagline: 'Language translation on Android. Works offline.',
		description:
			'Android app for translating text, speech, and images using Google ML Kit. Has translation history, a flashcard game, and downloadable language models so it works without internet. Local NoSQL storage.',
		stack: ['Java', 'Android', 'Google ML Kit', 'NoSQL'],
		platform: 'android',
		links: { github: 'https://github.com/olivershooter/candice' },
		image: '/images/candice.png',
		imageSize: { width: 1408, height: 768 },
		alt: 'Abstract illustration of letters from many alphabets swirling into glowing, connected nodes'
	}
]
```

- [ ] **Step 7: Create `src/content/skills.ts`**

```ts
import type { SkillGroup } from './types'

export const skills: readonly SkillGroup[] = [
	{
		title: 'Android',
		spine: 'ANDROID',
		items: [
			'Kotlin',
			'Jetpack Compose',
			'Android SDK',
			'Google ML Kit',
			'React Native'
		]
	},
	{
		title: 'Languages',
		spine: 'LANGUAGES',
		items: ['TypeScript', 'JavaScript', 'Python', 'Java', 'HTML/CSS']
	},
	{
		title: 'Frontend',
		spine: 'FRONTEND',
		items: ['React', 'Redux', 'TanStack', 'Vite', 'Tailwind CSS']
	},
	{
		title: 'Backend',
		spine: 'BACKEND',
		items: ['Spring Boot', 'FastAPI', 'Django', 'REST APIs', 'MongoDB', 'LDAP']
	},
	{
		title: 'Cloud & DevOps',
		spine: 'CLOUD',
		items: ['Kubernetes', 'Helm', 'Docker', 'OpenShift / OKD', 'AWS', 'CI/CD']
	},
	{
		title: 'Observability',
		spine: 'OBSERVABILITY',
		items: ['Grafana', 'Loki', 'Mimir', 'Tempo']
	},
	{
		title: 'Practice',
		spine: 'PRACTICE',
		items: ['Agile / Scrum', 'TDD', 'Pair programming', 'Code review', 'WCAG 2.1']
	}
]
```

- [ ] **Step 8: Create `src/content/index.ts`**

```ts
import { experience } from './experience'
import { projects } from './projects'
import type { Project, ProjectId, Role } from './types'

export { experience } from './experience'
export { profile } from './profile'
export { projects } from './projects'
export { skills } from './skills'
export type * from './types'

export function currentRole(): Role {
	const role = experience.find(item => item.isCurrent)
	if (!role) throw new Error('No current role in content/experience.ts')
	return role
}

export function getProject(id: ProjectId): Project {
	const project = projects.find(item => item.id === id)
	if (!project) throw new Error(`Unknown project: ${id}`)
	return project
}

export function mobileProjects(): readonly Project[] {
	return projects.filter(project => project.platform !== 'web')
}
```

If `export type *` isn't supported by the installed TypeScript (5.4 does support it), use explicit `export type { Profile, Role, ... } from './types'`.

- [ ] **Step 9: Run the tests and coverage**

Run: `npm run test:run -- src/content && npm run test:coverage`
Always run coverage on the **whole** suite. The threshold is global, so a filtered run reports the files it didn't load as uncovered.

Expected: all tests pass. `currentRole`'s throw branch isn't covered, so add this test inside the same `describe`:

```ts
it('throws when no role is current', async () => {
	vi.resetModules()
	vi.doMock('../experience', () => ({ experience: [] }))
	const content = await import('..')
	expect(() => content.currentRole()).toThrow(/No current role/)
	vi.doUnmock('../experience')
})
```

Re-run coverage. Expected: 100% for `src/content/**`.

- [ ] **Step 10: Commit**

```bash
npx prettier -w src/content
npm run run-eslint -- src/content
git add src/content
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: add shared content modules for both portfolio versions"
```

---

### Task 3: Browser utilities (storage, remembered version, analytics, contrast, reduced motion)

**Files:**
- Create: `src/lib/storage.ts`, `src/lib/versionChoice.ts`, `src/lib/analytics.ts`, `src/lib/contrast.ts`, `src/lib/useReducedMotion.ts`
- Test: `src/lib/__tests__/storage.test.ts`, `src/lib/__tests__/versionChoice.test.ts`, `src/lib/__tests__/analytics.test.ts`, `src/lib/__tests__/contrast.test.ts`, `src/lib/__tests__/useReducedMotion.test.tsx`

**Interfaces:**
- Produces:
  - `readStored(kind: 'local' | 'session', key: string): string | null`, plus `writeStored(kind, key, value): void` and `removeStored(kind, key): void`
  - `type Version = 'late-shift' | 'quick'`, `VERSION_KEY`, `VERSION_PATHS: Record<Version, string>`, `isVersion(value: string | null): value is Version`, `getRememberedVersion(): Version | null`, `rememberVersion(version: Version): void`, `forgetVersion(): void`, `landingRedirect(search: string): string | null`
  - `type AnalyticsEvent`, `track(event: AnalyticsEvent, data: Record<string, boolean | number | string>): void`
  - `relativeLuminance(hex: string): number`, `contrastRatio(foreground: string, background: string): number`
  - `useReducedMotion(): boolean` (default export)

- [ ] **Step 1: Write the failing tests**

`src/lib/__tests__/storage.test.ts`

```ts
import { readStored, removeStored, writeStored } from '../storage'

describe('storage', () => {
	it('reads, writes and removes values', () => {
		writeStored('local', 'k', 'v')
		expect(readStored('local', 'k')).toBe('v')
		writeStored('session', 'k', 's')
		expect(readStored('session', 'k')).toBe('s')
		removeStored('local', 'k')
		expect(readStored('local', 'k')).toBeNull()
	})

	it('never throws when storage is blocked', () => {
		const spy = vi
			.spyOn(window, 'localStorage', 'get')
			.mockImplementation(() => {
				throw new Error('SecurityError')
			})
		expect(readStored('local', 'k')).toBeNull()
		expect(() => writeStored('local', 'k', 'v')).not.toThrow()
		expect(() => removeStored('local', 'k')).not.toThrow()
		spy.mockRestore()
	})

	it('never throws when a write hits the quota', () => {
		const spy = vi
			.spyOn(Storage.prototype, 'setItem')
			.mockImplementation(() => {
				throw new Error('QuotaExceededError')
			})
		expect(() => writeStored('session', 'k', 'v')).not.toThrow()
		spy.mockRestore()
	})
})
```

`src/lib/__tests__/versionChoice.test.ts`

```ts
import {
	VERSION_KEY,
	forgetVersion,
	getRememberedVersion,
	isVersion,
	landingRedirect,
	rememberVersion
} from '../versionChoice'

describe('version choice', () => {
	it('recognises only the two versions', () => {
		expect(isVersion('quick')).toBe(true)
		expect(isVersion('late-shift')).toBe(true)
		expect(isVersion('fancy')).toBe(false)
		expect(isVersion(null)).toBe(false)
	})

	it('remembers and forgets a choice', () => {
		rememberVersion('quick')
		expect(getRememberedVersion()).toBe('quick')
		forgetVersion()
		expect(getRememberedVersion()).toBeNull()
	})

	it('redirects "/" to a remembered version', () => {
		rememberVersion('late-shift')
		expect(landingRedirect('')).toBe('/late-shift')
	})

	it('shows the chooser and clears the memory with ?choose', () => {
		rememberVersion('quick')
		expect(landingRedirect('?choose')).toBeNull()
		expect(getRememberedVersion()).toBeNull()
	})

	it('shows the chooser when the stored value is corrupted', () => {
		window.localStorage.setItem(VERSION_KEY, 'fancy')
		expect(getRememberedVersion()).toBeNull()
		expect(landingRedirect('')).toBeNull()
	})
})
```

`src/lib/__tests__/analytics.test.ts`

```ts
import { track } from '../analytics'

describe('track', () => {
	afterEach(() => {
		delete window.umami
	})

	it('forwards events to umami when present', () => {
		const spy = vi.fn()
		window.umami = { track: spy }
		track('version-chosen', { version: 'quick' })
		expect(spy).toHaveBeenCalledWith('version-chosen', { version: 'quick' })
	})

	it('does nothing when umami is blocked', () => {
		expect(() => track('radio-toggled', { on: true })).not.toThrow()
	})

	it('swallows errors thrown by umami', () => {
		window.umami = {
			track: () => {
				throw new Error('network')
			}
		}
		expect(() =>
			track('section-opened', { section: 'about', version: 'late-shift' })
		).not.toThrow()
	})
})
```

`src/lib/__tests__/contrast.test.ts`

```ts
import { contrastRatio, relativeLuminance } from '../contrast'

describe('contrast', () => {
	it('computes WCAG relative luminance', () => {
		expect(relativeLuminance('#000000')).toBe(0)
		expect(relativeLuminance('#ffffff')).toBe(1)
		expect(relativeLuminance('#FFFFFF')).toBe(1)
	})

	it('computes contrast ratios in either order', () => {
		expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5)
		expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 5)
		expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2)
		expect(contrastRatio('#3255a4', '#3255a4')).toBe(1)
	})

	it('rejects anything that is not a 6-digit hex colour', () => {
		expect(() => relativeLuminance('#fff')).toThrow(/Invalid hex/)
		expect(() => relativeLuminance('blue')).toThrow(/Invalid hex/)
	})
})
```

`src/lib/__tests__/useReducedMotion.test.tsx`

```tsx
import { renderHook } from '@testing-library/react'
import { setReducedMotion } from '../../testUtils'
import useReducedMotion from '../useReducedMotion'

describe('useReducedMotion', () => {
	it('is false by default', () => {
		const { result } = renderHook(() => useReducedMotion())
		expect(result.current).toBe(false)
	})

	it('is true when the user prefers reduced motion', () => {
		setReducedMotion(true)
		const { result } = renderHook(() => useReducedMotion())
		expect(result.current).toBe(true)
	})
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm run test:run -- src/lib`
Expected: FAIL, with modules not found.

- [ ] **Step 3: Implement `src/lib/storage.ts`**

```ts
type StorageKind = 'local' | 'session'

function getStore(kind: StorageKind): Storage | null {
	try {
		return kind === 'local' ? window.localStorage : window.sessionStorage
	} catch {
		return null
	}
}

export function readStored(kind: StorageKind, key: string): string | null {
	try {
		return getStore(kind)?.getItem(key) ?? null
	} catch {
		return null
	}
}

export function writeStored(
	kind: StorageKind,
	key: string,
	value: string
): void {
	try {
		getStore(kind)?.setItem(key, value)
	} catch {
		// Storage is full or blocked (private mode): the site works without it
	}
}

export function removeStored(kind: StorageKind, key: string): void {
	try {
		getStore(kind)?.removeItem(key)
	} catch {
		// Storage is blocked: nothing to remove
	}
}
```

- [ ] **Step 4: Implement `src/lib/versionChoice.ts`**

```ts
import { readStored, removeStored, writeStored } from './storage'

export type Version = 'late-shift' | 'quick'

export const VERSION_KEY = 'os-portfolio:version'

export const VERSION_PATHS: Readonly<Record<Version, string>> = {
	'late-shift': '/late-shift',
	quick: '/quick'
}

export function isVersion(value: string | null): value is Version {
	return value === 'late-shift' || value === 'quick'
}

export function getRememberedVersion(): Version | null {
	const value = readStored('local', VERSION_KEY)
	return isVersion(value) ? value : null
}

export function rememberVersion(version: Version): void {
	writeStored('local', VERSION_KEY, version)
}

export function forgetVersion(): void {
	removeStored('local', VERSION_KEY)
}

/** Where "/" should send the visitor, or null to show the chooser. */
export function landingRedirect(search: string): string | null {
	if (new URLSearchParams(search).has('choose')) {
		forgetVersion()
		return null
	}
	const remembered = getRememberedVersion()
	return remembered ? VERSION_PATHS[remembered] : null
}
```

- [ ] **Step 5: Implement `src/lib/analytics.ts`**

```ts
type EventData = Readonly<Record<string, boolean | number | string>>

interface Umami {
	track: (event: string, data?: EventData) => void
}

declare global {
	interface Window {
		umami?: Umami
	}
}

export type AnalyticsEvent = 'radio-toggled' | 'section-opened' | 'version-chosen'

export function track(event: AnalyticsEvent, data: EventData): void {
	try {
		window.umami?.track(event, data)
	} catch {
		// Analytics must never break the page
	}
}
```

- [ ] **Step 6: Implement `src/lib/contrast.ts`**

```ts
const HEX = /^#[\da-f]{6}$/i

function channel(hexPair: string): number {
	const value = Number.parseInt(hexPair, 16) / 255
	return value <= 0.039_28 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

export function relativeLuminance(hex: string): number {
	if (!HEX.test(hex)) throw new Error(`Invalid hex colour: ${hex}`)
	const red = channel(hex.slice(1, 3))
	const green = channel(hex.slice(3, 5))
	const blue = channel(hex.slice(5, 7))
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export function contrastRatio(foreground: string, background: string): number {
	const [light, dark] = [
		relativeLuminance(foreground),
		relativeLuminance(background)
	].sort((a, b) => b - a)
	return (light + 0.05) / (dark + 0.05)
}
```

- [ ] **Step 7: Implement `src/lib/useReducedMotion.ts`**

```ts
import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

export default function useReducedMotion(): boolean {
	const [isReduced, setIsReduced] = useState(
		() => window.matchMedia(QUERY).matches
	)
	useEffect(() => {
		const media = window.matchMedia(QUERY)
		const onChange = () => setIsReduced(media.matches)
		media.addEventListener('change', onChange)
		return () => media.removeEventListener('change', onChange)
	}, [])
	return isReduced
}
```

- [ ] **Step 8: Run the tests and coverage**

Run: `npm run test:run -- src/lib && npm run test:coverage`
Expected: everything passes with 100% coverage on `src/lib/**`. If the `onChange` body isn't covered, add a test that captures the `addEventListener` callback from the `matchMedia` stub and calls it.

- [ ] **Step 9: Commit**

```bash
npx prettier -w src/lib
npm run run-eslint -- src/lib
git add src/lib
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: add safe storage, remembered version, analytics, contrast helpers"
```

---

### Task 4: App shell: tokens, CSS, fonts, router, remove v2

**Files:**
- Create: `src/theme/tokens.json`, `src/components/ExternalLink.tsx`, `src/components/SwitchVersionLink.tsx`, `src/pages/Landing.tsx`, `src/pages/QuickRead.tsx`, `src/late-shift/LateShift.tsx`, `src/late-shift/lateShift.css`
- Rewrite: `src/App.tsx`, `src/main.tsx`, `src/index.css`, `tailwind.config.js`, `index.html`, `WORKFLOW.md`
- Delete: `src/components/{Nav,Hero,About,Experience,Projects,Skills,Contact}.tsx`, `src/hooks/`, `TODO.md`
- Test: `src/theme/__tests__/tokens.test.ts`, `src/__tests__/App.test.tsx`, `src/components/__tests__/links.test.tsx`

**Interfaces:**
- Consumes: `contrastRatio` (Task 3) and `profile` (Task 2).
- Produces:
  - `tokens.json` (shape below).
  - `ExternalLink({ href, children, className? })`, which appends the sr-only " (opens in new tab)".
  - `SwitchVersionLink({ className? })`, which links to `/?choose`.
  - Route components `Landing`, `QuickRead` and `LateShift`. They're minimal here; Tasks 5, 6 and 10 replace them.
  - Tailwind colours:
    - `paper`, `ink-blue`, `ink-pink`, `ink-yellow`, `ink-text`, `ink-focus`;
    - `quick-bg`, `quick-text`, `quick-muted`, `quick-link`, `quick-rule`, `quick-focus` (CSS variables).
  - Tailwind fonts: `font-display`, `font-body`, `font-mono`.

- [ ] **Step 1: Write the failing tests**

`src/theme/__tests__/tokens.test.ts`

```ts
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { contrastRatio } from '../../lib/contrast'
import tokens from '../tokens.json'

const css = readFileSync(
	fileURLToPath(new URL('../../index.css', import.meta.url)),
	'utf8'
)

describe('design tokens', () => {
	for (const theme of ['light', 'dark'] as const) {
		const palette = tokens.quick[theme]
		it(`Quick Read ${theme} text passes AA (4.5:1)`, () => {
			for (const colour of [palette.text, palette.muted, palette.link])
				expect(contrastRatio(colour, palette.bg)).toBeGreaterThanOrEqual(4.5)
		})
		it(`Quick Read ${theme} focus ring passes 3:1`, () => {
			expect(contrastRatio(palette.focus, palette.bg)).toBeGreaterThanOrEqual(3)
		})
	}

	it('ink text on paper passes AA, focus ring passes 3:1', () => {
		expect(contrastRatio(tokens.ink.blue, tokens.ink.paper)).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(tokens.ink.text, tokens.ink.paper)).toBeGreaterThanOrEqual(4.5)
		expect(contrastRatio(tokens.ink.focus, tokens.ink.paper)).toBeGreaterThanOrEqual(3)
	})

	it('keeps index.css variables in sync with tokens.json', () => {
		for (const [name, value] of Object.entries(tokens.quick.light))
			expect(css).toContain(`--quick-${name}: ${value};`)
		for (const [name, value] of Object.entries(tokens.quick.dark))
			expect(css).toContain(`--quick-${name}: ${value};`)
		expect(css).toContain(`--focus: ${tokens.ink.focus};`)
	})
})
```

`src/components/__tests__/links.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ExternalLink from '../ExternalLink'
import SwitchVersionLink from '../SwitchVersionLink'

describe('shared links', () => {
	it('announces that external links open a new tab', () => {
		render(<ExternalLink href='https://example.com'>GitHub</ExternalLink>)
		const link = screen.getByRole('link', { name: 'GitHub (opens in new tab)' })
		expect(link).toHaveAttribute('target', '_blank')
		expect(link).toHaveAttribute('rel', 'noreferrer')
	})

	it('switches version via the chooser', () => {
		render(
			<MemoryRouter>
				<SwitchVersionLink />
			</MemoryRouter>
		)
		expect(screen.getByRole('link', { name: 'Switch version' })).toHaveAttribute(
			'href',
			'/?choose'
		)
	})
})
```

`src/__tests__/App.test.tsx`

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'

function renderApp(path: string) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<App />
		</MemoryRouter>
	)
}

describe('routes', () => {
	it('shows the chooser at /', () => {
		renderApp('/')
		expect(
			screen.getByRole('heading', { level: 1, name: 'Software & Android Engineer' })
		).toBeInTheDocument()
	})

	it('shows the Quick Read at /quick', () => {
		renderApp('/quick')
		expect(
			screen.getByRole('heading', {
				level: 1,
				name: 'Software & Android Engineer in Manchester'
			})
		).toBeInTheDocument()
	})

	it('lazy-loads the Late Shift at /late-shift', async () => {
		renderApp('/late-shift')
		expect(
			await screen.findByRole('heading', { level: 1, name: /the late shift/i })
		).toBeInTheDocument()
	})

	it('sends unknown paths to the chooser', () => {
		renderApp('/nowhere')
		expect(
			screen.getByRole('heading', { level: 1, name: 'Software & Android Engineer' })
		).toBeInTheDocument()
	})
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm run test:run`
Expected: FAIL, with `tokens.json`, `ExternalLink` and the routes all missing.

- [ ] **Step 3: Create `src/theme/tokens.json`**

```json
{
	"ink": {
		"paper": "#f4ecdd",
		"blue": "#3255a4",
		"pink": "#ff48b0",
		"yellow": "#ffe200",
		"text": "#22223a",
		"focus": "#c2187a"
	},
	"quick": {
		"light": {
			"bg": "#fbf8f2",
			"text": "#1f2233",
			"muted": "#3d4054",
			"link": "#2a4a9a",
			"rule": "#1f2233",
			"focus": "#c2187a"
		},
		"dark": {
			"bg": "#16171f",
			"text": "#ecebf2",
			"muted": "#c4c3d0",
			"link": "#9db4ff",
			"rule": "#ecebf2",
			"focus": "#ff48b0"
		}
	}
}
```

- [ ] **Step 4: Rewrite `tailwind.config.js`**

```js
import tokens from './src/theme/tokens.json'

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{ts,tsx}'],
	theme: {
		extend: {
			colors: {
				paper: tokens.ink.paper,
				ink: {
					blue: tokens.ink.blue,
					pink: tokens.ink.pink,
					yellow: tokens.ink.yellow,
					text: tokens.ink.text,
					focus: tokens.ink.focus
				},
				quick: {
					bg: 'var(--quick-bg)',
					text: 'var(--quick-text)',
					muted: 'var(--quick-muted)',
					link: 'var(--quick-link)',
					rule: 'var(--quick-rule)',
					focus: 'var(--quick-focus)'
				}
			},
			fontFamily: {
				display: ['"Archivo Black"', 'system-ui', 'sans-serif'],
				body: ['"DM Sans"', 'system-ui', 'sans-serif'],
				mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
			}
		}
	},
	plugins: []
}
```

- [ ] **Step 5: Rewrite `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
	--paper: #f4ecdd;
	--ink-blue: #3255a4;
	--ink-pink: #ff48b0;
	--ink-yellow: #ffe200;
	--ink-text: #22223a;
	--focus: #c2187a;
	--quick-bg: #fbf8f2;
	--quick-text: #1f2233;
	--quick-muted: #3d4054;
	--quick-link: #2a4a9a;
	--quick-rule: #1f2233;
	--quick-focus: #c2187a;
}

@media (prefers-color-scheme: dark) {
	.quick {
		--quick-bg: #16171f;
		--quick-text: #ecebf2;
		--quick-muted: #c4c3d0;
		--quick-link: #9db4ff;
		--quick-rule: #ecebf2;
		--quick-focus: #ff48b0;
	}
}

html {
	background: var(--paper);
	color: var(--ink-text);
	font-family: 'DM Sans', system-ui, sans-serif;
}

:focus-visible {
	outline: 3px solid var(--focus);
	outline-offset: 3px;
}

.quick :focus-visible {
	outline-color: var(--quick-focus);
}

.quick-link {
	color: var(--quick-link);
	font-weight: 600;
	text-decoration: underline;
	text-underline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
	*,
	*::before,
	*::after {
		animation-duration: 0.01ms !important;
		animation-iteration-count: 1 !important;
		scroll-behavior: auto !important;
		transition-duration: 0.01ms !important;
	}
}
```

The dark `--quick-*` values live under `.quick`, so the tokens test (which searches for each `--quick-name: value;` string) finds both themes.

- [ ] **Step 6: Rewrite `index.html`**

```html
<!doctype html>
<html lang="en-GB">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta
			name="description"
			content="Oliver Shooter — Software & Android Engineer in Manchester. Kotlin, Jetpack Compose, React, cloud."
		/>
		<meta name="theme-color" content="#f4ecdd" />
		<link rel="icon" type="image/png" href="/favicon.png" />
		<title>Oliver Shooter — Software &amp; Android Engineer</title>
		<script
			defer
			src="https://umami.olivershooter.com/script.js"
			data-website-id="23cfe930-e19c-4448-89e7-296d06f27257"
		></script>
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="/src/main.tsx"></script>
	</body>
</html>
```

- [ ] **Step 7: Rewrite `src/main.tsx`**

```tsx
import '@fontsource/archivo-black/400.css'
import '@fontsource/dm-sans/400.css'
import '@fontsource/dm-sans/500.css'
import '@fontsource/dm-sans/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

const rootElement = document.querySelector('#root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
	<StrictMode>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</StrictMode>
)
```

- [ ] **Step 8: Rewrite `src/App.tsx`**

```tsx
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import QuickRead from './pages/QuickRead'

const LateShift = lazy(async () => import('./late-shift/LateShift'))

export default function App() {
	return (
		<Suspense
			fallback={
				<p className='p-8 font-mono text-ink-blue'>Switching on the lamp…</p>
			}
		>
			<Routes>
				<Route path='/' element={<Landing />} />
				<Route path='/quick' element={<QuickRead />} />
				<Route path='/late-shift/*' element={<LateShift />} />
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</Suspense>
	)
}
```

- [ ] **Step 9: Create the shared components and the minimal route components**

`src/components/ExternalLink.tsx`

```tsx
import type { ReactNode } from 'react'

interface ExternalLinkProperties {
	readonly href: string
	readonly children: ReactNode
	readonly className?: string
}

export default function ExternalLink({
	href,
	children,
	className
}: ExternalLinkProperties) {
	return (
		<a href={href} target='_blank' rel='noreferrer' className={className}>
			{children}
			<span className='sr-only'> (opens in new tab)</span>
		</a>
	)
}
```

`src/components/SwitchVersionLink.tsx`

```tsx
import { Link } from 'react-router-dom'

export default function SwitchVersionLink({
	className
}: {
	readonly className?: string
}) {
	return (
		<Link to='/?choose' className={className}>
			Switch version
		</Link>
	)
}
```

`src/pages/Landing.tsx` (Task 6 replaces it)

```tsx
import { Link } from 'react-router-dom'
import { profile } from '../content'

export default function Landing() {
	return (
		<main className='p-8'>
			<h1 className='font-display text-4xl text-ink-blue'>{profile.title}</h1>
			<Link to='/late-shift'>The Late Shift</Link>
			<Link to='/quick'>The Quick Read</Link>
		</main>
	)
}
```

`src/pages/QuickRead.tsx` (Task 5 replaces it)

```tsx
import { profile } from '../content'

export default function QuickRead() {
	return (
		<main className='quick p-8'>
			<h1>{`${profile.title} in ${profile.location.split(',')[0]}`}</h1>
		</main>
	)
}
```

`src/late-shift/LateShift.tsx` (Task 10 replaces it)

```tsx
import './lateShift.css'

export default function LateShift() {
	return (
		<main className='late-shift'>
			<h1>The Late Shift</h1>
		</main>
	)
}
```

`src/late-shift/lateShift.css`

```css
.late-shift {
	min-height: 100svh;
	background: var(--paper);
	color: var(--ink-text);
}
```

- [ ] **Step 10: Delete v2 files and replace the docs**

```bash
git rm src/components/Nav.tsx src/components/Hero.tsx src/components/About.tsx src/components/Experience.tsx src/components/Projects.tsx src/components/Skills.tsx src/components/Contact.tsx TODO.md
rmdir src/hooks
```

Rewrite `WORKFLOW.md`:

```md
# Oliver Shooter Portfolio — Workflow

v3 has a landing chooser, **The Late Shift** (interactive riso/lofi room) and **The Quick Read** (WCAG 2.2 AA).

- Design spec: `docs/superpowers/specs/2026-09-27-portfolio-v3-design.md`
- Implementation plan: `docs/superpowers/plans/2026-09-27-portfolio-v3.md`

## Scripts

- `npm run dev`: dev server
- `npm run test:run` / `npm run test:coverage`: tests (coverage has a 100% threshold on logic modules)
- `npm run lint`, `npm run run-tsc`, `npm run build`
- `scripts/room-screenshots.sh`: headless screenshots of the room (needs `npm run preview` running)
```

- [ ] **Step 11: Run everything**

Run: `npm run test:run && npm run run-tsc && npm run lint && npm run build`
Expected: all tests pass, and typecheck, lint and build are clean. The Tailwind config imports JSON. If the build reports it can't load `tokens.json`, change the import to `import tokens from './src/theme/tokens.json' with { type: 'json' }` and rebuild.

- [ ] **Step 12: Commit**

```bash
npx prettier -w src index.html tailwind.config.js WORKFLOW.md
npm run run-stylelint
git add -A src index.html tailwind.config.js WORKFLOW.md TODO.md
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: add router shell, design tokens and self-hosted fonts; remove v2 page"
```

---

### Task 5: The Quick Read (`/quick`)

**Files:**
- Rewrite: `src/pages/QuickRead.tsx`
- Test: `src/pages/__tests__/QuickRead.test.tsx`

**Interfaces:**
- Consumes: `profile`, `experience`, `projects`, `skills`, `currentRole`, `mobileProjects` (Task 2); `ExternalLink`, `SwitchVersionLink` (Task 4); `axeViolations` (Task 1).
- Produces: the default export `QuickRead`. Section ids: `about`, `android`, `experience`, `projects`, `skills`, `contact`. Main id: `main`.

- [ ] **Step 1: Write the failing test** `src/pages/__tests__/QuickRead.test.tsx`

```tsx
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { experience, profile, projects, skills } from '../../content'
import { axeViolations } from '../../testUtils'
import QuickRead from '../QuickRead'

function renderPage() {
	return render(
		<MemoryRouter>
			<QuickRead />
		</MemoryRouter>
	)
}

describe('The Quick Read', () => {
	it('has landmarks and a single h1', () => {
		renderPage()
		expect(screen.getByRole('banner')).toBeInTheDocument()
		expect(screen.getByRole('navigation', { name: 'Sections' })).toBeInTheDocument()
		expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
		expect(screen.getByRole('contentinfo')).toBeInTheDocument()
		expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
	})

	it('orders the section headings', () => {
		renderPage()
		const names = screen
			.getAllByRole('heading', { level: 2 })
			.map(heading => heading.textContent)
		expect(names).toEqual(['Android', 'Experience', 'Projects', 'Skills', 'Contact'])
	})

	it('has a skip link and nav links that all point at real sections', () => {
		renderPage()
		expect(screen.getByRole('link', { name: 'Skip to content' })).toHaveAttribute(
			'href',
			'#main'
		)
		const nav = screen.getByRole('navigation', { name: 'Sections' })
		const sections = [
			['about', 'Software & Android Engineer in Manchester'],
			['android', 'Android'],
			['experience', 'Experience'],
			['projects', 'Projects'],
			['skills', 'Skills'],
			['contact', 'Contact']
		] as const
		const links = within(nav).getAllByRole('link')
		expect(links).toHaveLength(sections.length)
		for (const [index, [id, heading]] of sections.entries()) {
			expect(links[index]).toHaveAttribute('href', `#${id}`)
			expect(screen.getByRole('region', { name: heading })).toHaveAttribute('id', id)
		}
	})

	it('renders every role, project and skill group from content', () => {
		renderPage()
		for (const role of experience)
			expect(screen.getByRole('heading', { level: 3, name: role.title })).toBeInTheDocument()
		for (const project of projects) {
			expect(screen.getAllByRole('heading', { level: 3, name: project.name }).length).toBeGreaterThan(0)
			expect(screen.getByAltText(project.alt)).toBeInTheDocument()
		}
		for (const group of skills)
			expect(screen.getByRole('heading', { level: 3, name: group.title })).toBeInTheDocument()
		expect(screen.getByRole('link', { name: profile.email })).toHaveAttribute(
			'href',
			`mailto:${profile.email}`
		)
	})

	it('links to the other version', () => {
		renderPage()
		expect(screen.getByRole('link', { name: 'Visit The Late Shift' })).toHaveAttribute(
			'href',
			'/late-shift'
		)
		expect(screen.getByRole('link', { name: 'Switch version' })).toBeInTheDocument()
	})

	it('has no axe violations', async () => {
		renderPage()
		expect(await axeViolations()).toEqual([])
	})
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:run -- src/pages/__tests__/QuickRead.test.tsx`
Expected: FAIL (no banner landmark).

- [ ] **Step 3: Implement `src/pages/QuickRead.tsx`**

```tsx
import { Link } from 'react-router-dom'
import ExternalLink from '../components/ExternalLink'
import SwitchVersionLink from '../components/SwitchVersionLink'
import {
	currentRole,
	experience,
	mobileProjects,
	profile,
	projects,
	skills,
	type Project
} from '../content'

const NAV = [
	{ id: 'about', label: 'About' },
	{ id: 'android', label: 'Android' },
	{ id: 'experience', label: 'Experience' },
	{ id: 'projects', label: 'Projects' },
	{ id: 'skills', label: 'Skills' },
	{ id: 'contact', label: 'Contact' }
] as const

const LINK_LABELS: Readonly<Record<keyof Project['links'], string>> = {
	live: 'Live site',
	appStore: 'App Store',
	playStore: 'Google Play',
	github: 'GitHub'
}

const YEAR = new Date().getFullYear()

function StackTags({ items }: { readonly items: readonly string[] }) {
	return (
		<ul className='mt-2 flex flex-wrap gap-2' aria-label='Tech stack'>
			{items.map(item => (
				<li
					key={item}
					className='rounded border border-quick-link px-2 text-sm font-semibold text-quick-link'
				>
					{item}
				</li>
			))}
		</ul>
	)
}

function ProjectLinks({ project }: { readonly project: Project }) {
	const entries = Object.entries(project.links) as [
		keyof Project['links'],
		string
	][]
	return (
		<p className='mt-2 flex flex-wrap gap-4'>
			{entries.map(([kind, href]) => (
				<ExternalLink key={kind} href={href} className='quick-link'>
					{`${LINK_LABELS[kind]}: ${project.name}`}
				</ExternalLink>
			))}
		</p>
	)
}

export default function QuickRead() {
	const role = currentRole()
	const city = profile.location.split(',')[0]
	return (
		<div className='quick min-h-screen bg-quick-bg font-body text-[17px] leading-relaxed text-quick-text'>
			<a
				href='#main'
				className='sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-10 focus:bg-quick-text focus:px-3 focus:py-2 focus:text-quick-bg'
			>
				Skip to content
			</a>
			<header className='border-b-2 border-quick-rule'>
				<div className='mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-5 py-6'>
					<p className='text-lg font-bold'>{profile.name}</p>
					<nav aria-label='Sections'>
						<ul className='flex flex-wrap gap-x-5 gap-y-2'>
							{NAV.map(item => (
								<li key={item.id}>
									<a className='quick-link inline-block py-1' href={`#${item.id}`}>
										{item.label}
									</a>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</header>

			<main id='main' tabIndex={-1} className='mx-auto max-w-3xl px-5 py-10'>
				<section id='about' aria-labelledby='about-heading'>
					<h1 id='about-heading' className='text-4xl font-extrabold leading-tight'>
						{`${profile.title} in ${city}`}
					</h1>
					<p className='mt-4 max-w-prose text-quick-muted'>{profile.shortBio}</p>
					<ol className='mt-6 space-y-2'>
						{profile.story.map(beat => (
							<li key={beat.year}>
								<span className='font-bold'>{beat.year}</span>
								{` — ${beat.title}. ${beat.text}`}
							</li>
						))}
					</ol>
				</section>

				<section id='android' aria-labelledby='android-heading' className='mt-12'>
					<h2 id='android-heading' className='text-2xl font-extrabold'>
						Android
					</h2>
					<p className='mt-2 max-w-prose'>{role.summary}</p>
					<StackTags items={['Kotlin', 'Jetpack Compose']} />
					<ul className='mt-4 space-y-4'>
						{mobileProjects().map(project => (
							<li key={project.id}>
								<h3 className='text-lg font-bold'>{project.name}</h3>
								<p>{project.tagline}</p>
								<ProjectLinks project={project} />
							</li>
						))}
					</ul>
				</section>

				<section id='experience' aria-labelledby='experience-heading' className='mt-12'>
					<h2 id='experience-heading' className='text-2xl font-extrabold'>
						Experience
					</h2>
					{experience.map(item => (
						<article key={item.id} className='mt-6'>
							<h3 className='text-lg font-bold'>{item.title}</h3>
							<p className='text-quick-muted'>{`${item.org} · ${item.period}`}</p>
							<ul className='mt-2 list-disc space-y-1 pl-5'>
								{item.bullets.map(bullet => (
									<li key={bullet}>{bullet}</li>
								))}
							</ul>
							<StackTags items={item.stack} />
						</article>
					))}
				</section>

				<section id='projects' aria-labelledby='projects-heading' className='mt-12'>
					<h2 id='projects-heading' className='text-2xl font-extrabold'>
						Projects
					</h2>
					{projects.map(project => (
						<article key={project.id} className='mt-8'>
							<h3 className='text-lg font-bold'>{project.name}</h3>
							<p className='font-semibold'>{project.tagline}</p>
							<img
								src={project.image}
								alt={project.alt}
								width={project.imageSize.width}
								height={project.imageSize.height}
								loading='lazy'
								className='mt-3 h-auto w-full rounded'
							/>
							<p className='mt-3'>{project.description}</p>
							<StackTags items={project.stack} />
							<ProjectLinks project={project} />
						</article>
					))}
				</section>

				<section id='skills' aria-labelledby='skills-heading' className='mt-12'>
					<h2 id='skills-heading' className='text-2xl font-extrabold'>
						Skills
					</h2>
					<div className='mt-4 grid gap-6 sm:grid-cols-2'>
						{skills.map(group => (
							<div key={group.title}>
								<h3 className='font-bold'>{group.title}</h3>
								<p>{group.items.join(', ')}</p>
							</div>
						))}
					</div>
				</section>

				<section id='contact' aria-labelledby='contact-heading' className='mt-12'>
					<h2 id='contact-heading' className='text-2xl font-extrabold'>
						Contact
					</h2>
					<p className='mt-2 max-w-prose'>{profile.contactMessage}</p>
					<p className='mt-3 flex flex-wrap gap-4'>
						<a className='quick-link' href={`mailto:${profile.email}`}>
							{profile.email}
						</a>
						<ExternalLink className='quick-link' href={profile.links.github}>
							GitHub
						</ExternalLink>
						{profile.links.linkedin ? (
							<ExternalLink className='quick-link' href={profile.links.linkedin}>
								LinkedIn
							</ExternalLink>
						) : null}
					</p>
					<p className='mt-10'>
						Want the interactive version?{' '}
						<Link className='quick-link' to='/late-shift'>
							Visit The Late Shift
						</Link>
					</p>
				</section>
			</main>

			<footer className='border-t-2 border-quick-rule'>
				<div className='mx-auto flex max-w-3xl flex-wrap justify-between gap-4 px-5 py-6 text-quick-muted'>
					<p>{`${profile.name} · ${profile.location} · ${YEAR}`}</p>
					<SwitchVersionLink className='quick-link' />
				</div>
			</footer>
		</div>
	)
}
```

- [ ] **Step 4: Run the tests**

Run: `npm run test:run -- src/pages src/__tests__/App.test.tsx`
Expected: PASS. If axe reports `region` (content outside landmarks), the skip link is the culprit. Move it inside `<header>` as its first child, and re-run.

- [ ] **Step 5: Manual AA checks** with `npm run dev`, then open `/quick`:
- Tab from the top: the skip link appears, and Enter moves focus to `main`.
- The focus ring is visible on every link, in both light and dark mode (toggle the OS setting).
- Zoom to 200%, and set the width to 320px: there should be no horizontal scroll.

Record the results in the commit body.

- [ ] **Step 6: Commit**

```bash
npx prettier -w src/pages
npm run run-eslint -- src/pages
git add src/pages
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: build The Quick Read page (WCAG 2.2 AA)"
```

---

### Task 6: Landing chooser (`/`)

**Files:**
- Rewrite: `src/pages/Landing.tsx`
- Modify: `src/index.css` (append the door and mini-room styles)
- Test: `src/pages/__tests__/Landing.test.tsx`

**Interfaces:**
- Consumes: `landingRedirect`, `rememberVersion`, `Version` (Task 3); `track` (Task 3); `profile` (Task 2); `renderRoute`, `axeViolations` (Task 1).
- Produces: the default export `Landing`.

- [ ] **Step 1: Write the failing test** `src/pages/__tests__/Landing.test.tsx`

```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import * as analytics from '../../lib/analytics'
import { VERSION_KEY } from '../../lib/versionChoice'
import { axeViolations, renderRoute } from '../../testUtils'
import Landing from '../Landing'

const routes = (
	<>
		<Route path='/' element={<Landing />} />
		<Route path='/quick' element={<p>quick page</p>} />
		<Route path='/late-shift' element={<p>late shift page</p>} />
	</>
)

describe('Landing', () => {
	it('offers both versions as links', () => {
		renderRoute('/', routes)
		expect(screen.getByRole('link', { name: /the late shift/i })).toHaveAttribute('href', '/late-shift')
		expect(screen.getByRole('link', { name: /the quick read/i })).toHaveAttribute('href', '/quick')
	})

	it('remembers the choice when asked and tracks it', async () => {
		const user = userEvent.setup()
		const spy = vi.spyOn(analytics, 'track')
		renderRoute('/', routes)
		await user.click(screen.getByRole('checkbox', { name: /remember my choice/i }))
		await user.click(screen.getByRole('link', { name: /the quick read/i }))
		expect(window.localStorage.getItem(VERSION_KEY)).toBe('quick')
		expect(spy).toHaveBeenCalledWith('version-chosen', { version: 'quick' })
		expect(screen.getByText('quick page')).toBeInTheDocument()
	})

	it('does not remember unless asked', async () => {
		const user = userEvent.setup()
		renderRoute('/', routes)
		await user.click(screen.getByRole('link', { name: /the late shift/i }))
		expect(window.localStorage.getItem(VERSION_KEY)).toBeNull()
	})

	it('redirects straight to a remembered version', () => {
		window.localStorage.setItem(VERSION_KEY, 'late-shift')
		renderRoute('/', routes)
		expect(screen.getByText('late shift page')).toBeInTheDocument()
	})

	it('shows the chooser with ?choose and forgets the choice', () => {
		window.localStorage.setItem(VERSION_KEY, 'quick')
		renderRoute('/?choose', routes)
		expect(screen.getByRole('link', { name: /the quick read/i })).toBeInTheDocument()
		expect(window.localStorage.getItem(VERSION_KEY)).toBeNull()
	})

	it('has no axe violations', async () => {
		renderRoute('/', routes)
		expect(await axeViolations()).toEqual([])
	})
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:run -- src/pages/__tests__/Landing.test.tsx`
Expected: FAIL (there's no checkbox yet).

- [ ] **Step 3: Implement `src/pages/Landing.tsx`**

```tsx
import { useState, type ChangeEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { profile } from '../content'
import { track } from '../lib/analytics'
import {
	landingRedirect,
	rememberVersion,
	type Version
} from '../lib/versionChoice'

export default function Landing() {
	const location = useLocation()
	const [redirect] = useState(() => landingRedirect(location.search))
	const [isRemembering, setIsRemembering] = useState(false)

	if (redirect) return <Navigate to={redirect} replace />

	const onChoose = (version: Version) => {
		if (isRemembering) rememberVersion(version)
		track('version-chosen', { version })
	}
	const onChooseLateShift = () => onChoose('late-shift')
	const onChooseQuick = () => onChoose('quick')
	const onRememberChange = (event: ChangeEvent<HTMLInputElement>) =>
		setIsRemembering(event.target.checked)

	return (
		<main className='min-h-screen bg-paper px-4 py-12 text-center text-ink-text sm:px-10'>
			<p className='font-mono text-xs font-bold uppercase tracking-[0.2em] text-ink-blue'>
				{`${profile.name} · ${profile.location.split(',')[0]}`}
			</p>
			<h1 className='landing-title mt-3 font-display text-4xl text-ink-blue sm:text-6xl'>
				{profile.title}
			</h1>
			<p className='mt-5 text-lg'>How would you like to look around?</p>

			<ul className='mx-auto mt-8 grid max-w-3xl gap-6 text-left min-[720px]:grid-cols-2'>
				<li>
					<Link
						to='/late-shift'
						onClick={onChooseLateShift}
						className='door'
						aria-describedby='door-late-shift-text'
					>
						<span className='door-preview door-room' aria-hidden='true'>
							<span className='door-room-window' />
							<span className='door-room-laptop' />
							<span className='door-room-phone' />
							<span className='door-room-lamp' />
						</span>
						<span className='door-title'>The Late Shift →</span>
						<span id='door-late-shift-text' className='door-text'>
							Step into my room: an interactive lofi scene with things to click,
							rain on the window and an optional radio.
						</span>
						<span className='door-meta'>
							Works on desktop &amp; mobile · Sound optional · ~2 min
						</span>
					</Link>
				</li>
				<li>
					<Link
						to='/quick'
						onClick={onChooseQuick}
						className='door'
						aria-describedby='door-quick-text'
					>
						<span className='door-preview door-plain' aria-hidden='true'>
							<i />
							<i />
							<i />
							<i />
							<i />
						</span>
						<span className='door-title'>The Quick Read →</span>
						<span id='door-quick-text' className='door-text'>
							Everything on one clean page. Fast, keyboard and screen-reader
							friendly, WCAG 2.2 AA.
						</span>
						<span className='door-meta'>Any device · No motion · ~30 sec</span>
					</Link>
				</li>
			</ul>

			<p className='mt-8 text-sm'>
				<label
					htmlFor='remember-choice'
					className='inline-flex min-h-6 items-center gap-2'
				>
					<input
						id='remember-choice'
						type='checkbox'
						checked={isRemembering}
						onChange={onRememberChange}
						className='h-5 w-5 accent-[#3255a4]'
					/>
					Remember my choice
				</label>
				<span className='block'>
					You can switch at any time from either version.
				</span>
			</p>
		</main>
	)
}
```

- [ ] **Step 4: Append the landing styles to `src/index.css`**

```css
.landing-title {
	text-shadow: 3px 2px 0 rgb(255 72 176 / 55%);
}

.door {
	display: flex;
	flex-direction: column;
	height: 100%;
	padding-bottom: 1rem;
	border: 2px solid var(--ink-blue);
	background: #fbf6ec;
	box-shadow: 5px 5px 0 var(--ink-pink);
	transition:
		transform 0.15s,
		box-shadow 0.15s;
}

.door:hover,
.door:focus-visible {
	box-shadow: 7px 7px 0 var(--ink-pink);
	transform: translate(-2px, -2px);
}

.door-preview {
	position: relative;
	display: block;
	height: 150px;
	overflow: hidden;
	border-bottom: 2px solid var(--ink-blue);
}

.door-title {
	margin: 0.9rem 1rem 0.25rem;
	color: var(--ink-blue);
	font-family: 'Archivo Black', system-ui, sans-serif;
	font-size: 1.25rem;
}

.door-text {
	margin: 0 1rem;
	color: #33334a;
	font-size: 0.9rem;
	line-height: 1.45;
}

.door-meta {
	margin: 0.6rem 1rem 0;
	color: var(--ink-blue);
	font-family: 'JetBrains Mono', monospace;
	font-size: 0.7rem;
	font-weight: 700;
	letter-spacing: 0.06em;
	text-transform: uppercase;
}

.door-room {
	background: linear-gradient(#5b4f9a 0 72%, #c9807a 72%);
}

.door-room-window {
	position: absolute;
	top: 12%;
	left: 10%;
	width: 38%;
	height: 50%;
	border: 4px solid #4b3f78;
	background: linear-gradient(#e7743b, #f5b041);
}

.door-room-window::after {
	position: absolute;
	inset: 0;
	animation: door-rain 0.5s linear infinite;
	background: repeating-linear-gradient(
		105deg,
		transparent 0 14px,
		rgb(255 255 255 / 35%) 14px 15px
	);
	content: '';
}

.door-room-laptop {
	position: absolute;
	top: 40%;
	left: 55%;
	width: 24%;
	height: 32%;
	border: 3px solid #2e3a73;
	background: #3d4d8f;
}

.door-room-phone {
	position: absolute;
	top: 44%;
	left: 83%;
	width: 7%;
	height: 28%;
	border: 3px solid #2e3a73;
	border-radius: 4px;
	background: #ffcf3a;
}

.door-room-lamp {
	position: absolute;
	top: 30%;
	right: 2%;
	width: 90px;
	height: 90px;
	border-radius: 50%;
	background: radial-gradient(rgb(255 226 0 / 55%), transparent 70%);
}

.door-plain {
	padding: 18px 20px;
	background: #fbf6ec;
}

.door-plain i {
	display: block;
	height: 10px;
	margin-bottom: 9px;
	border-radius: 2px;
	background: #c9c3d9;
}

.door-plain i:first-child {
	width: 55%;
	height: 18px;
	background: var(--ink-blue);
}

@keyframes door-rain {
	to {
		background-position: 0 30px;
	}
}
```

- [ ] **Step 5: Run the tests, then check it visually**

Run: `npm run test:run -- src/pages`
Expected: PASS.

Then `npm run dev` and open `/`:
- At 390px wide, the two doors stack.
- The rain in the preview animates, and stops when reduced motion is on.

- [ ] **Step 6: Commit**

```bash
npx prettier -w src/pages src/index.css
npm run run-eslint -- src/pages
npm run run-stylelint
git add src/pages src/index.css
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: add landing chooser with remembered version"
```

---

### Task 7: Room scene logic (pure, fully tested)

**Files:**
- Create: `src/late-shift/sectionIds.ts`, `src/late-shift/scene/math.ts`, `src/late-shift/scene/palette.ts`, `src/late-shift/scene/timeOfDay.ts`, `src/late-shift/scene/objects.ts`, `src/late-shift/scene/layouts.ts`, `src/late-shift/scene/hitTest.ts`, `src/late-shift/scene/camera.ts`
- Test: `src/late-shift/scene/__tests__/{math,timeOfDay,objects,layouts,hitTest,camera}.test.ts`, `src/late-shift/__tests__/sectionIds.test.ts`

**Interfaces:**
- Produces:
  - **`sectionIds.ts`**: `SECTION_IDS` (the 8 ids from Global Constraints) and `type SectionId`, plus `isSectionId(value: string): value is SectionId`.
  - **`math.ts`**:
    - `type Ink = 'b' | 'p' | 'y'`, `type Tri = readonly [number, number, number]`, `INKS: readonly Ink[]` (order `y`, `p`, `b`);
    - `hash(x, y, seed): number` in [0,1), `clamp01`, `coverage(value): string` (`rgba(0,0,0,a)`), `ease(value)`;
    - `mix(a: Tri, b: Tri, factor): Tri`, `scaleTri(tri, factor, offset = 0): Tri`, `pick(ink, tri): number`.
  - **`palette.ts`**: `INK_HEX: Record<Ink, string>`, `PAPER_HEX`, `MISREGISTRATION: Record<Ink, readonly [number, number]>`, `GRAIN = 0.12`.
  - **`timeOfDay.ts`**: `type TodName = 'dawn' | 'day' | 'dusk' | 'night'`, `type TodMode = TodName | 'auto'`, `interface TodState`, `TOD`, `autoTod(date): TodName`, `resolveTod(mode, date): TodName`, `approachTod(current, target, factor): TodState`.
  - **`objects.ts`**:
    - `type ObjectId` (the 9 ids), `type Box = readonly [x, y, w, h]`, `interface RoomObject { id, label, number, section: SectionId | null, box, tagSide: 'above' | 'below', tagY?, description }`;
    - `ROOM_OBJECTS` (draw order, top-most last), `CHIP_ORDER`, `getRoomObject(id)`, `objectForSection(section): ObjectId`.
  - **`layouts.ts`**:
    - `type LayoutName = 'desk' | 'phone'`, `type PlaceId = ObjectId | 'lamp' | 'mug' | 'shelf'`, `interface Placement { x, y, s, ox, oy }`, `interface Layout { name, vw, vh, deskY, phoneZoom, place }`;
    - `LAYOUTS`, `placement(layout, id)`, `transformPoint(layout, id, point: readonly [number, number]): [number, number]`, `transformBox(layout, id, box): Box`, `chooseLayout(width, height): LayoutName`.
  - **`hitTest.ts`**: `toVirtual(layout, client: readonly [number, number], rect: { left, top, width, height }): [number, number]` and `hitTest(layout, point: readonly [number, number], isZoomed = false): ObjectId | null`.
  - **`camera.ts`**: `interface CameraTarget { fx, fy, zoom }`, `interface CameraTransform { scale, fx, fy }`, `cameraTarget(layout, id): CameraTarget`, `cameraTransform(layout, target: CameraTarget | null, progress): CameraTransform`.

- [ ] **Step 1: Write the failing tests**

`src/late-shift/__tests__/sectionIds.test.ts`

```ts
import { SECTION_IDS, isSectionId } from '../sectionIds'

describe('section ids', () => {
	it('accepts every section id, including nested project ids', () => {
		for (const id of SECTION_IDS) expect(isSectionId(id)).toBe(true)
		expect(isSectionId('projects/screendle')).toBe(true)
	})

	it('rejects anything else', () => {
		expect(isSectionId('projects')).toBe(false)
		expect(isSectionId('')).toBe(false)
		expect(isSectionId('ABOUT')).toBe(false)
	})
})
```

`src/late-shift/scene/__tests__/math.test.ts`

```ts
import { clamp01, coverage, ease, hash, mix, pick, scaleTri } from '../math'

describe('scene math', () => {
	it('hashes deterministically into [0, 1)', () => {
		expect(hash(3, 4, 5)).toBe(hash(3, 4, 5))
		expect(hash(3, 4, 5)).not.toBe(hash(3, 4, 6))
		for (let index = 0; index < 200; index += 1) {
			const value = hash(index, index * 7, 11)
			expect(value).toBeGreaterThanOrEqual(0)
			expect(value).toBeLessThan(1)
		}
	})

	it('clamps and formats coverage', () => {
		expect(clamp01(-2)).toBe(0)
		expect(clamp01(3)).toBe(1)
		expect(coverage(0.5)).toBe('rgba(0,0,0,0.5)')
		expect(coverage(4)).toBe('rgba(0,0,0,1)')
	})

	it('eases with a clamped smoothstep', () => {
		expect(ease(0)).toBe(0)
		expect(ease(1)).toBe(1)
		expect(ease(0.5)).toBe(0.5)
		expect(ease(-1)).toBe(0)
		expect(ease(2)).toBe(1)
	})

	it('mixes, scales and picks ink coverages', () => {
		expect(mix([0, 0, 0], [1, 2, 3], 0.5)).toEqual([0.5, 1, 1.5])
		const scaled = scaleTri([0.2, 0.4, 0.6], 0.5)
		const lifted = scaleTri([0.2, 0.4, 0.6], 0.5, 0.1)
		for (const [index, expected] of [0.1, 0.2, 0.3].entries())
			expect(scaled[index]).toBeCloseTo(expected)
		for (const [index, expected] of [0.2, 0.3, 0.4].entries())
			expect(lifted[index]).toBeCloseTo(expected)
		expect(pick('y', [0.1, 0.2, 0.3])).toBe(0.1)
		expect(pick('p', [0.1, 0.2, 0.3])).toBe(0.2)
		expect(pick('b', [0.1, 0.2, 0.3])).toBe(0.3)
	})
})
```

`src/late-shift/scene/__tests__/timeOfDay.test.ts`

```ts
import { TOD, approachTod, autoTod, resolveTod } from '../timeOfDay'

const at = (hour: number, minute = 0) => new Date(2026, 8, 27, hour, minute)

describe('time of day', () => {
	it.each([
		[0, 0, 'night'],
		[4, 59, 'night'],
		[5, 0, 'dawn'],
		[7, 59, 'dawn'],
		[8, 0, 'day'],
		[16, 59, 'day'],
		[17, 0, 'dusk'],
		[19, 59, 'dusk'],
		[20, 0, 'night'],
		[23, 59, 'night']
	] as const)('%i:%i is %s', (hour, minute, expected) => {
		expect(autoTod(at(hour, minute))).toBe(expected)
	})

	it('resolves auto from the clock and passes fixed modes through', () => {
		expect(resolveTod('auto', at(12))).toBe('day')
		expect(resolveTod('night', at(12))).toBe('night')
	})

	it('approaches a target state', () => {
		expect(approachTod(TOD.day, TOD.night, 0)).toEqual(TOD.day)
		expect(approachTod(TOD.day, TOD.night, 1)).toEqual(TOD.night)
		expect(approachTod(TOD.day, TOD.night, 5)).toEqual(TOD.night)
		expect(approachTod(TOD.day, TOD.night, 0.5).lamp).toBeCloseTo(
			(TOD.day.lamp + TOD.night.lamp) / 2
		)
	})
})
```

`src/late-shift/scene/__tests__/objects.test.ts`

```ts
import { SECTION_IDS } from '../../sectionIds'
import { CHIP_ORDER, ROOM_OBJECTS, getRoomObject, objectForSection } from '../objects'

describe('room objects', () => {
	it('has 9 uniquely identified objects, all in the chip order', () => {
		const ids = ROOM_OBJECTS.map(object => object.id)
		expect(new Set(ids).size).toBe(9)
		expect([...CHIP_ORDER].sort()).toEqual([...ids].sort())
	})

	it('maps every section to exactly one object, and the radio to none', () => {
		for (const section of SECTION_IDS)
			expect(ROOM_OBJECTS.filter(object => object.section === section)).toHaveLength(1)
		expect(getRoomObject('radio').section).toBeNull()
		expect(objectForSection('projects/screendle')).toBe('screendle')
		expect(objectForSection('android')).toBe('android')
	})

	it('throws for unknown ids', () => {
		expect(() => getRoomObject('lamp' as 'radio')).toThrow(/Unknown room object/)
	})
})
```

`src/late-shift/scene/__tests__/layouts.test.ts`

```ts
import { LAYOUTS, chooseLayout, placement, transformBox, transformPoint } from '../layouts'

describe('layouts', () => {
	it('is the identity on desktop', () => {
		expect(transformPoint(LAYOUTS.desk, 'android', [771, 354])).toEqual([771, 354])
		expect(transformBox(LAYOUTS.desk, 'contact', [62, 42, 416, 306])).toEqual([62, 42, 416, 306])
		expect(placement(LAYOUTS.desk, 'lamp').s).toBe(1)
	})

	it('re-places objects for the phone layout', () => {
		const [x, y] = transformPoint(LAYOUTS.phone, 'android', [771, 354])
		expect(x).toBeCloseTo(349.35)
		expect(y).toBeCloseTo(545.1)
		const [bx, by, bw, bh] = transformBox(LAYOUTS.phone, 'contact', [62, 42, 416, 306])
		expect([bx, by]).toEqual([23, 40])
		expect(bw).toBeCloseTo(374.4)
		expect(bh).toBeCloseTo(275.4)
	})

	it('shares one placement for the shelf, camera and football', () => {
		expect(placement(LAYOUTS.phone, 'about')).toBe(placement(LAYOUTS.phone, 'shelf'))
		expect(placement(LAYOUTS.phone, 'football')).toBe(placement(LAYOUTS.phone, 'shelf'))
	})

	it('uses the phone layout only for narrow portrait viewports', () => {
		expect(chooseLayout(390, 844)).toBe('phone')
		expect(chooseLayout(699, 1000)).toBe('phone')
		expect(chooseLayout(844, 390)).toBe('desk')
		expect(chooseLayout(800, 1200)).toBe('desk')
		expect(chooseLayout(1280, 720)).toBe('desk')
	})
})
```

`src/late-shift/scene/__tests__/hitTest.test.ts`

```ts
import { LAYOUTS } from '../layouts'
import { hitTest, toVirtual } from '../hitTest'

describe('hit testing', () => {
	it('maps client pixels to virtual units', () => {
		const rect = { left: 100, top: 50, width: 500, height: 280 }
		expect(toVirtual(LAYOUTS.desk, [350, 190], rect)).toEqual([500, 280])
	})

	it('finds objects on desktop', () => {
		expect(hitTest(LAYOUTS.desk, [590, 330])).toBe('experience')
		expect(hitTest(LAYOUTS.desk, [200, 150])).toBe('contact')
		expect(hitTest(LAYOUTS.desk, [771, 354])).toBe('android')
		expect(hitTest(LAYOUTS.desk, [990, 20])).toBeNull()
	})

	it('prefers the top-most object where boxes overlap', () => {
		// The radio box overlaps the bottom of the window box
		expect(hitTest(LAYOUTS.desk, [200, 340])).toBe('radio')
	})

	it('uses the transformed boxes on the phone layout', () => {
		expect(hitTest(LAYOUTS.phone, [349, 545])).toBe('android')
		expect(hitTest(LAYOUTS.phone, [771, 354])).toBeNull()
	})

	it('ignores the pointer while zoomed', () => {
		expect(hitTest(LAYOUTS.desk, [590, 330], true)).toBeNull()
	})
})
```

`src/late-shift/scene/__tests__/camera.test.ts`

```ts
import { cameraTarget, cameraTransform } from '../camera'
import { LAYOUTS } from '../layouts'

describe('camera', () => {
	it('rests at the centre with no target or zero progress', () => {
		expect(cameraTransform(LAYOUTS.desk, null, 1)).toEqual({ scale: 1, fx: 500, fy: 280 })
		const target = cameraTarget(LAYOUTS.desk, 'experience')
		expect(cameraTransform(LAYOUTS.desk, target, 0)).toEqual({ scale: 1, fx: 500, fy: 280 })
	})

	it('pushes into the phone screen with the validated zoom', () => {
		const desk = cameraTransform(LAYOUTS.desk, cameraTarget(LAYOUTS.desk, 'android'), 1)
		expect(desk).toEqual({ scale: 4.9, fx: 771, fy: 354 })
		const phone = cameraTransform(LAYOUTS.phone, cameraTarget(LAYOUTS.phone, 'android'), 1)
		expect(phone.scale).toBeCloseTo(6.6)
		expect(phone.fx).toBeCloseTo(349.35)
	})

	it('fits other objects to 90% of the short edge', () => {
		const target = cameraTarget(LAYOUTS.desk, 'experience')
		expect(target.fx).toBe(456 + 136)
		expect(target.fy).toBe(246 + 84)
		expect(target.zoom).toBeCloseTo(0.9 * (560 / 168) - 1)
	})

	it('eases part-way', () => {
		const target = cameraTarget(LAYOUTS.desk, 'android')
		const half = cameraTransform(LAYOUTS.desk, target, 0.5)
		expect(half.scale).toBeCloseTo(1 + 3.9 * 0.25)
		expect(half.fx).toBeCloseTo(500 + (771 - 500) * 0.5)
	})
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm run test:run -- src/late-shift`
Expected: FAIL, with modules not found.

- [ ] **Step 3: Implement `src/late-shift/sectionIds.ts`**

```ts
export const SECTION_IDS = [
	'about',
	'android',
	'experience',
	'skills',
	'contact',
	'projects/screendle',
	'projects/candice',
	'projects/football'
] as const

export type SectionId = (typeof SECTION_IDS)[number]

export function isSectionId(value: string): value is SectionId {
	return (SECTION_IDS as readonly string[]).includes(value)
}
```

- [ ] **Step 4: Implement `src/late-shift/scene/math.ts`**

```ts
export type Ink = 'b' | 'p' | 'y'
export type Tri = readonly [number, number, number]

export const INKS: readonly Ink[] = ['y', 'p', 'b']

const INK_INDEX = { y: 0, p: 1, b: 2 } as const

export function hash(x: number, y: number, seed: number): number {
	let value =
		(Math.imul(x, 374_761_393) +
			Math.imul(y, 668_265_263) +
			Math.imul(seed, 1_442_695_041)) |
		0
	value = Math.imul(value ^ (value >>> 13), 1_274_126_177)
	return ((value ^ (value >>> 16)) >>> 0) / 4_294_967_296
}

export const clamp01 = (value: number): number => Math.min(1, Math.max(0, value))

export const coverage = (value: number): string => `rgba(0,0,0,${clamp01(value)})`

export function ease(value: number): number {
	const x = clamp01(value)
	return x * x * (3 - 2 * x)
}

export const mix = (a: Tri, b: Tri, factor: number): Tri => [
	a[0] + (b[0] - a[0]) * factor,
	a[1] + (b[1] - a[1]) * factor,
	a[2] + (b[2] - a[2]) * factor
]

export const scaleTri = (tri: Tri, factor: number, offset = 0): Tri => [
	tri[0] * factor + offset,
	tri[1] * factor + offset,
	tri[2] * factor + offset
]

export const pick = (ink: Ink, tri: Tri): number => tri[INK_INDEX[ink]]
```

The divisor is `4_294_967_296` (2³²), so the result is strictly below 1.

- [ ] **Step 5: Implement `src/late-shift/scene/palette.ts`**

```ts
import tokens from '../../theme/tokens.json'
import type { Ink } from './math'

export const INK_HEX: Readonly<Record<Ink, string>> = {
	y: tokens.ink.yellow,
	p: tokens.ink.pink,
	b: tokens.ink.blue
}

export const PAPER_HEX = tokens.ink.paper

export const MISREGISTRATION: Readonly<Record<Ink, readonly [number, number]>> = {
	y: [0, 0],
	p: [1.3, -0.8],
	b: [-1, 1.2]
}

export const GRAIN = 0.12
```

- [ ] **Step 6: Implement `src/late-shift/scene/timeOfDay.ts`**

```ts
import { clamp01, mix, type Tri } from './math'

export type TodName = 'dawn' | 'day' | 'dusk' | 'night'
export type TodMode = TodName | 'auto'

export interface TodState {
	readonly skyT: Tri
	readonly skyB: Tri
	readonly wall: Tri
	readonly sil: Tri
	readonly lamp: number
	readonly lit: number
	readonly n: number
}

export const TOD: Readonly<Record<TodName, TodState>> = {
	dawn: { skyT: [0.1, 0.5, 0.4], skyB: [0.6, 0.45, 0.02], wall: [0, 0.32, 0.42], sil: [0.05, 0.4, 0.75], lamp: 0.45, lit: 0.5, n: 0.3 },
	day: { skyT: [0.05, 0.1, 0.32], skyB: [0.1, 0.08, 0.12], wall: [0.08, 0.16, 0.2], sil: [0.12, 0.3, 0.55], lamp: 0.1, lit: 0, n: 0 },
	dusk: { skyT: [0.3, 0.6, 0.4], skyB: [0.95, 0.5, 0], wall: [0, 0.38, 0.55], sil: [0.08, 0.5, 0.85], lamp: 0.6, lit: 0.7, n: 0.5 },
	night: { skyT: [0, 0.35, 1], skyB: [0, 0.5, 0.8], wall: [0, 0.3, 0.82], sil: [0.03, 0.45, 1], lamp: 0.85, lit: 1, n: 1 }
}

export function autoTod(date: Date): TodName {
	const hour = date.getHours()
	if (hour >= 5 && hour < 8) return 'dawn'
	if (hour >= 8 && hour < 17) return 'day'
	if (hour >= 17 && hour < 20) return 'dusk'
	return 'night'
}

export const resolveTod = (mode: TodMode, date: Date): TodName =>
	mode === 'auto' ? autoTod(date) : mode

export function approachTod(current: TodState, target: TodState, factor: number): TodState {
	const f = clamp01(factor)
	if (f === 0) return current
	if (f === 1) return target
	const lerp = (a: number, b: number) => a + (b - a) * f
	return {
		skyT: mix(current.skyT, target.skyT, f),
		skyB: mix(current.skyB, target.skyB, f),
		wall: mix(current.wall, target.wall, f),
		sil: mix(current.sil, target.sil, f),
		lamp: lerp(current.lamp, target.lamp),
		lit: lerp(current.lit, target.lit),
		n: lerp(current.n, target.n)
	}
}
```

- [ ] **Step 7: Implement `src/late-shift/scene/objects.ts`**

```ts
import type { SectionId } from '../sectionIds'

export type ObjectId =
	| 'about'
	| 'android'
	| 'candice'
	| 'contact'
	| 'experience'
	| 'football'
	| 'radio'
	| 'screendle'
	| 'skills'

export type Box = readonly [number, number, number, number]

export interface RoomObject {
	readonly id: ObjectId
	readonly label: string
	readonly number: string
	readonly section: SectionId | null
	readonly box: Box
	readonly tagSide: 'above' | 'below'
	readonly tagY?: number
	readonly description: string
}

/** Draw order: later entries are drawn on top and win hit tests. Boxes are in desktop virtual units. */
export const ROOM_OBJECTS: readonly RoomObject[] = [
	{ id: 'contact', label: 'Contact', number: '05', section: 'contact', box: [62, 42, 416, 306], tagSide: 'above', description: 'The window: Manchester in the rain, with a tram going past.' },
	{ id: 'screendle', label: 'Screendle', number: 'P2', section: 'projects/screendle', box: [508, 62, 96, 140], tagSide: 'above', description: 'A Screendle film poster on the wall.' },
	{ id: 'candice', label: 'Candice', number: 'P3', section: 'projects/candice', box: [622, 80, 126, 112], tagSide: 'above', description: 'Sticky notes saying hello in four languages.' },
	{ id: 'about', label: 'About me', number: '01', section: 'about', box: [782, 148, 86, 60], tagSide: 'above', description: 'A Super 8 film camera on the shelf.' },
	{ id: 'football', label: 'Football Stats', number: 'P1', section: 'projects/football', box: [878, 168, 40, 42], tagSide: 'below', tagY: 216, description: 'A football on the shelf.' },
	{ id: 'radio', label: 'Lofi radio', number: '♪', section: null, box: [146, 326, 160, 86], tagSide: 'below', description: 'A cassette radio. Turns lofi music and rain sounds on or off.' },
	{ id: 'skills', label: 'Skills', number: '04', section: 'skills', box: [388, 364, 64, 48], tagSide: 'below', description: 'A stack of books.' },
	{ id: 'experience', label: 'Experience', number: '03', section: 'experience', box: [456, 246, 272, 168], tagSide: 'below', description: 'A laptop with code on the screen.' },
	{ id: 'android', label: 'Android', number: '02', section: 'android', box: [738, 296, 66, 116], tagSide: 'below', description: 'A phone on a stand showing prayer times.' }
]

export const CHIP_ORDER: readonly ObjectId[] = ['about', 'android', 'experience', 'skills', 'contact', 'football', 'screendle', 'candice', 'radio']

export function getRoomObject(id: ObjectId): RoomObject {
	const object = ROOM_OBJECTS.find(item => item.id === id)
	if (!object) throw new Error(`Unknown room object: ${id}`)
	return object
}

export function objectForSection(section: SectionId): ObjectId {
	const object = ROOM_OBJECTS.find(item => item.section === section)
	if (!object) throw new Error(`No room object for section: ${section}`)
	return object.id
}
```

`objectForSection`'s throw can't happen with valid data, so add `/* istanbul ignore next */` on the line above the `if (!object) throw` in `objectForSection`, so the 100% threshold holds.

- [ ] **Step 8: Implement `src/late-shift/scene/layouts.ts`**

```ts
import type { Box, ObjectId } from './objects'

export type LayoutName = 'desk' | 'phone'
export type PlaceId = ObjectId | 'lamp' | 'mug' | 'shelf'

export interface Placement {
	readonly x: number
	readonly y: number
	readonly s: number
	readonly ox: number
	readonly oy: number
}

export interface Layout {
	readonly name: LayoutName
	readonly vw: number
	readonly vh: number
	readonly deskY: number
	readonly phoneZoom: number
	readonly place: Readonly<Partial<Record<PlaceId, Placement>>>
}

const IDENTITY: Placement = { x: 0, y: 0, s: 1, ox: 0, oy: 0 }
const SHELF: Placement = { x: 240, y: 372, s: 0.8, ox: 770, oy: 140 }

export const LAYOUTS: Readonly<Record<LayoutName, Layout>> = {
	desk: { name: 'desk', vw: 1000, vh: 560, deskY: 410, phoneZoom: 3.9, place: {} },
	phone: {
		name: 'phone',
		vw: 420,
		vh: 780,
		deskY: 600,
		phoneZoom: 5.6,
		place: {
			contact: { x: 23, y: 40, s: 0.9, ox: 62, oy: 42 },
			screendle: { x: 22, y: 345, s: 0.85, ox: 508, oy: 62 },
			candice: { x: 118, y: 352, s: 0.85, ox: 622, oy: 80 },
			shelf: SHELF,
			about: SHELF,
			football: SHELF,
			experience: { x: 96, y: 469, s: 0.78, ox: 456, oy: 246 },
			android: { x: 318, y: 490, s: 0.95, ox: 738, oy: 296 },
			lamp: { x: 8, y: 504, s: 0.7, ox: 878, oy: 275 },
			radio: { x: 24, y: 627, s: 0.85, ox: 146, oy: 326 },
			mug: { x: 190, y: 635, s: 0.9, ox: 330, oy: 334 },
			skills: { x: 250, y: 652, s: 1, ox: 388, oy: 364 }
		}
	}
}

export const placement = (layout: Layout, id: PlaceId): Placement => layout.place[id] ?? IDENTITY

export function transformPoint(layout: Layout, id: PlaceId, point: readonly [number, number]): [number, number] {
	const p = placement(layout, id)
	return [p.x + (point[0] - p.ox) * p.s, p.y + (point[1] - p.oy) * p.s]
}

export function transformBox(layout: Layout, id: PlaceId, box: Box): Box {
	const [x, y] = transformPoint(layout, id, [box[0], box[1]])
	const { s } = placement(layout, id)
	return [x, y, box[2] * s, box[3] * s]
}

export const chooseLayout = (width: number, height: number): LayoutName =>
	height > width && width < 700 ? 'phone' : 'desk'
```

- [ ] **Step 9: Implement `src/late-shift/scene/hitTest.ts`**

```ts
import type { Layout } from './layouts'
import { transformBox } from './layouts'
import { ROOM_OBJECTS, type ObjectId } from './objects'

interface ClientRect {
	readonly left: number
	readonly top: number
	readonly width: number
	readonly height: number
}

export function toVirtual(layout: Layout, client: readonly [number, number], rect: ClientRect): [number, number] {
	return [
		((client[0] - rect.left) / rect.width) * layout.vw,
		((client[1] - rect.top) / rect.height) * layout.vh
	]
}

export function hitTest(layout: Layout, point: readonly [number, number], isZoomed = false): ObjectId | null {
	if (isZoomed) return null
	const [vx, vy] = point
	for (let index = ROOM_OBJECTS.length - 1; index >= 0; index -= 1) {
		const object = ROOM_OBJECTS[index]
		const [x, y, w, h] = transformBox(layout, object.id, object.box)
		if (vx >= x && vx <= x + w && vy >= y && vy <= y + h) return object.id
	}
	return null
}
```

- [ ] **Step 10: Implement `src/late-shift/scene/camera.ts`**

```ts
import { ease } from './math'
import { transformBox, transformPoint, type Layout } from './layouts'
import { getRoomObject, type ObjectId } from './objects'

export interface CameraTarget {
	readonly fx: number
	readonly fy: number
	readonly zoom: number
}

export interface CameraTransform {
	readonly scale: number
	readonly fx: number
	readonly fy: number
}

/** Centre of the phone's screen in desktop virtual units (the prototype's push-in focus). */
const PHONE_SCREEN_CENTRE = [771, 354] as const

export function cameraTarget(layout: Layout, id: ObjectId): CameraTarget {
	if (id === 'android') {
		const [fx, fy] = transformPoint(layout, 'android', PHONE_SCREEN_CENTRE)
		return { fx, fy, zoom: layout.phoneZoom }
	}
	const [x, y, w, h] = transformBox(layout, id, getRoomObject(id).box)
	const fit = 0.9 * Math.min(layout.vw / w, layout.vh / h)
	return { fx: x + w / 2, fy: y + h / 2, zoom: Math.max(0, fit - 1) }
}

export function cameraTransform(layout: Layout, target: CameraTarget | null, progress: number): CameraTransform {
	const cx = layout.vw / 2
	const cy = layout.vh / 2
	if (!target) return { scale: 1, fx: cx, fy: cy }
	const eased = ease(progress)
	return {
		scale: 1 + target.zoom * eased * eased,
		fx: cx + (target.fx - cx) * eased,
		fy: cy + (target.fy - cy) * eased
	}
}
```

- [ ] **Step 11: Run the tests and coverage**

Run: `npm run test:run -- src/late-shift && npm run test:coverage`
Expected: all pass, with 100% coverage on every file in the include list that exists so far.

- [ ] **Step 12: Commit**

```bash
npx prettier -w src/late-shift
npm run run-eslint -- src/late-shift
git add src/late-shift
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: add room scene logic (layouts, hit testing, camera, time of day)"
```

---

### Task 8: Engine primitives: paint helpers, compositor, frame loop

**Files:**
- Create: `src/late-shift/scene/paint.ts`, `src/late-shift/scene/state.ts`, `src/late-shift/engine/compositor.ts`, `src/late-shift/engine/loop.ts`
- Test: `src/late-shift/engine/__tests__/loop.test.ts`

**Interfaces:**
- Consumes: `coverage`, `hash`, `INKS`, `Ink`, `Tri` (Task 7); `INK_HEX`, `PAPER_HEX`, `MISREGISTRATION` (Task 7); `Layout`, `TodState`, `CameraTransform`, `ObjectId` (Task 7).
- Produces:
  - **`paint.ts`**: `type PathFn = (g: CanvasRenderingContext2D) => void`, `type Fill = number | ((g) => CanvasGradient)`, `own(g, path, fill)`, `knock(g, draw, amount)`, `verticalGradient(g, span, stops)`, `radialGlow(g, centre, radius, alpha)`.
  - **`state.ts`**: `interface RoomRenderState { layout, tod, hover, camera, phoneReveal, radioOn, reelAngle, isLightRain }` and `interface SceneFrame { g, t, ink, k, state }`.
  - **`compositor.ts`**: `interface Compositor { resize(cssWidth, cssHeight): void; render(time, viewport: { vw, vh }, draw: (ink, g) => void): void }` and `createCompositor(canvas, { dpr, grain }): Compositor`. It throws `Error('Canvas 2D is not available')` when `getContext` returns null.
  - **`loop.ts`**: `MAX_DT = 0.05`, `interface LoopHandle { stop(); setPaused(paused: boolean); isPaused(): boolean }` and `startLoop(frame: (seconds, dt) => void, deps?: { raf, caf }): LoopHandle`.

- [ ] **Step 1: Write the failing test** `src/late-shift/engine/__tests__/loop.test.ts`

```ts
import { MAX_DT, startLoop } from '../loop'

function fakeRaf() {
	const queue: FrameRequestCallback[] = []
	return {
		raf: (callback: FrameRequestCallback) => queue.push(callback),
		caf: vi.fn(),
		flush(now: number) {
			const callbacks = queue.splice(0)
			for (const callback of callbacks) callback(now)
		}
	}
}

describe('startLoop', () => {
	it('passes elapsed seconds and a clamped dt', () => {
		const clock = fakeRaf()
		const frame = vi.fn()
		startLoop(frame, clock)
		clock.flush(1000)
		clock.flush(1016)
		clock.flush(3000)
		expect(frame).toHaveBeenNthCalledWith(1, 0, 0)
		expect(frame.mock.calls[1][1]).toBeCloseTo(0.016)
		expect(frame.mock.calls[2][1]).toBe(MAX_DT)
		expect(frame.mock.calls[2][0]).toBeCloseTo(0.016 + MAX_DT)
	})

	it('stops calling the frame while paused and does not accumulate time', () => {
		const clock = fakeRaf()
		const frame = vi.fn()
		const loop = startLoop(frame, clock)
		clock.flush(0)
		loop.setPaused(true)
		expect(loop.isPaused()).toBe(true)
		clock.flush(16)
		clock.flush(32)
		expect(frame).toHaveBeenCalledTimes(1)
		loop.setPaused(false)
		clock.flush(48)
		expect(frame).toHaveBeenCalledTimes(2)
		expect(frame.mock.calls[1][0]).toBeCloseTo(0.016)
	})

	it('cancels on stop', () => {
		const clock = fakeRaf()
		const frame = vi.fn()
		const loop = startLoop(frame, clock)
		loop.stop()
		clock.flush(0)
		expect(frame).not.toHaveBeenCalled()
		expect(clock.caf).toHaveBeenCalled()
	})

	it('ignores clocks that run backwards', () => {
		const clock = fakeRaf()
		const frame = vi.fn()
		startLoop(frame, clock)
		clock.flush(100)
		clock.flush(50)
		expect(frame.mock.calls[1][1]).toBe(0)
	})

	it('uses requestAnimationFrame by default', () => {
		const raf = vi.spyOn(window, 'requestAnimationFrame')
		const caf = vi.spyOn(window, 'cancelAnimationFrame')
		startLoop(vi.fn()).stop()
		expect(raf).toHaveBeenCalled()
		expect(caf).toHaveBeenCalled()
	})
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:run -- src/late-shift/engine`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/late-shift/engine/loop.ts`**

```ts
export const MAX_DT = 0.05

export interface LoopHandle {
	readonly stop: () => void
	readonly setPaused: (paused: boolean) => void
	readonly isPaused: () => boolean
}

interface LoopDeps {
	readonly raf: (callback: FrameRequestCallback) => number
	readonly caf: (handle: number) => void
}

const browserDeps: LoopDeps = {
	raf: callback => window.requestAnimationFrame(callback),
	caf: handle => window.cancelAnimationFrame(handle)
}

export function startLoop(
	frame: (seconds: number, dt: number) => void,
	deps: LoopDeps = browserDeps
): LoopHandle {
	let handle = 0
	let last: number | null = null
	let elapsed = 0
	let paused = false
	let running = true

	const tick = (now: number) => {
		if (!running) return
		handle = deps.raf(tick)
		const dt = last === null ? 0 : Math.min(MAX_DT, Math.max(0, (now - last) / 1000))
		last = now
		if (paused) return
		elapsed += dt
		frame(elapsed, dt)
	}
	handle = deps.raf(tick)

	return {
		stop: () => {
			running = false
			deps.caf(handle)
		},
		setPaused: value => {
			paused = value
		},
		isPaused: () => paused
	}
}
```

Vitest's jsdom environment runs with `pretendToBeVisual`, so `window.requestAnimationFrame` exists, and the last test covers `browserDeps`.

- [ ] **Step 4: Implement `src/late-shift/scene/paint.ts`**

```ts
import { coverage } from './math'

export type PathFn = (g: CanvasRenderingContext2D) => void
export type Fill = number | ((g: CanvasRenderingContext2D) => CanvasGradient)

/** Clear the shape on this plate, then lay it down at `fill` coverage, so the shape owns its value. */
export function own(g: CanvasRenderingContext2D, path: PathFn, fill: Fill): void {
	g.save()
	g.beginPath()
	path(g)
	g.globalCompositeOperation = 'destination-out'
	g.fillStyle = '#000'
	g.fill()
	g.globalCompositeOperation = 'source-over'
	g.fillStyle = typeof fill === 'number' ? coverage(fill) : fill(g)
	g.fill()
	g.restore()
}

/** Remove ink (rain, steam, stars): paper shows through. */
export function knock(g: CanvasRenderingContext2D, draw: PathFn, amount: number): void {
	g.save()
	g.globalCompositeOperation = 'destination-out'
	const style = coverage(amount)
	g.strokeStyle = style
	g.fillStyle = style
	draw(g)
	g.restore()
}

export function verticalGradient(
	g: CanvasRenderingContext2D,
	span: readonly [number, number],
	stops: readonly [number, number]
): CanvasGradient {
	const gradient = g.createLinearGradient(0, span[0], 0, span[1])
	gradient.addColorStop(0, coverage(stops[0]))
	gradient.addColorStop(1, coverage(stops[1]))
	return gradient
}

export function radialGlow(
	g: CanvasRenderingContext2D,
	centre: readonly [number, number],
	radius: number,
	alpha: number
): CanvasGradient {
	const gradient = g.createRadialGradient(centre[0], centre[1], 4, centre[0], centre[1], radius)
	gradient.addColorStop(0, coverage(alpha))
	gradient.addColorStop(1, coverage(0))
	return gradient
}
```

- [ ] **Step 5: Implement `src/late-shift/scene/state.ts`**

```ts
import type { CameraTransform } from './camera'
import type { Layout } from './layouts'
import type { Ink, Tri } from './math'
import type { ObjectId } from './objects'
import type { TodState } from './timeOfDay'

export interface RoomRenderState {
	readonly layout: Layout
	readonly tod: TodState
	readonly hover: Readonly<Partial<Record<ObjectId, number>>>
	readonly camera: CameraTransform
	/** 0..1: how far the phone screen has turned into the Android page. */
	readonly phoneReveal: number
	readonly radioOn: boolean
	readonly reelAngle: number
	readonly isLightRain: boolean
}

export interface SceneFrame {
	readonly g: CanvasRenderingContext2D
	readonly t: number
	readonly ink: Ink
	readonly k: (tri: Tri) => number
	readonly state: RoomRenderState
}
```

- [ ] **Step 6: Implement `src/late-shift/engine/compositor.ts`**

```ts
import { hash, INKS, type Ink } from '../scene/math'
import { INK_HEX, MISREGISTRATION, PAPER_HEX } from '../scene/palette'

export interface Compositor {
	readonly resize: (cssWidth: number, cssHeight: number) => void
	readonly render: (
		time: number,
		viewport: { readonly vw: number; readonly vh: number },
		draw: (ink: Ink, g: CanvasRenderingContext2D) => void
	) => void
}

interface Plate {
	readonly ink: Ink
	readonly index: number
	readonly canvas: HTMLCanvasElement
	readonly g: CanvasRenderingContext2D
}

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
	const g = canvas.getContext('2d')
	if (!g) throw new Error('Canvas 2D is not available')
	return g
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	return canvas
}

function makeGrain(width: number, height: number): HTMLCanvasElement {
	const canvas = makeCanvas(width, height)
	const g = context2d(canvas)
	const image = g.createImageData(width, height)
	const { data } = image
	for (let y = 0, index = 0; y < height; y += 1) {
		for (let x = 0; x < width; x += 1, index += 4) {
			const value = 255 - hash(x, y, 7) * 46 - hash(x >> 3, y >> 1, 9) * 14
			data[index] = value
			data[index + 1] = value
			data[index + 2] = value - 4
			data[index + 3] = 255
		}
	}
	g.putImageData(image, 0, 0)
	return canvas
}

export function createCompositor(
	canvas: HTMLCanvasElement,
	options: { readonly dpr: number; readonly grain: number }
): Compositor {
	const main = context2d(canvas)
	let width = 1
	let height = 1
	let plates: Plate[] = []
	let grain = makeCanvas(1, 1)

	const resize = (cssWidth: number, cssHeight: number) => {
		width = Math.max(1, Math.round(cssWidth * options.dpr))
		height = Math.max(1, Math.round(cssHeight * options.dpr))
		canvas.width = width
		canvas.height = height
		plates = INKS.map((ink, index) => {
			const plate = makeCanvas(width, height)
			return { ink, index, canvas: plate, g: context2d(plate) }
		})
		grain = makeGrain(width, height)
	}

	const render: Compositor['render'] = (time, viewport, draw) => {
		main.globalCompositeOperation = 'source-over'
		main.globalAlpha = 1
		main.fillStyle = PAPER_HEX
		main.fillRect(0, 0, width, height)
		const boil = Math.floor(time * 6)
		const shift = options.grain * options.dpr
		for (const plate of plates) {
			const { g } = plate
			g.setTransform(1, 0, 0, 1, 0, 0)
			g.globalCompositeOperation = 'source-over'
			g.clearRect(0, 0, width, height)
			const [ox, oy] = MISREGISTRATION[plate.ink]
			g.translate(
				(ox + (hash(boil, plate.index, 5) - 0.5) * 1.1) * shift,
				(oy + (hash(boil, plate.index, 6) - 0.5) * 1.1) * shift
			)
			g.scale(width / viewport.vw, height / viewport.vh)
			draw(plate.ink, g)
			g.setTransform(1, 0, 0, 1, 0, 0)
			g.globalCompositeOperation = 'source-in'
			g.fillStyle = INK_HEX[plate.ink]
			g.fillRect(0, 0, width, height)
			main.globalCompositeOperation = 'multiply'
			main.drawImage(plate.canvas, 0, 0)
		}
		main.globalCompositeOperation = 'multiply'
		main.globalAlpha = 0.25 + 0.75 * options.grain
		main.drawImage(grain, 0, 0)
		main.globalAlpha = 1
		main.globalCompositeOperation = 'source-over'
	}

	return { resize, render }
}
```

`getImageData` is never used; the grain is built once per resize with `createImageData`. That meets the spec's §6.8 budget.

- [ ] **Step 7: Run the tests, typecheck and lint**

Run: `npm run test:run -- src/late-shift && npm run run-tsc && npm run run-eslint -- src/late-shift`
Expected: PASS, and clean.

- [ ] **Step 8: Commit**

```bash
npx prettier -w src/late-shift
git add src/late-shift
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: add ink-plate compositor, paint helpers and frame loop"
```

---

### Task 9: Port the room drawing and the room engine

**Files:**
- Create: `src/late-shift/scene/objects/window.ts`, `src/late-shift/scene/objects/wallArt.ts`, `src/late-shift/scene/objects/shelf.ts`, `src/late-shift/scene/objects/deskItems.ts`, `src/late-shift/scene/objects/laptop.ts`, `src/late-shift/scene/objects/phone.ts`, `src/late-shift/scene/room.ts`, `src/late-shift/engine/roomEngine.ts`
- Test: `src/late-shift/scene/__tests__/room.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 7 and 8.
- Produces:
  - `drawRoom(ink: Ink, g: CanvasRenderingContext2D, t: number, state: RoomRenderState): void`.
  - `interface RoomEngine { setLayout(name, width, height); setHover(id | null); setHighlight(id | null); setCamera(id | null, progress); setRadio(on); setTodMode(mode); setPaused(paused); destroy() }`.
  - `createRoomEngine(canvas, options: { layout: LayoutName; width: number; height: number; isReducedMotion: boolean; dpr: number }): RoomEngine`. It throws when Canvas 2D is unavailable.

These drawing functions are a line-for-line port of the prototype's `drawWindow`, `drawPoster` and so on, in `docs/superpowers/specs/2026-09-27-portfolio-v3-prototypes/late-shift-room.html`. Here's how to translate:

| Prototype | Port |
|---|---|
| `K(...)` | `k(...)` |
| `C(...)` | `coverage(...)` |
| `cur` | `state.tod` |
| `S.spin` | `state.reelAngle` |
| `S.playing` | `state.radioOn` |
| `S.s` (inside the phone) | `state.phoneReveal` |
| `K([0,1,0]) === 1` | `ink === 'p'` |
| `"Arial Black"` | `"Archivo Black"` |
| 46 rain streaks | `state.isLightRain ? 23 : 46` |

- [ ] **Step 1: Write the failing test** `src/late-shift/scene/__tests__/room.test.ts`

This test runs the whole scene against a fake 2D context. It proves every draw path executes without throwing, and that `save` and `restore` stay balanced.

```ts
import type { Mock } from 'vitest'
import { cameraTarget, cameraTransform } from '../camera'
import { LAYOUTS, type LayoutName } from '../layouts'
import { INKS } from '../math'
import { drawRoom } from '../room'
import type { RoomRenderState } from '../state'
import { TOD, type TodName } from '../timeOfDay'

function fakeContext() {
	const spies = new Map<string, Mock>()
	const values: Record<string, unknown> = {}
	const gradient = { addColorStop: vi.fn() }
	const context = new Proxy(values, {
		get(target, key: string) {
			if (key in target) return target[key]
			if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => gradient
			if (key === 'measureText') return () => ({ width: 40 })
			if (!spies.has(key)) spies.set(key, vi.fn())
			return spies.get(key)
		},
		set(target, key: string, value) {
			target[key] = value
			return true
		}
	}) as unknown as CanvasRenderingContext2D
	const calls = (name: string) => spies.get(name)?.mock.calls.length ?? 0
	return { context, calls }
}

function state(layout: LayoutName, tod: TodName, overrides: Partial<RoomRenderState> = {}): RoomRenderState {
	return {
		layout: LAYOUTS[layout],
		tod: TOD[tod],
		hover: {},
		camera: cameraTransform(LAYOUTS[layout], null, 0),
		phoneReveal: 0,
		radioOn: false,
		reelAngle: 0,
		isLightRain: layout === 'phone',
		...overrides
	}
}

describe('drawRoom', () => {
	it.each(['desk', 'phone'] as const)('draws every time of day on the %s layout', layout => {
		for (const tod of ['dawn', 'day', 'dusk', 'night'] as const) {
			for (const ink of INKS) {
				const { context, calls } = fakeContext()
				drawRoom(ink, context, 12.3, state(layout, tod))
				expect(calls('fill')).toBeGreaterThan(100)
				expect(calls('save')).toBe(calls('restore'))
			}
		}
	})

	it('draws hover, radio and the phone reveal states', () => {
		const layout = LAYOUTS.desk
		for (const ink of INKS) {
			const { context, calls } = fakeContext()
			drawRoom(ink, context, 3, state('desk', 'night', {
				hover: { experience: 1, android: 0.5 },
				radioOn: true,
				reelAngle: 2,
				phoneReveal: 1,
				camera: cameraTransform(layout, cameraTarget(layout, 'android'), 1)
			}))
			expect(calls('save')).toBe(calls('restore'))
			expect(calls('fillText')).toBeGreaterThan(5)
		}
	})

	it('draws half as many rain streaks on light rain', () => {
		const heavy = fakeContext()
		drawRoom('b', heavy.context, 1, state('desk', 'night', { isLightRain: false }))
		const light = fakeContext()
		drawRoom('b', light.context, 1, state('desk', 'night', { isLightRain: true }))
		expect(light.calls('stroke')).toBeLessThan(heavy.calls('stroke'))
	})
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:run -- src/late-shift/scene/__tests__/room.test.ts`
Expected: FAIL (`../room` not found).

- [ ] **Step 3: Implement `src/late-shift/scene/objects/window.ts`**

```ts
import { coverage, hash, mix, scaleTri, type Tri } from '../math'
import { knock, own, verticalGradient } from '../paint'
import type { SceneFrame } from '../state'

const WX = 70
const WY = 50
const WW = 400
const WH = 290
const WB = WY + WH
const FRAME: Tri = [0.25, 0.55, 0.85]

function drawSky({ g, t, k, state }: SceneFrame): void {
	const { tod } = state
	own(g, c => c.rect(WX, WY, WW, WH), c => verticalGradient(c, [WY, WB], [k(tod.skyT), k(tod.skyB)]))
	if (tod.n > 0.3) {
		for (let index = 0; index < 22; index += 1) {
			if (Math.sin(t * 2.5 + index * 3) > -0.2) {
				own(g, c => c.rect(WX + hash(index, 1, 2) * WW, WY + hash(index, 2, 2) * WH * 0.5, 2, 2), k([0.7, 0, 0]) * tod.n)
			}
		}
		own(g, c => c.arc(WX + 62, WY + 46, 15, 0, 7), k([0.85, 0.05, 0]))
	}
	for (let index = 0; index < 4; index += 1) {
		const cx = WX + ((index * 140 + t * 12) % (WW + 160)) - 80
		const cy = WY + 40 + index * 22
		own(g, c => {
			c.ellipse(cx, cy, 60, 12, 0, 0, 7)
			c.ellipse(cx + 26, cy - 8, 34, 11, 0, 0, 7)
		}, k(mix(tod.skyT, [0.05, 0.12, 0.3], 0.5)))
	}
}

function drawSkyline({ g, t, k, state }: SceneFrame): void {
	const { tod } = state
	const { sil, n } = tod
	own(g, c => {
		c.moveTo(WX, WB)
		for (let x = 0; x <= WW; x += 24) {
			const roof = 44 + hash(x, 3, 3) * 18
			c.lineTo(WX + x, WB - roof + 10)
			c.lineTo(WX + x + 12, WB - roof)
			c.lineTo(WX + x + 24, WB - roof + 10)
		}
		c.lineTo(WX + WW, WB)
		c.closePath()
	}, k(scaleTri(sil, 0.88)))
	const brick = mix([0.35, 0.75, 0.4], [0.05, 0.55, 1], n * 0.85)
	own(g, c => {
		c.rect(96, 246, 128, WB - 246)
		c.rect(200, 160, 14, 90)
		c.rect(197, 156, 20, 8)
	}, k(brick))
	for (let row = 0; row < 3; row += 1) {
		for (let column = 0; column < 6; column += 1) {
			const isLit = hash(column, row, 9) < 0.55 && tod.lit > 0.2
			own(g, c => c.rect(104 + column * 20, 256 + row * 24, 10, 14), isLit ? k([tod.lit, 0.15, 0]) : k(scaleTri(brick, 0.75, 0.15)))
		}
	}
	const glass = mix([0.05, 0.12, 0.5], sil, n)
	own(g, c => {
		c.rect(352, 92, 26, WB - 92)
		c.rect(352, 92, 34, 96)
		c.rect(382, 74, 2, 20)
	}, k(glass))
	for (let y = 100; y < WB; y += 9) {
		const isLit = n > 0.3 && hash(y, 1, 4) < 0.6
		own(g, c => c.rect(354, y, y < 188 ? 30 : 22, 1.6), isLit ? k([tod.lit * 0.9, 0, 0]) : k(scaleTri(glass, 0.7, 0.15)))
	}
	g.lineWidth = 1.2
	g.strokeStyle = coverage(k([0, 0.4, 0.8]))
	g.beginPath()
	g.moveTo(WX, WB - 42)
	g.lineTo(WX + WW, WB - 40)
	g.stroke()
	const tramX = WX + WW + 60 - ((t * 120) % (WW + 460))
	own(g, c => c.roundRect(tramX, WB - 30, 200, 22, 5), k([1, 0.12, 0.08]))
	g.lineWidth = 1.5
	g.strokeStyle = coverage(k([0, 0.3, 0.9]))
	g.beginPath()
	g.moveTo(tramX + 90, WB - 30)
	g.lineTo(tramX + 100, WB - 41)
	g.lineTo(tramX + 110, WB - 30)
	g.stroke()
	for (let index = 0; index < 9; index += 1) {
		own(g, c => c.rect(tramX + 8 + index * 21, WB - 26, 14, 8), n > 0.3 ? k([1, 0, 0]) : k([0.1, 0.3, 0.75]))
	}
	own(g, c => c.rect(WX, WB - 8, WW, 8), k(scaleTri(sil, 0.8)))
}

function drawRain({ g, t, state }: SceneFrame): void {
	const { n } = state.tod
	const streaks = state.isLightRain ? 23 : 46
	for (let index = 0; index < streaks; index += 1) {
		const rx = WX + hash(index, 4, 1) * (WW + 40)
		const ry = WY + ((hash(index, 5, 1) * WH + t * 260) % (WH + 20)) - 10
		knock(g, c => {
			c.lineWidth = 1.2
			c.beginPath()
			c.moveTo(rx, ry)
			c.lineTo(rx - 5, ry + 13)
			c.stroke()
		}, 0.35 + 0.35 * n)
	}
	for (let index = 0; index < 16; index += 1) {
		const dx = WX + hash(index, 8, 8) * WW
		const dy = WY + ((hash(index, 9, 8) * WH + t * (8 + hash(index, 1, 8) * 14)) % WH)
		knock(g, c => {
			c.beginPath()
			c.arc(dx, dy, 2.4, 0, 7)
			c.fill()
		}, 0.45)
	}
}

export default function drawWindow(frame: SceneFrame): void {
	const { g, k } = frame
	g.save()
	g.beginPath()
	g.rect(WX, WY, WW, WH)
	g.clip()
	drawSky(frame)
	drawSkyline(frame)
	drawRain(frame)
	g.restore()
	own(g, c => {
		c.rect(WX + WW / 2 - 3, WY, 6, WH)
		c.rect(WX, WY + WH * 0.45 - 3, WW, 6)
	}, k(FRAME))
	g.lineWidth = 9
	g.strokeStyle = coverage(k(FRAME))
	g.strokeRect(WX - 2, WY - 2, WW + 4, WH + 4)
	own(g, c => c.rect(WX - 16, WB + 4, WW + 32, 12), k([0.3, 0.55, 0.6]))
}
```

- [ ] **Step 4: Implement `src/late-shift/scene/objects/wallArt.ts`**

```ts
import { coverage, type Tri } from '../math'
import { own } from '../paint'
import type { SceneFrame } from '../state'

const POSTER: Tri = [0.15, 0.85, 0.25]

export function drawPoster({ g, t, k }: SceneFrame): void {
	own(g, c => c.rect(512, 66, 88, 132), k(POSTER))
	own(g, c => c.arc(556, 118, 30, 0, 7), k([0.9, 0.2, 0]))
	for (let index = 0; index < 6; index += 1) {
		const angle = index * 1.047 + t * 0.5
		own(g, c => c.arc(556 + Math.cos(angle) * 17, 118 + Math.sin(angle) * 17, 6, 0, 7), k(POSTER))
	}
	own(g, c => c.arc(556, 118, 5, 0, 7), k(POSTER))
	g.fillStyle = coverage(k([0.9, 0, 0]))
	g.font = '400 12px "Archivo Black", system-ui'
	g.fillText('SCREENDLE', 517, 176)
	g.font = '700 7px "JetBrains Mono", monospace'
	g.fillText('5 CLUES · 5 GUESSES', 520, 188)
}

const NOTES: readonly { readonly x: number; readonly y: number; readonly tilt: number; readonly colour: Tri; readonly word: string }[] = [
	{ x: 630, y: 86, tilt: -0.08, colour: [0.9, 0.05, 0], word: 'hola' },
	{ x: 680, y: 100, tilt: 0.07, colour: [0.2, 0.75, 0], word: 'merci' },
	{ x: 646, y: 134, tilt: 0.04, colour: [0.08, 0.1, 0.35], word: 'سلام' },
	{ x: 700, y: 146, tilt: -0.05, colour: [0.9, 0.05, 0], word: 'ciao' }
]

export function drawStickies({ g, t, k }: SceneFrame): void {
	for (const note of NOTES) {
		g.save()
		g.translate(note.x + 20, note.y + 20)
		g.rotate(note.tilt + Math.sin(t * 1.4 + note.x) * 0.02)
		own(g, c => c.rect(-20, -20, 40, 40), k(note.colour))
		g.font = '700 11px "DM Sans", system-ui'
		g.textAlign = 'center'
		g.fillStyle = coverage(k([0, 0.1, 0.95]))
		g.fillText(note.word, 0, 4)
		g.restore()
	}
}
```

- [ ] **Step 5: Implement `src/late-shift/scene/objects/shelf.ts`**

```ts
import { coverage } from '../math'
import { own } from '../paint'
import type { SceneFrame } from '../state'

export function drawShelf({ g, t, k }: SceneFrame): void {
	own(g, c => c.rect(770, 206, 212, 8), k([0.3, 0.6, 0.6]))
	own(g, c => {
		c.moveTo(938, 206)
		c.lineTo(942, 184)
		c.lineTo(966, 184)
		c.lineTo(970, 206)
		c.closePath()
	}, k([0.5, 0.75, 0.3]))
	for (let index = 0; index < 5; index += 1) {
		const angle = -2.4 + index * 0.45 + Math.sin(t * 1.3 + index) * 0.06
		own(g, c => c.ellipse(954 + Math.cos(angle) * 14, 180 + Math.sin(angle) * 14, 12, 5, angle, 0, 7), k([0.75, 0.05, 0.65]))
	}
}

export function drawCamera({ g, k }: SceneFrame): void {
	own(g, c => {
		c.roundRect(786, 166, 58, 40, 4)
		c.rect(800, 152, 26, 14)
	}, k([0.1, 0.35, 0.95]))
	own(g, c => c.arc(852, 186, 13, 0, 7), k([0.2, 0.15, 0.6]))
	own(g, c => c.arc(852, 186, 6, 0, 7), k([0.9, 0.1, 0.2]))
	g.font = '700 7px "JetBrains Mono", monospace'
	g.fillStyle = coverage(k([0.8, 0.1, 0]))
	g.fillText('SUPER 8', 792, 200)
}

export function drawFootball({ g, t, k }: SceneFrame): void {
	g.save()
	g.translate(898, 189)
	g.rotate(Math.sin(t * 0.8) * 0.15)
	own(g, c => c.arc(0, 0, 17, 0, 7), k([0.04, 0.04, 0.08]))
	own(g, c => {
		c.arc(0, 0, 5.5, 0, 7)
		for (const [x, y] of [[-12, -8], [13, -7], [-7, 12], [9, 11]] as const) {
			c.moveTo(x + 3.5, y)
			c.arc(x, y, 3.5, 0, 7)
		}
	}, k([0, 0.2, 0.95]))
	g.restore()
}
```

- [ ] **Step 6: Implement `src/late-shift/scene/objects/deskItems.ts`**

```ts
import { coverage, type Tri } from '../math'
import { knock, own } from '../paint'
import type { SceneFrame } from '../state'

export function drawRadio({ g, t, k, state }: SceneFrame): void {
	own(g, c => c.roundRect(150, 342, 152, 68, 7), k([0.35, 0.8, 0.22]))
	own(g, c => {
		c.rect(206, 332, 3, 12)
		c.rect(196, 330, 60, 3)
	}, k([0.1, 0.4, 0.9]))
	for (let y = 354; y < 400; y += 6) {
		for (let x = 160; x < 196; x += 6) own(g, c => c.arc(x, y, 1.6, 0, 7), k([0.2, 0.5, 0.95]))
	}
	own(g, c => c.roundRect(204, 352, 88, 36, 4), k([0.08, 0.08, 0.25]))
	for (const cx of [228, 268]) {
		own(g, c => c.arc(cx, 370, 11, 0, 7), k([0.1, 0.35, 0.9]))
		for (let spoke = 0; spoke < 3; spoke += 1) {
			const angle = state.reelAngle + spoke * 2.094
			knock(g, c => {
				c.lineWidth = 2.5
				c.beginPath()
				c.moveTo(cx, 370)
				c.lineTo(cx + Math.cos(angle) * 9, 370 + Math.sin(angle) * 9)
				c.stroke()
			}, 1)
		}
	}
	g.font = '700 8px "JetBrains Mono", monospace'
	g.fillStyle = coverage(k([0, 0.1, 0.95]))
	g.fillText(state.radioOn ? 'LOFI FM  ▶' : 'LOFI FM  ■', 216, 402)
	if (!state.radioOn) return
	for (let index = 0; index < 4; index += 1) {
		const life = (t * 0.5 + index * 0.25) % 1
		g.font = `700 ${12 + index * 2}px system-ui`
		g.fillStyle = coverage(k([0, 0.8, 0.9]) * (1 - life))
		g.fillText(index % 2 === 1 ? '♪' : '♫', 250 + Math.sin(life * 6 + index) * 18 + index * 8, 336 - life * 62)
	}
}

export function drawMug({ g, t, k }: SceneFrame): void {
	own(g, c => c.roundRect(334, 376, 30, 34, 3), k([0.1, 0.25, 0.9]))
	g.lineWidth = 4
	g.strokeStyle = coverage(k([0.1, 0.25, 0.9]))
	g.beginPath()
	g.arc(365, 392, 7, -1.4, 1.4)
	g.stroke()
	for (let wisp = 0; wisp < 2; wisp += 1) {
		knock(g, c => {
			c.lineWidth = 3
			c.beginPath()
			c.moveTo(342 + wisp * 12 + Math.sin(t * 3.2 + wisp * 2) * 4, 372)
			for (let y = 2; y < 38; y += 2) {
				c.lineTo(342 + wisp * 12 + Math.sin(y * 0.2 + t * 3.2 + wisp * 2) * 4, 372 - y)
			}
			c.stroke()
		}, 0.45)
	}
}

const BOOKS: readonly { readonly x: number; readonly y: number; readonly w: number; readonly colour: Tri; readonly title: string }[] = [
	{ x: 392, y: 396, w: 58, colour: [0.1, 0.85, 0.1], title: 'KOTLIN' },
	{ x: 396, y: 382, w: 52, colour: [0.9, 0.05, 0.2], title: 'REACT' },
	{ x: 390, y: 368, w: 56, colour: [0.05, 0.25, 0.9], title: 'K8S · HELM' }
]

export function drawBooks({ g, k }: SceneFrame): void {
	for (const book of BOOKS) {
		own(g, c => c.roundRect(book.x, book.y, book.w, 14, 2), k(book.colour))
		g.font = '700 6.5px "JetBrains Mono", monospace'
		g.fillStyle = coverage(k(book.colour[2] > 0.5 ? [0.9, 0, 0] : [0, 0.1, 0.95]))
		g.fillText(book.title, book.x + 5, book.y + 9.5)
	}
}

export function drawLamp({ g, k }: SceneFrame): void {
	g.lineWidth = 4
	g.strokeStyle = coverage(k([0, 0.45, 1]))
	g.beginPath()
	g.moveTo(950, 408)
	g.lineTo(930, 350)
	g.lineTo(912, 300)
	g.stroke()
	own(g, c => {
		c.moveTo(880, 312)
		c.lineTo(896, 280)
		c.lineTo(922, 280)
		c.lineTo(934, 312)
		c.closePath()
	}, k([0.1, 0.6, 0.95]))
	own(g, c => c.ellipse(907, 313, 26, 4, 0, 0, 7), k([1, 0.1, 0]))
	own(g, c => c.rect(934, 404, 32, 6), k([0.05, 0.5, 1]))
}
```

- [ ] **Step 7: Implement `src/late-shift/scene/objects/laptop.ts`**

```ts
import type { Tri } from '../math'
import { own } from '../paint'
import type { SceneFrame } from '../state'

type Token = 'call' | 'keyword' | 'plain' | 'string'

const COLOURS: Readonly<Record<Token, Tri>> = {
	keyword: [0, 0.9, 0],
	string: [0.95, 0, 0],
	call: [0.85, 0, 0],
	plain: [0.12, 0.08, 0.05]
}

const LINES: readonly (readonly [number, Token, number])[] = [
	[0, 'keyword', 36], [0, 'string', 70], [1, 'plain', 90], [2, 'keyword', 30],
	[2, 'call', 60], [1, 'plain', 40], [3, 'string', 80], [3, 'call', 44],
	[2, 'plain', 70], [1, 'keyword', 26], [0, 'plain', 12], [0, 'keyword', 50],
	[1, 'call', 96], [2, 'string', 54]
]

export default function drawLaptop({ g, t, k }: SceneFrame): void {
	own(g, c => c.roundRect(484, 250, 216, 146, 6), k([0.05, 0.35, 1]))
	own(g, c => c.rect(492, 258, 200, 130), k([0.02, 0.3, 0.8]))
	const offset = Math.floor(t * 1.2) % LINES.length
	for (let index = 0; index < 12; index += 1) {
		const [indent, token, width] = LINES[(index + offset) % LINES.length]
		own(g, c => c.rect(500 + indent * 12, 266 + index * 10, width, 4), k(COLOURS[token]))
	}
	if (Math.floor(t * 2.5) % 2 === 1) own(g, c => c.rect(610, 376, 5, 6), k([0.95, 0, 0]))
	own(g, c => {
		c.moveTo(470, 396)
		c.lineTo(714, 396)
		c.lineTo(728, 412)
		c.lineTo(456, 412)
		c.closePath()
	}, k([0.08, 0.4, 0.8]))
}
```

- [ ] **Step 8: Implement `src/late-shift/scene/objects/phone.ts`**

```ts
import { coverage, ease, type Ink, type Tri } from '../math'
import { knock, own, verticalGradient } from '../paint'
import type { SceneFrame } from '../state'

const SX = 745
const SY = 305
const SW = 52
const SH = 98
const PRAYERS = [['Fajr', '05:31'], ['Dhuhr', '13:02'], ['Asr', '16:12'], ['Maghrib', '18:52'], ['Isha', '20:21']] as const

function drawPrayerScreen(g: CanvasRenderingContext2D, k: (tri: Tri) => number, fade: number, isNight: boolean): void {
	const write = (text: string, x: number, y: number, size: number) => {
		g.font = `700 ${size}px "DM Sans", system-ui`
		if (isNight) {
			knock(g, c => c.fillText(text, x, y), fade)
			return
		}
		g.fillStyle = coverage(k([0, 0.1, 0.95]) * fade)
		g.fillText(text, x, y)
	}
	write('Manchester', SX + 5, SY + 11, 4.5)
	write('Maghrib 18:52', SX + 5, SY + 27, 7.5)
	write('in 1h 04m', SX + 5, SY + 35, 4.5)
	for (const [index, [name, time]] of PRAYERS.entries()) {
		own(g, c => c.roundRect(SX + 4, SY + 44 + index * 10, SW - 8, 8, 2), (index === 3 ? k([0.9, 0.3, 0]) : k([0.05, 0.05, 0.12])) * fade)
		g.font = '600 4px "DM Sans", system-ui'
		g.fillStyle = coverage(k([0, 0.1, 0.9]) * fade)
		g.fillText(name, SX + 7, SY + 49.5 + index * 10)
		g.fillText(time, SX + SW - 18, SY + 49.5 + index * 10)
	}
}

function drawAndroidTitle(g: CanvasRenderingContext2D, ink: Ink, k: (tri: Tri) => number, printed: number): void {
	const slide = (1 - printed) * 14
	g.font = '400 10px "Archivo Black", system-ui'
	const size = (10 * (SW - 7)) / g.measureText('ANDROID').width
	g.font = `400 ${size}px "Archivo Black", system-ui`
	if (ink === 'p') {
		g.fillStyle = coverage(0.95 * (0.3 + 0.7 * printed))
		g.fillText('ANDROID', SX + 3 - slide, SY + 34 - slide * 0.3)
	}
	if (ink === 'b') {
		g.fillStyle = coverage(0.8 * (0.3 + 0.7 * printed))
		g.fillText('ANDROID', SX + 3 + slide, SY + 34 + slide * 0.3)
	}
	if (ink === 'y') {
		g.fillStyle = coverage(0.9 * printed)
		g.beginPath()
		g.arc(SX + SW - 10, SY + SH - 12, 7, 0, 7)
		g.fill()
	}
	g.font = '700 3.6px "JetBrains Mono", monospace'
	g.fillStyle = coverage(k([0, 0.2, 0.95]) * printed)
	g.fillText('02 / KOTLIN · COMPOSE', SX + 4, SY + 16)
}

export default function drawPhone({ g, ink, k, state }: SceneFrame): void {
	const { tod, phoneReveal } = state
	own(g, c => {
		c.moveTo(752, 410)
		c.lineTo(768, 380)
		c.lineTo(790, 410)
		c.closePath()
	}, k([0.1, 0.4, 0.9]))
	own(g, c => c.roundRect(741, 300, 60, 108, 9), k([0.05, 0.3, 1]))
	const fade = 1 - ease((phoneReveal - 0.45) / 0.18)
	g.save()
	g.beginPath()
	g.roundRect(SX, SY, SW, SH, 5)
	g.clip()
	own(g, c => c.rect(SX, SY, SW, SH), c => verticalGradient(c, [SY, SY + SH], [k(tod.skyT) * fade, k(tod.skyB) * fade]))
	if (fade > 0.01) drawPrayerScreen(g, k, fade, tod.n > 0.4)
	const printed = ease((phoneReveal - 0.6) / 0.3)
	if (printed > 0) drawAndroidTitle(g, ink, k, printed)
	g.restore()
}
```

The canvas title reads "02 / KOTLIN · COMPOSE" so it fits the 52-unit screen. The full kicker lives in the HTML section page.

- [ ] **Step 9: Implement `src/late-shift/scene/room.ts`**

```ts
import { placement, transformPoint, type Placement, type PlaceId } from './layouts'
import { coverage, pick, type Ink, type Tri } from './math'
import { getRoomObject, type ObjectId } from './objects'
import { drawBooks, drawLamp, drawMug, drawRadio } from './objects/deskItems'
import drawLaptop from './objects/laptop'
import drawPhone from './objects/phone'
import { drawCamera, drawFootball, drawShelf } from './objects/shelf'
import { drawPoster, drawStickies } from './objects/wallArt'
import drawWindow from './objects/window'
import { own, radialGlow } from './paint'
import type { RoomRenderState, SceneFrame } from './state'

const DRAWERS: Readonly<Record<ObjectId, (frame: SceneFrame) => void>> = {
	contact: drawWindow,
	screendle: drawPoster,
	candice: drawStickies,
	about: drawCamera,
	football: drawFootball,
	radio: drawRadio,
	skills: drawBooks,
	experience: drawLaptop,
	android: drawPhone
}

const GLOW_LIFT: Readonly<Record<Ink, number>> = { y: 0, p: 0.3, b: 0.8 }

function applyPlacement(g: CanvasRenderingContext2D, p: Placement): void {
	g.translate(p.x, p.y)
	g.scale(p.s, p.s)
	g.translate(-p.ox, -p.oy)
}

function placed(frame: SceneFrame, id: PlaceId, draw: (frame: SceneFrame) => void): void {
	frame.g.save()
	applyPlacement(frame.g, placement(frame.state.layout, id))
	draw(frame)
	frame.g.restore()
}

function drawObject(frame: SceneFrame, id: ObjectId): void {
	const { g, t, ink, state } = frame
	const lift = state.hover[id] ?? 0
	const [x, y, w, h] = getRoomObject(id).box
	g.save()
	applyPlacement(g, placement(state.layout, id))
	if (lift > 0.001) {
		const cx = x + w / 2
		const cy = y + h / 2
		if (ink === 'y') {
			g.fillStyle = radialGlow(g, [cx, cy], Math.max(w, h) * 0.8, 0.55 * lift)
			g.fillRect(x - w, y - h, w * 3, h * 3)
		}
		const grow = 1 + 0.035 * lift
		g.translate(cx, cy - 4 * lift)
		g.scale(grow, grow)
		g.translate(-cx, -cy)
	}
	DRAWERS[id](frame)
	if (lift > 0.001 && ink === 'p') {
		g.setLineDash([7, 5])
		g.lineDashOffset = -t * 30
		g.lineWidth = 2.2
		g.strokeStyle = coverage(0.95 * lift)
		g.beginPath()
		g.roundRect(x - 7, y - 7, w + 14, h + 14, 8)
		g.stroke()
		g.setLineDash([])
	}
	g.restore()
}

function drawWall({ g, k, state }: SceneFrame): void {
	const { vw, vh, deskY } = state.layout
	own(g, c => c.rect(0, 0, vw, vh), k(state.tod.wall))
	for (let x = 0; x < vw; x += 34) own(g, c => c.rect(x, 0, 12, deskY), k(state.tod.wall) * 1.12)
}

function drawDesk({ g, k, state }: SceneFrame): void {
	const { vw, vh, deskY } = state.layout
	own(g, c => c.rect(0, deskY, vw, vh - deskY), k([0.22, 0.46, 0.3]))
	for (let y = deskY + 16; y < vh; y += 22) own(g, c => c.rect(0, y, vw, 2), k([0.3, 0.75, 0.4]))
	own(g, c => c.rect(0, deskY, vw, 5), k([0.25, 0.75, 0.55]))
}

function drawLampGlow({ g, ink, state }: SceneFrame): void {
	const { layout, tod } = state
	const centre = transformPoint(layout, 'lamp', [905, 312])
	const radius = 420 * placement(layout, 'lamp').s
	g.save()
	g.globalCompositeOperation = 'destination-out'
	g.fillStyle = radialGlow(g, centre, radius, GLOW_LIFT[ink] * tod.lamp)
	g.fillRect(0, 0, layout.vw, layout.vh)
	g.restore()
	if (ink === 'y') {
		g.fillStyle = radialGlow(g, centre, radius, 0.7 * tod.lamp)
		g.fillRect(0, 0, layout.vw, layout.vh)
	}
}

export function drawRoom(ink: Ink, g: CanvasRenderingContext2D, t: number, state: RoomRenderState): void {
	const frame: SceneFrame = { g, t, ink, k: (tri: Tri) => pick(ink, tri), state }
	const { layout, camera } = state
	g.save()
	g.translate(layout.vw / 2, layout.vh / 2)
	g.scale(camera.scale, camera.scale)
	g.translate(-camera.fx, -camera.fy)
	drawWall(frame)
	for (const id of ['screendle', 'candice', 'contact'] as const) drawObject(frame, id)
	drawDesk(frame)
	drawLampGlow(frame)
	placed(frame, 'shelf', drawShelf)
	for (const id of ['about', 'football', 'radio'] as const) drawObject(frame, id)
	placed(frame, 'mug', drawMug)
	for (const id of ['skills', 'experience', 'android'] as const) drawObject(frame, id)
	placed(frame, 'lamp', drawLamp)
	g.restore()
}
```

- [ ] **Step 10: Run the room test**

Run: `npm run test:run -- src/late-shift/scene`
Expected: PASS. If `fill` counts are low, check that `own` is being used, not `fillRect`.

- [ ] **Step 11: Implement `src/late-shift/engine/roomEngine.ts`**

```ts
import { cameraTarget, cameraTransform } from '../scene/camera'
import { LAYOUTS, type LayoutName } from '../scene/layouts'
import { ROOM_OBJECTS, type ObjectId } from '../scene/objects'
import { GRAIN } from '../scene/palette'
import { drawRoom } from '../scene/room'
import type { RoomRenderState } from '../scene/state'
import { TOD, approachTod, resolveTod, type TodMode } from '../scene/timeOfDay'
import { createCompositor } from './compositor'
import { startLoop } from './loop'

export interface RoomEngine {
	readonly setLayout: (name: LayoutName, width: number, height: number) => void
	readonly setHover: (id: ObjectId | null) => void
	readonly setHighlight: (id: ObjectId | null) => void
	readonly setCamera: (id: ObjectId | null, progress: number) => void
	readonly setRadio: (on: boolean) => void
	readonly setTodMode: (mode: TodMode) => void
	readonly setPaused: (paused: boolean) => void
	readonly destroy: () => void
}

export interface RoomEngineOptions {
	readonly layout: LayoutName
	readonly width: number
	readonly height: number
	readonly isReducedMotion: boolean
	readonly dpr: number
}

/** Reduced motion renders a single, fixed moment of the animation. */
const STATIC_TIME = 12

export function createRoomEngine(canvas: HTMLCanvasElement, options: RoomEngineOptions): RoomEngine {
	const compositor = createCompositor(canvas, { dpr: options.dpr, grain: GRAIN })
	compositor.resize(options.width, options.height)
	let layout = LAYOUTS[options.layout]
	let todMode: TodMode = 'auto'
	let tod = TOD[resolveTod(todMode, new Date())]
	let hoverId: ObjectId | null = null
	let highlightId: ObjectId | null = null
	const hover: Partial<Record<ObjectId, number>> = {}
	let cameraId: ObjectId | null = null
	let cameraProgress = 0
	let radioOn = false
	let reelAngle = 0
	let dirty = true

	void document.fonts.load('16px "Archivo Black"').then(() => {
		dirty = true
	})

	const frame = (seconds: number, dt: number) => {
		const target = TOD[resolveTod(todMode, new Date())]
		tod = options.isReducedMotion ? target : approachTod(tod, target, 1 - Math.exp(-dt * 2.5))
		let isSettling = false
		for (const object of ROOM_OBJECTS) {
			const goal = object.id === hoverId || object.id === highlightId ? 1 : 0
			const current = hover[object.id] ?? 0
			const next = options.isReducedMotion ? goal : current + (goal - current) * (1 - Math.exp(-dt * 14))
			if (Math.abs(next - current) > 0.001) isSettling = true
			hover[object.id] = next
		}
		if (radioOn) reelAngle += dt * 5
		if (options.isReducedMotion && !dirty && !isSettling) return
		dirty = false
		const time = options.isReducedMotion ? STATIC_TIME : seconds
		const state: RoomRenderState = {
			layout,
			tod,
			hover,
			camera: cameraTransform(layout, cameraId ? cameraTarget(layout, cameraId) : null, cameraProgress),
			phoneReveal: cameraId === 'android' ? cameraProgress : 0,
			radioOn,
			reelAngle,
			isLightRain: layout.name === 'phone'
		}
		compositor.render(time, layout, (ink, g) => drawRoom(ink, g, time, state))
	}

	const loop = startLoop(frame)

	return {
		setLayout: (name, width, height) => {
			layout = LAYOUTS[name]
			compositor.resize(width, height)
			dirty = true
		},
		setHover: id => {
			hoverId = id
			dirty = true
		},
		setHighlight: id => {
			highlightId = id
			dirty = true
		},
		setCamera: (id, progress) => {
			cameraId = id
			cameraProgress = progress
			dirty = true
		},
		setRadio: on => {
			radioOn = on
			dirty = true
		},
		setTodMode: mode => {
			todMode = mode
			dirty = true
		},
		setPaused: paused => loop.setPaused(paused),
		destroy: () => loop.stop()
	}
}
```

- [ ] **Step 12: Typecheck, lint, test and commit**

```bash
npm run run-tsc && npm run test:run -- src/late-shift
npx prettier -w src/late-shift
npm run run-eslint -- src/late-shift
git add src/late-shift
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: port the room scene drawing and add the room engine"
```

The room gets checked visually by screenshots at the end of Task 10, once it's mounted in the page.

---

### Task 10: The Late Shift UI shell (room, tags, chips, radio badge)

**Files:**
- Create: `src/late-shift/ui/useRoomEngine.ts`, `src/late-shift/ui/RoomStage.tsx`, `src/late-shift/ui/Tags.tsx`, `src/late-shift/ui/SectionChips.tsx`, `src/late-shift/ui/RadioBadge.tsx`, `src/late-shift/ui/debugParameters.ts`, `scripts/room-screenshots.sh`
- Rewrite: `src/late-shift/LateShift.tsx`, `src/late-shift/lateShift.css`
- Modify: `.gitignore` (add `screenshots/`)
- Test: `src/late-shift/ui/__tests__/debugParameters.test.ts`, `src/late-shift/__tests__/LateShift.test.tsx`

**Interfaces:**
- Consumes: `createRoomEngine`, `RoomEngine` (Task 9); `LAYOUTS`, `chooseLayout`, `transformBox`, `transformPoint`, `LayoutName` (Task 7); `ROOM_OBJECTS`, `CHIP_ORDER`, `getRoomObject`, `ObjectId`, `RoomObject` (Task 7); `hitTest`, `toVirtual` (Task 7); `track` (Task 3); `useReducedMotion` (Task 3); `SwitchVersionLink` (Task 4).
- Produces:
  - `useRoomEngine({ canvasReference, stageReference, isReducedMotion }): { engine: RoomEngine | null; layoutName: LayoutName; hasFailed: boolean; setCovered: (covered: boolean) => void }`
  - `todFromSearch(search: URLSearchParams): TodMode` and `hoverFromSearch(search: URLSearchParams): ObjectId | null`
  - Tag buttons carry `data-object={id}`, which is how Task 12 returns focus.
  - `LateShift` renders `<main data-scroll=...>`. Task 13 sets `data-scroll`.

- [ ] **Step 1: Write the failing tests**

`src/late-shift/ui/__tests__/debugParameters.test.ts`

```ts
import { hoverFromSearch, todFromSearch } from '../debugParameters'

describe('debug parameters', () => {
	it('reads a valid time of day or falls back to auto', () => {
		expect(todFromSearch(new URLSearchParams('tod=night'))).toBe('night')
		expect(todFromSearch(new URLSearchParams('tod=teatime'))).toBe('auto')
		expect(todFromSearch(new URLSearchParams(''))).toBe('auto')
	})

	it('reads a valid object id to highlight', () => {
		expect(hoverFromSearch(new URLSearchParams('hover=experience'))).toBe('experience')
		expect(hoverFromSearch(new URLSearchParams('hover=lamp'))).toBeNull()
		expect(hoverFromSearch(new URLSearchParams(''))).toBeNull()
	})
})
```

`src/late-shift/__tests__/LateShift.test.tsx`

```tsx
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import * as analytics from '../../lib/analytics'
import { axeViolations, renderRoute } from '../../testUtils'
import type { RoomEngine } from '../engine/roomEngine'
import LateShift from '../LateShift'

// Mock factories are hoisted above imports, so shared mocks must be created with vi.hoisted
const { engine, createRoomEngine } = vi.hoisted(() => {
	const mockEngine: RoomEngine = {
		setLayout: vi.fn(),
		setHover: vi.fn(),
		setHighlight: vi.fn(),
		setCamera: vi.fn(),
		setRadio: vi.fn(),
		setTodMode: vi.fn(),
		setPaused: vi.fn(),
		destroy: vi.fn()
	}
	return { engine: mockEngine, createRoomEngine: vi.fn((): RoomEngine => mockEngine) }
})

vi.mock('../engine/roomEngine', () => ({ createRoomEngine }))

const routes = <Route path='/late-shift/*' element={<LateShift />} />

describe('The Late Shift shell', () => {
	it('renders the room with a title, a hidden canvas, tags and chips', () => {
		renderRoute('/late-shift', routes)
		expect(screen.getByRole('heading', { level: 1, name: /the late shift/i })).toBeInTheDocument()
		const tags = screen.getByRole('list', { name: 'Things in the room' })
		expect(within(tags).getAllByRole('button')).toHaveLength(9)
		const chips = screen.getByRole('navigation', { name: 'Sections' })
		expect(within(chips).getAllByRole('button')).toHaveLength(9)
		expect(within(chips).getByRole('button', { name: '01 · About me' })).toBeInTheDocument()
	})

	it('highlights an object when its chip is hovered or focused', async () => {
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		await user.hover(screen.getByRole('button', { name: '03 · Experience' }))
		expect(engine.setHighlight).toHaveBeenLastCalledWith('experience')
		await user.unhover(screen.getByRole('button', { name: '03 · Experience' }))
		expect(engine.setHighlight).toHaveBeenLastCalledWith(null)
	})

	it('navigates to a section when a tag is clicked', async () => {
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		await user.click(screen.getByRole('button', { name: 'Experience' }))
		expect(screen.getByTestId('location')).toHaveTextContent('/late-shift/experience')
	})

	it('toggles the radio from its tag', async () => {
		const user = userEvent.setup()
		const spy = vi.spyOn(analytics, 'track')
		renderRoute('/late-shift', routes)
		const radio = screen.getByRole('button', { name: 'Lofi radio' })
		expect(radio).toHaveAttribute('aria-pressed', 'false')
		await user.click(radio)
		expect(radio).toHaveAttribute('aria-pressed', 'true')
		expect(engine.setRadio).toHaveBeenLastCalledWith(true)
		expect(spy).toHaveBeenCalledWith('radio-toggled', { on: true })
	})

	it('applies ?tod= and ?hover= for screenshots', () => {
		renderRoute('/late-shift?tod=night&hover=android', routes)
		expect(engine.setTodMode).toHaveBeenLastCalledWith('night')
		expect(engine.setHighlight).toHaveBeenLastCalledWith('android')
	})

	it('still works when the canvas cannot be created', async () => {
		createRoomEngine.mockImplementationOnce(() => {
			throw new Error('Canvas 2D is not available')
		})
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		expect(screen.getByText(/couldn’t be drawn on this device/i)).toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: '04 · Skills' }))
		expect(screen.getByTestId('location')).toHaveTextContent('/late-shift/skills')
	})

	it('has no axe violations', async () => {
		renderRoute('/late-shift', routes)
		expect(await axeViolations()).toEqual([])
	})
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm run test:run -- src/late-shift`
Expected: FAIL. The debug module is missing, and the Late Shift has no tags yet.

- [ ] **Step 3: Implement `src/late-shift/ui/debugParameters.ts`**

```ts
import { ROOM_OBJECTS, type ObjectId } from '../scene/objects'
import type { TodMode } from '../scene/timeOfDay'

const TODS = new Set(['dawn', 'day', 'dusk', 'night'])

export function todFromSearch(search: URLSearchParams): TodMode {
	const value = search.get('tod')
	return value !== null && TODS.has(value) ? (value as TodMode) : 'auto'
}

export function hoverFromSearch(search: URLSearchParams): ObjectId | null {
	const value = search.get('hover')
	return ROOM_OBJECTS.find(object => object.id === value)?.id ?? null
}
```

- [ ] **Step 4: Implement `src/late-shift/ui/useRoomEngine.ts`**

```ts
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { createRoomEngine, type RoomEngine } from '../engine/roomEngine'
import { chooseLayout, type LayoutName } from '../scene/layouts'

interface UseRoomEngineOptions {
	readonly canvasReference: RefObject<HTMLCanvasElement>
	readonly stageReference: RefObject<HTMLDivElement>
	readonly isReducedMotion: boolean
}

export default function useRoomEngine({ canvasReference, stageReference, isReducedMotion }: UseRoomEngineOptions) {
	const [engine, setEngine] = useState<RoomEngine | null>(null)
	const [hasFailed, setHasFailed] = useState(false)
	const [layoutName, setLayoutName] = useState<LayoutName>(() => chooseLayout(window.innerWidth, window.innerHeight))
	const coveredReference = useRef(false)
	const syncReference = useRef<() => void>()

	useEffect(() => {
		const canvas = canvasReference.current
		const stage = stageReference.current
		if (!canvas || !stage) return undefined
		const box = stage.getBoundingClientRect()
		let created: RoomEngine
		try {
			created = createRoomEngine(canvas, {
				layout: chooseLayout(window.innerWidth, window.innerHeight),
				width: box.width,
				height: box.height,
				isReducedMotion,
				dpr: Math.min(window.devicePixelRatio || 1, 2)
			})
		} catch {
			setHasFailed(true)
			return undefined
		}
		setEngine(created)

		const onResize = () => {
			const name = chooseLayout(window.innerWidth, window.innerHeight)
			setLayoutName(name)
			const rect = stage.getBoundingClientRect()
			created.setLayout(name, rect.width, rect.height)
		}
		const resizeObserver = new ResizeObserver(onResize)
		resizeObserver.observe(stage)
		window.addEventListener('resize', onResize)

		let isHidden = document.hidden
		let isOffscreen = false
		const sync = () => created.setPaused(isHidden || isOffscreen || coveredReference.current)
		syncReference.current = sync
		const onVisibility = () => {
			isHidden = document.hidden
			sync()
		}
		document.addEventListener('visibilitychange', onVisibility)
		const intersection = new IntersectionObserver(entries => {
			isOffscreen = !entries.some(entry => entry.isIntersecting)
			sync()
		})
		intersection.observe(stage)

		return () => {
			resizeObserver.disconnect()
			intersection.disconnect()
			window.removeEventListener('resize', onResize)
			document.removeEventListener('visibilitychange', onVisibility)
			syncReference.current = undefined
			created.destroy()
			setEngine(null)
		}
	}, [canvasReference, stageReference, isReducedMotion])

	const setCovered = useCallback((covered: boolean) => {
		coveredReference.current = covered
		syncReference.current?.()
	}, [])

	return { engine, layoutName, hasFailed, setCovered }
}
```

- [ ] **Step 5: Implement `src/late-shift/ui/Tags.tsx`**

```tsx
import { useEffect, useRef, type CSSProperties } from 'react'
import { transformBox, transformPoint, type Layout } from '../scene/layouts'
import { ROOM_OBJECTS, type ObjectId, type RoomObject } from '../scene/objects'

interface TagsProperties {
	readonly layout: Layout
	readonly highlighted: ObjectId | null
	readonly isRadioOn: boolean
	readonly isHidden: boolean
	readonly onActivate: (id: ObjectId) => void
	readonly onHighlight: (id: ObjectId | null) => void
}

function tagAnchor(layout: Layout, object: RoomObject): [number, number] {
	const [x, y, w, h] = transformBox(layout, object.id, object.box)
	if (object.tagSide === 'above') return [x + w / 2, y]
	if (object.tagY === undefined) return [x + w / 2, y + h]
	return [x + w / 2, transformPoint(layout, object.id, [0, object.tagY])[1]]
}

interface RoomTagProperties {
	readonly layout: Layout
	readonly object: RoomObject
	readonly index: number
	readonly isActive: boolean
	readonly isRadioOn: boolean
	readonly onActivate: (id: ObjectId) => void
	readonly onHighlight: (id: ObjectId | null) => void
}

function RoomTag({ layout, object, index, isActive, isRadioOn, onActivate, onHighlight }: RoomTagProperties) {
	const [ax, ay] = tagAnchor(layout, object)
	const style = {
		left: `${(ax / layout.vw) * 100}%`,
		top: `${(ay / layout.vh) * 100}%`,
		'--tilt': `${((index % 3) - 1) * 1.8}deg`,
		'--delay': `${0.2 + index * 0.07}s`
	} as CSSProperties
	const onClick = () => onActivate(object.id)
	const onEnter = () => onHighlight(object.id)
	const onLeave = () => onHighlight(null)
	return (
		<button
			type='button'
			data-object={object.id}
			className={`room-tag room-tag-${object.tagSide}${isActive ? ' is-active' : ''}`}
			style={style}
			aria-pressed={object.id === 'radio' ? isRadioOn : undefined}
			aria-describedby={`room-object-${object.id}`}
			onClick={onClick}
			onMouseEnter={onEnter}
			onMouseLeave={onLeave}
			onFocus={onEnter}
			onBlur={onLeave}
		>
			<span className='room-tag-dot' aria-hidden='true' />
			{object.label}
		</button>
	)
}

export default function Tags({ layout, highlighted, isRadioOn, isHidden, onActivate, onHighlight }: TagsProperties) {
	const listReference = useRef<HTMLUListElement>(null)
	// React 18 has no `inert` prop; set it directly so hidden tags leave the tab order
	useEffect(() => {
		listReference.current?.toggleAttribute('inert', isHidden)
	}, [isHidden])
	return (
		<>
			<ul ref={listReference} className={`room-tags${isHidden ? ' is-hidden' : ''}`} aria-label='Things in the room'>
				{ROOM_OBJECTS.map((object, index) => (
					<li key={object.id}>
						<RoomTag
							layout={layout}
							object={object}
							index={index}
							isActive={highlighted === object.id}
							isRadioOn={isRadioOn}
							onActivate={onActivate}
							onHighlight={onHighlight}
						/>
					</li>
				))}
			</ul>
			{ROOM_OBJECTS.map(object => (
				<span key={object.id} id={`room-object-${object.id}`} hidden>
					{object.description}
				</span>
			))}
		</>
	)
}
```

- [ ] **Step 6: Implement `src/late-shift/ui/SectionChips.tsx`**

```tsx
import { CHIP_ORDER, getRoomObject, type ObjectId, type RoomObject } from '../scene/objects'

interface SectionChipsProperties {
	readonly highlighted: ObjectId | null
	readonly isRadioOn: boolean
	readonly onActivate: (id: ObjectId) => void
	readonly onHighlight: (id: ObjectId | null) => void
}

interface ChipProperties extends Omit<SectionChipsProperties, 'highlighted'> {
	readonly object: RoomObject
	readonly isActive: boolean
}

function Chip({ object, isActive, isRadioOn, onActivate, onHighlight }: ChipProperties) {
	const onClick = () => onActivate(object.id)
	const onEnter = () => onHighlight(object.id)
	const onLeave = () => onHighlight(null)
	const label = object.section === null ? `${object.number} ${object.label}` : `${object.number} · ${object.label}`
	return (
		<button
			type='button'
			className={`room-chip${isActive ? ' is-active' : ''}`}
			aria-pressed={object.section === null ? isRadioOn : undefined}
			onClick={onClick}
			onMouseEnter={onEnter}
			onMouseLeave={onLeave}
			onFocus={onEnter}
			onBlur={onLeave}
		>
			{label}
		</button>
	)
}

export default function SectionChips({ highlighted, isRadioOn, onActivate, onHighlight }: SectionChipsProperties) {
	return (
		<nav aria-label='Sections' className='room-chips'>
			<ul>
				{CHIP_ORDER.map(id => (
					<li key={id}>
						<Chip
							object={getRoomObject(id)}
							isActive={highlighted === id}
							isRadioOn={isRadioOn}
							onActivate={onActivate}
							onHighlight={onHighlight}
						/>
					</li>
				))}
			</ul>
		</nav>
	)
}
```

- [ ] **Step 7: Implement `src/late-shift/ui/RadioBadge.tsx`**

```tsx
interface RadioBadgeProperties {
	readonly isOn: boolean
	readonly isCompact: boolean
	readonly hasPaused?: boolean
}

export default function RadioBadge({ isOn, isCompact, hasPaused = false }: RadioBadgeProperties) {
	let text = '♪ Radio off · try the cassette deck'
	if (isOn) text = '♪ lofi fm · rain on oxford road'
	else if (hasPaused) text = '♪ Radio paused · press the cassette deck to resume'
	return (
		<p className={`radio-badge${isCompact ? ' is-compact' : ''}`} aria-live='polite'>
			{text}
		</p>
	)
}
```

- [ ] **Step 8: Implement `src/late-shift/ui/RoomStage.tsx`**

```tsx
import type { MouseEvent, PointerEvent, RefObject } from 'react'
import { LAYOUTS, type LayoutName } from '../scene/layouts'
import { hitTest, toVirtual } from '../scene/hitTest'
import type { ObjectId } from '../scene/objects'
import RadioBadge from './RadioBadge'
import Tags from './Tags'

interface RoomStageProperties {
	readonly layoutName: LayoutName
	readonly canvasReference: RefObject<HTMLCanvasElement>
	readonly stageReference: RefObject<HTMLDivElement>
	readonly isZoomed: boolean
	readonly hasFailed: boolean
	readonly isHintVisible: boolean
	readonly isRadioOn: boolean
	readonly hasPausedRadio?: boolean
	readonly highlighted: ObjectId | null
	readonly hovered: ObjectId | null
	readonly onHover: (id: ObjectId | null) => void
	readonly onHighlight: (id: ObjectId | null) => void
	readonly onActivate: (id: ObjectId) => void
}

export default function RoomStage({
	layoutName, canvasReference, stageReference, isZoomed, hasFailed, isHintVisible,
	isRadioOn, hasPausedRadio, highlighted, hovered, onHover, onHighlight, onActivate
}: RoomStageProperties) {
	const layout = LAYOUTS[layoutName]
	const pointAt = (event: MouseEvent<HTMLCanvasElement>) =>
		hitTest(layout, toVirtual(layout, [event.clientX, event.clientY], event.currentTarget.getBoundingClientRect()), isZoomed)
	const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => onHover(pointAt(event))
	const onPointerLeave = () => onHover(null)
	const onCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
		const id = pointAt(event)
		if (id) onActivate(id)
	}
	return (
		<div ref={stageReference} className={`room-stage room-stage-${layoutName}${isZoomed ? ' is-zoomed' : ''}`}>
			<canvas
				ref={canvasReference}
				role='presentation'
				aria-hidden='true'
				className={`room-canvas${hovered ? ' is-pointer' : ''}`}
				onPointerMove={onPointerMove}
				onPointerLeave={onPointerLeave}
				onClick={onCanvasClick}
			/>
			{hasFailed ? (
				<p className='room-fallback'>
					The room couldn’t be drawn on this device, but every section is still one click away below.
				</p>
			) : null}
			{isHintVisible && layoutName === 'desk' && !hasFailed ? (
				<p className='room-hint' aria-hidden='true'>✦ Click anything with a tag</p>
			) : null}
			<RadioBadge isOn={isRadioOn} isCompact={layoutName === 'phone'} hasPaused={hasPausedRadio} />
			{hasFailed ? null : (
				<Tags
					layout={layout}
					highlighted={highlighted ?? hovered}
					isRadioOn={isRadioOn}
					isHidden={isZoomed}
					onActivate={onActivate}
					onHighlight={onHighlight}
				/>
			)}
		</div>
	)
}
```

- [ ] **Step 9: Rewrite `src/late-shift/LateShift.tsx`**

```tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SwitchVersionLink from '../components/SwitchVersionLink'
import { track } from '../lib/analytics'
import useReducedMotion from '../lib/useReducedMotion'
import { getRoomObject, type ObjectId } from './scene/objects'
import { hoverFromSearch, todFromSearch } from './ui/debugParameters'
import RoomStage from './ui/RoomStage'
import SectionChips from './ui/SectionChips'
import useRoomEngine from './ui/useRoomEngine'
import './lateShift.css'

export default function LateShift() {
	const isReducedMotion = useReducedMotion()
	const navigate = useNavigate()
	const [searchParameters] = useSearchParams()
	const canvasReference = useRef<HTMLCanvasElement>(null)
	const stageReference = useRef<HTMLDivElement>(null)
	const { engine, layoutName, hasFailed } = useRoomEngine({ canvasReference, stageReference, isReducedMotion })
	const [hovered, setHovered] = useState<ObjectId | null>(null)
	const [highlighted, setHighlighted] = useState<ObjectId | null>(null)
	const [isRadioOn, setIsRadioOn] = useState(false)
	const [isHintVisible, setIsHintVisible] = useState(true)

	useEffect(() => {
		engine?.setHover(hovered)
	}, [engine, hovered])
	useEffect(() => {
		engine?.setHighlight(highlighted ?? hoverFromSearch(searchParameters))
	}, [engine, highlighted, searchParameters])
	useEffect(() => {
		engine?.setRadio(isRadioOn)
	}, [engine, isRadioOn])
	useEffect(() => {
		engine?.setTodMode(todFromSearch(searchParameters))
	}, [engine, searchParameters])

	const onActivate = useCallback(
		(id: ObjectId) => {
			setIsHintVisible(false)
			const { section } = getRoomObject(id)
			if (section === null) {
				const next = !isRadioOn
				setIsRadioOn(next)
				track('radio-toggled', { on: next })
				return
			}
			navigate(`/late-shift/${section}`)
		},
		[isRadioOn, navigate]
	)
	const onHover = setHovered
	const onHighlight = setHighlighted

	return (
		<main className='late-shift' data-scroll='static'>
			<h1 className='sr-only'>The Late Shift: Oliver Shooter&apos;s room</h1>
			<p className='sr-only'>
				An illustrated desk at night in Manchester. Rain runs down the window, a tram goes past, and a lamp lights the
				desk. Each labelled object opens a part of the portfolio.
			</p>
			<div className='room-sticky'>
				<RoomStage
					layoutName={layoutName}
					canvasReference={canvasReference}
					stageReference={stageReference}
					isZoomed={false}
					hasFailed={hasFailed}
					isHintVisible={isHintVisible}
					isRadioOn={isRadioOn}
					highlighted={highlighted}
					hovered={hovered}
					onHover={onHover}
					onHighlight={onHighlight}
					onActivate={onActivate}
				/>
				<SectionChips highlighted={highlighted} isRadioOn={isRadioOn} onActivate={onActivate} onHighlight={onHighlight} />
			</div>
			<p className='late-shift-footer'>
				<Link to='/quick'>Read everything on one page</Link>
				<span aria-hidden='true'> · </span>
				<SwitchVersionLink />
			</p>
		</main>
	)
}
```

- [ ] **Step 10: Rewrite `src/late-shift/lateShift.css`**

```css
.late-shift {
	min-height: 100svh;
	background: #1d1c26;
	color: var(--ink-text);
}

.room-sticky {
	display: flex;
	min-height: 100svh;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 12px;
	gap: 12px;
}

.room-stage {
	position: relative;
	overflow: hidden;
	border-radius: 8px;
	background: var(--paper);
}

.room-stage-desk {
	width: min(100%, calc((100svh - 7rem) * 1000 / 560));
	aspect-ratio: 1000 / 560;
}

.room-stage-phone {
	width: min(100%, calc((100svh - 6rem) * 420 / 780));
	aspect-ratio: 420 / 780;
}

.room-canvas {
	position: absolute;
	display: block;
	width: 100%;
	height: 100%;
	inset: 0;
}

.room-canvas.is-pointer {
	cursor: pointer;
}

.room-tags {
	margin: 0;
	padding: 0;
	list-style: none;
	transition: opacity 0.3s;
}

.room-tags.is-hidden {
	opacity: 0;
}

.room-tag {
	position: absolute;
	display: flex;
	align-items: center;
	padding: 5px 8px 5px 7px;
	border: 1.5px solid var(--ink-blue);
	margin-top: -8px;
	animation: tag-in 0.5s cubic-bezier(0.2, 1.6, 0.4, 1) both;
	animation-delay: var(--delay, 0s);
	background: var(--paper);
	box-shadow: 2px 2px 0 var(--ink-pink);
	color: var(--ink-blue);
	font: 700 11px/1 'JetBrains Mono', monospace;
	gap: 6px;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	transform: translate(-50%, -100%) rotate(var(--tilt, 0deg));
	white-space: nowrap;
}

.room-tag::after {
	position: absolute;
	content: '';
	inset: -12px;
}

.room-tag-below {
	margin-top: 8px;
	transform: translate(-50%, 0) rotate(var(--tilt, 0deg));
}

.room-tag.is-active,
.room-tag:hover {
	background: var(--ink-yellow);
}

.room-tag-dot {
	width: 7px;
	height: 7px;
	border-radius: 50%;
	animation: tag-pulse 1.8s infinite;
	background: var(--ink-pink);
}

.room-stage-phone .room-tag {
	padding: 4px 6px 4px 5px;
	font-size: 9.5px;
	gap: 4px;
}

.room-hint,
.radio-badge,
.room-fallback {
	position: absolute;
	top: 12px;
	margin: 0;
	padding: 6px 9px;
	font: 700 11px 'JetBrains Mono', monospace;
	letter-spacing: 0.06em;
}

.room-hint {
	left: 12px;
	background: var(--ink-blue);
	color: var(--paper);
	text-transform: uppercase;
}

.room-fallback {
	right: 12px;
	left: 12px;
	top: 40%;
	background: var(--paper);
	color: var(--ink-blue);
	font-size: 14px;
	text-align: center;
}

.radio-badge {
	right: 12px;
	border: 1.5px solid var(--ink-blue);
	background: var(--paper);
	box-shadow: 2px 2px 0 var(--ink-pink);
	color: var(--ink-blue);
}

.radio-badge.is-compact {
	width: 2.2em;
	overflow: hidden;
	white-space: nowrap;
}

.room-chips ul {
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	margin: 0;
	padding: 0;
	gap: 8px;
	list-style: none;
}

.room-chip {
	min-height: 32px;
	padding: 7px 11px;
	border: 1.5px solid var(--ink-blue);
	background: var(--paper);
	box-shadow: 2px 2px 0 var(--ink-pink);
	color: var(--ink-blue);
	font: 700 12px 'JetBrains Mono', monospace;
	letter-spacing: 0.06em;
	text-transform: uppercase;
}

.room-chip.is-active,
.room-chip:hover {
	background: var(--ink-yellow);
}

.late-shift-footer {
	padding: 16px;
	color: var(--paper);
	text-align: center;
}

.late-shift-footer a {
	color: var(--paper);
	text-decoration: underline;
	text-underline-offset: 3px;
}

@keyframes tag-in {
	from {
		opacity: 0;
		translate: 0 10px;
	}

	to {
		opacity: 1;
		translate: 0 0;
	}
}

@keyframes tag-pulse {
	0% {
		box-shadow: 0 0 0 0 rgb(255 72 176 / 67%);
	}

	70% {
		box-shadow: 0 0 0 7px rgb(255 72 176 / 0%);
	}

	100% {
		box-shadow: 0 0 0 0 rgb(255 72 176 / 0%);
	}
}
```

- [ ] **Step 11: Run the tests**

Run: `npm run test:run -- src/late-shift src/__tests__/App.test.tsx`
Expected: PASS. In `App.test.tsx`, the real engine throws (jsdom has no Canvas 2D), so the fallback path is exercised there too.

- [ ] **Step 12: Create `scripts/room-screenshots.sh` and ignore its output**

```bash
#!/usr/bin/env bash
# Usage: scripts/room-screenshots.sh [base-url]
# Needs `npm run build && npm run preview` running (default http://localhost:4173).
# Set CHROME to your Chrome/Chromium binary if it isn't at the Windows default.
set -euo pipefail
BASE="${1:-http://localhost:4173}"
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
OUT="screenshots"
mkdir -p "$OUT"
shot() {
	"$CHROME" --headless=new --hide-scrollbars --window-size="$2" \
		--virtual-time-budget=4000 --screenshot="$OUT/$1.png" "$BASE$3" >/dev/null 2>&1
	echo "$OUT/$1.png"
}
for tod in dawn day dusk night; do
	shot "desk-$tod" 1280,720 "/late-shift?tod=$tod"
	shot "phone-$tod" 390,844 "/late-shift?tod=$tod"
done
shot desk-hover 1280,720 "/late-shift?tod=dusk&hover=experience"
shot desk-android 1280,720 "/late-shift/android?tod=dusk"
shot phone-android 390,844 "/late-shift/android?tod=dusk"
shot desk-experience 1280,720 "/late-shift/experience?tod=night"
```

Then:

```bash
chmod +x scripts/room-screenshots.sh
echo "screenshots/" >> .gitignore
```

Check that `.gitignore` ends with a newline first. If `tail -c1 .gitignore` isn't empty, run `echo >> .gitignore` before appending.

- [ ] **Step 13: Take the screenshots and review them**

```bash
npm run build && (npm run preview &) && sleep 3 && scripts/room-screenshots.sh
```

Open every PNG under `screenshots/` and compare it with the prototype. What to check:
- The window shows Manchester, with rain on the glass.
- The lamp glow is visible at night.
- On the phone layout, the objects are stacked the way the placement table in spec §6.6 describes.
- In `desk-hover`, the laptop is lifted, with a pink dashed outline.
- All tags are visible and don't overlap.

Fix any drawing differences against the prototype before committing. Stop the preview server afterwards.

- [ ] **Step 14: Commit**

```bash
npx prettier -w src/late-shift scripts
npm run run-eslint -- src/late-shift
npm run run-stylelint
git add src/late-shift scripts .gitignore
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: mount the room with tags, chips and radio badge"
```

---

### Task 11: Section skins

**Files:**
- Create: `src/late-shift/sections/PrintHeading.tsx`, `src/late-shift/sections/AboutFilm.tsx`, `src/late-shift/sections/AndroidScreen.tsx`, `src/late-shift/sections/ExperienceEditor.tsx`, `src/late-shift/sections/SkillsShelf.tsx`, `src/late-shift/sections/ProjectZine.tsx`, `src/late-shift/sections/ContactPostcard.tsx`, `src/late-shift/sections/registry.tsx`
- Modify: `src/late-shift/lateShift.css` (append the skin styles)
- Test: `src/late-shift/sections/__tests__/sections.test.tsx`

**Interfaces:**
- Consumes: content (Task 2), `ExternalLink` (Task 4), `SECTION_IDS`, `SectionId` (Task 7), `axeViolations` (Task 1).
- Produces:
  - `PrintHeading`: a `forwardRef<HTMLHeadingElement, { id: string; children: string; tabIndex?: number }>` that renders an `h1`.
  - `interface SectionEntry { title: string; kicker: string; skin: 'editor' | 'film' | 'phone' | 'postcard' | 'shelf' | 'zine'; render: () => ReactElement }`
  - `SECTIONS: Readonly<Record<SectionId, SectionEntry>>`

- [ ] **Step 1: Write the failing test** `src/late-shift/sections/__tests__/sections.test.tsx`

```tsx
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { experience, getProject, profile, skills } from '../../../content'
import { axeViolations } from '../../../testUtils'
import { SECTION_IDS } from '../../sectionIds'
import PrintHeading from '../PrintHeading'
import { SECTIONS } from '../registry'

function renderSection(id: (typeof SECTION_IDS)[number]) {
	return render(<MemoryRouter>{SECTIONS[id].render()}</MemoryRouter>)
}

describe('section skins', () => {
	it('has an entry for every section id', () => {
		expect(Object.keys(SECTIONS).sort()).toEqual([...SECTION_IDS].sort())
		for (const id of SECTION_IDS) expect(SECTIONS[id].title.length).toBeGreaterThan(0)
	})

	it('prints headings as real, readable text', () => {
		render(<PrintHeading id='t'>Experience</PrintHeading>)
		expect(screen.getByRole('heading', { level: 1, name: 'Experience' })).toBeInTheDocument()
	})

	it('plays the story as focusable film frames', () => {
		renderSection('about')
		const strip = screen.getByRole('region', { name: /film frames/i })
		expect(strip).toHaveAttribute('tabindex', '0')
		for (const beat of profile.story) expect(screen.getByText(beat.text)).toBeInTheDocument()
	})

	it('shows Android work on the phone', () => {
		renderSection('android')
		expect(screen.getByRole('heading', { name: 'Salah Times' })).toBeInTheDocument()
		expect(screen.getByRole('heading', { name: 'Candice' })).toBeInTheDocument()
		expect(screen.getByText(experience[0].summary)).toBeInTheDocument()
	})

	it('lets the keyboard move between files in the editor', async () => {
		const user = userEvent.setup()
		renderSection('experience')
		const tabs = screen.getAllByRole('tab')
		expect(tabs.map(tab => tab.textContent)).toEqual([
			...experience.map(role => role.file),
			'msc_birmingham.md',
			'film_2014.mov'
		])
		expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
		await user.click(tabs[0])
		await user.keyboard('{ArrowDown}')
		expect(tabs[1]).toHaveAttribute('aria-selected', 'true')
		expect(tabs[1]).toHaveFocus()
		expect(screen.getByRole('tabpanel')).toHaveTextContent(experience[1].title)
		await user.keyboard('{End}')
		expect(tabs.at(-1)).toHaveAttribute('aria-selected', 'true')
		await user.keyboard('{Home}')
		expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
		await user.keyboard('{ArrowUp}')
		expect(tabs.at(-1)).toHaveAttribute('aria-selected', 'true')
	})

	it('opens book spines on the shelf', async () => {
		const user = userEvent.setup()
		renderSection('skills')
		const first = screen.getByRole('button', { name: skills[0].title })
		expect(first).toHaveAttribute('aria-expanded', 'true')
		const second = screen.getByRole('button', { name: skills[1].title })
		await user.click(second)
		expect(second).toHaveAttribute('aria-expanded', 'true')
		expect(first).toHaveAttribute('aria-expanded', 'false')
		expect(screen.getByRole('list', { name: skills[1].title })).toBeInTheDocument()
	})

	it('renders project case studies with links', () => {
		renderSection('projects/candice')
		const project = getProject('candice')
		expect(screen.getByAltText(project.alt)).toBeInTheDocument()
		expect(screen.getByRole('link', { name: /github/i })).toHaveAttribute('href', project.links.github)
	})

	it('writes the contact postcard', () => {
		renderSection('contact')
		const card = screen.getByRole('article', { name: /postcard/i })
		expect(within(card).getByRole('link', { name: profile.email })).toHaveAttribute('href', `mailto:${profile.email}`)
	})

	it('has no axe violations across all skins', async () => {
		render(
			<MemoryRouter>
				<main>
					<h1>All sections</h1>
					{SECTION_IDS.map(id => (
						<section key={id} aria-label={SECTIONS[id].title}>
							{SECTIONS[id].render()}
						</section>
					))}
				</main>
			</MemoryRouter>
		)
		expect(await axeViolations()).toEqual([])
	})
})
```

The axe test renders every skin at once. If ids collide between skins, it will fail (`duplicate-id`). That's the point: skins must not use fixed ids, so derive every id from the section or item id.

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:run -- src/late-shift/sections`
Expected: FAIL (the registry is missing).

- [ ] **Step 3: Implement `src/late-shift/sections/PrintHeading.tsx`**

```tsx
import { forwardRef } from 'react'

interface PrintHeadingProperties {
	readonly id: string
	readonly children: string
	readonly tabIndex?: number
}

/** Blue ink is the real text; the pink plate is a decorative, hidden copy that slides into register. */
const PrintHeading = forwardRef<HTMLHeadingElement, PrintHeadingProperties>(
	function PrintHeading({ id, children, tabIndex }, reference) {
		return (
			<h1 ref={reference} id={id} tabIndex={tabIndex} className='print-heading'>
				<span className='print-heading-ink' aria-hidden='true'>
					{children}
				</span>
				<span className='print-heading-text'>{children}</span>
			</h1>
		)
	}
)

export default PrintHeading
```

- [ ] **Step 4: Implement `src/late-shift/sections/AboutFilm.tsx`**

```tsx
import { profile } from '../../content'

export default function AboutFilm() {
	return (
		<>
			<p className='skin-lede'>{profile.shortBio}</p>
			{/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a horizontally scrolling region must be keyboard-focusable (WCAG 2.1.1, axe scrollable-region-focusable) */}
			<section className='film-strip' tabIndex={0} aria-label='My story, as film frames'>
				<ol>
					{profile.story.map((beat, index) => (
						<li key={beat.year} className='film-frame'>
							<span className='film-frame-number'>{`FRAME ${String(index + 1).padStart(2, '0')}`}</span>
							<span className='film-frame-year'>{beat.year}</span>
							<h2 className='film-frame-title'>{beat.title}</h2>
							<p>{beat.text}</p>
						</li>
					))}
				</ol>
			</section>
		</>
	)
}
```

- [ ] **Step 5: Implement `src/late-shift/sections/AndroidScreen.tsx`**

```tsx
import ExternalLink from '../../components/ExternalLink'
import { currentRole, mobileProjects, type Project } from '../../content'

const STORE_LABELS: Readonly<Record<keyof Project['links'], string>> = {
	live: 'Live site',
	appStore: 'App Store',
	playStore: 'Google Play',
	github: 'GitHub'
}

function Chips({ items }: { readonly items: readonly string[] }) {
	return (
		<ul className='skin-chips' aria-label='Tech stack'>
			{items.map(item => (
				<li key={item}>{item}</li>
			))}
		</ul>
	)
}

export default function AndroidScreen() {
	const role = currentRole()
	return (
		<div className='phone-screen'>
			<article className='phone-card'>
				<h2>{`${role.org} · ${role.title}`}</h2>
				<p>{role.summary}</p>
				<Chips items={role.stack.slice(0, 2)} />
			</article>
			{mobileProjects().map(project => (
				<article key={project.id} className='phone-card'>
					<h2>{project.name}</h2>
					<p>{project.tagline}</p>
					<Chips items={project.stack} />
					<p className='phone-links'>
						{(Object.entries(project.links) as [keyof Project['links'], string][]).map(([kind, href]) => (
							<ExternalLink key={kind} href={href}>
								{`${STORE_LABELS[kind]}: ${project.name}`}
							</ExternalLink>
						))}
					</p>
				</article>
			))}
		</div>
	)
}
```

- [ ] **Step 6: Implement `src/late-shift/sections/ExperienceEditor.tsx`**

```tsx
import { useRef, useState, type KeyboardEvent } from 'react'
import { experience, profile, type Role } from '../../content'

type EditorFile =
	| { readonly kind: 'note'; readonly file: string; readonly title: string; readonly text: string }
	| { readonly kind: 'role'; readonly file: string; readonly role: Role }

const FILES: readonly EditorFile[] = [
	...experience.map(role => ({ kind: 'role' as const, file: role.file, role })),
	{ kind: 'note', file: 'msc_birmingham.md', title: profile.story[1].title, text: profile.story[1].text },
	{ kind: 'note', file: 'film_2014.mov', title: profile.story[0].title, text: profile.story[0].text }
]

const KEY_STEP: Readonly<Record<string, number>> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }

function FileBody({ entry }: { readonly entry: EditorFile }) {
	if (entry.kind === 'note') {
		return (
			<>
				<h2>{entry.title}</h2>
				<p>{entry.text}</p>
			</>
		)
	}
	const { role } = entry
	return (
		<>
			<p className='editor-when'>{`${role.period} · ${role.org}`}</p>
			<h2>{role.title}</h2>
			<p className='editor-code' aria-hidden='true'>
				<b>fun</b> <em>work</em>() = listOf(
			</p>
			<ul className='editor-bullets'>
				{role.bullets.map(bullet => (
					<li key={bullet}>{bullet}</li>
				))}
			</ul>
			<p className='editor-code' aria-hidden='true'>)</p>
			<ul className='skin-chips' aria-label='Tech stack'>
				{role.stack.map(item => (
					<li key={item}>{item}</li>
				))}
			</ul>
		</>
	)
}

export default function ExperienceEditor() {
	const [selected, setSelected] = useState(0)
	const tabReferences = useRef<(HTMLButtonElement | null)[]>([])
	const onSelect = (index: number) => {
		const next = (index + FILES.length) % FILES.length
		setSelected(next)
		tabReferences.current[next]?.focus()
	}
	const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
		if (event.key === 'Home') onSelect(0)
		else if (event.key === 'End') onSelect(FILES.length - 1)
		else if (event.key in KEY_STEP) onSelect(selected + KEY_STEP[event.key])
		else return
		event.preventDefault()
	}
	const entry = FILES[selected]
	return (
		<div className='editor'>
			<div className='editor-explorer' role='tablist' aria-label='Explorer' aria-orientation='vertical'>
				{FILES.map((file, index) => {
					const onClick = () => onSelect(index)
					return (
						<button
							key={file.file}
							ref={element => {
								tabReferences.current[index] = element
							}}
							type='button'
							role='tab'
							id={`editor-tab-${index}`}
							aria-selected={index === selected}
							aria-controls='editor-panel'
							tabIndex={index === selected ? 0 : -1}
							className='editor-tab'
							onClick={onClick}
							onKeyDown={onTabKeyDown}
						>
							{file.file}
						</button>
					)
				})}
			</div>
			<div className='editor-pane' role='tabpanel' id='editor-panel' aria-labelledby={`editor-tab-${selected}`} tabIndex={0}>
				<FileBody entry={entry} />
			</div>
		</div>
	)
}
```

- [ ] **Step 7: Implement `src/late-shift/sections/SkillsShelf.tsx`**

```tsx
import { useState } from 'react'
import { skills } from '../../content'

export default function SkillsShelf() {
	const [open, setOpen] = useState(0)
	return (
		<div className='shelf'>
			{skills.map((group, index) => {
				const isOpen = open === index
				const panelId = `shelf-panel-${index}`
				const onToggle = () => setOpen(index)
				return (
					<div key={group.title} className={`shelf-book${isOpen ? ' is-open' : ''}`}>
						<button type='button' className='shelf-spine' aria-expanded={isOpen} aria-controls={panelId} onClick={onToggle}>
							<span aria-hidden='true'>{group.spine}</span>
							<span className='sr-only'>{group.title}</span>
						</button>
						<ul id={panelId} className='shelf-items' aria-label={group.title} hidden={!isOpen}>
							{group.items.map(item => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>
				)
			})}
		</div>
	)
}
```

The spine shows the uppercase `spine` label, but its accessible name is the full `title`, which is why the test finds `name: skills[0].title`. WCAG 2.5.3 "label in name" holds because every spine label, ignoring case, is contained in its title: `CLOUD` is in "Cloud & DevOps", and `OBSERVABILITY` is "Observability". Keep that true if you edit `skills.ts`.

- [ ] **Step 8: Implement `src/late-shift/sections/ProjectZine.tsx`**

```tsx
import ExternalLink from '../../components/ExternalLink'
import { getProject, type Project, type ProjectId } from '../../content'

const LINK_LABELS: Readonly<Record<keyof Project['links'], string>> = {
	live: 'Visit the live site',
	appStore: 'Get it on the App Store',
	playStore: 'Get it on Google Play',
	github: 'Read the code on GitHub'
}

export default function ProjectZine({ projectId }: { readonly projectId: ProjectId }) {
	const project = getProject(projectId)
	return (
		<div className='zine'>
			<p className='zine-tagline'>{project.tagline}</p>
			<figure className='zine-figure'>
				<img
					src={project.image}
					alt={project.alt}
					width={project.imageSize.width}
					height={project.imageSize.height}
					loading='lazy'
				/>
			</figure>
			<p>{project.description}</p>
			<ul className='skin-chips' aria-label='Tech stack'>
				{project.stack.map(item => (
					<li key={item}>{item}</li>
				))}
			</ul>
			<p className='zine-links'>
				{(Object.entries(project.links) as [keyof Project['links'], string][]).map(([kind, href]) => (
					<ExternalLink key={kind} href={href}>
						{LINK_LABELS[kind]}
					</ExternalLink>
				))}
			</p>
		</div>
	)
}
```

- [ ] **Step 9: Implement `src/late-shift/sections/ContactPostcard.tsx`**

```tsx
import ExternalLink from '../../components/ExternalLink'
import { profile } from '../../content'

export default function ContactPostcard() {
	return (
		<article className='postcard' aria-label='Postcard from Manchester'>
			<div className='postcard-message'>
				<p>{profile.contactMessage}</p>
				<p className='postcard-sign'>— Oliver</p>
			</div>
			<div className='postcard-address'>
				<span className='postcard-stamp' aria-hidden='true'>MCR</span>
				<p>
					<a href={`mailto:${profile.email}`}>{profile.email}</a>
				</p>
				<p>
					<ExternalLink href={profile.links.github}>GitHub</ExternalLink>
				</p>
				{profile.links.linkedin ? (
					<p>
						<ExternalLink href={profile.links.linkedin}>LinkedIn</ExternalLink>
					</p>
				) : null}
				<p>{profile.location}</p>
			</div>
		</article>
	)
}
```

- [ ] **Step 10: Implement `src/late-shift/sections/registry.tsx`**

```tsx
import type { ReactElement } from 'react'
import { getProject } from '../../content'
import type { SectionId } from '../sectionIds'
import AboutFilm from './AboutFilm'
import AndroidScreen from './AndroidScreen'
import ContactPostcard from './ContactPostcard'
import ExperienceEditor from './ExperienceEditor'
import ProjectZine from './ProjectZine'
import SkillsShelf from './SkillsShelf'

export interface SectionEntry {
	readonly title: string
	readonly kicker: string
	readonly skin: 'editor' | 'film' | 'phone' | 'postcard' | 'shelf' | 'zine'
	readonly render: () => ReactElement
}

export const SECTIONS: Readonly<Record<SectionId, SectionEntry>> = {
	about: { title: 'About me', kicker: '01 / From film to code', skin: 'film', render: () => <AboutFilm /> },
	android: { title: 'Android', kicker: '02 / Kotlin · Jetpack Compose', skin: 'phone', render: () => <AndroidScreen /> },
	experience: { title: 'Experience', kicker: '03 / Where I’ve worked', skin: 'editor', render: () => <ExperienceEditor /> },
	skills: { title: 'Skills', kicker: '04 / The toolbox', skin: 'shelf', render: () => <SkillsShelf /> },
	contact: { title: 'Contact', kicker: '05 / Say hello', skin: 'postcard', render: () => <ContactPostcard /> },
	'projects/football': { title: getProject('football').name, kicker: 'Project P1 · Web', skin: 'zine', render: () => <ProjectZine projectId='football' /> },
	'projects/screendle': { title: getProject('screendle').name, kicker: 'Project P2 · Web', skin: 'zine', render: () => <ProjectZine projectId='screendle' /> },
	'projects/candice': { title: getProject('candice').name, kicker: 'Project P3 · Android', skin: 'zine', render: () => <ProjectZine projectId='candice' /> }
}
```

In the axe test, the editor uses fixed ids (`editor-panel`, `editor-tab-N`), but only one editor is rendered, so they're unique. The shelf ids are unique per index. Only the zine is rendered three times, and it has no ids.

- [ ] **Step 11: Append the skin styles to `src/late-shift/lateShift.css`**

```css
.print-heading {
	position: relative;
	display: inline-block;
	margin: 0.2rem 0 1rem;
	color: var(--ink-blue);
	font-family: 'Archivo Black', system-ui, sans-serif;
	font-size: clamp(2.2rem, 7vw, 4rem);
	line-height: 0.95;
}

.print-heading-ink {
	position: absolute;
	animation: plate-pink 0.7s cubic-bezier(0.2, 0.9, 0.3, 1) both;
	color: var(--ink-pink);
	inset: 0;
	mix-blend-mode: multiply;
	transform: translate(-0.05em, -0.02em);
}

.print-heading-text {
	position: relative;
	display: inline-block;
	animation: plate-blue 0.7s cubic-bezier(0.2, 0.9, 0.3, 1) both;
	mix-blend-mode: multiply;
}

.skin-lede {
	max-width: 60ch;
	font-size: 1.1rem;
}

.skin-chips {
	display: flex;
	flex-wrap: wrap;
	margin: 0.6rem 0 0;
	padding: 0;
	gap: 6px;
	list-style: none;
}

.skin-chips li {
	padding: 3px 7px;
	background: var(--ink-yellow);
	color: var(--ink-text);
	font: 700 11px 'JetBrains Mono', monospace;
	text-transform: uppercase;
}

.film-strip {
	overflow-x: auto;
	padding: 18px 0;
	background: #22223a;
	scroll-snap-type: x mandatory;
}

.film-strip ol {
	display: flex;
	margin: 0;
	padding: 0 18px;
	gap: 18px;
	list-style: none;
}

.film-frame {
	min-width: min(280px, 80vw);
	padding: 18px;
	border-top: 10px dotted var(--paper);
	border-bottom: 10px dotted var(--paper);
	background: var(--paper);
	scroll-snap-align: start;
}

.film-frame-number,
.film-frame-year,
.editor-when {
	display: block;
	color: var(--ink-blue);
	font: 700 11px 'JetBrains Mono', monospace;
	letter-spacing: 0.1em;
}

.film-frame-title {
	margin: 6px 0;
	font-family: 'Archivo Black', system-ui, sans-serif;
	font-size: 1.3rem;
}

.phone-screen {
	display: grid;
	max-width: 420px;
	padding: 18px;
	border: 10px solid var(--ink-blue);
	border-radius: 28px;
	gap: 12px;
}

.phone-card {
	padding: 14px;
	border-left: 4px solid var(--ink-pink);
	background: #fbf6ec;
}

.phone-card h2 {
	margin: 0 0 4px;
	font-size: 1.15rem;
}

.phone-links,
.zine-links {
	display: flex;
	flex-wrap: wrap;
	gap: 14px;
}

.editor {
	display: grid;
	overflow: hidden;
	border: 2px solid #2e3a73;
	grid-template-columns: 220px 1fr;
}

.editor-explorer {
	display: flex;
	flex-direction: column;
	padding: 12px 0;
	background: #2e3a73;
}

.editor-tab {
	padding: 8px 16px;
	border-left: 3px solid transparent;
	color: var(--paper);
	font: 12px 'JetBrains Mono', monospace;
	text-align: left;
}

.editor-tab[aria-selected='true'] {
	border-left-color: var(--ink-yellow);
	background: #3d4d8f;
}

.editor-pane {
	padding: 20px 26px;
}

.editor-code {
	margin: 0;
	font: 13px 'JetBrains Mono', monospace;
}

.editor-code b {
	color: #b3136a;
}

.editor-code em {
	color: var(--ink-blue);
	font-style: normal;
	font-weight: 700;
}

.editor-bullets {
	margin: 4px 0 4px 1.5rem;
	font: 13px/1.7 'JetBrains Mono', monospace;
}

@media (width < 700px) {
	.editor {
		grid-template-columns: 1fr;
	}

	.editor-explorer {
		overflow-x: auto;
		flex-direction: row;
	}
}

.shelf {
	display: flex;
	flex-wrap: wrap;
	align-items: flex-start;
	gap: 8px;
}

.shelf-spine {
	min-width: 44px;
	min-height: 180px;
	padding: 12px 8px;
	background: var(--ink-blue);
	color: var(--paper);
	font: 700 12px 'JetBrains Mono', monospace;
	letter-spacing: 0.12em;
	writing-mode: vertical-rl;
}

.shelf-book.is-open .shelf-spine {
	background: var(--ink-pink);
	color: var(--ink-text);
}

.shelf-items {
	margin: 0;
	padding: 12px 20px;
	background: #fbf6ec;
}

.zine-tagline {
	color: var(--ink-blue);
	font-family: 'Archivo Black', system-ui, sans-serif;
	font-size: 1.3rem;
}

.zine-figure {
	margin: 12px 0;
	background: var(--ink-blue);
}

.zine-figure img {
	display: block;
	width: 100%;
	height: auto;
	filter: grayscale(1) contrast(1.1);
	mix-blend-mode: screen;
}

.postcard {
	display: grid;
	max-width: 760px;
	padding: 22px;
	background: #fbf6ec;
	box-shadow: 6px 6px 0 var(--ink-pink);
	gap: 22px;
	grid-template-columns: 1.3fr 1fr;
}

.postcard-address {
	position: relative;
	padding-left: 22px;
	border-left: 2px dashed var(--ink-blue);
}

.postcard-stamp {
	position: absolute;
	top: 0;
	right: 0;
	padding: 10px 8px;
	border: 3px double var(--ink-pink);
	color: var(--ink-pink);
	font: 700 14px 'JetBrains Mono', monospace;
	transform: rotate(6deg);
}

@media (width < 700px) {
	.postcard {
		grid-template-columns: 1fr;
	}
}

@keyframes plate-pink {
	from {
		opacity: 0.2;
		transform: translate(-0.5em, -0.15em);
	}
}

@keyframes plate-blue {
	from {
		opacity: 0.2;
		transform: translate(0.5em, 0.15em);
	}
}
```

In the editor, `#b3136a` on paper is decorative (the code line is `aria-hidden`), and it still reads well.

- [ ] **Step 12: Run the tests**

Run: `npm run test:run -- src/late-shift/sections`
Expected: PASS.

- [ ] **Step 13: Commit**

```bash
npx prettier -w src/late-shift
npm run run-eslint -- src/late-shift/sections
npm run run-stylelint
git add src/late-shift
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: add section skins (film, phone, editor, shelf, zine, postcard)"
```

---

### Task 12: Section dialog, camera tween and section routing

**Files:**
- Create: `src/late-shift/ui/useCameraTween.ts`, `src/late-shift/ui/useFocusTrap.ts`, `src/late-shift/ui/SectionPage.tsx`
- Modify: `src/late-shift/LateShift.tsx`, `src/late-shift/lateShift.css`
- Test: `src/late-shift/__tests__/sections.routing.test.tsx`

**Interfaces:**
- Consumes: `SECTIONS` (Task 11), `PrintHeading` (Task 11), `isSectionId`, `SectionId` (Task 7), `objectForSection` (Task 7), `RoomEngine` (Task 9), and `useRoomEngine`'s `setCovered` (Task 10).
- Produces:
  - `useCameraTween(engine: RoomEngine | null, isReducedMotion: boolean): { flyTo(target: ObjectId, to: number): Promise<void>; jumpTo(target: ObjectId | null, value: number): Promise<void> }`
  - `useFocusTrap(containerReference, onEscape): void`
  - `SectionPage({ section, onClose })`

- [ ] **Step 1: Write the failing test** `src/late-shift/__tests__/sections.routing.test.tsx`

Every test runs with reduced motion, so the camera tweens complete instantly.

```tsx
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import * as analytics from '../../lib/analytics'
import { renderRoute, setReducedMotion } from '../../testUtils'
import type { RoomEngine } from '../engine/roomEngine'
import LateShift from '../LateShift'

const { engine } = vi.hoisted(() => {
	const mockEngine: RoomEngine = {
		setLayout: vi.fn(), setHover: vi.fn(), setHighlight: vi.fn(), setCamera: vi.fn(),
		setRadio: vi.fn(), setTodMode: vi.fn(), setPaused: vi.fn(), destroy: vi.fn()
	}
	return { engine: mockEngine }
})
vi.mock('../engine/roomEngine', () => ({ createRoomEngine: () => engine }))

const routes = <Route path='/late-shift/*' element={<LateShift />} />

function setViewport(width: number, height: number) {
	Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
	Object.defineProperty(window, 'innerHeight', { configurable: true, value: height })
}

describe('Late Shift sections', () => {
	beforeEach(() => setReducedMotion(true))
	afterEach(() => setViewport(1024, 768))

	it('opens a section from a tag and focuses its heading', async () => {
		const user = userEvent.setup()
		const spy = vi.spyOn(analytics, 'track')
		renderRoute('/late-shift', routes)
		await user.click(screen.getByRole('button', { name: 'Experience' }))
		const dialog = await screen.findByRole('dialog', { name: 'Experience' })
		expect(dialog).toHaveAttribute('aria-modal', 'true')
		expect(screen.getByRole('heading', { level: 1, name: 'Experience' })).toHaveFocus()
		expect(engine.setCamera).toHaveBeenLastCalledWith('experience', 1)
		expect(spy).toHaveBeenCalledWith('section-opened', { section: 'experience', version: 'late-shift' })
	})

	it('closes with Escape, returns to the room and restores focus to the tag', async () => {
		const user = userEvent.setup()
		renderRoute('/late-shift/experience', routes)
		await screen.findByRole('dialog', { name: 'Experience' })
		await user.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
		expect(screen.getByTestId('location')).toHaveTextContent(/^\/late-shift$/)
		await waitFor(() => expect(screen.getByRole('button', { name: 'Experience' })).toHaveFocus())
		expect(engine.setCamera).toHaveBeenLastCalledWith('experience', 0)
	})

	it('deep-links to a nested project section, already zoomed', async () => {
		renderRoute('/late-shift/projects/screendle', routes)
		expect(await screen.findByRole('dialog', { name: 'Screendle' })).toBeInTheDocument()
		expect(engine.setCamera).toHaveBeenCalledWith('screendle', 1)
		expect(screen.getByRole('heading', { level: 1, name: 'Screendle' })).toHaveFocus()
	})

	it('redirects unknown sections to the room', async () => {
		renderRoute('/late-shift/nope', routes)
		await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent(/^\/late-shift$/))
	})

	it('opens only the last of two rapid activations', async () => {
		setReducedMotion(false)
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		await user.click(screen.getByRole('button', { name: 'Experience' }))
		await user.click(screen.getByRole('button', { name: '04 · Skills' }))
		expect(await screen.findByRole('dialog', { name: 'Skills' }, { timeout: 3000 })).toBeInTheDocument()
		await new Promise(resolve => { setTimeout(resolve, 1200) })
		expect(screen.queryByRole('dialog', { name: 'Experience' })).not.toBeInTheDocument()
	})

	it('keeps the section open and re-lays out the engine on resize', async () => {
		renderRoute('/late-shift/about', routes)
		await screen.findByRole('dialog', { name: 'About me' })
		act(() => {
			setViewport(390, 844)
			window.dispatchEvent(new Event('resize'))
		})
		expect(engine.setLayout).toHaveBeenLastCalledWith('phone', expect.any(Number), expect.any(Number))
		expect(screen.getByRole('dialog', { name: 'About me' })).toBeInTheDocument()
		expect(engine.setCamera).toHaveBeenLastCalledWith('about', 1)
	})

	it('pauses the room while a section covers it', async () => {
		renderRoute('/late-shift/skills', routes)
		await screen.findByRole('dialog', { name: 'Skills' })
		expect(engine.setPaused).toHaveBeenLastCalledWith(true)
	})
})
```

The "rapid activations" test uses real 0.9s tweens (reduced motion off). While the camera is flying, the tags stay clickable (the zoom-hide is in Step 5). The second click comes from a chip, which is always outside the stage.

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:run -- src/late-shift/__tests__/sections.routing.test.tsx`
Expected: FAIL (no dialog).

- [ ] **Step 3: Implement `src/late-shift/ui/useCameraTween.ts`**

```ts
import { gsap } from 'gsap'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { RoomEngine } from '../engine/roomEngine'
import type { ObjectId } from '../scene/objects'

export interface CameraTween {
	readonly flyTo: (target: ObjectId, to: number) => Promise<void>
	readonly jumpTo: (target: ObjectId | null, value: number) => Promise<void>
}

export default function useCameraTween(engine: RoomEngine | null, isReducedMotion: boolean): CameraTween {
	const camera = useRef<{ progress: number; target: ObjectId | null }>({ progress: 0, target: null })
	const tween = useRef<gsap.core.Tween | null>(null)
	const engineReference = useRef(engine)

	useEffect(() => {
		engineReference.current = engine
		engine?.setCamera(camera.current.target, camera.current.progress)
	}, [engine])

	useEffect(() => () => {
		tween.current?.kill()
	}, [])

	const jumpTo = useCallback(async (target: ObjectId | null, value: number) => {
		tween.current?.kill()
		camera.current = { progress: value, target }
		engineReference.current?.setCamera(target, value)
		return Promise.resolve()
	}, [])

	const flyTo = useCallback(
		async (target: ObjectId, to: number) =>
			new Promise<void>(resolve => {
				tween.current?.kill()
				if (camera.current.target !== target) camera.current = { progress: 0, target }
				const state = camera.current
				tween.current = gsap.to(state, {
					progress: to,
					duration: isReducedMotion ? 0 : 0.9,
					ease: 'power2.inOut',
					onUpdate: () => engineReference.current?.setCamera(target, state.progress),
					onComplete: () => {
						engineReference.current?.setCamera(target, state.progress)
						resolve()
					}
				})
			}),
		[isReducedMotion]
	)

	return useMemo(() => ({ flyTo, jumpTo }), [flyTo, jumpTo])
}
```

- [ ] **Step 4: Implement `src/late-shift/ui/useFocusTrap.ts`**

```ts
import { useEffect, type RefObject } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function useFocusTrap(containerReference: RefObject<HTMLElement>, onEscape: () => void): void {
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			const container = containerReference.current
			if (!container) return
			if (event.key === 'Escape') {
				event.preventDefault()
				onEscape()
				return
			}
			if (event.key !== 'Tab') return
			const items = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)]
			const first = items.at(0)
			const last = items.at(-1)
			if (!first || !last) return
			if (event.shiftKey && document.activeElement === first) {
				event.preventDefault()
				last.focus()
			} else if (!event.shiftKey && document.activeElement === last) {
				event.preventDefault()
				first.focus()
			}
		}
		document.addEventListener('keydown', onKeyDown)
		return () => document.removeEventListener('keydown', onKeyDown)
	}, [containerReference, onEscape])
}
```

- [ ] **Step 5: Implement `src/late-shift/ui/SectionPage.tsx`**

```tsx
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import SwitchVersionLink from '../../components/SwitchVersionLink'
import type { SectionId } from '../sectionIds'
import PrintHeading from '../sections/PrintHeading'
import { SECTIONS } from '../sections/registry'
import useFocusTrap from './useFocusTrap'

interface SectionPageProperties {
	readonly section: SectionId
	readonly onClose: () => void
}

export default function SectionPage({ section, onClose }: SectionPageProperties) {
	const entry = SECTIONS[section]
	const dialogReference = useRef<HTMLDivElement>(null)
	const headingReference = useRef<HTMLHeadingElement>(null)
	useFocusTrap(dialogReference, onClose)

	useEffect(() => {
		headingReference.current?.focus()
	}, [section])

	useEffect(() => {
		const previous = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = previous
		}
	}, [])

	return (
		<div
			ref={dialogReference}
			role='dialog'
			aria-modal='true'
			aria-labelledby='section-title'
			className={`section-page skin-${entry.skin}`}
		>
			<div className='section-page-inner'>
				<button type='button' className='section-back' onClick={onClose}>
					<span aria-hidden='true'>← </span>Back to the room<span aria-hidden='true'> (Esc)</span>
				</button>
				<p className='section-kicker'>{entry.kicker}</p>
				<PrintHeading id='section-title' ref={headingReference} tabIndex={-1}>
					{entry.title}
				</PrintHeading>
				<div className='section-body'>{entry.render()}</div>
				<p className='section-footer'>
					<Link to='/quick'>Read everything on one page</Link>
					<span aria-hidden='true'> · </span>
					<SwitchVersionLink />
				</p>
			</div>
		</div>
	)
}
```

- [ ] **Step 6: Wire sections into `src/late-shift/LateShift.tsx`**

Replace the imports block and the component body up to the `return`, and change the JSX, as follows. The full resulting file:

```tsx
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import SwitchVersionLink from '../components/SwitchVersionLink'
import { track } from '../lib/analytics'
import useReducedMotion from '../lib/useReducedMotion'
import { getRoomObject, objectForSection, type ObjectId } from './scene/objects'
import { isSectionId, type SectionId } from './sectionIds'
import { hoverFromSearch, todFromSearch } from './ui/debugParameters'
import RoomStage from './ui/RoomStage'
import SectionChips from './ui/SectionChips'
import SectionPage from './ui/SectionPage'
import useCameraTween from './ui/useCameraTween'
import useRoomEngine from './ui/useRoomEngine'
import './lateShift.css'

export default function LateShift() {
	const isReducedMotion = useReducedMotion()
	const navigate = useNavigate()
	const [searchParameters] = useSearchParams()
	const path = useParams()['*'] ?? ''
	const section: SectionId | null = isSectionId(path) ? path : null
	const canvasReference = useRef<HTMLCanvasElement>(null)
	const stageReference = useRef<HTMLDivElement>(null)
	const { engine, layoutName, hasFailed, setCovered } = useRoomEngine({ canvasReference, stageReference, isReducedMotion })
	const { flyTo, jumpTo } = useCameraTween(engine, isReducedMotion)
	const [hovered, setHovered] = useState<ObjectId | null>(null)
	const [highlighted, setHighlighted] = useState<ObjectId | null>(null)
	const [isRadioOn, setIsRadioOn] = useState(false)
	const [isHintVisible, setIsHintVisible] = useState(true)
	const [pageSection, setPageSection] = useState<SectionId | null>(null)
	const [isZoomed, setIsZoomed] = useState(false)
	const cameraObject = useRef<ObjectId | null>(null)
	const pendingFocus = useRef<ObjectId | null>(null)
	const isInitial = useRef(true)

	useEffect(() => {
		engine?.setHover(hovered)
	}, [engine, hovered])
	useEffect(() => {
		engine?.setHighlight(highlighted ?? hoverFromSearch(searchParameters))
	}, [engine, highlighted, searchParameters])
	useEffect(() => {
		engine?.setRadio(isRadioOn)
	}, [engine, isRadioOn])
	useEffect(() => {
		engine?.setTodMode(todFromSearch(searchParameters))
	}, [engine, searchParameters])

	useEffect(() => {
		let isCancelled = false
		const isFirst = isInitial.current
		isInitial.current = false
		const previous = cameraObject.current
		if (section === null) {
			setPageSection(null)
			setCovered(false)
			if (previous !== null) {
				void flyTo(previous, 0).then(() => {
					if (isCancelled) return
					cameraObject.current = null
					pendingFocus.current = previous
					setIsZoomed(false)
				})
			}
			return () => {
				isCancelled = true
			}
		}
		const target = objectForSection(section)
		track('section-opened', { section, version: 'late-shift' })
		cameraObject.current = target
		setIsZoomed(true)
		setPageSection(null)
		const arrive = isFirst || hasFailed ? jumpTo(target, 1) : flyTo(target, 1)
		void arrive.then(() => {
			if (isCancelled) return
			setPageSection(section)
			setCovered(true)
		})
		return () => {
			isCancelled = true
		}
	}, [section, flyTo, jumpTo, setCovered, hasFailed])

	useEffect(() => {
		if (isZoomed || pendingFocus.current === null) return
		document.querySelector<HTMLElement>(`[data-object="${pendingFocus.current}"]`)?.focus()
		pendingFocus.current = null
	}, [isZoomed])

	const onActivate = useCallback(
		(id: ObjectId) => {
			setIsHintVisible(false)
			const object = getRoomObject(id)
			if (object.section === null) {
				const next = !isRadioOn
				setIsRadioOn(next)
				track('radio-toggled', { on: next })
				return
			}
			navigate(`/late-shift/${object.section}`)
		},
		[isRadioOn, navigate]
	)
	const onClose = useCallback(() => navigate('/late-shift'), [navigate])
	const onHover = setHovered
	const onHighlight = setHighlighted

	if (path !== '' && section === null) return <Navigate to='/late-shift' replace />

	return (
		<main className='late-shift' data-scroll='static'>
			<h1 className='sr-only'>The Late Shift: Oliver Shooter&apos;s room</h1>
			<p className='sr-only'>
				An illustrated desk at night in Manchester. Rain runs down the window, a tram goes past, and a lamp lights the
				desk. Each labelled object opens a part of the portfolio.
			</p>
			<div className='room-sticky'>
				<RoomStage
					layoutName={layoutName}
					canvasReference={canvasReference}
					stageReference={stageReference}
					isZoomed={isZoomed && pageSection !== null}
					hasFailed={hasFailed}
					isHintVisible={isHintVisible}
					isRadioOn={isRadioOn}
					highlighted={highlighted}
					hovered={hovered}
					onHover={onHover}
					onHighlight={onHighlight}
					onActivate={onActivate}
				/>
				<SectionChips highlighted={highlighted} isRadioOn={isRadioOn} onActivate={onActivate} onHighlight={onHighlight} />
			</div>
			<p className='late-shift-footer'>
				<Link to='/quick'>Read everything on one page</Link>
				<span aria-hidden='true'> · </span>
				<SwitchVersionLink />
			</p>
			{pageSection ? <SectionPage section={pageSection} onClose={onClose} /> : null}
		</main>
	)
}
```

`isZoomed` is passed to the stage as `isZoomed && pageSection !== null`. While the camera is still flying, the tags stay operable, which is what makes the "rapid activations" behaviour testable. Once the page is open, the stage sits under the modal and the tags are inert.

A layout change doesn't reset the camera: `useCameraTween` keeps its target, and `setLayout` only changes the layout. That's the Review Focus 5 test.

- [ ] **Step 7: Append the dialog styles to `src/late-shift/lateShift.css`**

```css
.section-page {
	position: fixed;
	z-index: 20;
	overflow-y: auto;
	animation: section-in 0.25s ease-out both;
	background: var(--paper);
	color: var(--ink-text);
	inset: 0;
}

.section-page-inner {
	max-width: 980px;
	margin: 0 auto;
	padding: 24px 20px 48px;
}

.section-back {
	min-height: 32px;
	color: var(--ink-blue);
	font: 700 12px 'JetBrains Mono', monospace;
	letter-spacing: 0.08em;
	text-transform: uppercase;
}

.section-kicker {
	margin: 18px 0 0;
	color: var(--ink-blue);
	font: 700 12px 'JetBrains Mono', monospace;
	letter-spacing: 0.14em;
	text-transform: uppercase;
}

.section-body a {
	color: var(--ink-blue);
	font-weight: 700;
	text-decoration: underline;
	text-underline-offset: 3px;
}

.section-footer {
	margin-top: 40px;
}

.section-footer a {
	color: var(--ink-blue);
	text-decoration: underline;
}

.skin-editor {
	background: #ece5f6;
}

.skin-film {
	background: #f1e6d3;
}

@keyframes section-in {
	from {
		opacity: 0;
	}
}
```

- [ ] **Step 8: Run all Late Shift tests**

Run: `npm run test:run -- src/late-shift`
Expected: PASS. That includes Task 10's shell tests (their navigation assertions still hold).

- [ ] **Step 9: Screenshots and a manual check**

Re-run Step 13 of Task 10.
- `desk-android.png` and `phone-android.png` show the Android dialog over a zoomed room.
- With `npm run dev`, click the laptop: the camera flies in over about 0.9s, then the editor page appears.
- Esc flies back out, and focus lands on the Experience tag.

- [ ] **Step 10: Commit**

```bash
npx prettier -w src/late-shift
npm run run-eslint -- src/late-shift
npm run run-stylelint
git add src/late-shift
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: open sections as dialogs with camera fly-in and deep links"
```

---

### Task 13: Scroll into the phone (scroll-scrub) and the reduced-motion path

**Files:**
- Create: `src/late-shift/ui/useScrollIntoPhone.ts`
- Modify: `src/late-shift/LateShift.tsx`, `src/late-shift/lateShift.css`, `vite.config.ts` (add the file to coverage)
- Test: `src/late-shift/ui/__tests__/scrubAction.test.ts`, `src/late-shift/__tests__/LateShift.motion.test.tsx`

**Interfaces:**
- Consumes: `useCameraTween.jumpTo` (Task 12), GSAP `ScrollTrigger`.
- Produces:
  - `scrubAction(progress: number): { kind: 'camera'; progress: number } | { kind: 'open' }`
  - `useScrollIntoPhone({ spacerReference, isEnabled, onProgress, onArrive }): void`
  - `<main data-scroll='scrub' | 'static'>`

- [ ] **Step 1: Write the failing tests**

`src/late-shift/ui/__tests__/scrubAction.test.ts`

```ts
import { scrubAction } from '../useScrollIntoPhone'

describe('scrubAction', () => {
	it('drives the camera until the phone is reached', () => {
		expect(scrubAction(0)).toEqual({ kind: 'camera', progress: 0 })
		expect(scrubAction(0.5)).toEqual({ kind: 'camera', progress: 0.5 })
		expect(scrubAction(0.998)).toEqual({ kind: 'camera', progress: 0.998 })
	})

	it('opens the Android section at the end of the scroll', () => {
		expect(scrubAction(0.999)).toEqual({ kind: 'open' })
		expect(scrubAction(1)).toEqual({ kind: 'open' })
	})
})
```

`src/late-shift/__tests__/LateShift.motion.test.tsx`

```tsx
import { screen } from '@testing-library/react'
import { Route } from 'react-router-dom'
import { renderRoute, setReducedMotion } from '../../testUtils'
import LateShift from '../LateShift'

vi.mock('../engine/roomEngine', () => ({
	createRoomEngine: () => ({
		setLayout: vi.fn(), setHover: vi.fn(), setHighlight: vi.fn(), setCamera: vi.fn(),
		setRadio: vi.fn(), setTodMode: vi.fn(), setPaused: vi.fn(), destroy: vi.fn()
	})
}))

const routes = <Route path='/late-shift/*' element={<LateShift />} />

describe('Late Shift motion', () => {
	it('scroll-scrubs into the phone when motion is allowed', () => {
		renderRoute('/late-shift', routes)
		expect(screen.getByRole('main')).toHaveAttribute('data-scroll', 'scrub')
	})

	it('is a static page with reduced motion', () => {
		setReducedMotion(true)
		renderRoute('/late-shift', routes)
		expect(screen.getByRole('main')).toHaveAttribute('data-scroll', 'static')
	})
})
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm run test:run -- src/late-shift`
Expected: FAIL (`useScrollIntoPhone` is missing, and `data-scroll` is always `static`).

- [ ] **Step 3: Implement `src/late-shift/ui/useScrollIntoPhone.ts`**

```ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, type RefObject } from 'react'

export type ScrubAction =
	| { readonly kind: 'camera'; readonly progress: number }
	| { readonly kind: 'open' }

export function scrubAction(progress: number): ScrubAction {
	return progress >= 0.999 ? { kind: 'open' } : { kind: 'camera', progress }
}

interface ScrollIntoPhoneOptions {
	readonly spacerReference: RefObject<HTMLElement>
	readonly isEnabled: boolean
	readonly onProgress: (progress: number) => void
	readonly onArrive: () => void
}

export default function useScrollIntoPhone({ spacerReference, isEnabled, onProgress, onArrive }: ScrollIntoPhoneOptions): void {
	useEffect(() => {
		const spacer = spacerReference.current
		if (!isEnabled || !spacer) return undefined
		gsap.registerPlugin(ScrollTrigger)
		const trigger = ScrollTrigger.create({
			trigger: spacer,
			start: 'top top',
			end: 'bottom bottom',
			onUpdate: self => {
				const action = scrubAction(self.progress)
				if (action.kind === 'open') onArrive()
				else onProgress(action.progress)
			}
		})
		return () => trigger.kill()
	}, [spacerReference, isEnabled, onProgress, onArrive])
}
```

Add `'src/late-shift/ui/useScrollIntoPhone.ts'` to the coverage `include` list in `vite.config.ts`. The hook body runs only when ScrollTrigger is live, so mark the default export with `/* istanbul ignore next */` on the line above `export default function useScrollIntoPhone`. The pure `scrubAction` stays covered.

ScrollTrigger measures real layout, which jsdom doesn't have. So every component test gets a no-op hook, while `scrubAction` stays real. Append this to `src/setupTests.ts` (a `vi.mock` in a setup file applies to all test files):

```ts
vi.mock('./late-shift/ui/useScrollIntoPhone', async importOriginal => ({
	...(await importOriginal<typeof import('./late-shift/ui/useScrollIntoPhone')>()),
	default: vi.fn()
}))
```

- [ ] **Step 4: Wire it into `src/late-shift/LateShift.tsx`**

Add the import:

```tsx
import useScrollIntoPhone from './ui/useScrollIntoPhone'
```

After `const isInitial = useRef(true)`, add:

```tsx
	const spacerReference = useRef<HTMLDivElement>(null)
	const [isScrubEnabled, setIsScrubEnabled] = useState(true)
	const onScrubProgress = useCallback(
		(progress: number) => {
			void jumpTo(progress > 0 ? 'android' : null, progress)
			cameraObject.current = progress > 0 ? 'android' : null
			setIsZoomed(progress > 0.03)
		},
		[jumpTo]
	)
	const onScrubArrive = useCallback(() => navigate('/late-shift/android'), [navigate])
	useScrollIntoPhone({
		spacerReference,
		isEnabled: !isReducedMotion && isScrubEnabled && section === null,
		onProgress: onScrubProgress,
		onArrive: onScrubArrive
	})
```

In the section effect's `section === null` branch, replace the `if (previous !== null) { ... }` block with:

```tsx
			if (previous !== null) {
				setIsScrubEnabled(false)
				window.scrollTo({ top: 0 })
				void flyTo(previous, 0).then(() => {
					if (isCancelled) return
					cameraObject.current = null
					pendingFocus.current = previous
					setIsZoomed(false)
					setIsScrubEnabled(true)
				})
			}
```

In the open branch, straight after `const target = objectForSection(section)`, add:

```tsx
		setIsScrubEnabled(false)
```

`window.scrollTo` isn't implemented in jsdom. Add `vi.stubGlobal('scrollTo', vi.fn())` to `src/setupTests.ts`, at module level next to the observer stubs.

Change the JSX root and wrap the sticky block:

```tsx
		<main className='late-shift' data-scroll={isReducedMotion ? 'static' : 'scrub'}>
			...sr-only h1 and p unchanged...
			<div ref={spacerReference} className='room-scroll'>
				<div className='room-sticky'>
					...RoomStage and SectionChips unchanged...
				</div>
			</div>
			...footer and SectionPage unchanged...
		</main>
```

- [ ] **Step 5: Append the scroll styles to `src/late-shift/lateShift.css`**

```css
.late-shift[data-scroll='scrub'] .room-scroll {
	height: 200svh;
}

.late-shift[data-scroll='scrub'] .room-sticky {
	position: sticky;
	top: 0;
}

@media (prefers-reduced-motion: reduce) {
	.room-tag,
	.room-tag-dot {
		animation: none;
	}
}
```

- [ ] **Step 6: Run the tests**

Run: `npm run test:run`
Expected: the whole suite passes.

- [ ] **Step 7: Manual check** with `npm run dev`, then open `/late-shift`:
- Scrolling down pushes into the phone, and at the bottom the Android dialog opens.
- Esc flies back out, the page is at the top, and scrolling works again.
- With OS reduced motion on: the page doesn't scroll-scrub, the room is still, and the tags don't pulse. Opening a section is instant.
- Check at 390×844 in the device toolbar, and rotate to landscape: the layout switches with no reload, and the tags re-place.

- [ ] **Step 8: Commit**

```bash
npx prettier -w src/late-shift src/setupTests.ts vite.config.ts
npm run run-eslint -- src/late-shift src/setupTests.ts
npm run run-stylelint
git add src/late-shift src/setupTests.ts vite.config.ts
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: scroll-scrub into the phone; static room for reduced motion"
```

---

### Task 14: LOFI FM (procedural Web Audio radio)

**Files:**
- Create: `src/late-shift/audio/lofiRadio.ts`, `src/late-shift/ui/useLofiRadio.ts`
- Modify: `src/late-shift/LateShift.tsx`
- Test: `src/late-shift/__tests__/LateShift.radio.test.tsx`

**Interfaces:**
- Consumes: `readStored`, `writeStored` (Task 3), `track` (Task 3).
- Produces:
  - `interface LofiRadio { start(): Promise<void>; stop(): void; isPlaying(): boolean }`
  - `createLofiRadio(makeContext?: () => AudioContext): LofiRadio`
  - `useLofiRadio(): { isOn: boolean; wasOn: boolean; onToggle: () => void }`

- [ ] **Step 1: Write the failing test** `src/late-shift/__tests__/LateShift.radio.test.tsx`

```tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route } from 'react-router-dom'
import { renderRoute } from '../../testUtils'
import LateShift from '../LateShift'

const { radio } = vi.hoisted(() => ({
	radio: { start: vi.fn(async () => Promise.resolve()), stop: vi.fn(), isPlaying: vi.fn(() => false) }
}))
vi.mock('../audio/lofiRadio', () => ({ createLofiRadio: () => radio }))
vi.mock('../engine/roomEngine', () => ({
	createRoomEngine: () => ({
		setLayout: vi.fn(), setHover: vi.fn(), setHighlight: vi.fn(), setCamera: vi.fn(),
		setRadio: vi.fn(), setTodMode: vi.fn(), setPaused: vi.fn(), destroy: vi.fn()
	})
}))

const routes = <Route path='/late-shift/*' element={<LateShift />} />

describe('LOFI FM', () => {
	it('starts and stops the radio from the cassette deck', async () => {
		const user = userEvent.setup()
		renderRoute('/late-shift', routes)
		await user.click(screen.getByRole('button', { name: 'Lofi radio' }))
		expect(radio.start).toHaveBeenCalledTimes(1)
		expect(window.sessionStorage.getItem('os-portfolio:radio')).toBe('on')
		expect(screen.getByText('♪ lofi fm · rain on oxford road')).toBeInTheDocument()
		radio.isPlaying.mockReturnValue(true)
		await user.click(screen.getByRole('button', { name: '♪ Lofi radio' }))
		expect(radio.stop).toHaveBeenCalledTimes(1)
		expect(window.sessionStorage.getItem('os-portfolio:radio')).toBe('off')
	})

	it('offers to resume when the radio was on earlier this session', () => {
		window.sessionStorage.setItem('os-portfolio:radio', 'on')
		renderRoute('/late-shift', routes)
		expect(screen.getByText(/radio paused/i)).toBeInTheDocument()
		expect(radio.start).not.toHaveBeenCalled()
	})
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test:run -- src/late-shift/__tests__/LateShift.radio.test.tsx`
Expected: FAIL (`start` isn't called).

- [ ] **Step 3: Implement `src/late-shift/audio/lofiRadio.ts`**

```ts
export interface LofiRadio {
	readonly start: () => Promise<void>
	readonly stop: () => void
	readonly isPlaying: () => boolean
}

const BPM = 72
const SIXTEENTH = 60 / BPM / 4
const LOOKAHEAD = 0.12
const TICK_MS = 25
const VOLUME = 0.35
const FADE = 0.6

/** Am7 · Dm9 · G7 · Cmaj7, voiced in MIDI note numbers. */
const CHORDS: readonly (readonly number[])[] = [
	[57, 60, 64, 67],
	[50, 57, 60, 65],
	[55, 59, 62, 65],
	[48, 55, 59, 64]
]
const KICKS = new Set([0, 7, 10])
const SNARES = new Set([4, 12])

interface Graph {
	readonly context: AudioContext
	readonly master: GainNode
	readonly music: GainNode
	readonly noise: AudioBuffer
}

interface NoiseHit {
	readonly type: BiquadFilterType
	readonly frequency: number
	readonly level: number
	readonly length: number
}

const midiToHertz = (note: number): number => 440 * 2 ** ((note - 69) / 12)

function createNoise(context: AudioContext): AudioBuffer {
	const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
	const data = buffer.getChannelData(0)
	for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1
	return buffer
}

function buildGraph(context: AudioContext): Graph {
	const master = context.createGain()
	master.gain.value = 0
	const warmth = context.createBiquadFilter()
	warmth.type = 'lowpass'
	warmth.frequency.value = 5000
	master.connect(warmth)
	warmth.connect(context.destination)

	const music = context.createGain()
	const tone = context.createBiquadFilter()
	tone.type = 'lowpass'
	tone.frequency.value = 1800
	music.connect(tone)
	tone.connect(master)

	const tremolo = context.createOscillator()
	tremolo.frequency.value = 4.5
	const depth = context.createGain()
	depth.gain.value = 0.12
	tremolo.connect(depth)
	depth.connect(music.gain)
	tremolo.start()

	return { context, master, music, noise: createNoise(context) }
}

function playChord(graph: Graph, notes: readonly number[], time: number, length: number): void {
	for (const note of notes) {
		for (const [type, multiplier, level] of [['sine', 1, 0.07], ['triangle', 2, 0.015]] as const) {
			const voice = graph.context.createOscillator()
			voice.type = type
			voice.frequency.value = midiToHertz(note) * multiplier
			const envelope = graph.context.createGain()
			envelope.gain.setValueAtTime(0, time)
			envelope.gain.linearRampToValueAtTime(level, time + 0.03)
			envelope.gain.exponentialRampToValueAtTime(level * 0.4, time + length * 0.6)
			envelope.gain.linearRampToValueAtTime(0, time + length)
			voice.connect(envelope)
			envelope.connect(graph.music)
			voice.start(time)
			voice.stop(time + length + 0.05)
		}
	}
}

function playBass(graph: Graph, note: number, time: number): void {
	const voice = graph.context.createOscillator()
	voice.type = 'sine'
	voice.frequency.value = midiToHertz(note - 12)
	const envelope = graph.context.createGain()
	envelope.gain.setValueAtTime(0.22, time)
	envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.5)
	voice.connect(envelope)
	envelope.connect(graph.master)
	voice.start(time)
	voice.stop(time + 0.55)
}

function playKick(graph: Graph, time: number): void {
	const voice = graph.context.createOscillator()
	voice.frequency.setValueAtTime(120, time)
	voice.frequency.exponentialRampToValueAtTime(45, time + 0.12)
	const envelope = graph.context.createGain()
	envelope.gain.setValueAtTime(0.8, time)
	envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.28)
	voice.connect(envelope)
	envelope.connect(graph.master)
	voice.start(time)
	voice.stop(time + 0.3)
}

function playNoiseHit(graph: Graph, time: number, hit: NoiseHit): void {
	const source = graph.context.createBufferSource()
	source.buffer = graph.noise
	const filter = graph.context.createBiquadFilter()
	filter.type = hit.type
	filter.frequency.value = hit.frequency
	const envelope = graph.context.createGain()
	envelope.gain.setValueAtTime(hit.level, time)
	envelope.gain.exponentialRampToValueAtTime(0.0001, time + hit.length)
	source.connect(filter)
	filter.connect(envelope)
	envelope.connect(graph.master)
	source.start(time, Math.random())
	source.stop(time + hit.length + 0.02)
}

function playRain(graph: Graph): AudioBufferSourceNode {
	const source = graph.context.createBufferSource()
	source.buffer = graph.noise
	source.loop = true
	const filter = graph.context.createBiquadFilter()
	filter.type = 'bandpass'
	filter.frequency.value = 1200
	filter.Q.value = 0.7
	const level = graph.context.createGain()
	level.gain.value = 0.16
	const swell = graph.context.createOscillator()
	swell.frequency.value = 0.05
	const swellDepth = graph.context.createGain()
	swellDepth.gain.value = 0.05
	swell.connect(swellDepth)
	swellDepth.connect(level.gain)
	swell.start()
	source.connect(filter)
	filter.connect(level)
	level.connect(graph.master)
	source.start()
	source.addEventListener('ended', () => swell.stop())
	return source
}

function scheduleStep(graph: Graph, step: number, time: number): void {
	const inBar = step % 16
	const chord = CHORDS[Math.floor(step / 16) % CHORDS.length]
	const swung = step % 2 === 1 ? time + SIXTEENTH * 0.33 : time
	if (inBar === 0) {
		playChord(graph, chord, time, SIXTEENTH * 16)
		playBass(graph, chord[0], time)
	}
	if (inBar === 10) playBass(graph, chord[0], time)
	if (KICKS.has(inBar)) playKick(graph, swung)
	if (SNARES.has(inBar)) playNoiseHit(graph, swung, { type: 'bandpass', frequency: 1800, level: 0.28, length: 0.18 })
	if (inBar % 2 === 0) playNoiseHit(graph, time, { type: 'highpass', frequency: 7000, level: 0.06, length: 0.05 })
	if (Math.random() < 0.3) {
		playNoiseHit(graph, time + Math.random() * SIXTEENTH, { type: 'highpass', frequency: 2500, level: 0.025, length: 0.012 })
	}
}

function fadeTo(graph: Graph, value: number): void {
	const now = graph.context.currentTime
	graph.master.gain.cancelScheduledValues(now)
	graph.master.gain.setValueAtTime(graph.master.gain.value, now)
	graph.master.gain.linearRampToValueAtTime(value, now + FADE)
}

export function createLofiRadio(makeContext: () => AudioContext = () => new AudioContext()): LofiRadio {
	let graph: Graph | null = null
	let rain: AudioBufferSourceNode | null = null
	let timer: number | undefined
	let step = 0
	let nextTime = 0
	let playing = false

	const tick = () => {
		if (!graph) return
		while (nextTime < graph.context.currentTime + LOOKAHEAD) {
			scheduleStep(graph, step, nextTime)
			nextTime += SIXTEENTH
			step = (step + 1) % 64
		}
	}

	return {
		start: async () => {
			if (playing) return
			graph ??= buildGraph(makeContext())
			await graph.context.resume()
			playing = true
			fadeTo(graph, VOLUME)
			rain = playRain(graph)
			step = 0
			nextTime = graph.context.currentTime + 0.05
			timer = window.setInterval(tick, TICK_MS)
		},
		stop: () => {
			if (!playing || !graph) return
			playing = false
			window.clearInterval(timer)
			fadeTo(graph, 0)
			const fading = rain
			rain = null
			const { context } = graph
			window.setTimeout(() => {
				fading?.stop()
				if (!playing) void context.suspend()
			}, FADE * 1000 + 100)
		},
		isPlaying: () => playing
	}
}
```

- [ ] **Step 4: Implement `src/late-shift/ui/useLofiRadio.ts`**

```ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { track } from '../../lib/analytics'
import { readStored, writeStored } from '../../lib/storage'
import { createLofiRadio, type LofiRadio } from '../audio/lofiRadio'

const RADIO_KEY = 'os-portfolio:radio'

export default function useLofiRadio() {
	const radio = useRef<LofiRadio | null>(null)
	const [isOn, setIsOn] = useState(false)
	const [wasOn] = useState(() => readStored('session', RADIO_KEY) === 'on')

	const onToggle = useCallback(() => {
		radio.current ??= createLofiRadio()
		const next = !radio.current.isPlaying()
		if (next) void radio.current.start()
		else radio.current.stop()
		setIsOn(next)
		writeStored('session', RADIO_KEY, next ? 'on' : 'off')
		track('radio-toggled', { on: next })
	}, [])

	useEffect(
		() => () => {
			radio.current?.stop()
		},
		[]
	)

	return { isOn, wasOn, onToggle }
}
```

- [ ] **Step 5: Use it in `src/late-shift/LateShift.tsx`**

Add the import `import useLofiRadio from './ui/useLofiRadio'`, then:
- Delete `const [isRadioOn, setIsRadioOn] = useState(false)` and add `const { isOn: isRadioOn, wasOn: wasRadioOn, onToggle: onRadioToggle } = useLofiRadio()`.
- In `onActivate`, replace the radio branch with:

```tsx
			if (object.section === null) {
				onRadioToggle()
				return
			}
```

- Change the `onActivate` dependency array to `[navigate, onRadioToggle]`.
- Pass `hasPausedRadio={wasRadioOn}` to `RoomStage`.

- [ ] **Step 6: Mock the radio in the Task 10 shell test, then run everything.** jsdom has no `AudioContext`, so the real radio would reject when started. Add this to `src/late-shift/__tests__/LateShift.test.tsx`, below the engine mock:

```ts
vi.mock('../audio/lofiRadio', () => ({
	createLofiRadio: () => ({ start: vi.fn(async () => Promise.resolve()), stop: vi.fn(), isPlaying: vi.fn(() => false) })
}))
```

Run: `npm run test:run`
Expected: everything passes. The shell test's radio case still sees `aria-pressed` flip and `track('radio-toggled', { on: true })`, which now comes from `useLofiRadio`.

- [ ] **Step 7: Listen to it.** With `npm run dev`, click the cassette deck:
- Music fades in over 0.6s, with chords, soft drums, crackle and rain.
- Clicking again fades it out.
- The reels spin and notes float only while it's playing.

If the procedural sound is judged not good enough, keep this interface and swap in CC0 loop files instead (spec §6.7). List their sources in `public/audio/SOURCES.md`.

- [ ] **Step 8: Commit**

```bash
npx prettier -w src/late-shift
npm run run-eslint -- src/late-shift
git add src/late-shift
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "feat: add LOFI FM procedural radio"
```

---

### Task 15: Polish, budgets and final verification

**Files:**
- Modify: `vite.config.ts` (manualChunks, PWA globs)

- [ ] **Step 1: Split GSAP into its own chunk and precache the fonts and images.** In `vite.config.ts`:
- Add `build: { rollupOptions: { output: { manualChunks: { gsap: ['gsap'] } } } }` to the returned config object.
- Change the `VitePWA({...})` options to:

```ts
					VitePWA({
						registerType: 'autoUpdate',
						includeAssets: ['favicon.png'],
						workbox: {
							globPatterns: ['**/*.{js,css,html,png,woff2}']
						}
					})
```

- [ ] **Step 2: Build and check the budgets**

Run: `npm run build`
In Vite's output table, read the gzip column:
- The entry chunk (`index-*.js`) plus its CSS is ≤ 90 KB.
- The `LateShift-*.js` chunk is ≤ 120 KB.
- `gsap-*.js` is listed separately.

If the entry is over budget, check that nothing under `src/late-shift/` or `gsap` is imported by `Landing`, `QuickRead` or `App` (except the lazy import).

- [ ] **Step 3: Run the full automated suite**

Run: `npm run run-tsc && npm run lint && npm run run-stylelint && npm run test:coverage`
Expected:
- all clean;
- every test passes;
- coverage is 100% for each file in the include list.

- [ ] **Step 4: Screenshots.** Run `npm run preview` and `scripts/room-screenshots.sh`, and review all 12 images (checklist in Task 10, Step 13).

- [ ] **Step 5: Manual verification checklist.** Do each of these and note the results in the commit message:
- [ ] Lighthouse (Chrome DevTools, mobile) on `/` and `/quick`: Accessibility is 100.
- [ ] Keyboard only:
  - `/`: tab to each door, and the checkbox.
  - `/quick`: skip link, nav, all links.
  - `/late-shift`: tags, then chips. Enter opens a section, the tabs and spines work, Esc closes, and focus comes back to the tag.
- [ ] Screen reader (NVDA or Narrator):
  - `/late-shift` announces "The Late Shift" and lists "Things in the room" with their descriptions.
  - A section announces as a dialog named after its heading.
- [ ] Reduced motion on: the landing rain is still, and the room is a single frame. No scroll-scrub, no tag pulse.
- [ ] Phone (DevTools 390×844, then rotate): the portrait room, the chips, and full-screen sections all look right.
- [ ] Performance panel on `/late-shift` (desktop, idle, 6 s): about 60 fps, and no long tasks over 50 ms after load.
- [ ] Dark mode on `/quick`: all text readable, and the focus ring visible.

- [ ] **Step 6: Commit**

```bash
npx prettier -w vite.config.ts
git add vite.config.ts
git -c user.name="Oliver Shooter" -c user.email="olivershooter@gmail.com" commit -m "chore: split gsap chunk, precache fonts/images, verify budgets and a11y"
```

---

## Self-Review Notes

**Spec coverage:**

| Spec section | Where it's implemented |
|---|---|
| §3 routes and remembered choice | Tasks 3, 4, 6 |
| §3 analytics | Tasks 3, 6, 10, 12, 14 |
| §4 content and integrity test | Task 2 |
| §5 landing | Task 6 |
| §6.1 engine | Tasks 8, 9 |
| §6.2 modules | Tasks 7–14 |
| §6.3 interaction | Tasks 10, 12, 13 |
| §6.4 camera | Tasks 7, 12 |
| §6.5 skins and focus management | Tasks 11, 12 |
| §6.6 mobile | Tasks 7, 9, 10, 13 |
| §6.7 audio | Task 14 |
| §6.8 budgets | Tasks 8, 15 |
| §6.9 reduced motion and baseline a11y | Tasks 9, 10, 13 |
| §7 Quick Read | Tasks 4, 5 |
| §8 architecture, fonts, removals, lint | Tasks 1, 4, 15 |
| §9 testing | Every task, then Task 15 |

**Deliberate deviations from the spec, all minor:**
- Two pieces of code are marked `istanbul ignore`: `objectForSection`'s impossible throw, and the ScrollTrigger hook. Their pure logic is still covered.
- The canvas title on the phone is shortened to "02 / KOTLIN · COMPOSE" so it fits the screen.
- The "pinned" canvas during scroll-scrub uses CSS `position: sticky` rather than ScrollTrigger `pin`, which is simpler and behaves the same.
- The ESLint config gets three extra global overrides (Task 1) because enabled rules contradict each other.

**Type and name consistency (checked):**
- `ObjectId`, `SectionId`, `Layout`, `RoomEngine`, `SceneFrame` and `RoomRenderState` are defined once and used with the same names everywhere.
- Boolean props are `is*`/`has*` throughout: `hasPausedRadio` / `hasPaused`, `isZoomed`, `isRadioOn`.
- `data-object` on tags is what Task 12's focus return queries.
