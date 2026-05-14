# Koan Demo Shell — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Koan chat-led demo shell with three demos (Theme Builder wizard, Tabs, Toasts) inside `demo/`, plus seven generalizable components with `@rokkit/ui`-shape APIs (still located in `demo/` until promotion in Phase 1.5).

**Architecture:** Single-route SvelteKit app at `demo/`. State lives in Svelte 5 runes (`$state`) stores; shell never unmounts between demos. Minisearch index over a static catalog drives chat-to-demo matching. Theme wizard persists to localStorage with download/export. Existing Sensei pages move under `(legacy)/` to stay buildable.

**Tech Stack:** SvelteKit 2 + Svelte 5 + `@rokkit/ui` + `@rokkit/forms` + `@rokkit/themes` + UnoCSS + Playwright (e2e) + vitest (unit, added in Task 1) + `minisearch` + `@fontsource/caveat`.

**Reference:** Design spec at `docs/superpowers/specs/2026-05-14-koan-demo-shell-design.md`. Read it before starting Task 1.

**Phase 1.5 (Promotion):** Out of scope for this plan — its own plan will be written after Phase 1 stabilizes on `develop`.

---

## File Structure

**Created:**
```
demo/
  vitest.config.js                       — NEW
  package.json                           — MODIFIED (add deps)
  src/app.css                            — MODIFIED (Caveat import)
  src/app.html                           — MODIFIED (flash-prevention hook extended)
  src/routes/+page.svelte                — REWRITTEN (mounts Koan shell)
  src/routes/(legacy)/                   — NEW group (existing pages moved here)
  src/lib/koan/
    types.ts                             — types: DemoMeta, WizardState, SavedTheme, TimelineEntry
    persistence.ts                       — localStorage adapter (corruption-tolerant)
    store.svelte.ts                      — koan $state: query, history, activeDemoId
    theme-store.svelte.ts                — extends theme store with active/saved/draft
    catalog.ts                           — demo registry + minisearch index
    match.svelte.ts                      — $derived match results
    components/
      AnnotationArrow.svelte             — SVG arrow with Caveat label
      BrandMark.svelte                   — animated brand glyph + label
      EmptyState.svelte                  — generic empty/welcome pattern
      ShowcaseCanvas.svelte              — dot-grid container
      TimelineList.svelte                — visited demos list
      PreviewCard.svelte                 — gallery card
      Gallery.svelte                     — searchable card grid
      ChatPanel.svelte                   — chat sidebar pattern
      Welcome.svelte                     — Koan-local: composes EmptyState + AnnotationArrow
      Shell.svelte                       — Koan-local: 2-pane layout + transitions
      Canvas.svelte                      — Koan-local: gallery/demo router
      DownloadModal.svelte               — theme wizard download dialog
    demos/
      tabs/{index,meta}.svelte/.ts
      toasts/{index,meta}.svelte/.ts
      theme-wizard/{index,meta}.svelte/.ts
      theme-wizard/StepStart.svelte
      theme-wizard/StepTune.svelte
      theme-wizard/StepSave.svelte
      theme-wizard/PreviewPane.svelte
  spec/koan/
    persistence.spec.ts
    store.spec.svelte.ts
    catalog.spec.ts
    match.spec.svelte.ts
    wizard-state.spec.ts
  e2e/koan/
    welcome.e2e.ts
    tabs-demo.e2e.ts
    toasts-demo.e2e.ts
    theme-wizard.e2e.ts
    timeline.e2e.ts
    deep-link.e2e.ts
    keyboard.e2e.ts
    reduced-motion.e2e.ts
```

**Moved:**
```
demo/src/routes/(app)/*    → demo/src/routes/(legacy)/(app)/*
demo/src/routes/setup/*    → demo/src/routes/(legacy)/setup/*
```

---

## Conventions (read before starting)

- All commits use the project's existing conventional-commit prefixes (`feat(demo):`, `fix(demo):`, `refactor(demo):`, `test(demo):`, `docs:`).
- Commit message footer: `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
- Tests are TDD: write failing test → see it fail → minimal implementation → see it pass → commit.
- All unit tests in `demo/spec/koan/`, all e2e in `demo/e2e/koan/`.
- Run unit tests: `cd demo && bun run test:unit`.
- Run e2e tests: `cd demo && bun run test:e2e`.
- Run lint: `bun run lint` from repo root (must be zero errors).
- Use Svelte 5 runes (`$state`, `$derived`, `$effect`); no Svelte 4 stores.
- All localStorage access guarded with `typeof localStorage !== 'undefined'`.
- Component files use `.svelte`; logic files use `.svelte.ts` if they use runes, else `.ts`.
- Branch: stay on `develop` (per `CLAUDE.md`).

---

## Tasks

### Task 1: Move Sensei pages to `(legacy)/`, verify build

**Files:**
- Move: `demo/src/routes/(app)/*` → `demo/src/routes/(legacy)/(app)/*`
- Move: `demo/src/routes/setup/*` → `demo/src/routes/(legacy)/setup/*`

- [ ] **Step 1: Create legacy directory**

```bash
mkdir -p demo/src/routes/\(legacy\)
```

- [ ] **Step 2: Move existing route groups**

```bash
git mv 'demo/src/routes/(app)' 'demo/src/routes/(legacy)/(app)'
git mv demo/src/routes/setup 'demo/src/routes/(legacy)/setup'
```

- [ ] **Step 3: Verify build still works**

Run: `cd demo && bun run build`
Expected: build succeeds, no broken-link errors. SvelteKit treats `(legacy)` as a route group and merges children into the URL space.

- [ ] **Step 4: Verify dev server starts**

Run: `cd demo && bun run dev`
Open: `http://localhost:5173/observatory` → loads as before.
Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add demo/src/routes
git commit -m "$(cat <<'EOF'
refactor(demo): move Sensei pages to (legacy) route group

Preserves all current pages buildable but off the main path so the
Koan shell can occupy the root route in subsequent tasks.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Add dependencies (minisearch, @fontsource/caveat, vitest)

**Files:**
- Modify: `demo/package.json`
- Create: `demo/vitest.config.js`

- [ ] **Step 1: Add runtime deps**

Run:
```bash
cd demo && bun add minisearch @fontsource/caveat
```
Verify `demo/package.json` now lists both under `dependencies`.

- [ ] **Step 2: Add vitest dev deps**

```bash
cd demo && bun add -d vitest @vitest/browser jsdom @testing-library/svelte @testing-library/jest-dom
```

- [ ] **Step 3: Add test script to `demo/package.json`**

Edit `demo/package.json` `scripts`:
```json
"test:unit": "vitest run",
"test:unit:watch": "vitest"
```

- [ ] **Step 4: Create `demo/vitest.config.js`**

```js
import { defineConfig } from 'vitest/config'
import { sveltekit } from '@sveltejs/kit/vite'

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['spec/**/*.spec.{ts,svelte.ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./spec/setup.ts']
	}
})
```

- [ ] **Step 5: Create `demo/spec/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Verify vitest runs (empty suite)**

```bash
cd demo && bun run test:unit
```
Expected: vitest reports "No test files found, exiting with code 0" or similar. No errors.

- [ ] **Step 7: Commit**

