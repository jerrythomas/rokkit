# Components + Catalog Consolidation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Collapse the redundant "Components" and "Catalog" navigation into one section whose landing IS the catalog, preserve the chat-shell entry + persisted history, and stop duplicate-titled history rows.

**Architecture:** `apps/learn` is a SvelteKit app. The `/app` route is a Koan chat-shell (`src/routes/app/+layout.svelte`) — a 3-column stage: `ChatHistory` (persistent conversation list) · `chat-left` aside (phase-dependent stream + composer) · canvas (phase-dependent content). A shell store (`src/lib/koan/shell.svelte.ts`) holds `phase`; route `+page.svelte` files set the phase on mount. We collapse the `welcome` + `catalog` phases into one `landing` phase (compact hero header + catalog grid in the canvas), make the catalog the `/app` landing, redirect `/app/catalog → /app`, drop the separate nav item, and add title-dedup to the conversation store.

**Tech Stack:** Svelte 5 runes, SvelteKit, TypeScript, Vitest (run-once via `bun run` scripts), Playwright (e2e).

**Conventions:**
- Run tests with run-once scripts only: from repo root `bun run test:ci` (all) or scope with vitest's project filter; NEVER `test:unit`/bare `vitest` (watch mode orphans processes).
- The learn app's Svelte/types are validated by `bun run build` (svelte-check does NOT cover `apps/learn`).
- Files use TAB indentation. Match it exactly.
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- Dev server may be running on :5173 for visual checks.

---

## File Structure

| File | Responsibility | Change |
|---|---|---|
| `src/lib/koan/conversations.svelte.ts` | Persisted conversation store | `startNew` upserts by title for `app` surface |
| `spec/koan/conversations.spec.svelte.ts` | Unit tests for the store | **Create** — dedup tests |
| `src/lib/koan/shell.svelte.ts` | Shell phase state | `ShellPhase` → `landing\|thinking\|response`; `setShellLanding()` replaces welcome/catalog setters; default `landing` |
| `src/routes/app/+page.svelte` | `/app` phase setter | call `setShellLanding()` |
| `src/routes/app/catalog/+page.svelte` | old catalog route | **Delete** |
| `src/routes/app/catalog/+page.ts` | catalog redirect | **Create** — `redirect(308, '/app')` |
| `src/routes/app/+layout.svelte` | chat-shell chrome | merge welcome+catalog canvas → landing; merge rail branches; add "Browse" link; update phase checks |
| `src/lib/components/SiteNav.svelte` | top nav | drop Catalog link; simplify Components match |
| `src/routes/components/[name]/+page.svelte` | static component doc | repoint `/app/catalog` link → `/app` |
| `e2e/components-catalog.e2e.ts` | e2e | **Create** — nav/landing/redirect assertions |

---

## Task 1: Conversation store — upsert-by-title dedup

**Files:**
- Modify: `src/lib/koan/conversations.svelte.ts` (function `startNew`, lines 203-221)
- Create: `spec/koan/conversations.spec.svelte.ts`

The bug: every `startNew('app', …)` unshifts a new conversation, so clicking the "Tabs" suggestion (or typing "tabs") repeatedly stacks duplicate "Tabs" rows. Fix: for the `app` surface, if a conversation with the same `title` already exists, reuse it (replace turns with the new user turn, refresh `updatedAt`, move to top, set current) instead of creating a new one. The `chat` surface is unchanged.

- [ ] **Step 1: Write the failing test**