```bash
git add demo/package.json demo/vitest.config.js demo/spec/setup.ts bun.lock
git commit -m "$(cat <<'EOF'
chore(demo): add minisearch, @fontsource/caveat, vitest

Adds runtime deps for Koan match index and Caveat annotation font,
plus vitest for unit testing pure logic modules.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Import Caveat font

**Files:**
- Modify: `demo/src/app.css`

- [ ] **Step 1: Add font import**

Open `demo/src/app.css` and add at the top (after existing `@fontsource/*` imports):

```css
@import '@fontsource/caveat/400.css';
@import '@fontsource/caveat/500.css';
```

- [ ] **Step 2: Add CSS variable for Caveat**

In the same file, in the `:root` block (or wherever font tokens live):

```css
:root {
	--font-script: 'Caveat', cursive;
}
```

- [ ] **Step 3: Verify dev server loads font**

```bash
cd demo && bun run dev
```
Open `http://localhost:5173/`, open DevTools → Network → Fonts. Confirm `caveat-latin-400-normal.woff2` (or similar) loads. Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add demo/src/app.css
git commit -m "$(cat <<'EOF'
feat(demo): import Caveat font for Koan annotations

Adds @fontsource/caveat 400+500 weights and the --font-script CSS
variable. Used by AnnotationArrow and welcome-state copy.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Define Koan types

**Files:**
- Create: `demo/src/lib/koan/types.ts`

- [ ] **Step 1: Write types file**

```ts
// demo/src/lib/koan/types.ts
import type { Component } from 'svelte'

export type DemoCategory = 'theme' | 'navigation' | 'feedback' | 'forms' | 'data'

export type DemoMeta = {
	id: string
	title: string
	description: string
	keywords: string[]
	category: DemoCategory
	icon: string
	load: () => Promise<{ default: Component }>
	preview?: () => Promise<{ default: Component }>
}

export type TimelineEntry = {
	demoId: string
	mountedAt: string
	query: string
}

export type WizardMode = 'light' | 'dark' | 'auto'
export type WizardDensity = 'compact' | 'normal' | 'comfortable'
export type WizardRoundedness = 'sharp' | 'soft' | 'rounded' | 'pill'

export type WizardState = {
	preset: string
	mode: WizardMode
	density: WizardDensity
	roundedness: WizardRoundedness
	name: string
}

export type SavedTheme = WizardState & {
	id: string
	createdAt: string
	updatedAt: string
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd demo && bunx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add demo/src/lib/koan/types.ts
git commit -m "$(cat <<'EOF'
feat(demo): add Koan type definitions

Defines DemoMeta, TimelineEntry, WizardState, SavedTheme — the
shared type vocabulary for the Koan shell and its demos.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Persistence adapter with unit tests

**Files:**
- Create: `demo/src/lib/koan/persistence.ts`
- Create: `demo/spec/koan/persistence.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
// demo/spec/koan/persistence.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { read, write, clear } from '../../src/lib/koan/persistence'

describe('persistence', () => {
	beforeEach(() => localStorage.clear())

	it('writes and reads JSON values', () => {
		write('koan.test', { foo: 1 })
		expect(read('koan.test', (v: any) => typeof v?.foo === 'number')).toEqual({ foo: 1 })
	})

	it('returns null for missing key', () => {
		expect(read('koan.missing', () => true)).toBeNull()
	})

	it('returns null when schema check fails', () => {
		localStorage.setItem('koan.bad', JSON.stringify({ bogus: true }))
		expect(read('koan.bad', (v: any) => typeof v?.foo === 'number')).toBeNull()
	})

	it('returns null on malformed JSON', () => {
		localStorage.setItem('koan.broken', 'not-json{{{')
		expect(read('koan.broken', () => true)).toBeNull()
	})

	it('clears a key', () => {
		write('koan.test', 1)
		clear('koan.test')
		expect(localStorage.getItem('koan.test')).toBeNull()
	})

	it('handles SSR (no localStorage)', () => {
		const original = globalThis.localStorage
		// @ts-expect-error simulate SSR
		delete globalThis.localStorage
		expect(read('koan.x', () => true)).toBeNull()
		write('koan.x', 1) // should not throw
		clear('koan.x')    // should not throw
		globalThis.localStorage = original
	})
})
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd demo && bun run test:unit
```
Expected: FAIL — `persistence.ts` does not exist.

- [ ] **Step 3: Implement persistence**

```ts
// demo/src/lib/koan/persistence.ts
const hasLS = () => typeof localStorage !== 'undefined'

export function read<T>(key: string, schema: (v: unknown) => boolean): T | null {
	if (!hasLS()) return null
	const raw = localStorage.getItem(key)
	if (raw == null) return null
	try {
		const parsed = JSON.parse(raw)
		return schema(parsed) ? (parsed as T) : null
	} catch {
		return null
	}
}

export function write<T>(key: string, value: T): void {
	if (!hasLS()) return
	try {
		localStorage.setItem(key, JSON.stringify(value))
	} catch {
		// quota exceeded or serialization error — swallow
	}
}

export function clear(key: string): void {
	if (!hasLS()) return
	localStorage.removeItem(key)
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd demo && bun run test:unit
```
Expected: all 6 tests pass.

- [ ] **Step 5: Commit**

```bash
git add demo/src/lib/koan/persistence.ts demo/spec/koan/persistence.spec.ts
git commit -m "$(cat <<'EOF'
feat(demo): add Koan persistence adapter

Corruption-tolerant localStorage wrapper used by stores and the
theme wizard. SSR-safe (no-ops when localStorage is undefined).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Koan shell store with persisted history

**Files:**
- Create: `demo/src/lib/koan/store.svelte.ts`
- Create: `demo/spec/koan/store.spec.svelte.ts`

- [ ] **Step 1: Write failing tests**

```ts
// demo/spec/koan/store.spec.svelte.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { koan, recordVisit, resetSession } from '../../src/lib/koan/store.svelte'

describe('koan store', () => {
	beforeEach(() => {
		localStorage.clear()
		resetSession()
	})

	it('starts with empty state', () => {
		expect(koan.query).toBe('')
		expect(koan.history).toEqual([])
		expect(koan.activeDemoId).toBeNull()
		expect(koan.visitedThisSession.size).toBe(0)
	})

	it('recordVisit adds entry, marks visited, persists', () => {
		recordVisit('theme-wizard', 'theme')
		expect(koan.history.length).toBe(1)
		expect(koan.history[0].demoId).toBe('theme-wizard')
		expect(koan.history[0].query).toBe('theme')
		expect(koan.visitedThisSession.has('theme-wizard')).toBe(true)
		expect(koan.activeDemoId).toBe('theme-wizard')
		expect(JSON.parse(localStorage.getItem('koan.history')!)).toHaveLength(1)
	})

	it('revisit moves entry to top, no duplicate', () => {
		recordVisit('tabs', 'tabs')
		recordVisit('toasts', 'toast')
		recordVisit('tabs', 'tabs again')
		expect(koan.history.length).toBe(2)
		expect(koan.history[0].demoId).toBe('tabs')
		expect(koan.history[0].query).toBe('tabs again')
	})
})
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd demo && bun run test:unit -- store.spec
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement store**

```ts
// demo/src/lib/koan/store.svelte.ts
import type { TimelineEntry } from './types'
import { read, write } from './persistence'

const HISTORY_KEY = 'koan.history'

function loadHistory(): TimelineEntry[] {
	return (
		read<TimelineEntry[]>(HISTORY_KEY, (v) =>
			Array.isArray(v) && v.every((e: any) => typeof e?.demoId === 'string')
		) ?? []
	)
}

export const koan = $state({
	query: '',
	activeDemoId: null as string | null,
	history: loadHistory(),
	visitedThisSession: new Set<string>()
})

export function recordVisit(demoId: string, query: string) {
	koan.activeDemoId = demoId
	koan.visitedThisSession.add(demoId)
	const entry: TimelineEntry = {
		demoId,
		mountedAt: new Date().toISOString(),
		query
	}
	const filtered = koan.history.filter((e) => e.demoId !== demoId)
	koan.history = [entry, ...filtered]
	write(HISTORY_KEY, koan.history)
}

export function resetSession() {
	koan.query = ''
	koan.activeDemoId = null
	koan.history = []
	koan.visitedThisSession.clear()
	write(HISTORY_KEY, [])
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd demo && bun run test:unit -- store.spec
```
Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add demo/src/lib/koan/store.svelte.ts demo/spec/koan/store.spec.svelte.ts
git commit -m "$(cat <<'EOF'
feat(demo): add Koan shell state store

Svelte 5 $state with query, activeDemoId, history (persisted), and
session-visited set. recordVisit moves revisits to top instead of
duplicating; persists to localStorage.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Theme store (extends existing) — active/saved/draft

**Files:**
- Create: `demo/src/lib/koan/theme-store.svelte.ts`
- Create: `demo/spec/koan/theme-store.spec.svelte.ts`

- [ ] **Step 1: Write failing tests**

```ts
// demo/spec/koan/theme-store.spec.svelte.ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
	themeStore,
	saveTheme,
	setActiveTheme,
	setMode,
	saveDraft,
	clearDraft
} from '../../src/lib/koan/theme-store.svelte'
import type { WizardState } from '../../src/lib/koan/types'

const blankWizard: WizardState = {
	preset: 'zen-sumi',
	mode: 'auto',
	density: 'normal',
	roundedness: 'soft',
	name: 'Test'
}

describe('theme-store', () => {
	beforeEach(() => {
		localStorage.clear()
		themeStore.saved = []
		themeStore.active = null
		themeStore.draft = null
		themeStore.mode = 'auto'
	})

	it('saveTheme appends and persists', () => {
		saveTheme(blankWizard)
		expect(themeStore.saved.length).toBe(1)
		expect(themeStore.saved[0].name).toBe('Test')
		expect(themeStore.saved[0].id).toMatch(/^t-/)
	})

	it('setActiveTheme persists', () => {
		const t = saveTheme(blankWizard)
		setActiveTheme(t.id)
		expect(themeStore.active?.id).toBe(t.id)
		expect(localStorage.getItem('koan.theme.active')).toBe(JSON.stringify(t.id))
	})

	it('setMode persists', () => {
		setMode('dark')
		expect(themeStore.mode).toBe('dark')
		expect(localStorage.getItem('koan.mode')).toBe(JSON.stringify('dark'))
	})

	it('saveDraft and clearDraft round-trip', () => {
		saveDraft(blankWizard)
		expect(themeStore.draft?.name).toBe('Test')
		clearDraft()
		expect(themeStore.draft).toBeNull()
	})
})
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd demo && bun run test:unit -- theme-store.spec
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement theme store**

```ts
// demo/src/lib/koan/theme-store.svelte.ts
import type { SavedTheme, WizardMode, WizardState } from './types'
import { read, write, clear } from './persistence'

const KEYS = {
	active: 'koan.theme.active',
	saved: 'koan.themes',
	draft: 'koan.theme-wizard.draft',
	mode: 'koan.mode'
} as const

function loadSaved(): SavedTheme[] {
	return read<SavedTheme[]>(KEYS.saved, (v) => Array.isArray(v)) ?? []
}

function loadActive(saved: SavedTheme[]): SavedTheme | null {
	const id = read<string>(KEYS.active, (v) => typeof v === 'string')
	if (!id) return null
	return saved.find((t) => t.id === id) ?? null
}

function loadDraft(): WizardState | null {
	return read<WizardState>(KEYS.draft, (v: any) => typeof v?.preset === 'string')
}

function loadMode(): WizardMode {
	return read<WizardMode>(KEYS.mode, (v) => v === 'light' || v === 'dark' || v === 'auto') ?? 'auto'
}

const savedInit = loadSaved()

export const themeStore = $state({
	active: loadActive(savedInit),
	saved: savedInit,
	draft: loadDraft(),
	mode: loadMode() as WizardMode
})

export function saveTheme(state: WizardState): SavedTheme {
	const now = new Date().toISOString()
	const theme: SavedTheme = {
		...state,
		id: `t-${Date.now().toString(36)}`,
		createdAt: now,
		updatedAt: now
	}
	themeStore.saved = [...themeStore.saved, theme]
	write(KEYS.saved, themeStore.saved)
	return theme
}

export function setActiveTheme(id: string | null) {
	if (id == null) {
		themeStore.active = null
		clear(KEYS.active)
		return
	}
	const theme = themeStore.saved.find((t) => t.id === id) ?? null
	themeStore.active = theme
	if (theme) write(KEYS.active, id)
}

export function setMode(mode: WizardMode) {
	themeStore.mode = mode
	write(KEYS.mode, mode)
}

let draftTimer: ReturnType<typeof setTimeout> | null = null
export function saveDraft(state: WizardState) {
	themeStore.draft = state
	if (draftTimer) clearTimeout(draftTimer)
	draftTimer = setTimeout(() => write(KEYS.draft, state), 250)
}

export function clearDraft() {
	themeStore.draft = null
	if (draftTimer) clearTimeout(draftTimer)
	clear(KEYS.draft)
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd demo && bun run test:unit -- theme-store.spec
```
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add demo/src/lib/koan/theme-store.svelte.ts demo/spec/koan/theme-store.spec.svelte.ts
git commit -m "$(cat <<'EOF'
feat(demo): add Koan theme store

$state for active/saved/draft themes and runtime mode preference.
Throttled draft writes (250ms) avoid storage thrash on wizard
field-drag interactions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Demo catalog skeleton

**Files:**
- Create: `demo/src/lib/koan/catalog.ts`
- Create: `demo/spec/koan/catalog.spec.ts`

- [ ] **Step 1: Write failing tests**

```ts
// demo/spec/koan/catalog.spec.ts
import { describe, it, expect } from 'vitest'
import { catalog, miniIndex } from '../../src/lib/koan/catalog'

describe('catalog', () => {
	it('has unique demo ids', () => {
		const ids = catalog.map((d) => d.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('builds a minisearch index that finds theme by id', () => {
		const results = miniIndex.search('theme-wizard')
		expect(results[0]?.id).toBe('theme-wizard')
	})

	it('matches keyword synonyms', () => {
		const results = miniIndex.search('notification')
		expect(results.map((r) => r.id)).toContain('toasts')
	})

	it('is fuzzy enough to match typos', () => {
		const results = miniIndex.search('tabz', { fuzzy: 0.2 })
		expect(results.map((r) => r.id)).toContain('tabs')
	})
})
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd demo && bun run test:unit -- catalog.spec
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement catalog**

```ts
// demo/src/lib/koan/catalog.ts
import MiniSearch from 'minisearch'
import type { DemoMeta } from './types'

import themeWizard from './demos/theme-wizard/meta'
import tabs from './demos/tabs/meta'
import toasts from './demos/toasts/meta'

export const catalog: DemoMeta[] = [themeWizard, tabs, toasts]

export const miniIndex = new MiniSearch<DemoMeta>({
	fields: ['title', 'keywords', 'description'],
	storeFields: ['id', 'title', 'description', 'category', 'icon'],
	searchOptions: {
		boost: { title: 3, keywords: 2, description: 1 },
		fuzzy: 0.2,
		prefix: true
	},
	extractField: (doc, field) => {
		if (field === 'keywords') return doc.keywords.join(' ')
		return (doc as any)[field] ?? ''
	}
})

miniIndex.addAll(catalog)

export function findById(id: string): DemoMeta | undefined {
	return catalog.find((d) => d.id === id)
}
```

- [ ] **Step 4: Create minimal meta files (so catalog imports resolve)**

`demo/src/lib/koan/demos/theme-wizard/meta.ts`:
```ts
import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'theme-wizard',
	title: 'Theme Builder',
	description:
		'Compose a Rokkit theme: skin, density, mode, and roundedness. Save & download.',
	keywords: [
		'theme', 'themes', 'customize', 'style', 'skin', 'palette',
		'color', 'colors', 'dark', 'light', 'density', 'mode', 'design'
	],
	category: 'theme',
	icon: '染',
	load: () => import('./index.svelte')
}

export default meta
```

`demo/src/lib/koan/demos/theme-wizard/index.svelte` (placeholder, will be filled later):
```svelte
<div data-demo="theme-wizard">Theme Builder (placeholder)</div>
```

`demo/src/lib/koan/demos/tabs/meta.ts`:
```ts
import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'tabs',
	title: 'Tabs',
	description: 'Tabbed panels — horizontal, vertical, pill, and underlined orientations.',
	keywords: ['tabs', 'tab', 'tabbed', 'panels', 'sections', 'orientation', 'vertical', 'horizontal', 'switch'],
	category: 'navigation',
	icon: '章',
	load: () => import('./index.svelte')
}

export default meta
```

`demo/src/lib/koan/demos/tabs/index.svelte`:
```svelte
<div data-demo="tabs">Tabs (placeholder)</div>
```

`demo/src/lib/koan/demos/toasts/meta.ts`:
```ts
import type { DemoMeta } from '../../types'

const meta: DemoMeta = {
	id: 'toasts',
	title: 'Toasts',
	description: 'Trigger toast notifications — success, warning, error, and info variants.',
	keywords: ['toast', 'toasts', 'notification', 'notifications', 'alert', 'alerts', 'message', 'snackbar', 'banner'],
	category: 'feedback',
	icon: '報',
	load: () => import('./index.svelte')
}

export default meta
```

`demo/src/lib/koan/demos/toasts/index.svelte`:
```svelte
<div data-demo="toasts">Toasts (placeholder)</div>
```

- [ ] **Step 5: Run catalog tests, verify they pass**

```bash
cd demo && bun run test:unit -- catalog.spec
```
Expected: 4 tests pass.

- [ ] **Step 6: Commit**

```bash
git add demo/src/lib/koan/catalog.ts demo/src/lib/koan/demos demo/spec/koan/catalog.spec.ts
git commit -m "$(cat <<'EOF'
feat(demo): add Koan demo catalog + minisearch index

Three Phase 1 demos registered (theme-wizard, tabs, toasts) with
placeholder index.svelte files. Minisearch index built at module
load with fuzzy + prefix matching, boost ratios title:3 keywords:2.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Match logic ($derived from query)

**Files:**
- Create: `demo/src/lib/koan/match.svelte.ts`
- Create: `demo/spec/koan/match.spec.svelte.ts`

- [ ] **Step 1: Write failing tests**

```ts
// demo/spec/koan/match.spec.svelte.ts
import { describe, it, expect } from 'vitest'
import { runMatch } from '../../src/lib/koan/match.svelte'

describe('runMatch', () => {
	it('returns empty array for empty query', () => {
		expect(runMatch('')).toEqual([])
	})

	it('returns top matches for keyword', () => {
		const r = runMatch('theme')
		expect(r[0].id).toBe('theme-wizard')
	})

	it('returns multiple matches when query is broad', () => {
		const r = runMatch('tab')
		expect(r.length).toBeGreaterThan(0)
	})

	it('returns no-match for gibberish', () => {
		const r = runMatch('xyzzyplugh')
		expect(r).toEqual([])
	})
})
```

- [ ] **Step 2: Run test, verify it fails**

```bash
cd demo && bun run test:unit -- match.spec
```
Expected: FAIL.

- [ ] **Step 3: Implement match**

```ts
// demo/src/lib/koan/match.svelte.ts
import { catalog, miniIndex, findById } from './catalog'
import type { DemoMeta } from './types'

const MAX_RESULTS = 6

export function runMatch(query: string): DemoMeta[] {
	const q = query.trim()
	if (!q) return []
	const results = miniIndex.search(q)
	return results
		.slice(0, MAX_RESULTS)
		.map((r) => findById(r.id as string))
		.filter((d): d is DemoMeta => d !== undefined)
}

export function isStrongMatch(query: string, results: DemoMeta[]): boolean {
	if (results.length !== 1) return false
	const q = query.trim().toLowerCase()
	return results[0].title.toLowerCase() === q || results[0].id === q
}

export function nextSuggestions(visited: Set<string>): DemoMeta[] {
	const candidates = catalog.filter((d) => !visited.has(d.id))
	return candidates.slice(0, 3)
}
```

- [ ] **Step 4: Run tests, verify they pass**

```bash
cd demo && bun run test:unit -- match.spec
```
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add demo/src/lib/koan/match.svelte.ts demo/spec/koan/match.spec.svelte.ts
git commit -m "$(cat <<'EOF'
feat(demo): add Koan match helpers

runMatch wraps minisearch with top-6 cap and DemoMeta resolution.
isStrongMatch detects exact title/id queries (drives direct-mount
vs gallery decision). nextSuggestions returns unvisited demos.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: AnnotationArrow component

**Files:**
- Create: `demo/src/lib/koan/components/AnnotationArrow.svelte`

- [ ] **Step 1: Implement component**

```svelte
<!-- demo/src/lib/koan/components/AnnotationArrow.svelte -->
<script lang="ts">
	type Direction = 'right' | 'left' | 'down' | 'up' | 'curve-tl' | 'curve-tr' | 'curve-bl' | 'curve-br'

	let {
		direction = 'right',
		curve = 40,
		label = '',
		stroke = 'var(--color-accent-z5)',
		width = 160,
		height = 80
	}: {
		direction?: Direction
		curve?: number
		label?: string
		stroke?: string
		width?: number
		height?: number
	} = $props()

	const paths: Record<Direction, string> = {
		right:    `M 10 ${height / 2} Q ${width / 2} ${height / 2 - curve} ${width - 20} ${height / 2}`,
		left:     `M ${width - 10} ${height / 2} Q ${width / 2} ${height / 2 - curve} 20 ${height / 2}`,
		down:     `M ${width / 2} 10 Q ${width / 2 + curve} ${height / 2} ${width / 2} ${height - 20}`,
		up:       `M ${width / 2} ${height - 10} Q ${width / 2 - curve} ${height / 2} ${width / 2} 20`,
		'curve-tl': `M ${width - 20} 20 Q ${width / 2} ${height} 20 ${height / 2}`,
		'curve-tr': `M 20 20 Q ${width / 2} ${height} ${width - 20} ${height / 2}`,
		'curve-bl': `M ${width - 20} ${height - 20} Q ${width / 2} 0 20 ${height / 2}`,
		'curve-br': `M 20 ${height - 20} Q ${width / 2} 0 ${width - 20} ${height / 2}`
	}

	const arrowTip = $derived(() => {
		const path = paths[direction]
		const match = path.match(/([\d.]+) ([\d.]+)$/)
		return match ? { x: +match[1], y: +match[2] } : { x: 0, y: 0 }
	})
</script>

<div class="annotation" aria-hidden="true">
	<svg {width} {height} viewBox="0 0 {width} {height}" fill="none">
		<path d={paths[direction]} {stroke} stroke-width="2" stroke-linecap="round" fill="none" />
		<polygon
			points="-6,-4 0,0 -6,4"
			fill={stroke}
			transform="translate({arrowTip().x}, {arrowTip().y})"
		/>
	</svg>
	{#if label}
		<span class="label" style="color: {stroke}">{label}</span>
	{/if}
</div>

<style>
	.annotation {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}
	.label {
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 18px;
		font-weight: 500;
		white-space: nowrap;
	}
</style>
```

- [ ] **Step 2: Run lint**

```bash
bun run lint
```
Expected: zero errors related to this file.

- [ ] **Step 3: Commit**

```bash
git add demo/src/lib/koan/components/AnnotationArrow.svelte
git commit -m "$(cat <<'EOF'
feat(demo): add AnnotationArrow component

SVG hand-drawn arrow with optional Caveat-script label. 8 direction
presets (cardinal + 4 quadrant curves). Stroke color via semantic
token. Decorative (aria-hidden); pair with semantic text nearby.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: BrandMark component

**Files:**
- Create: `demo/src/lib/koan/components/BrandMark.svelte`

- [ ] **Step 1: Implement component**

```svelte
<!-- demo/src/lib/koan/components/BrandMark.svelte -->
<script lang="ts">
	let {
		glyph = '○',
		label = '',
		compact = false
	}: {
		glyph?: string
		label?: string
		compact?: boolean
	} = $props()
</script>

<div class="brand" class:compact aria-label={label}>
	<span class="glyph">{glyph}</span>
	{#if label}
		<span class="label">{label}</span>
	{/if}
</div>

<style>
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		transition:
			transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1),
			gap 500ms ease-out;
	}
	.glyph {
		font-size: 96px;
		line-height: 1;
		color: var(--color-ink-z1);
		transition: font-size 500ms cubic-bezier(0.34, 1.56, 0.64, 1);
		font-family: var(--font-display, inherit);
	}
	.label {
		font-size: 28px;
		font-weight: 500;
		color: var(--color-ink-z1);
		letter-spacing: -0.02em;
		opacity: 1;
		transition:
			font-size 500ms ease-out,
			opacity 300ms ease-out;
	}
	.compact .glyph {
		font-size: 24px;
	}
	.compact .label {
		font-size: 16px;
	}
	@media (prefers-reduced-motion: reduce) {
		.brand,
		.glyph,
		.label {
			transition: none;
		}
	}
</style>
```

- [ ] **Step 2: Run lint**

```bash
bun run lint
```
Expected: zero errors related to this file.

- [ ] **Step 3: Commit**

```bash
git add demo/src/lib/koan/components/BrandMark.svelte
git commit -m "$(cat <<'EOF'
feat(demo): add BrandMark component

Animated brand glyph + label that scales between hero (welcome) and
compact (sidebar top-left) modes via the compact prop. 500ms spring
transition; respects prefers-reduced-motion.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: EmptyState component

**Files:**
- Create: `demo/src/lib/koan/components/EmptyState.svelte`

- [ ] **Step 1: Implement component**

```svelte
<!-- demo/src/lib/koan/components/EmptyState.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		icon = '',
		title = '',
		description = '',
		action,
		annotation
	}: {
		icon?: string
		title?: string
		description?: string
		action?: Snippet
		annotation?: Snippet
	} = $props()
</script>

<div class="empty-state">
	{#if icon}
		<div class="icon">{icon}</div>
	{/if}
	{#if title}
		<h2 class="title">{title}</h2>
	{/if}
	{#if description}
		<p class="description">{description}</p>
	{/if}
	{#if action}
		<div class="action">{@render action()}</div>
	{/if}
	{#if annotation}
		<div class="annotation">{@render annotation()}</div>
	{/if}
</div>

<style>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
		padding: 48px 24px;
		text-align: center;
	}
	.icon {
		font-size: 96px;
		line-height: 1;
		color: var(--color-ink-z1);
	}
	.title {
		margin: 0;
		font-size: 24px;
		color: var(--color-ink-z1);
	}
	.description {
		margin: 0;
		max-width: 480px;
		color: var(--color-ink-z3);
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 22px;
		line-height: 1.4;
	}
	.action {
		margin-top: 16px;
	}
	.annotation {
		margin-top: 24px;
	}
</style>
```

- [ ] **Step 2: Run lint**

```bash
bun run lint
```
Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add demo/src/lib/koan/components/EmptyState.svelte
git commit -m "$(cat <<'EOF'
feat(demo): add EmptyState component

Generic empty/welcome pattern: icon, title, description (in Caveat),
plus action and annotation snippet slots. Used by Koan Welcome and
re-usable for any empty list / no-results / first-run scenario.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: ShowcaseCanvas component

**Files:**
- Create: `demo/src/lib/koan/components/ShowcaseCanvas.svelte`

- [ ] **Step 1: Implement component**

```svelte
<!-- demo/src/lib/koan/components/ShowcaseCanvas.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		grid = true,
		gridSize = 24,
		gridColor = 'var(--canvas-grid-color, color-mix(in oklch, var(--color-surface-z2), transparent 70%))',
		toolbar,
		children
	}: {
		grid?: boolean
		gridSize?: number
		gridColor?: string
		toolbar?: Snippet
		children?: Snippet
	} = $props()
</script>

<section
	class="canvas"
	class:has-grid={grid}
	style="--grid-size: {gridSize}px; --grid-color: {gridColor};"
>
	{#if toolbar}
		<div class="toolbar">{@render toolbar()}</div>
	{/if}
	<div class="content">
		{@render children?.()}
	</div>
</section>

<style>
	.canvas {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--color-surface-z1);
	}
	.canvas.has-grid {
		background-color: var(--color-surface-z1);
		background-image: radial-gradient(circle, var(--grid-color) 1px, transparent 1px);
		background-size: var(--grid-size) var(--grid-size);
	}
	.toolbar {
		flex: 0 0 auto;
		padding: 12px 24px;
		border-bottom: 1px solid var(--color-surface-z2);
		background: var(--color-surface-z1);
	}
	.content {
		flex: 1 1 auto;
		padding: 32px;
	}
</style>
```

- [ ] **Step 2: Run lint**

```bash
bun run lint
```

- [ ] **Step 3: Commit**

```bash
git add demo/src/lib/koan/components/ShowcaseCanvas.svelte
git commit -m "$(cat <<'EOF'
feat(demo): add ShowcaseCanvas component

Grid-background container for showcase/playground content. Optional
dot-grid pattern at configurable size and color, optional toolbar
slot. Reinforces the demo/sandbox feel.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: TimelineList component

**Files:**
- Create: `demo/src/lib/koan/components/TimelineList.svelte`

- [ ] **Step 1: Implement component**

```svelte
<!-- demo/src/lib/koan/components/TimelineList.svelte -->
<script lang="ts">
	type Item = { id: string; icon: string; title: string; timestamp: string }

	let {
		items = [] as Item[],
		activeId = null as string | null,
		relativeTime = true,
		onselect
	}: {
		items?: Item[]
		activeId?: string | null
		relativeTime?: boolean
		onselect?: (item: Item) => void
	} = $props()

	function formatTime(iso: string): string {
		if (!relativeTime) return new Date(iso).toLocaleTimeString()
		const diff = (Date.now() - new Date(iso).getTime()) / 1000
		if (diff < 60) return 'just now'
		if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
		if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
		return `${Math.floor(diff / 86400)}d ago`
	}
</script>

<ul class="timeline" role="list">
	{#each items as item (item.id)}
		<li>
			<button
				type="button"
				class="entry"
				class:active={item.id === activeId}
				onclick={() => onselect?.(item)}
			>
				<span class="icon">{item.icon}</span>
				<span class="title">{item.title}</span>
				<span class="time">{formatTime(item.timestamp)}</span>
			</button>
		</li>
	{/each}
</ul>

<style>
	.timeline {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.entry {
		display: grid;
		grid-template-columns: 24px 1fr auto;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 8px 10px;
		background: transparent;
		border: none;
		border-radius: var(--radius-sm, 4px);
		text-align: left;
		color: var(--color-ink-z2);
		cursor: pointer;
		font-size: 13px;
		transition: background 120ms ease;
	}
	.entry:hover {
		background: var(--color-surface-z2);
		color: var(--color-ink-z1);
	}
	.entry.active {
		background: var(--color-surface-z2);
		color: var(--color-ink-z1);
	}
	.icon {
		font-size: 16px;
		text-align: center;
		color: var(--color-ink-z3);
	}
	.title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.time {
		font-size: 11px;
		color: var(--color-ink-z4);
	}
</style>
```

- [ ] **Step 2: Run lint**

```bash
bun run lint
```

- [ ] **Step 3: Commit**

```bash
git add demo/src/lib/koan/components/TimelineList.svelte
git commit -m "$(cat <<'EOF'
feat(demo): add TimelineList component

Generic timeline entry list with icon, title, and relative timestamp.
onselect callback for click-to-restore. activeId highlights the
currently-mounted entry.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: PreviewCard component

**Files:**
- Create: `demo/src/lib/koan/components/PreviewCard.svelte`

- [ ] **Step 1: Implement component**

```svelte
<!-- demo/src/lib/koan/components/PreviewCard.svelte -->
<script lang="ts">
	let {
		icon,
		title,
		description,
		onclick
	}: {
		icon: string
		title: string
		description: string
		onclick?: () => void
	} = $props()
</script>

<button type="button" class="card" {onclick}>
	<span class="icon">{icon}</span>
	<span class="title">{title}</span>
	<span class="description">{description}</span>
	<span class="hint">tap to open</span>
</button>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 20px;
		background: var(--color-surface-z0);
		border: 1px solid var(--color-surface-z2);
		border-radius: var(--radius-md, 6px);
		text-align: left;
		color: inherit;
		cursor: pointer;
		transition:
			border-color 120ms ease,
			transform 120ms ease;
	}
	.card:hover {
		border-color: var(--color-accent-z5);
		transform: translateY(-1px);
	}
	.icon {
		font-size: 32px;
		line-height: 1;
		color: var(--color-ink-z1);
	}
	.title {
		font-size: 16px;
		font-weight: 500;
		color: var(--color-ink-z1);
	}
	.description {
		font-size: 13px;
		color: var(--color-ink-z3);
		line-height: 1.4;
		flex: 1 1 auto;
	}
	.hint {
		margin-top: 8px;
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 16px;
		color: var(--color-accent-z5);
	}
</style>
```

- [ ] **Step 2: Run lint**

```bash
bun run lint
```

- [ ] **Step 3: Commit**

```bash
git add demo/src/lib/koan/components/PreviewCard.svelte
git commit -m "$(cat <<'EOF'
feat(demo): add PreviewCard component

Default gallery card for a demo: large kanji icon, title, description,
Caveat-script tap hint. Click triggers onclick (mounts the demo).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Gallery component

**Files:**
- Create: `demo/src/lib/koan/components/Gallery.svelte`

- [ ] **Step 1: Implement component**

```svelte
<!-- demo/src/lib/koan/components/Gallery.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte'
	import PreviewCard from './PreviewCard.svelte'

	type Item = { id: string; icon: string; title: string; description: string }

	let {
		items = [] as Item[],
		breadcrumb = '',
		onpick,
		card
	}: {
		items?: Item[]
		breadcrumb?: string
		onpick?: (item: Item) => void
		card?: Snippet<[Item]>
	} = $props()
</script>

<div class="gallery">
	{#if breadcrumb}
		<p class="breadcrumb" aria-hidden="true">{breadcrumb}</p>
	{/if}
	<div class="grid">
		{#each items as item (item.id)}
			{#if card}
				{@render card(item)}
			{:else}
				<PreviewCard
					icon={item.icon}
					title={item.title}
					description={item.description}
					onclick={() => onpick?.(item)}
				/>
			{/if}
		{/each}
	</div>
</div>

<style>
	.gallery {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 1080px;
		margin: 0 auto;
	}
	.breadcrumb {
		margin: 0;
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 22px;
		color: var(--color-ink-z3);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 16px;
	}
</style>
```

- [ ] **Step 2: Run lint**

```bash
bun run lint
```

- [ ] **Step 3: Commit**

```bash
git add demo/src/lib/koan/components/Gallery.svelte
git commit -m "$(cat <<'EOF'
feat(demo): add Gallery component

Searchable card grid with PreviewCard default rendering. Optional
custom card snippet for richer per-demo previews. Caveat-script
breadcrumb describes the query context (e.g. "matches for theme").

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: ChatPanel component

**Files:**
- Create: `demo/src/lib/koan/components/ChatPanel.svelte`

- [ ] **Step 1: Implement component**

```svelte
<!-- demo/src/lib/koan/components/ChatPanel.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		query = $bindable(''),
		placeholder = 'try a topic — theme, tabs, toast…',
		brandMark,
		suggestions,
		history,
		footer,
		onsubmit
	}: {
		query?: string
		placeholder?: string
		brandMark?: Snippet
		suggestions?: Snippet
		history?: Snippet
		footer?: Snippet
		onsubmit?: (q: string) => void
	} = $props()

	let textarea = $state<HTMLTextAreaElement | undefined>()

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (query.trim()) onsubmit?.(query.trim())
		}
	}

	export function focus() {
		textarea?.focus()
	}
</script>

<aside class="chat-panel">
	{#if brandMark}
		<div class="brand-slot">{@render brandMark()}</div>
	{/if}
	<div class="input-area">
		<textarea
			bind:this={textarea}
			bind:value={query}
			{placeholder}
			rows="2"
			onkeydown={handleKeydown}
			aria-label="Type a topic to explore"
		></textarea>
	</div>
	{#if suggestions}
		<div class="suggestions">{@render suggestions()}</div>
	{/if}
	{#if history}
		<div class="history">{@render history()}</div>
	{/if}
	{#if footer}
		<div class="footer">{@render footer()}</div>
	{/if}
</aside>

<style>
	.chat-panel {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 360px;
		height: 100vh;
		padding: 20px 16px;
		background: var(--color-surface-z0);
		border-right: 1px solid var(--color-surface-z2);
		box-sizing: border-box;
	}
	.brand-slot {
		flex: 0 0 auto;
	}
	.input-area textarea {
		width: 100%;
		min-height: 56px;
		padding: 10px 12px;
		background: var(--color-surface-z1);
		border: 1px solid var(--color-surface-z2);
		border-radius: var(--radius-md, 6px);
		color: var(--color-ink-z1);
		font: inherit;
		font-size: 14px;
		resize: none;
		box-sizing: border-box;
	}
	.input-area textarea:focus {
		outline: none;
		border-color: var(--color-accent-z5);
	}
	.input-area textarea::placeholder {
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 18px;
		color: var(--color-ink-z4);
	}
	.suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.history {
		flex: 1 1 auto;
		overflow-y: auto;
	}
	.footer {
		flex: 0 0 auto;
	}
</style>
```

- [ ] **Step 2: Run lint**

```bash
bun run lint
```

- [ ] **Step 3: Commit**

```bash
git add demo/src/lib/koan/components/ChatPanel.svelte
git commit -m "$(cat <<'EOF'
feat(demo): add ChatPanel component

Chat-sidebar pattern with bindable query, brandMark/suggestions/
history/footer slots, and onsubmit callback. Enter submits;
Shift+Enter inserts newline. Caveat-script placeholder.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 18: Welcome composition (Koan-local)

**Files:**
- Create: `demo/src/lib/koan/components/Welcome.svelte`

- [ ] **Step 1: Implement component**

```svelte
<!-- demo/src/lib/koan/components/Welcome.svelte -->
<script lang="ts">
	import EmptyState from './EmptyState.svelte'
	import AnnotationArrow from './AnnotationArrow.svelte'

	let {
		query = $bindable(''),
		onsubmit
	}: {
		query?: string
		onsubmit?: (q: string) => void
	} = $props()

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (query.trim()) onsubmit?.(query.trim())
		}
	}
</script>

<div class="welcome">
	<EmptyState
		icon="○"
		description="start with a word — theme, tabs, anything"
	>
		{#snippet action()}
			<div class="input-wrap">
				<textarea
					bind:value={query}
					rows="1"
					placeholder="type here…"
					onkeydown={handleKeydown}
					aria-label="What would you like to explore?"
				></textarea>
			</div>
		{/snippet}
		{#snippet annotation()}
			<AnnotationArrow direction="curve-tl" label="press Enter" />
		{/snippet}
	</EmptyState>
</div>

<style>
	.welcome {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
	}
	.input-wrap textarea {
		width: 360px;
		min-height: 48px;
		padding: 12px 16px;
		background: var(--color-surface-z0);
		border: 1px solid var(--color-surface-z2);
		border-radius: var(--radius-md, 6px);
		color: var(--color-ink-z1);
		font: inherit;
		font-size: 16px;
		text-align: center;
		resize: none;
		box-sizing: border-box;
	}
	.input-wrap textarea:focus {
		outline: none;
		border-color: var(--color-accent-z5);
	}
	.input-wrap textarea::placeholder {
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 20px;
		color: var(--color-ink-z4);
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add demo/src/lib/koan/components/Welcome.svelte
git commit -m "$(cat <<'EOF'
feat(demo): add Welcome composition (Koan-local)

Centered enso glyph + Caveat tagline + centered chat input with a
curving Caveat-labeled arrow. Submits via Enter, no sidebar visible
in this state.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 19: Canvas router (Koan-local)

**Files:**
- Create: `demo/src/lib/koan/components/Canvas.svelte`

- [ ] **Step 1: Implement component**

```svelte
<!-- demo/src/lib/koan/components/Canvas.svelte -->
<script lang="ts">
	import ShowcaseCanvas from './ShowcaseCanvas.svelte'
	import Gallery from './Gallery.svelte'
	import { koan, recordVisit } from '../store.svelte'
	import { catalog, findById } from '../catalog'
	import { runMatch } from '../match.svelte'
	import type { Component } from 'svelte'

	const matches = $derived(runMatch(koan.query))
	const active = $derived(koan.activeDemoId ? findById(koan.activeDemoId) : null)

	let loadedComponent = $state<Component | null>(null)
	let loadingError = $state<string | null>(null)

	$effect(() => {
		loadedComponent = null
		loadingError = null
		if (!active) return
		active
			.load()
			.then((mod) => (loadedComponent = mod.default))
			.catch((err) => (loadingError = err?.message ?? 'failed to load demo'))
	})

	function backToGallery() {
		koan.activeDemoId = null
	}

	function pickGalleryItem(item: { id: string }) {
		recordVisit(item.id, koan.query)
	}

	const galleryItems = $derived(matches.length > 0 ? matches : catalog)
	const breadcrumb = $derived(
		koan.query.trim() ? `matches for "${koan.query.trim()}"` : 'all demos'
	)
</script>

<ShowcaseCanvas>
	{#snippet toolbar()}
		{#if active}
			<button type="button" class="back" onclick={backToGallery}>
				<span aria-hidden="true">←</span>
				<span>{active.title}</span>
			</button>
		{/if}
	{/snippet}
	{#if active}
		{#if loadingError}
			<p class="error">Couldn't load demo: {loadingError}</p>
		{:else if loadedComponent}
			{@const Demo = loadedComponent}
			<Demo />
		{:else}
			<p class="loading">Loading…</p>
		{/if}
	{:else}
		<Gallery items={galleryItems} {breadcrumb} onpick={pickGalleryItem} />
	{/if}
</ShowcaseCanvas>

<style>
	.back {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		background: transparent;
		border: none;
		color: var(--color-ink-z3);
		cursor: pointer;
		font: inherit;
	}
	.back:hover {
		color: var(--color-ink-z1);
	}
	.error,
	.loading {
		text-align: center;
		color: var(--color-ink-z3);
		padding: 48px;
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add demo/src/lib/koan/components/Canvas.svelte
git commit -m "$(cat <<'EOF'
feat(demo): add Canvas router (Koan-local)

Switches between gallery (matches or full catalog) and active demo
based on koan.activeDemoId. Lazy-loads demo via meta.load(). Toolbar
strip shows back-to-gallery affordance when a demo is mounted.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 20: Shell composition (two-pane layout)

**Files:**
- Create: `demo/src/lib/koan/components/Shell.svelte`

- [ ] **Step 1: Implement component**

```svelte
<!-- demo/src/lib/koan/components/Shell.svelte -->
<script lang="ts">
	import ChatPanel from './ChatPanel.svelte'
	import Canvas from './Canvas.svelte'
	import Welcome from './Welcome.svelte'
	import BrandMark from './BrandMark.svelte'
	import TimelineList from './TimelineList.svelte'
	import { koan, recordVisit } from '../store.svelte'
	import { themeStore, setMode } from '../theme-store.svelte'
	import { runMatch, isStrongMatch, nextSuggestions } from '../match.svelte'
	import { findById } from '../catalog'

	let hasInteracted = $state(koan.history.length > 0)

	const matches = $derived(runMatch(koan.query))
	const suggestions = $derived(
		koan.query.trim() ? matches.slice(0, 3) : nextSuggestions(koan.visitedThisSession)
	)

	function handleSubmit(q: string) {
		koan.query = q
		hasInteracted = true
		const m = runMatch(q)
		if (isStrongMatch(q, m)) {
			recordVisit(m[0].id, q)
		}
	}

	function pickSuggestion(id: string) {
		const demo = findById(id)
		if (!demo) return
		hasInteracted = true
		recordVisit(id, koan.query)
	}

	function selectTimeline(item: { id: string }) {
		const demo = findById(item.id)
		if (demo) recordVisit(item.id, koan.query)
	}

	const timelineItems = $derived(
		koan.history.map((h) => {
			const demo = findById(h.demoId)
			return {
				id: h.demoId,
				icon: demo?.icon ?? '○',
				title: demo?.title ?? h.demoId,
				timestamp: h.mountedAt
			}
		})
	)

	function cycleMode() {
		const order = ['light', 'dark', 'auto'] as const
		const idx = order.indexOf(themeStore.mode)
		setMode(order[(idx + 1) % order.length])
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault()
			hasInteracted = true
		}
	}}
/>

{#if !hasInteracted}
	<Welcome bind:query={koan.query} onsubmit={handleSubmit} />
{:else}
	<div class="shell">
		<ChatPanel
			bind:query={koan.query}
			onsubmit={handleSubmit}
		>
			{#snippet brandMark()}
				<BrandMark glyph="○" label="Koan" compact />
			{/snippet}
			{#snippet suggestions()}
				<div class="chips">
					{#each suggestions as s (s.id)}
						<button type="button" class="chip" onclick={() => pickSuggestion(s.id)}>
							<span aria-hidden="true">{s.icon}</span>
							<span>{s.title}</span>
						</button>
					{/each}
				</div>
			{/snippet}
			{#snippet history()}
				<TimelineList
					items={timelineItems}
					activeId={koan.activeDemoId}
					onselect={selectTimeline}
				/>
			{/snippet}
			{#snippet footer()}
				<div class="footer">
					<button type="button" class="mode" onclick={cycleMode}>
						mode: {themeStore.mode}
					</button>
					<button
						type="button"
						class="reset"
						onclick={() => {
							if (confirm('Reset Koan? Clears themes and history.')) {
								localStorage.clear()
								location.reload()
							}
						}}
					>
						reset
					</button>
				</div>
			{/snippet}
		</ChatPanel>
		<Canvas />
	</div>
{/if}

<style>
	.shell {
		display: grid;
		grid-template-columns: 360px 1fr;
		min-height: 100vh;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		background: var(--color-surface-z1);
		border: 1px solid var(--color-surface-z2);
		border-radius: 999px;
		font-size: 12px;
		color: var(--color-ink-z2);
		cursor: pointer;
	}
	.chip:hover {
		border-color: var(--color-accent-z5);
		color: var(--color-ink-z1);
	}
	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
		color: var(--color-ink-z4);
		padding-top: 8px;
		border-top: 1px solid var(--color-surface-z2);
	}
	.footer button {
		background: transparent;
		border: none;
		color: inherit;
		cursor: pointer;
		font: inherit;
	}
	.footer button:hover {
		color: var(--color-ink-z2);
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add demo/src/lib/koan/components/Shell.svelte
git commit -m "$(cat <<'EOF'
feat(demo): add Shell composition (Koan-local)

Two-pane layout with one-shot welcome → active transition. Renders
Welcome when hasInteracted is false; otherwise ChatPanel + Canvas.
Wires up suggestion chips, timeline, mode toggle, reset link, and
Cmd/Ctrl+K to focus the input.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 21: Mount Shell at root + e2e welcome state

**Files:**
- Modify: `demo/src/routes/+page.svelte`
- Create: `demo/e2e/koan/welcome.e2e.ts`

- [ ] **Step 1: Rewrite root page**

```svelte
<!-- demo/src/routes/+page.svelte -->
<script lang="ts">
	import Shell from '$lib/koan/components/Shell.svelte'
	import { koan, recordVisit } from '$lib/koan/store.svelte'
	import { onMount } from 'svelte'
	import { page } from '$app/state'

	onMount(() => {
		const params = new URL(window.location.href).searchParams
		const demoId = params.get('demo')
		const q = params.get('q')
		if (q) koan.query = q
		if (demoId) recordVisit(demoId, q ?? '')
	})
</script>

<svelte:head>
	<title>Koan — Rokkit demo</title>
</svelte:head>

<Shell />
```

- [ ] **Step 2: Write welcome e2e test**

```ts
// demo/e2e/koan/welcome.e2e.ts
import { expect, test } from '@playwright/test'

test('welcome state shows enso, tagline, and centered input; no sidebar', async ({ page }) => {
	await page.goto('/')
	await expect(page.getByText('○')).toBeVisible()
	await expect(page.getByText('start with a word')).toBeVisible()
	await expect(page.getByPlaceholder('type here…')).toBeVisible()
	await expect(page.locator('aside.chat-panel')).toHaveCount(0)
})

test('typing a query and pressing Enter migrates to active state', async ({ page }) => {
	await page.goto('/')
	const input = page.getByPlaceholder('type here…')
	await input.fill('tabs')
	await input.press('Enter')
	await expect(page.locator('aside.chat-panel')).toBeVisible()
	await expect(page.getByText('Tabs (placeholder)')).toBeVisible()
})
```

- [ ] **Step 3: Run e2e, verify it passes**

```bash
cd demo && bun run test:e2e -- koan/welcome.e2e.ts
```
Expected: both tests pass.

- [ ] **Step 4: Commit**

```bash
git add demo/src/routes/+page.svelte demo/e2e/koan/welcome.e2e.ts
git commit -m "$(cat <<'EOF'
feat(demo): mount Koan shell at root + welcome e2e

Root page mounts Shell, parses ?demo and ?q URL params on mount.
e2e verifies welcome layout (no sidebar) and the migration to active
state on Enter.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 22: Tabs demo (real content)

**Files:**
- Modify: `demo/src/lib/koan/demos/tabs/index.svelte`
- Create: `demo/e2e/koan/tabs-demo.e2e.ts`

- [ ] **Step 1: Implement Tabs demo**

```svelte
<!-- demo/src/lib/koan/demos/tabs/index.svelte -->
<script lang="ts">
	import { Tabs } from '@rokkit/ui'

	const items = [
		{ id: 'first', label: 'First', body: 'Content of the first tab.' },
		{ id: 'second', label: 'Second', body: 'Content of the second tab.' },
		{ id: 'third', label: 'Third', body: 'Content of the third tab.' }
	]
	let h = $state('first')
	let v = $state('first')
	let p = $state('first')
</script>

<section class="tabs-demo">
	<header>
		<h1>Tabs</h1>
		<p class="caption">Three orientations of the same data.</p>
	</header>

	<div class="grid">
		<article class="example">
			<h2>Horizontal (default)</h2>
			<Tabs {items} bind:value={h} fields={{ value: 'id', label: 'label' }}>
				{#snippet panel(item)}
					<p>{item.body}</p>
				{/snippet}
			</Tabs>
		</article>

		<article class="example">
			<h2>Vertical</h2>
			<Tabs {items} bind:value={v} orientation="vertical" fields={{ value: 'id', label: 'label' }}>
				{#snippet panel(item)}
					<p>{item.body}</p>
				{/snippet}
			</Tabs>
		</article>

		<article class="example">
			<h2>Pill</h2>
			<Tabs {items} bind:value={p} variant="pill" fields={{ value: 'id', label: 'label' }}>
				{#snippet panel(item)}
					<p>{item.body}</p>
				{/snippet}
			</Tabs>
		</article>
	</div>
</section>

<style>
	.tabs-demo {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 1080px;
		margin: 0 auto;
	}
	header h1 {
		margin: 0 0 4px;
	}
	.caption {
		margin: 0;
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 22px;
		color: var(--color-ink-z3);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 24px;
	}
	.example {
		padding: 16px;
		background: var(--color-surface-z0);
		border: 1px solid var(--color-surface-z2);
		border-radius: var(--radius-md, 6px);
	}
	.example h2 {
		margin: 0 0 12px;
		font-size: 14px;
		color: var(--color-ink-z3);
	}
</style>
```

- [ ] **Step 2: Write e2e**

```ts
// demo/e2e/koan/tabs-demo.e2e.ts
import { expect, test } from '@playwright/test'

test('tabs demo renders three orientations and switches panels', async ({ page }) => {
	await page.goto('/?demo=tabs')
	await expect(page.getByRole('heading', { name: 'Tabs', level: 1 })).toBeVisible()
	await expect(page.getByText('Horizontal (default)')).toBeVisible()
	await expect(page.getByText('Vertical')).toBeVisible()
	await expect(page.getByText('Pill')).toBeVisible()
	// switch in horizontal example
	const horizontal = page.locator('.example', { hasText: 'Horizontal' })
	await horizontal.getByRole('tab', { name: 'Second' }).click()
	await expect(horizontal.getByText('Content of the second tab.')).toBeVisible()
})
```

- [ ] **Step 3: Run e2e**

```bash
cd demo && bun run test:e2e -- koan/tabs-demo
```
Expected: pass. (If `Tabs` panel snippet API differs in `@rokkit/ui`, adjust the snippet name/usage to match the current API — check `packages/ui/src/Tabs.svelte` for the canonical snippet name.)

- [ ] **Step 4: Commit**

```bash
git add demo/src/lib/koan/demos/tabs demo/e2e/koan/tabs-demo.e2e.ts
git commit -m "$(cat <<'EOF'
feat(demo): tabs demo content + e2e

Three side-by-side examples (horizontal, vertical, pill) demonstrating
Tabs orientations. Caveat caption.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 23: Toasts demo (real content)

**Files:**
- Modify: `demo/src/lib/koan/demos/toasts/index.svelte`
- Create: `demo/e2e/koan/toasts-demo.e2e.ts`

- [ ] **Step 1: Implement Toasts demo**

```svelte
<!-- demo/src/lib/koan/demos/toasts/index.svelte -->
<script lang="ts">
	import { Button, Toast, ToastProvider, toast } from '@rokkit/ui'
	// NOTE: If the @rokkit/ui Toast API uses a different name (e.g. addToast),
	// substitute that here. Check packages/ui/src/Toast.svelte for the canonical
	// trigger function and provider component.
</script>

<ToastProvider>
	<section class="toasts-demo">
		<header>
			<h1>Toasts</h1>
			<p class="caption">Trigger one of each tone.</p>
		</header>

		<div class="actions">
			<Button onclick={() => toast.success('Saved successfully.')}>Show success</Button>
			<Button onclick={() => toast.warning('Heads up — check inputs.')}>Show warning</Button>
			<Button onclick={() => toast.error('Something went wrong.')}>Show error</Button>
			<Button onclick={() => toast.info('Heads up — new release.')}>Show info</Button>
		</div>

		<p class="hint">toasts auto-dismiss after 4s — click × to dismiss early</p>
	</section>
</ToastProvider>

<style>
	.toasts-demo {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 720px;
		margin: 0 auto;
	}
	header h1 {
		margin: 0 0 4px;
	}
	.caption {
		margin: 0;
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 22px;
		color: var(--color-ink-z3);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}
	.hint {
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 18px;
		color: var(--color-ink-z3);
	}
</style>
```

- [ ] **Step 2: Verify Toast API matches**

Before committing, open `packages/ui/src/Toast*.svelte` and `packages/ui/src/index.js` to confirm the exported names. If `toast.success` doesn't exist, substitute the actual function/method (likely `addToast({ tone: 'success', message: '…' })` or similar). Update the demo accordingly. **Do not commit code that references a non-existent export.**

- [ ] **Step 3: Write e2e**

```ts
// demo/e2e/koan/toasts-demo.e2e.ts
import { expect, test } from '@playwright/test'

test('toasts demo shows buttons and fires toasts', async ({ page }) => {
	await page.goto('/?demo=toasts')
	await expect(page.getByRole('heading', { name: 'Toasts', level: 1 })).toBeVisible()
	await page.getByRole('button', { name: 'Show success' }).click()
	await expect(page.getByText('Saved successfully.')).toBeVisible()
})
```

- [ ] **Step 4: Run e2e**

```bash
cd demo && bun run test:e2e -- koan/toasts-demo
```
Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add demo/src/lib/koan/demos/toasts demo/e2e/koan/toasts-demo.e2e.ts
git commit -m "$(cat <<'EOF'
feat(demo): toasts demo content + e2e

Four trigger buttons for success/warning/error/info tones inside a
ToastProvider. Caveat caption + dismiss hint.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 24: Theme wizard — preset card (StepStart)

**Files:**
- Create: `demo/src/lib/koan/demos/theme-wizard/StepStart.svelte`

- [ ] **Step 1: Implement step component**

```svelte
<!-- demo/src/lib/koan/demos/theme-wizard/StepStart.svelte -->
<script lang="ts">
	import type { WizardState } from '../../types'

	const presets = [
		{ id: 'zen-sumi', name: 'Zen-Sumi', swatches: ['#0d0d0c', '#e2dfd6', '#9c4736', '#557b78', '#5a4a8a'] },
		{ id: 'minimal',  name: 'Minimal',  swatches: ['#1a1a1a', '#f8f8f8', '#1f6feb', '#0e8a4a', '#d35400'] },
		{ id: 'ocean',    name: 'Ocean',    swatches: ['#0d1b2a', '#e0fbfc', '#3a86ff', '#06d6a0', '#118ab2'] },
		{ id: 'violet',   name: 'Violet',   swatches: ['#1a1230', '#f0eaff', '#7c3aed', '#a855f7', '#c084fc'] },
		{ id: 'rose',     name: 'Rose',     swatches: ['#291015', '#fff1f3', '#e11d48', '#f43f5e', '#fb7185'] },
		{ id: 'emerald',  name: 'Emerald',  swatches: ['#022c22', '#ecfdf5', '#059669', '#10b981', '#34d399'] }
	]

	let { state = $bindable<WizardState>() }: { state?: WizardState } = $props()
</script>

<section class="step">
	<h2>Pick a starting point</h2>
	<div class="grid">
		{#each presets as p (p.id)}
			<button
				type="button"
				class="card"
				class:selected={state.preset === p.id}
				onclick={() => (state.preset = p.id)}
				aria-pressed={state.preset === p.id}
			>
				<span class="name">{p.name}</span>
				<span class="swatches">
					{#each p.swatches as c}
						<span class="swatch" style="background: {c}"></span>
					{/each}
				</span>
				<span class="aa">Aa</span>
			</button>
		{/each}
	</div>
</section>

<style>
	.step h2 {
		margin: 0 0 16px;
		font-size: 18px;
		color: var(--color-ink-z1);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 12px;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		background: var(--color-surface-z0);
		border: 1px solid var(--color-surface-z2);
		border-radius: var(--radius-md, 6px);
		text-align: left;
		cursor: pointer;
	}
	.card:hover {
		border-color: var(--color-accent-z5);
	}
	.card.selected {
		border-color: var(--color-primary-z5);
		box-shadow: 0 0 0 2px var(--color-primary-z5);
	}
	.name {
		font-size: 14px;
		font-weight: 500;
		color: var(--color-ink-z1);
	}
	.swatches {
		display: flex;
		gap: 4px;
	}
	.swatch {
		width: 24px;
		height: 24px;
		border-radius: var(--radius-sm, 4px);
		border: 1px solid var(--color-surface-z2);
	}
	.aa {
		font-size: 24px;
		color: var(--color-ink-z3);
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add demo/src/lib/koan/demos/theme-wizard/StepStart.svelte
git commit -m "$(cat <<'EOF'
feat(demo): theme wizard step 1 — preset picker

Six preset cards (zen-sumi, minimal, ocean, violet, rose, emerald)
with name, 5-swatch strip, and Aa sample. Two-way binds the preset
to state.preset.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 25: Theme wizard — PreviewPane

**Files:**
- Create: `demo/src/lib/koan/demos/theme-wizard/PreviewPane.svelte`

- [ ] **Step 1: Implement preview pane**

```svelte
<!-- demo/src/lib/koan/demos/theme-wizard/PreviewPane.svelte -->
<script lang="ts">
	import { Button, Card } from '@rokkit/ui'
	import type { WizardState } from '../../types'

	let { state }: { state: WizardState } = $props()
</script>

<div
	class="preview"
	data-density={state.density}
	data-radius={state.roundedness}
	data-mode={state.mode}
>
	<div class="row">
		<Button>Primary</Button>
		<Button style="outline">Outline</Button>
		<Button style="ghost">Ghost</Button>
	</div>
	<Card>
		<h3>Sample card</h3>
		<p>Density: {state.density} · Rounded: {state.roundedness} · Mode: {state.mode}</p>
	</Card>
	<label class="field">
		<span>Sample input</span>
		<input type="text" placeholder="type here…" />
	</label>
</div>

<style>
	.preview {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		background: var(--color-surface-z0);
		border: 1px solid var(--color-surface-z2);
		border-radius: var(--radius-md, 6px);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 12px;
		color: var(--color-ink-z3);
	}
	.field input {
		padding: 6px 10px;
		background: var(--color-surface-z1);
		border: 1px solid var(--color-surface-z2);
		border-radius: var(--radius-sm, 4px);
		color: var(--color-ink-z1);
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add demo/src/lib/koan/demos/theme-wizard/PreviewPane.svelte
git commit -m "$(cat <<'EOF'
feat(demo): theme wizard preview pane

Live sample (button row, card, input) that responds to density,
roundedness, and mode selections via data-* attributes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 26: Theme wizard — StepTune (chips)

**Files:**
- Create: `demo/src/lib/koan/demos/theme-wizard/StepTune.svelte`

- [ ] **Step 1: Implement step**

```svelte
<!-- demo/src/lib/koan/demos/theme-wizard/StepTune.svelte -->
<script lang="ts">
	import type { WizardState } from '../../types'
	import PreviewPane from './PreviewPane.svelte'

	let { state = $bindable<WizardState>() }: { state?: WizardState } = $props()

	const modes = ['light', 'dark', 'auto'] as const
	const densities = ['compact', 'normal', 'comfortable'] as const
	const radii = ['sharp', 'soft', 'rounded', 'pill'] as const
</script>

<section class="step">
	<h2>Tune mode, density, and roundedness</h2>
	<div class="layout">
		<div class="controls">
			<fieldset>
				<legend>Mode</legend>
				<div class="chips">
					{#each modes as m}
						<button
							type="button"
							class="chip"
							class:selected={state.mode === m}
							onclick={() => (state.mode = m)}
							aria-pressed={state.mode === m}
						>{m}</button>
					{/each}
				</div>
			</fieldset>
			<fieldset>
				<legend>Density</legend>
				<div class="chips">
					{#each densities as d}
						<button
							type="button"
							class="chip"
							class:selected={state.density === d}
							onclick={() => (state.density = d)}
							aria-pressed={state.density === d}
						>{d}</button>
					{/each}
				</div>
			</fieldset>
			<fieldset>
				<legend>Roundedness</legend>
				<div class="chips">
					{#each radii as r}
						<button
							type="button"
							class="chip"
							class:selected={state.roundedness === r}
							onclick={() => (state.roundedness = r)}
							aria-pressed={state.roundedness === r}
						>{r}</button>
					{/each}
				</div>
			</fieldset>
		</div>
		<PreviewPane {state} />
	</div>
</section>

<style>
	.step h2 {
		margin: 0 0 16px;
	}
	.layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
	}
	@media (max-width: 800px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
	.controls {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	fieldset {
		border: 1px solid var(--color-surface-z2);
		padding: 12px;
		border-radius: var(--radius-md, 6px);
	}
	legend {
		padding: 0 6px;
		font-size: 12px;
		color: var(--color-ink-z3);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chip {
		padding: 4px 12px;
		background: var(--color-surface-z1);
		border: 1px solid var(--color-surface-z2);
		border-radius: 999px;
		color: var(--color-ink-z2);
		cursor: pointer;
	}
	.chip.selected {
		background: var(--color-primary-z5);
		color: var(--color-surface-z0);
		border-color: var(--color-primary-z5);
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add demo/src/lib/koan/demos/theme-wizard/StepTune.svelte
git commit -m "$(cat <<'EOF'
feat(demo): theme wizard step 2 — tune chips + preview

Three chip groups (mode, density, roundedness) with single-value
selection and live preview pane reacting to picks.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 27: Theme wizard — DownloadModal

**Files:**
- Create: `demo/src/lib/koan/components/DownloadModal.svelte`

- [ ] **Step 1: Implement modal**

```svelte
<!-- demo/src/lib/koan/components/DownloadModal.svelte -->
<script lang="ts">
	import { Modal, Tabs, Button } from '@rokkit/ui'
	import type { SavedTheme } from '../types'

	let {
		open = $bindable(false),
		theme
	}: {
		open?: boolean
		theme: SavedTheme
	} = $props()

	let format = $state<'config' | 'css'>('config')

	function configSnippet(t: SavedTheme): string {
		return `// rokkit.config.js
export default {
  name: '${t.name}',
  preset: '${t.preset}',
  mode: '${t.mode}',
  density: '${t.density}',
  shape: { radius: '${t.roundedness}' }
}
`
	}

	function cssSnippet(t: SavedTheme): string {
		return `:root[data-radius="${t.roundedness}"][data-density="${t.density}"][data-mode="${t.mode}"] {
  /* theme: ${t.name} (preset: ${t.preset}) */
}
`
	}

	const content = $derived(format === 'config' ? configSnippet(theme) : cssSnippet(theme))

	async function copy() {
		await navigator.clipboard.writeText(content)
	}

	function download() {
		const blob = new Blob([content], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}.${format === 'config' ? 'rokkit.config.js' : 'theme.css'}`
		a.click()
		URL.revokeObjectURL(url)
	}
</script>

<Modal bind:open>
	<div class="download">
		<h2>Download "{theme.name}"</h2>
		<Tabs
			items={[
				{ id: 'config', label: 'rokkit.config.js' },
				{ id: 'css', label: 'CSS variables' }
			]}
			bind:value={format}
			fields={{ value: 'id', label: 'label' }}
		>
			{#snippet panel()}
				<pre><code>{content}</code></pre>
			{/snippet}
		</Tabs>
		<div class="actions">
			<Button onclick={copy}>Copy</Button>
			<Button onclick={download}>Download file</Button>
			<Button style="outline" onclick={() => (open = false)}>Close</Button>
		</div>
	</div>
</Modal>

<style>
	.download {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 480px;
	}
	.download h2 {
		margin: 0;
	}
	pre {
		background: var(--color-surface-z1);
		border: 1px solid var(--color-surface-z2);
		border-radius: var(--radius-sm, 4px);
		padding: 12px;
		overflow-x: auto;
		font-size: 12px;
		color: var(--color-ink-z2);
	}
	.actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
	}
</style>
```

NOTE: If `@rokkit/ui` doesn't export `Modal`, substitute the actual exported overlay (e.g. `Dialog`, `Sheet`, or wrap with a custom overlay). Verify against `packages/ui/src/index.js`.

- [ ] **Step 2: Commit**

```bash
git add demo/src/lib/koan/components/DownloadModal.svelte
git commit -m "$(cat <<'EOF'
feat(demo): theme wizard download modal