Create `spec/koan/conversations.spec.svelte.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
	conversations,
	startNew,
	clearAll,
	getCurrentId
} from '../../src/lib/koan/conversations.svelte'

describe('conversations — startNew dedup', () => {
	beforeEach(() => {
		clearAll()
	})

	it('app surface: same title upserts (one row, refreshed, moved to top, current)', () => {
		const first = startNew('app', 'Tabs')
		startNew('app', 'Table')
		const again = startNew('app', 'Tabs')

		const tabsRows = conversations.filter((c) => c.surface === 'app' && c.title === 'Tabs')
		expect(tabsRows.length).toBe(1)
		// re-used the same conversation id
		expect(again).toBe(first)
		// moved to the top of the list
		expect(conversations[0].id).toBe(first)
		// turns reset to the latest single user turn
		expect(conversations[0].turns.length).toBe(1)
		// it is the current conversation
		expect(getCurrentId()).toBe(first)
	})

	it('app surface: different titles create separate rows', () => {
		startNew('app', 'Tabs')
		startNew('app', 'Table')
		expect(conversations.filter((c) => c.surface === 'app').length).toBe(2)
	})

	it('chat surface: same title always appends (no dedup)', () => {
		startNew('chat', 'Build a chart')
		startNew('chat', 'Build a chart')
		expect(conversations.filter((c) => c.surface === 'chat').length).toBe(2)
	})

	it('does not dedup across surfaces with the same title', () => {
		startNew('app', 'Chart')
		startNew('chat', 'Chart')
		expect(conversations.length).toBe(2)
	})
})
```

- [ ] **Step 2: Run the test to verify it fails**

From repo root:
```bash
cd apps/learn && bunx vitest run spec/koan/conversations.spec.svelte.ts
```
Expected: FAIL — the first test sees 3 "Tabs" rows (or `again !== first`), because the current `startNew` always unshifts.

- [ ] **Step 3: Implement the upsert in `startNew`**

Replace the body of `startNew` (currently lines 203-221) with:

```ts
export function startNew(surface: ConversationSurface, query: string): ConversationId {
	const at = nowIso()
	const title = query.trim().slice(0, 80) || 'New conversation'
	const userTurn: UserTurn = { kind: 'user', id: makeId('t'), at, text: query }

	// Upsert by title for the `app` surface: re-exploring the same component
	// reuses its existing row (turns reset, moved to top) instead of stacking
	// duplicate-titled entries. The `chat` surface always appends.
	if (surface === 'app') {
		const existingIdx = conversations.findIndex(
			(c) => c.surface === 'app' && c.title === title
		)
		if (existingIdx >= 0) {
			const [existing] = conversations.splice(existingIdx, 1)
			existing.updatedAt = at
			existing.turns = [userTurn]
			conversations.unshift(existing)
			currentRef.id = existing.id
			persist()
			persistCurrentId()
			return existing.id
		}
	}

	const id = makeId('conv')
	const conv: Conversation = {
		id,
		title,
		surface,
		createdAt: at,
		updatedAt: at,
		turns: [userTurn]
	}
	conversations.unshift(conv)
	pruneOldest()
	currentRef.id = id
	persist()
	persistCurrentId()
	return id
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
cd apps/learn && bunx vitest run spec/koan/conversations.spec.svelte.ts
```
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/learn/src/lib/koan/conversations.svelte.ts apps/learn/spec/koan/conversations.spec.svelte.ts
git commit -m "fix(learn): upsert app conversations by title (no duplicate history rows)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Collapse `welcome` + `catalog` phases into `landing`

This is the core change. The shell type change ripples to the two `/app` page routes and every phase check in the layout, so it lands as one cohesive task. Do all steps before building.

**Files:**
- Modify: `src/lib/koan/shell.svelte.ts`
- Modify: `src/routes/app/+page.svelte`
- Delete: `src/routes/app/catalog/+page.svelte`; Create: `src/routes/app/catalog/+page.ts`
- Modify: `src/routes/app/+layout.svelte` (canvas branches, rail branches, chat-header, composer placeholder, phase checks)

- [ ] **Step 1: Shell — collapse phases + new setter**

In `src/lib/koan/shell.svelte.ts`:

Change the phase type (line 9):
```ts
export type ShellPhase = 'landing' | 'thinking' | 'response'
```

Change the default phase (line 71): `phase: 'welcome',` → `phase: 'landing',`

Replace `setShellWelcome` and `setShellCatalog` (lines 89-99) with a single setter:
```ts
export function setShellLanding(): void {
	shell.phase = 'landing'
	shell.demoType = null
	shell.demoVariant = null
}
```