Modal with Tabs toggling rokkit.config.js snippet vs CSS variables.
Copy-to-clipboard and file-download actions.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 28: Theme wizard — StepSave

**Files:**
- Create: `demo/src/lib/koan/demos/theme-wizard/StepSave.svelte`

- [ ] **Step 1: Implement step**

```svelte
<!-- demo/src/lib/koan/demos/theme-wizard/StepSave.svelte -->
<script lang="ts">
	import { Button } from '@rokkit/ui'
	import DownloadModal from '../../components/DownloadModal.svelte'
	import type { SavedTheme, WizardState } from '../../types'
	import { saveTheme, setActiveTheme } from '../../theme-store.svelte'

	let {
		state = $bindable<WizardState>(),
		onsaved
	}: {
		state?: WizardState
		onsaved?: (t: SavedTheme) => void
	} = $props()

	let saved = $state<SavedTheme | null>(null)
	let downloadOpen = $state(false)
	let error = $state('')

	function persist() {
		if (!state.name.trim()) {
			error = 'Name is required.'
			return
		}
		error = ''
		const theme = saveTheme(state)
		saved = theme
		setActiveTheme(theme.id)
		onsaved?.(theme)
	}
</script>

<section class="step">
	<h2>Name and save</h2>
	<label class="field">
		<span>Theme name</span>
		<input
			type="text"
			bind:value={state.name}
			placeholder="e.g. My Theme"
			aria-required="true"
		/>
	</label>
	{#if error}
		<p class="error">{error}</p>
	{/if}
	<div class="actions">
		<Button onclick={persist}>Save</Button>
		<Button style="outline" disabled={!saved} onclick={() => (downloadOpen = true)}>
			Download
		</Button>
	</div>
	{#if saved}
		<DownloadModal bind:open={downloadOpen} theme={saved} />
	{/if}
</section>

<style>
	.step h2 {
		margin: 0 0 16px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		max-width: 360px;
	}
	.field input {
		padding: 8px 12px;
		background: var(--color-surface-z1);
		border: 1px solid var(--color-surface-z2);
		border-radius: var(--radius-md, 6px);
		color: var(--color-ink-z1);
		font: inherit;
	}
	.error {
		margin: 0;
		color: var(--color-danger-z5);
		font-size: 13px;
	}
	.actions {
		display: flex;
		gap: 12px;
		margin-top: 16px;
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add demo/src/lib/koan/demos/theme-wizard/StepSave.svelte
git commit -m "$(cat <<'EOF'
feat(demo): theme wizard step 3 — save + download

Name field with required validation, Save (persists to localStorage
+ sets active), and Download (opens DownloadModal). onsaved callback
notifies the wizard wrapper.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 29: Theme wizard — main index.svelte

**Files:**
- Modify: `demo/src/lib/koan/demos/theme-wizard/index.svelte`

- [ ] **Step 1: Implement wizard router**

```svelte
<!-- demo/src/lib/koan/demos/theme-wizard/index.svelte -->
<script lang="ts">
	import { Stepper } from '@rokkit/ui'
	import { Button } from '@rokkit/ui'
	import StepStart from './StepStart.svelte'
	import StepTune from './StepTune.svelte'
	import StepSave from './StepSave.svelte'
	import type { WizardState } from '../../types'
	import { themeStore, saveDraft, clearDraft, setActiveTheme } from '../../theme-store.svelte'

	const steps = [
		{ id: 'start', label: 'Start' },
		{ id: 'tune', label: 'Tune' },
		{ id: 'save', label: 'Save' }
	]

	let stepIdx = $state(0)

	function makeBlank(): WizardState {
		return {
			preset: 'zen-sumi',
			mode: 'auto',
			density: 'normal',
			roundedness: 'soft',
			name: `My Theme ${themeStore.saved.length + 1}`
		}
	}

	let state = $state<WizardState>(themeStore.draft ?? makeBlank())

	$effect(() => {
		saveDraft($state.snapshot(state))
	})

	$effect(() => {
		// Apply the wizard state live by writing data-* attrs on the html element
		document.documentElement.dataset.mode = state.mode
		document.documentElement.dataset.density = state.density
		document.documentElement.dataset.radius = state.roundedness
		document.documentElement.dataset.skin = state.preset
	})
</script>

<section class="wizard">
	<Stepper {steps} bind:value={stepIdx} fields={{ value: 'id', label: 'label' }} />

	{#if stepIdx === 0}
		<StepStart bind:state />
	{:else if stepIdx === 1}
		<StepTune bind:state />
	{:else}
		<StepSave
			bind:state
			onsaved={(t) => {
				setActiveTheme(t.id)
				clearDraft()
			}}
		/>
	{/if}

	<div class="nav">
		<Button
			style="outline"
			disabled={stepIdx === 0}
			onclick={() => (stepIdx = Math.max(0, stepIdx - 1))}
		>
			Back
		</Button>
		<Button
			disabled={stepIdx === steps.length - 1}
			onclick={() => (stepIdx = Math.min(steps.length - 1, stepIdx + 1))}
		>
			Next
		</Button>
	</div>
</section>

<style>
	.wizard {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 980px;
		margin: 0 auto;
	}
	.nav {
		display: flex;
		justify-content: space-between;
		gap: 8px;
	}
</style>
```

NOTE: Verify `Stepper` is the correct export name in `@rokkit/ui` (could be `StepIndicator` per the project docs). Use whichever is the active component.

- [ ] **Step 2: Commit**

```bash
git add demo/src/lib/koan/demos/theme-wizard/index.svelte
git commit -m "$(cat <<'EOF'
feat(demo): theme wizard main router

Stepper-driven 3-step wizard (Start → Tune → Save). Throttled draft
persistence, live application via document.documentElement.dataset
attrs, back/next nav. Restores from saved draft on mount.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 30: Theme wizard e2e

**Files:**
- Create: `demo/e2e/koan/theme-wizard.e2e.ts`

- [ ] **Step 1: Write e2e**

```ts
// demo/e2e/koan/theme-wizard.e2e.ts
import { expect, test } from '@playwright/test'

test('theme wizard walkthrough: pick preset → tune → save → restyles page', async ({ page }) => {
	await page.goto('/?demo=theme-wizard')
	// Step 1 — pick preset
	await page.getByRole('button', { name: 'Violet' }).click()
	await page.getByRole('button', { name: 'Next' }).click()
	// Step 2 — pick density
	await page.getByRole('button', { name: 'compact', exact: true }).click()
	await page.getByRole('button', { name: 'rounded', exact: true }).click()
	await page.getByRole('button', { name: 'Next' }).click()
	// Step 3 — name + save
	const name = page.getByLabel('Theme name')
	await name.fill('Playwright Theme')
	await page.getByRole('button', { name: 'Save' }).click()
	// Verify applied
	await expect(page.locator('html')).toHaveAttribute('data-skin', 'violet')
	await expect(page.locator('html')).toHaveAttribute('data-density', 'compact')
	await expect(page.locator('html')).toHaveAttribute('data-radius', 'rounded')
})

test('refreshing after save keeps the active theme applied', async ({ page }) => {
	await page.goto('/?demo=theme-wizard')
	await page.getByRole('button', { name: 'Emerald' }).click()
	await page.getByRole('button', { name: 'Next' }).click()
	await page.getByRole('button', { name: 'Next' }).click()
	await page.getByLabel('Theme name').fill('Persist Me')
	await page.getByRole('button', { name: 'Save' }).click()
	await page.reload()
	await expect(page.locator('html')).toHaveAttribute('data-skin', 'emerald')
})
```

- [ ] **Step 2: Run e2e**

```bash
cd demo && bun run test:e2e -- koan/theme-wizard
```
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add demo/e2e/koan/theme-wizard.e2e.ts
git commit -m "$(cat <<'EOF'
test(demo): theme wizard e2e — walkthrough + persistence

Verifies preset pick → tune → save flow applies CSS data-* attrs and
that the active theme survives a page reload.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 31: Timeline e2e — visited demos persist and restore

**Files:**
- Create: `demo/e2e/koan/timeline.e2e.ts`

- [ ] **Step 1: Write e2e**

```ts
// demo/e2e/koan/timeline.e2e.ts
import { expect, test } from '@playwright/test'

test('timeline records visited demos and allows restoration', async ({ page }) => {
	await page.goto('/')
	const input = page.getByPlaceholder('type here…')
	await input.fill('tabs')
	await input.press('Enter')
	await expect(page.getByText('Tabs', { exact: false })).toBeVisible()
	// Now navigate via chip in sidebar to toasts
	await page.getByRole('button', { name: /Toasts/ }).first().click()
	await expect(page.getByRole('heading', { name: 'Toasts', level: 1 })).toBeVisible()
	// Timeline should now have both
	await expect(page.locator('.timeline .entry')).toHaveCount(2)
})

test('timeline survives reload', async ({ page }) => {
	await page.goto('/?demo=tabs')
	await page.reload()
	await expect(page.locator('aside.chat-panel')).toBeVisible()
	await expect(page.locator('.timeline .entry')).toHaveCount(1)
})
```

- [ ] **Step 2: Run e2e**

```bash
cd demo && bun run test:e2e -- koan/timeline
```
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add demo/e2e/koan/timeline.e2e.ts
git commit -m "$(cat <<'EOF'
test(demo): timeline e2e — record visited + survive reload

Verifies timeline accumulates as user explores, and history persists
across page reload (sidebar starts populated, no welcome migration).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 32: Deep-link e2e

**Files:**
- Create: `demo/e2e/koan/deep-link.e2e.ts`

- [ ] **Step 1: Write e2e**

```ts
// demo/e2e/koan/deep-link.e2e.ts
import { expect, test } from '@playwright/test'

test('?demo=tabs skips welcome, mounts tabs', async ({ page }) => {
	await page.goto('/?demo=tabs')
	await expect(page.getByRole('heading', { name: 'Tabs', level: 1 })).toBeVisible()
	await expect(page.locator('aside.chat-panel')).toBeVisible()
})

test('?q=theme prefills query and shows gallery', async ({ page }) => {
	await page.goto('/?q=theme')
	await expect(page.locator('aside.chat-panel')).toBeVisible()
	await expect(page.getByText('matches for "theme"')).toBeVisible()
	await expect(page.getByRole('button', { name: /Theme Builder/ })).toBeVisible()
})
```

- [ ] **Step 2: Run e2e**

```bash
cd demo && bun run test:e2e -- koan/deep-link
```
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add demo/e2e/koan/deep-link.e2e.ts
git commit -m "$(cat <<'EOF'
test(demo): deep-link e2e — ?demo and ?q URL params

Verifies ?demo=<id> skips welcome and mounts the demo, and ?q=<query>
shows the gallery with prefilled query.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 33: Keyboard navigation e2e

**Files:**
- Create: `demo/e2e/koan/keyboard.e2e.ts`

- [ ] **Step 1: Write e2e**

```ts
// demo/e2e/koan/keyboard.e2e.ts
import { expect, test } from '@playwright/test'

test('Cmd+K focuses chat input from anywhere', async ({ page, browserName }) => {
	await page.goto('/?demo=tabs')
	const modifier = process.platform === 'darwin' ? 'Meta' : 'Control'
	await page.keyboard.press(`${modifier}+k`)
	const input = page.locator('aside.chat-panel textarea')
	await expect(input).toBeFocused()
})

test('Enter on chat input submits query', async ({ page }) => {
	await page.goto('/?demo=tabs')
	const input = page.locator('aside.chat-panel textarea')
	await input.fill('toast')
	await input.press('Enter')
	// strong match → mounts directly
	await expect(page.getByRole('heading', { name: 'Toasts', level: 1 })).toBeVisible()
})
```

- [ ] **Step 2: Run e2e**

```bash
cd demo && bun run test:e2e -- koan/keyboard
```
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add demo/e2e/koan/keyboard.e2e.ts
git commit -m "$(cat <<'EOF'
test(demo): keyboard e2e — Cmd+K focus + Enter submit

Verifies the global Cmd/Ctrl+K shortcut focuses the chat input from
any state, and that Enter on the input triggers match/mount.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 34: Reduced-motion e2e

**Files:**
- Create: `demo/e2e/koan/reduced-motion.e2e.ts`

- [ ] **Step 1: Write e2e**

```ts
// demo/e2e/koan/reduced-motion.e2e.ts
import { expect, test } from '@playwright/test'

test.use({ reducedMotion: 'reduce' })

test('brand mark renders without transition when reduced-motion is set', async ({ page }) => {
	await page.goto('/')
	await page.getByPlaceholder('type here…').fill('tabs')
	await page.getByPlaceholder('type here…').press('Enter')
	const brand = page.locator('.brand-slot .brand')
	await expect(brand).toBeVisible()
	const transition = await brand.evaluate((el) => getComputedStyle(el).transitionProperty)
	expect(transition).toBe('none')
})
```

- [ ] **Step 2: Run e2e**

```bash
cd demo && bun run test:e2e -- koan/reduced-motion
```
Expected: pass.

- [ ] **Step 3: Commit**

```bash
git add demo/e2e/koan/reduced-motion.e2e.ts
git commit -m "$(cat <<'EOF'
test(demo): reduced-motion e2e — brand-mark transition disabled

Verifies that prefers-reduced-motion: reduce removes the brand-mark
transition (instant state change instead of 500ms spring).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 35: Flash-prevention hook — apply active theme before hydration

**Files:**
- Modify: `demo/src/app.html`

- [ ] **Step 1: Read current `app.html`**

Inspect `demo/src/app.html` to find the existing flash-prevention inline script (per commit `3cba1a04`). It currently reads density/skin/style and applies to `document.body.dataset`.

- [ ] **Step 2: Extend the script to read Koan keys**

Replace or extend the existing inline `<script>` in the `<head>` of `demo/src/app.html`:

```html
<script>
	(function () {
		try {
			const mode = JSON.parse(localStorage.getItem('koan.mode') ?? '"auto"')
			document.documentElement.dataset.mode = mode
			const activeId = JSON.parse(localStorage.getItem('koan.theme.active') ?? 'null')
			if (activeId) {
				const themes = JSON.parse(localStorage.getItem('koan.themes') ?? '[]')
				const t = themes.find((x) => x.id === activeId)
				if (t) {
					document.documentElement.dataset.skin = t.preset
					document.documentElement.dataset.density = t.density
					document.documentElement.dataset.radius = t.roundedness
					document.documentElement.dataset.mode = t.mode === 'auto' ? mode : t.mode
				}
			}
		} catch (e) {
			/* ignore — defaults will apply */
		}
	})()
</script>
```

Ensure this runs **before** any `app.css` import (the existing script likely is already positioned correctly; extend in place rather than relocating).

- [ ] **Step 3: e2e verifies flash-prevention**

Append to `demo/e2e/koan/deep-link.e2e.ts`:

```ts
test('flash prevention applies saved theme before hydration', async ({ page }) => {
	// Pre-seed an active theme via initial-state injection
	await page.addInitScript(() => {
		const theme = {
			id: 't-seed', name: 'Seed', preset: 'rose',
			mode: 'light', density: 'compact', roundedness: 'pill',
			createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
		}
		localStorage.setItem('koan.themes', JSON.stringify([theme]))
		localStorage.setItem('koan.theme.active', JSON.stringify('t-seed'))
	})
	await page.goto('/')
	// On first paint, before JS hydrates further, html should already have the data attrs
	await expect(page.locator('html')).toHaveAttribute('data-skin', 'rose')
	await expect(page.locator('html')).toHaveAttribute('data-density', 'compact')
})
```

- [ ] **Step 4: Run e2e**

```bash
cd demo && bun run test:e2e -- koan/deep-link
```
Expected: pass (3 tests including the new flash-prevention case).

- [ ] **Step 5: Commit**

```bash
git add demo/src/app.html demo/e2e/koan/deep-link.e2e.ts
git commit -m "$(cat <<'EOF'
feat(demo): extend flash-prevention to apply Koan active theme

Inline script in app.html now reads koan.theme.active and the
matching saved theme from koan.themes, then applies skin/density/
radius/mode data-* attrs to documentElement before SvelteKit
hydrates. e2e verifies attributes are present on first paint.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 36: Recovery toast for broken/missing theme

**Files:**
- Modify: `demo/src/routes/+page.svelte`

- [ ] **Step 1: Add recovery logic**

```svelte
<!-- demo/src/routes/+page.svelte -->
<script lang="ts">
	import Shell from '$lib/koan/components/Shell.svelte'
	import { koan, recordVisit } from '$lib/koan/store.svelte'
	import { themeStore, setActiveTheme } from '$lib/koan/theme-store.svelte'
	import { catalog } from '$lib/koan/catalog'
	import { onMount } from 'svelte'

	// Note: substitute with whichever toast API @rokkit/ui exposes.
	import { toast } from '@rokkit/ui'

	onMount(() => {
		const params = new URL(window.location.href).searchParams
		const demoId = params.get('demo')
		const q = params.get('q')
		if (q) koan.query = q
		if (demoId) recordVisit(demoId, q ?? '')
		if (themeStore.active) {
			const knownPresets = ['zen-sumi', 'minimal', 'ocean', 'violet', 'rose', 'emerald']
			if (!knownPresets.includes(themeStore.active.preset)) {
				const broken = themeStore.active
				setActiveTheme(null)
				toast.warning?.(`Theme "${broken.name}" couldn't load — opening Theme Builder.`)
				recordVisit('theme-wizard', '')
			}
		}
	})