- [ ] **Step 2: `/app` index sets the landing phase**

Replace `src/routes/app/+page.svelte` entirely:
```svelte
<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellLanding } from '$lib/koan/shell.svelte'

	onMount(() => {
		setShellLanding()
	})
</script>
```

- [ ] **Step 3: Redirect `/app/catalog → /app`**

Delete `src/routes/app/catalog/+page.svelte`. Create `src/routes/app/catalog/+page.ts`:
```ts
import { redirect } from '@sveltejs/kit'

export const load = () => {
	redirect(308, '/app')
}
```

- [ ] **Step 4: Layout — merge the welcome + catalog CANVAS branches into one `landing` branch**

In `src/routes/app/+layout.svelte`, the canvas currently has a `welcome` branch then a `catalog` branch. Replace BOTH (the block starting `{:else if shell.phase === 'welcome'}` with the `welcome-hero` through the end of the `catalog` branch's `</div>` before `{:else if shell.phase === 'thinking'}`) with a single `landing` branch.

Find this exact current code:
```svelte
			{:else if shell.phase === 'welcome'}
				<div class="welcome-hero">
					<div class="mark"><RokkitWordmark height={64} /></div>
					<div class="lede">Pass the data. The component does the rest.</div>
					<div class="sub">
						Type a question on the left. The answer mounts here — themed,
						density-tuned, copyable, and identical to what you'd ship.
					</div>
					<div class="meta">
						<span>style</span>
						<span class="meta-value">{vibe.style}</span>
						<span class="meta-sep">·</span>
						<span>47 components</span>
						<span class="meta-sep">·</span>
						<span>Svelte 5 runes</span>
					</div>
				</div>
			{:else if shell.phase === 'catalog'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Browse · catalog</div>
					<div class="canvas-title">Every component, one click away</div>
					<div class="canvas-sub">
						Type to filter, or jump straight into a tile. Each lands you
						on the live demo with the chat on the left and Tweaks at hand.
					</div>
				</div>
				<div class="canvas-body catalog">
					<CatalogGrid filter={shell.composerValue} />
				</div>
```

Replace it with:
```svelte
			{:else if shell.phase === 'landing'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Browse · catalog</div>
					<div class="canvas-title">Pass the data. The component does the rest.</div>
					<div class="canvas-sub">
						Every component in the library — {vibe.style} · 47 components · Svelte 5
						runes. Type to filter, or jump into a tile; it mounts live with the
						chat on the left and Tweaks at hand.
					</div>
				</div>
				<div class="canvas-body catalog">
					<CatalogGrid filter={shell.composerValue} />
				</div>
```

- [ ] **Step 5: Layout — merge the welcome + catalog RAIL branches (chat-left aside)**

Find this exact current code (the welcome-stream branch followed by the catalog branch):
```svelte
			{#if shell.phase === 'welcome'}
				<div class="welcome-stream">
					<h2 class="welcome-hello">Welcome back.</h2>
					<p class="welcome-lede">
						Tell me what you want to build. As you type I'll match
						components from the catalog — or press <kbd>⌘</kbd><kbd>↵</kbd>
						to send.
					</p>

					<ComposerSuggestions
						query={shell.composerValue}
						onpick={pickSuggestion}
					/>

					<a class="welcome-browse" href="/app/catalog">
						<span class="i-mdi:view-grid-outline" aria-hidden="true"></span>
						Browse the full catalog
						<span class="i-mdi:arrow-right" aria-hidden="true"></span>
					</a>
				</div>
			{:else if shell.phase === 'catalog'}
				<div class="welcome-stream">
					<h2 class="welcome-hello">Catalog</h2>
					<p class="welcome-lede">
						Every component in the library. Pick a tile on the right to
						mount it — or filter from the composer below.
					</p>

					<ComposerSuggestions
						query={shell.composerValue}
						onpick={pickSuggestion}
					/>

					<a class="welcome-browse" href="/app">
						<span class="i-mdi:arrow-left" aria-hidden="true"></span>
						Back to welcome
					</a>
				</div>
			{:else if shell.phase === 'thinking'}
```

Replace it with a single `landing` branch (drop both browse links — the catalog is the canvas now):
```svelte
			{#if shell.phase === 'landing'}
				<div class="welcome-stream">
					<h2 class="welcome-hello">Welcome back.</h2>
					<p class="welcome-lede">
						Tell me what you want to build — I'll match components as you
						type, or browse the catalog on the right. Press
						<kbd>⌘</kbd><kbd>↵</kbd> to send.
					</p>

					<ComposerSuggestions
						query={shell.composerValue}
						onpick={pickSuggestion}
					/>
				</div>
			{:else if shell.phase === 'thinking'}
```

- [ ] **Step 6: Layout — add a "Browse" link in the chat-header (return to catalog from a demo)**

Find the chat-header block:
```svelte
			<div class="chat-header">
				<span class="chat-title">
					Conversation
					{#if shell.phase !== 'welcome'}
						<span class="chat-sub">· {shell.lastQuery}</span>
					{/if}
				</span>
			</div>
```

Replace with (update the phase check and add the Browse link shown when a demo is mounted):
```svelte
			<div class="chat-header">
				<span class="chat-title">
					Conversation
					{#if shell.phase !== 'landing'}
						<span class="chat-sub">· {shell.lastQuery}</span>
					{/if}
				</span>
				{#if shell.phase === 'response'}
					<a class="chat-browse" href="/app">
						<span class="i-mdi:view-grid-outline" aria-hidden="true"></span>
						Browse
					</a>
				{/if}
			</div>
```

Add this CSS rule inside the layout's `<style>` block, immediately after the `.welcome-browse` rule (search for `.welcome-browse {` to locate it):
```css
	.chat-browse {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		margin-left: auto;
		font: 500 11px var(--font-ui);
		color: var(--ink-mute);
		text-decoration: none;
		padding: 3px 8px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		transition:
			color 120ms ease,
			border-color 120ms ease;
	}
	.chat-browse:hover {
		color: var(--ink);
		border-color: var(--paper-edge-hover);
	}
	.chat-browse [class^='i-'] {
		width: 13px;
		height: 13px;
	}
```

If the `.chat-header` rule sets `display`, ensure it is `display: flex; align-items: center;` so `margin-left: auto` pushes the Browse link right (search for `.chat-header {` — if it is not already flex, change it to `display: flex; align-items: center;`).

- [ ] **Step 7: Layout — update the composer placeholder phase check**

Find (around the `<ChatComposer>`):
```svelte
			placeholder={shell.phase === 'welcome'
```
Change `=== 'welcome'` to `=== 'landing'`. (Leave the two placeholder strings as-is.)

- [ ] **Step 8: Layout — sweep any remaining `'welcome'` / `'catalog'` phase references**

Run:
```bash
cd apps/learn && grep -n "shell.phase === 'welcome'\|shell.phase === 'catalog'\|shell.phase !== 'welcome'\|phase: 'welcome'\|phase: 'catalog'" src/routes/app/+layout.svelte
```
Expected after Steps 4-7: no matches. If any remain, update them to `'landing'` (they are leftover references to the merged phases).

- [ ] **Step 9: Remove now-orphaned `RokkitWordmark` import and `.welcome-browse` CSS**

```bash
cd apps/learn && grep -n "RokkitWordmark" src/routes/app/+layout.svelte
```
If the only remaining match is the `import` line (line ~20), delete that import line. If `RokkitWordmark` is still used elsewhere in the file, leave it.

Both browse links that used `.welcome-browse` were removed in Step 5, so its CSS is now unused (Svelte would emit an "unused CSS selector" warning). Check and remove it:
```bash
cd apps/learn && grep -n "welcome-browse" src/routes/app/+layout.svelte
```
If the only matches are CSS rules (no `class="...welcome-browse..."` markup), delete the `.welcome-browse { … }`, `.welcome-browse:hover { … }`, and any `.welcome-browse [class^='i-'] { … }` rules from the `<style>` block. (Do NOT touch the new `.chat-browse` rules added in Step 6.)

- [ ] **Step 10: Build to verify the app compiles (svelte-check does not cover apps/learn)**

```bash
cd apps/learn && bun run build 2>&1 | tail -6
```
Expected: `✓ built` with exit 0, no Svelte/TS errors referencing `welcome`, `catalog`, `setShellWelcome`, or `setShellCatalog`.

- [ ] **Step 11: Commit**

```bash
git add apps/learn/src/lib/koan/shell.svelte.ts apps/learn/src/routes/app/+page.svelte apps/learn/src/routes/app/catalog/ apps/learn/src/routes/app/+layout.svelte
git commit -m "feat(learn): collapse welcome+catalog into one catalog-first landing phase

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: SiteNav — single "Components" entry

**Files:**
- Modify: `src/lib/components/SiteNav.svelte` (lines 12-18)

- [ ] **Step 1: Drop the Catalog link, simplify the Components match**

Replace the `links` array (lines 12-18) with:
```ts
	const links = [
		{ label: 'Components', href: '/app', match: (p: string) => p.startsWith('/app') || homeIsActive },
		{ label: 'Guides', href: '/guides', match: (p: string) => p.startsWith('/guides') },
		{ label: 'Chat demo', href: '/chat', match: (p: string) => p.startsWith('/chat') },
		{ label: 'GitHub ↗', href: 'https://github.com/jerrythomas/rokkit', external: true, match: () => false }
	]
```

- [ ] **Step 2: Build to verify**

```bash
cd apps/learn && bun run build 2>&1 | tail -3
```
Expected: `✓ built`, exit 0.

- [ ] **Step 3: Commit**

```bash
git add apps/learn/src/lib/components/SiteNav.svelte
git commit -m "feat(learn): single Components nav entry (fold in Catalog)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Repoint stray `/app/catalog` links + stale comments

**Files:**
- Modify: `src/routes/components/[name]/+page.svelte` (line 13)
- Modify: `src/lib/koan/components/CatalogGrid.svelte` (line 3, comment)
- Modify: `src/routes/app/+layout.svelte` (line ~249, comment)

- [ ] **Step 1: Repoint the static doc link**

In `src/routes/components/[name]/+page.svelte` line 13, change the href:
```svelte
		<a class="demo-link" href="/app">Try it in the interactive catalog →</a>
```

- [ ] **Step 2: Fix stale comments**

In `src/lib/koan/components/CatalogGrid.svelte` line 3, change `Catalog grid for /app/catalog.` → `Catalog grid for the /app landing.`

In `src/routes/app/+layout.svelte` (the `pickSuggestion` comment near line 249), remove the now-false sentence referencing the "dedicated /app/catalog route (TBD)". Find:
```
	// thinking → goto path as a typed submission. The dedicated /app/catalog
	// route (TBD) gives the same demos a sidebar-browse entry point for
	// users who prefer to scan visually.
```
Replace with:
```
	// thinking → goto path as a typed submission. The catalog grid on the
	// /app landing gives the same demos a browse-first entry point.
```

- [ ] **Step 3: Verify no stray references remain**

```bash
cd apps/learn && grep -rn "/app/catalog" src
```
Expected: no matches (the redirect route at `src/routes/app/catalog/+page.ts` references `/app`, not `/app/catalog`).

- [ ] **Step 4: Commit**

```bash
git add apps/learn/src/routes/components/ apps/learn/src/lib/koan/components/CatalogGrid.svelte apps/learn/src/routes/app/+layout.svelte
git commit -m "chore(learn): repoint /app/catalog references to /app

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: E2E — nav, landing, redirect, browse

**Files:**
- Create: `e2e/components-catalog.e2e.ts`

E2E runs against `bun run build && bun run preview` (Playwright `webServer`, baseURL :4173 — match the existing `playwright.config`). Use the same patterns as existing specs in `apps/learn/e2e/`.

- [ ] **Step 1: Write the e2e spec**

Create `apps/learn/e2e/components-catalog.e2e.ts`:
```ts
import { test, expect } from '@playwright/test'

test('top nav has no separate Catalog item', async ({ page }) => {
	await page.goto('/app')
	const nav = page.locator('[data-site-nav]')
	await expect(nav.getByText('Components', { exact: true })).toBeVisible()
	await expect(nav.getByText('Catalog', { exact: true })).toHaveCount(0)
})

test('/app landing shows the catalog grid', async ({ page }) => {
	await page.goto('/app')
	await expect(page.locator('[data-catalog-grid]')).toBeVisible()
	await expect(page.locator('[data-catalog-tile]').first()).toBeVisible()
})

test('/app/catalog redirects to /app', async ({ page }) => {
	await page.goto('/app/catalog')
	await expect(page).toHaveURL(/\/app$/)
	await expect(page.locator('[data-catalog-grid]')).toBeVisible()
})

test('clicking a tile mounts the demo, and Browse returns to the grid', async ({ page }) => {
	await page.goto('/app')
	await page.locator('button[title="Tabs"]').click()
	await expect(page).toHaveURL(/\/app\/tabs/)
	// the catalog grid is no longer shown in the response phase
	await expect(page.locator('[data-catalog-grid]')).toHaveCount(0)
	// Browse link returns to the landing grid
	await page.locator('a.chat-browse').click()
	await expect(page).toHaveURL(/\/app$/)
	await expect(page.locator('[data-catalog-grid]')).toBeVisible()
})
```

- [ ] **Step 2: Run the e2e spec**

```bash
cd apps/learn && npx playwright test components-catalog
```
Expected: 4 passed. (If `button[title="Tabs"]` is not found, confirm the Tabs tile title via the catalog — `CatalogGrid` sets `title={demo.title}`.)

- [ ] **Step 3: Commit**

```bash
git add apps/learn/e2e/components-catalog.e2e.ts
git commit -m "test(learn): e2e for components/catalog consolidation

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Final gate + journal

**Files:**
- Modify: `agents/journal.md`

- [ ] **Step 1: Full check**

From repo root:
```bash
bun run check
```
Expected: lint + types + svelte-check + test:ci all pass (test count ≥ 5074 + the 4 new dedup tests).

- [ ] **Step 2: Contrast e2e (layout change — confirm no regression)**

```bash
cd apps/learn && npx playwright test theme-contrast
```
Expected: 1 passed (no new failures beyond baseline).

- [ ] **Step 3: Visual sanity (dev server on :5173)**

Open `http://localhost:5173/app` — confirm the catalog grid is the landing with a compact hero header; nav shows no "Catalog"; click a tile → demo mounts; the "Browse" link returns to the grid. Open `http://localhost:5173/app/catalog` — confirm it redirects to `/app`. Explore the same component (e.g. click the "Tabs" suggestion) twice — confirm only one "Tabs" row in the history rail.

- [ ] **Step 4: Journal entry**

Append a dated entry to `agents/journal.md` summarizing the consolidation (catalog-first landing, single nav entry, phase collapse, redirect, conversation dedup) with the commit hashes. Link `[[project_demo_app]]`.

- [ ] **Step 5: Commit**

```bash
git add agents/journal.md
git commit -m "docs(journal): log Components+Catalog consolidation

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Notes / Risks

- **Type ripple:** changing `ShellPhase` breaks every `'welcome'`/`'catalog'` reference at compile time — Task 2 Step 8's grep is the safety net. `bun run build` (not svelte-check) is what surfaces these for `apps/learn`.
- **Dedup scope:** intentionally `app`-surface + exact-title only. `chat` is untouched (richer titles + Sub-project 2). No fuzzy matching (YAGNI).
- **Out of scope (Sub-project 2):** AI-demo rename, mode-selection entry cards, capabilities/suggestions, AI summary titles, chat-surface dedup.