</script>

<svelte:head>
	<title>Koan — Rokkit demo</title>
</svelte:head>

<Shell />
```

- [ ] **Step 2: e2e verifies recovery**

Append to `demo/e2e/koan/theme-wizard.e2e.ts`:

```ts
test('broken theme triggers recovery toast and opens wizard', async ({ page }) => {
	await page.addInitScript(() => {
		const theme = {
			id: 't-broken', name: 'Broken', preset: 'nonexistent-skin',
			mode: 'light', density: 'normal', roundedness: 'soft',
			createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
		}
		localStorage.setItem('koan.themes', JSON.stringify([theme]))
		localStorage.setItem('koan.theme.active', JSON.stringify('t-broken'))
	})
	await page.goto('/')
	await expect(page.getByText('Theme Builder')).toBeVisible()
	await expect(page.getByText(/couldn['']t load/)).toBeVisible()
})
```

- [ ] **Step 3: Run e2e**

```bash
cd demo && bun run test:e2e -- koan/theme-wizard
```
Expected: pass (all wizard tests including recovery).

- [ ] **Step 4: Commit**

```bash
git add demo/src/routes/+page.svelte demo/e2e/koan/theme-wizard.e2e.ts
git commit -m "$(cat <<'EOF'
feat(demo): recovery toast + wizard open for broken theme

On boot, if the active saved theme references a preset not in the
known set, surface a warning toast and auto-open Theme Builder for
repair. e2e covers the scenario.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 37: Wizard state derivation unit tests

**Files:**
- Create: `demo/spec/koan/wizard-state.spec.ts`

- [ ] **Step 1: Write tests**

```ts
// demo/spec/koan/wizard-state.spec.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { saveTheme, themeStore, setActiveTheme } from '../../src/lib/koan/theme-store.svelte'

describe('wizard → SavedTheme', () => {
	beforeEach(() => {
		localStorage.clear()
		themeStore.saved = []
		themeStore.active = null
	})

	it('saveTheme produces a SavedTheme with id and timestamps', () => {
		const t = saveTheme({
			preset: 'zen-sumi', mode: 'auto', density: 'normal',
			roundedness: 'soft', name: 'X'
		})
		expect(t.id).toMatch(/^t-/)
		expect(t.createdAt).toBeTruthy()
		expect(t.updatedAt).toBeTruthy()
		expect(themeStore.saved.length).toBe(1)
	})

	it('setActiveTheme persists active id and resolves the theme', () => {
		const t = saveTheme({
			preset: 'ocean', mode: 'dark', density: 'compact',
			roundedness: 'rounded', name: 'Y'
		})
		setActiveTheme(t.id)
		expect(themeStore.active?.id).toBe(t.id)
	})

	it('setActiveTheme(null) clears active', () => {
		const t = saveTheme({
			preset: 'rose', mode: 'light', density: 'normal',
			roundedness: 'soft', name: 'Z'
		})
		setActiveTheme(t.id)
		setActiveTheme(null)
		expect(themeStore.active).toBeNull()
	})
})
```

- [ ] **Step 2: Run unit tests**

```bash
cd demo && bun run test:unit
```
Expected: all unit tests pass (persistence, store, theme-store, catalog, match, wizard-state).

- [ ] **Step 3: Commit**

```bash
git add demo/spec/koan/wizard-state.spec.ts
git commit -m "$(cat <<'EOF'
test(demo): wizard state derivation unit tests

Verifies saveTheme produces a SavedTheme with id/timestamps,
setActiveTheme(id) resolves and persists, setActiveTheme(null) clears.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 38: Visual regression baselines

**Files:**
- Update: `demo/playwright.config.ts` (if needed for snapshots)
- Create: snapshot files under `demo/e2e/koan/__snapshots__/`

- [ ] **Step 1: Add screenshot tests**

`demo/e2e/koan/visual.e2e.ts`:

```ts
import { expect, test } from '@playwright/test'

test.describe('Koan visual baselines', () => {
	test('welcome (light)', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'light' })
		await page.goto('/')
		await expect(page).toHaveScreenshot('welcome-light.png', { fullPage: true })
	})

	test('welcome (dark)', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' })
		await page.goto('/')
		await expect(page).toHaveScreenshot('welcome-dark.png', { fullPage: true })
	})

	test('gallery (light)', async ({ page }) => {
		await page.goto('/?q=theme')
		await expect(page).toHaveScreenshot('gallery-light.png', { fullPage: true })
	})

	test('theme wizard step 1', async ({ page }) => {
		await page.goto('/?demo=theme-wizard')
		await expect(page).toHaveScreenshot('wizard-step1.png', { fullPage: true })
	})

	test('tabs demo', async ({ page }) => {
		await page.goto('/?demo=tabs')
		await expect(page).toHaveScreenshot('tabs-demo.png', { fullPage: true })
	})
})
```

- [ ] **Step 2: Generate baselines**

```bash
cd demo && bun run test:e2e:update -- koan/visual.e2e.ts
```
Verify the generated PNGs look correct (review each one).

- [ ] **Step 3: Run again as comparison**

```bash
cd demo && bun run test:e2e -- koan/visual.e2e.ts
```
Expected: pass.

- [ ] **Step 4: Commit**

```bash
git add demo/e2e/koan/visual.e2e.ts demo/e2e/koan/visual.e2e.ts-snapshots
git commit -m "$(cat <<'EOF'
test(demo): visual regression baselines for Koan

Captures welcome (light/dark), gallery, theme wizard step 1, and
tabs demo as Playwright snapshot baselines.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 39: Final test suite + lint sweep

- [ ] **Step 1: Run full unit suite (monorepo root)**

```bash
bun run test:ci
```
Expected: all 3369+ existing tests still pass; new unit tests included if root vitest workspace picks up `demo/spec/`. If demo unit tests are *not* picked up by the root run, that's expected (vitest workspace may exclude `demo`). Note this and ensure `bun run test:unit` (from `demo/`) is included in the CI sequence.

- [ ] **Step 2: Run demo unit tests explicitly**

```bash
cd demo && bun run test:unit
```
Expected: all unit tests pass (catalog, match, persistence, store, theme-store, wizard-state).

- [ ] **Step 3: Run demo e2e suite**

```bash
cd demo && bun run test:e2e -- koan
```
Expected: all koan/* e2e tests pass.

- [ ] **Step 4: Verify legacy pages still build**

```bash
cd demo && bun run build
```
Expected: build succeeds with no broken-link errors.

- [ ] **Step 5: Lint sweep**

```bash
bun run lint
```
Expected: zero errors (warnings acceptable per CLAUDE.md).

- [ ] **Step 6: If anything fails**

Fix root cause. Do not commit failing tests. Do not skip steps.

- [ ] **Step 7: Commit any final fixes**

If fixes were needed:
```bash
git add -A
git commit -m "$(cat <<'EOF'
fix(demo): resolve final test failures from Koan Phase 1

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 40: Journal + priority checklist update

**Files:**
- Modify: `agents/journal.md` (append)
- Modify: `docs/design/12-priority.md` (mark demo entry)

- [ ] **Step 1: Append journal entry**

Append to `agents/journal.md`:

```markdown
## 2026-05-14 — Koan Demo Shell (Phase 1)

**Summary:** Replaced the Sensei mockup app with Koan — a chat-led demo shell — at `demo/` root. Moved existing Sensei pages to `(legacy)/`. Built shell, three demos (Theme Builder wizard, Tabs, Toasts), and seven generalizable components (AnnotationArrow, BrandMark, EmptyState, ShowcaseCanvas, TimelineList, PreviewCard, Gallery, ChatPanel) in `demo/src/lib/koan/`. Components have `@rokkit/ui`-shape APIs; promotion to `@rokkit/ui` is Phase 1.5 (separate plan).

**Highlights:**
- One-shot welcome → migration → active state transition (~500ms brand-mark scale).
- minisearch index with fuzzy 0.2 + prefix + boosts (title:3, keywords:2, description:1).
- Theme Builder wizard: 3 steps (Start preset / Tune chips / Save & download). localStorage draft + saved themes + active id; flash-prevention via `app.html` inline script.
- 13+ Playwright e2e tests in `demo/e2e/koan/` covering welcome, demos, deep-links, timeline, keyboard, reduced-motion, recovery, visual baselines.
- vitest added to `demo/` for unit tests on pure logic (persistence, stores, catalog, match, wizard-state).

**Design doc:** `docs/superpowers/specs/2026-05-14-koan-demo-shell-design.md`
**Plan:** `docs/superpowers/plans/2026-05-14-koan-demo-shell.md`

**Next:** Phase 1.5 (promote 7 components to `@rokkit/ui`) — separate plan written when Phase 1 stabilizes on develop.
```

- [ ] **Step 2: Update priority checklist**

Edit `docs/design/12-priority.md`. Find the `- [ ] **demo/ showcase app**` entry and replace it with:

```markdown
- [x] **`demo/` showcase app** — chat-led Koan shell at `demo/` with 3 demos (Theme Builder wizard, Tabs, Toasts) and 7 new components built in-place (`demo/src/lib/koan/components/`) ready for Phase 1.5 promotion to @rokkit/ui (2026-05-14)
```

- [ ] **Step 3: Final commit**

```bash
git add agents/journal.md docs/design/12-priority.md
git commit -m "$(cat <<'EOF'
docs: journal + priority update for Koan Phase 1

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

After implementing all 40 tasks, run this checklist:

1. **All tests pass:**
   - `bun run test:ci` from repo root (existing 3369+ tests still pass)
   - `cd demo && bun run test:unit` (Koan unit tests pass)
   - `cd demo && bun run test:e2e -- koan` (all Koan e2e pass)

2. **Zero lint errors:**
   - `bun run lint` from repo root

3. **All spec sections have at least one implementing task:**
   - Welcome → migration → active states (Tasks 18, 20, 21)
   - Brand-mark transition (Tasks 11, 20)
   - Chat input + suggestions + history (Task 17, 20)
   - minisearch + match logic (Tasks 8, 9)
   - 3 demos (Tasks 22, 23, 24–30)
   - Theme wizard 3 steps (Tasks 24–30)
   - Persistence (Tasks 5, 6, 7)
   - Deep-linking (Tasks 21, 32)
   - Flash prevention (Task 35)
   - Recovery toast (Task 36)
   - Accessibility (Tasks 33, 34)
   - Visual baselines (Task 38)

4. **Phase 1.5 NOT done in this plan.** A separate plan handles promotion to `@rokkit/ui`.

---

## Phase 1.5 (deferred to its own plan)

After Phase 1 lands on `develop` and bakes for a few days, write a new plan:
- `docs/superpowers/plans/YYYY-MM-DD-koan-promotion.md`

That plan moves these 7 components from `demo/src/lib/koan/components/` to `packages/ui/src/<name>/`:
- AnnotationArrow, BrandMark, EmptyState, ShowcaseCanvas, TimelineList, PreviewCard, Gallery, ChatPanel

For each: move source, split into idiomatic `@rokkit/ui` structure, update Koan imports, add unit tests, add llms.txt, add zen-sumi theme CSS. **Skip the playground page on `sites/learn`** — Koan demos serve as the canonical live example, with the component's llms.txt linking to the appropriate Koan deep-link.

Shell, Welcome, Canvas (Koan-local) stay in `demo/`.
