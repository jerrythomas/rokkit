# Playground → Learn Site Consolidation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge all playground functionality into the learn site and delete `sites/playground/`.

**Architecture:** Enhance learn's `PlaySection` with per-page theme switching, migrate all 31 playground component pages as learn play pages, consolidate e2e tests, then remove the playground site.

**Tech Stack:** SvelteKit, Svelte 5, Playwright, UnoCSS, @rokkit/ui + @rokkit/forms

**Design doc:** `docs/plans/2026-03-02-playground-consolidation-design.md`

---

## Phase 1: Enhance PlaySection

### Task 1: Add theme selector to PlaySection

The learn site's `PlaySection.svelte` needs a theme selector matching the playground's `Playground.svelte` — 4 theme buttons (rokkit, minimal, material, glass) in a "Theme" section in the controls sidebar.

**Files:**
- Modify: `sites/learn/src/lib/components/PlaySection.svelte`

**Step 1: Read the current file**

Current `PlaySection.svelte` at `sites/learn/src/lib/components/PlaySection.svelte`:

```svelte
<script>
	let { preview, controls } = $props()
</script>

<div class="flex flex-col h-full min-h-[500px]">
	<div class="flex-1 grid grid-cols-[1fr_280px] gap-4 min-h-0">
		<div class="preview-area flex items-center justify-center p-6 rounded-lg overflow-auto
		            border-surface-z2 border bg-surface-z0">
			{@render preview()}
		</div>
		<aside class="rounded-lg overflow-y-auto border-surface-z2 border bg-surface-z0">
			{#if controls}
				<h3 class="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-surface-z5
				           border-surface-z2 border-b m-0">Properties</h3>
				<div class="p-3 flex flex-col gap-3">
					{@render controls()}
				</div>
			{/if}
		</aside>
	</div>
</div>
```

**Step 2: Add theme selector**

Replace the full file with:

```svelte
<script>
	// @ts-nocheck
	import { theme } from '$lib/theme.svelte'

	let { preview, controls } = $props()

	const themes = ['rokkit', 'minimal', 'material', 'glass']
</script>

<div class="flex flex-col h-full min-h-[500px]">
	<div class="flex-1 grid grid-cols-[1fr_280px] gap-4 min-h-0">
		<div class="preview-area flex items-center justify-center p-6 rounded-lg overflow-auto
		            border-surface-z2 border bg-surface-z0" data-style={theme.name}>
			{@render preview()}
		</div>
		<aside class="rounded-lg overflow-y-auto border-surface-z2 border bg-surface-z0">
			<h3 class="m-0 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-surface-z5
			           border-surface-z2 border-b">Theme</h3>
			<div class="p-3 flex flex-col gap-3">
				<div class="flex flex-wrap gap-1.5">
					{#each themes as t}
						<button
							class="px-2.5 py-1 rounded-md bg-transparent text-xs cursor-pointer transition-all capitalize
							       border-surface-z3 border text-surface-z6 hover:(bg-surface-z1 text-surface-z8)
							       {theme.name === t ? 'bg-primary-z1! text-primary-z7! border-primary-z3!' : ''}"
							onclick={() => theme.name = t}
						>
							{t}
						</button>
					{/each}
				</div>
			</div>

			{#if controls}
				<h3 class="m-0 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-surface-z5
				           border-surface-z2 border-b">Properties</h3>
				<div class="p-3 flex flex-col gap-3">
					{@render controls()}
				</div>
			{/if}
		</aside>
	</div>
</div>

<style>
	.preview-area {
		background-image:
			linear-gradient(rgb(var(--color-surface-200) / 0.5) 1px, transparent 1px),
			linear-gradient(90deg, rgb(var(--color-surface-200) / 0.5) 1px, transparent 1px);
		background-size: 20px 20px;
	}
</style>
```

Key changes:
- Import `theme` from `$lib/theme.svelte` (the learn site's existing `ThemeManager`)
- Add `data-style={theme.name}` on the preview area so themes apply to component rendering
- Add theme selector buttons above Properties section (always visible)
- Theme section always renders (not conditional on `controls`)
- Added grid background pattern from existing `<style>` block

**Step 3: Verify existing play pages still work**

Run: `cd solution && bun run test:ci`
Expected: All tests pass (PlaySection is only used in play pages, no unit tests exist for it).

**Step 4: Commit**

```bash
git add sites/learn/src/lib/components/PlaySection.svelte
git commit -m "feat(learn): add theme selector to PlaySection"
```

---

## Phase 2: Migrate Playground-Only Components (8 components)

These components exist in playground but have no learn page. Each needs: `meta.json`, `+layout.svelte`, `+page.svelte`, `play/+page.svelte`.

### Task 2: Create learn entries for floating-action

**Files:**
- Create: `sites/learn/src/routes/(learn)/components/floating-action/meta.json`
- Create: `sites/learn/src/routes/(learn)/components/floating-action/+layout.svelte`
- Create: `sites/learn/src/routes/(learn)/components/floating-action/+page.svelte`
- Create: `sites/learn/src/routes/(learn)/components/floating-action/play/+page.svelte`
- Reference: `sites/playground/src/routes/components/floating-action/+page.svelte`

**Step 1: Create meta.json**

```json
{
  "title": "FloatingAction",
  "description": "Floating action button (FAB) with radial, vertical, or horizontal expansion",
  "icon": "i-lucide:plus",
  "category": "components"
}
```

**Step 2: Create +layout.svelte**

Copy the standard Learn/Play toggle layout (identical for all components):

```svelte
<script>
	// @ts-nocheck
	import { Toggle } from '@rokkit/ui'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'

	let { children } = $props()

	const viewOptions = [
		{ label: 'Learn', value: 'learn', icon: 'i-lucide:book-open' },
		{ label: 'Play', value: 'play', icon: 'i-lucide:play' }
	]

	let activeView = $derived(page.url.pathname.endsWith('/play') ? 'play' : 'learn')
	let basePath = $derived(page.url.pathname.replace(/\/play$/, ''))

	function handleViewChange(value) {
		if (value === 'play') goto(`${basePath}/play`)
		else goto(basePath)
	}
</script>

<div class="mb-6 flex items-center justify-end" data-view-toggle>
	<Toggle options={viewOptions} value={activeView} onchange={handleViewChange} />
</div>

{@render children?.()}
```

**Step 3: Create minimal +page.svelte (learn page)**

```svelte
<script>
	// @ts-nocheck
	import { Code } from '@rokkit/ui'
</script>

<article data-article-root>
	<p>
		FloatingAction provides a floating action button (FAB) that expands to reveal a set of actions.
		Supports radial, vertical, or horizontal expansion with configurable positioning.
	</p>

	<h2>Quick Start</h2>
	<Code
		lang="svelte"
		code={`<script>
  import { FloatingAction } from '@rokkit/ui'

  const actions = [
    { text: 'Edit', value: 'edit', icon: 'i-lucide:edit' },
    { text: 'Copy', value: 'copy', icon: 'i-lucide:copy' },
    { text: 'Share', value: 'share', icon: 'i-lucide:share' }
  ]
</script>

<FloatingAction items={actions} icon="i-lucide:plus" onselect={(v) => console.log(v)} />`}
	/>
</article>
```

**Step 4: Create play/+page.svelte**

Adapt the playground page — replace `Playground` with `PlaySection`, remove title/description, add `// @ts-nocheck`:

```svelte
<script>
	// @ts-nocheck
	import { FloatingAction } from '@rokkit/ui'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	let lastAction = $state('')

	let props = $state({ size: 'md', expand: 'vertical', position: 'bottom-right', itemAlign: 'center', backdrop: false })

	const schema = {
		type: 'object',
		properties: {
			size: { type: 'string' },
			expand: { type: 'string' },
			position: { type: 'string' },
			itemAlign: { type: 'string' },
			backdrop: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{ scope: '#/size', label: 'Size', props: { options: ['sm', 'md', 'lg'] } },
			{ scope: '#/expand', label: 'Expand', props: { options: ['vertical', 'horizontal', 'radial'] } },
			{ scope: '#/position', label: 'Position', props: { options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'] } },
			{ scope: '#/itemAlign', label: 'Item Align', props: { options: ['start', 'center', 'end'] } },
			{ scope: '#/backdrop', label: 'Backdrop' },
			{ type: 'separator' }
		]
	}

	const actions = [
		{ text: 'Edit', value: 'edit', icon: 'i-lucide:edit' },
		{ text: 'Copy', value: 'copy', icon: 'i-lucide:copy' },
		{ text: 'Share', value: 'share', icon: 'i-lucide:share' },
		{ text: 'Delete', value: 'delete', icon: 'i-lucide:trash' }
	]

	function handleSelect(value) {
		lastAction = String(value)
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="relative w-full h-[400px] border-dashed border-surface-z3 border rounded-lg overflow-visible">
			<FloatingAction
				items={actions}
				icon="i-lucide:plus"
				expand={props.expand}
				position={props.position}
				itemAlign={props.itemAlign}
				size={props.size}
				backdrop={props.backdrop}
				contained
				onselect={handleSelect}
			/>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Last action" value={lastAction || '—'} />
	{/snippet}
</PlaySection>
```

**Step 5: Commit**

```bash
git add sites/learn/src/routes/\(learn\)/components/floating-action/
git commit -m "feat(learn): add FloatingAction learn + play pages"
```

### Task 3: Create learn entries for floating-navigation

Same pattern as Task 2. **Files to create:**
- `sites/learn/src/routes/(learn)/components/floating-navigation/meta.json`
- `sites/learn/src/routes/(learn)/components/floating-navigation/+layout.svelte`
- `sites/learn/src/routes/(learn)/components/floating-navigation/+page.svelte`
- `sites/learn/src/routes/(learn)/components/floating-navigation/play/+page.svelte`
- Reference: `sites/playground/src/routes/components/floating-navigation/+page.svelte`

Meta: `{ "title": "FloatingNavigation", "description": "Floating navigation dots for page sections", "icon": "i-lucide:compass", "category": "components" }`

Adapt playground page to use `PlaySection` instead of `Playground`. Remove `lang="ts"`, add `// @ts-nocheck`, remove `as any` casts.

### Task 4: Create learn entries for forms (FormRenderer)

Same pattern. **Files to create:**
- `sites/learn/src/routes/(learn)/components/forms/meta.json`
- `sites/learn/src/routes/(learn)/components/forms/+layout.svelte`
- `sites/learn/src/routes/(learn)/components/forms/+page.svelte`
- `sites/learn/src/routes/(learn)/components/forms/play/+page.svelte`
- Reference: `sites/playground/src/routes/components/forms/+page.svelte`

Meta: `{ "title": "FormRenderer", "description": "Schema-driven form rendering with display components, validation, and mixed layouts", "icon": "i-lucide:file-text", "category": "components" }`

Note: The forms playground page is very large (~555 lines) with 9 demo tabs. Migrate it as-is, adapting only the import/wrapper.

### Task 5: Create learn entries for palette-manager

Same pattern. Reference: `sites/playground/src/routes/components/palette-manager/+page.svelte`

Meta: `{ "title": "PaletteManager", "description": "Interactive color palette editor for theme customization", "icon": "i-lucide:palette", "category": "components" }`

### Task 6: Create learn entries for reveal

Same pattern. Reference: `sites/playground/src/routes/components/reveal/+page.svelte`

Meta: `{ "title": "Reveal", "description": "Scroll-triggered reveal animation with configurable direction and delay", "icon": "i-lucide:eye", "category": "components" }`

### Task 7: Create learn entries for shine

Same pattern. Reference: `sites/playground/src/routes/components/shine/+page.svelte`

Meta: `{ "title": "Shine", "description": "Animated light sweep effect on hover", "icon": "i-lucide:sparkles", "category": "components" }`

### Task 8: Create learn entries for tilt

Same pattern. Reference: `sites/playground/src/routes/components/tilt/+page.svelte`

Meta: `{ "title": "Tilt", "description": "Parallax 3D tilt effect that responds to mouse movement", "icon": "i-lucide:rotate-3d", "category": "components" }`

### Task 9: Create learn entries for timeline

Same pattern. Reference: `sites/playground/src/routes/components/timeline/+page.svelte`

Meta: `{ "title": "Timeline", "description": "View-only vertical steps for instructions, changelogs, or process visualization", "icon": "i-lucide:milestone", "category": "components" }`

### Task 10: Commit all 8 new component entries

```bash
git add sites/learn/src/routes/\(learn\)/components/floating-navigation/
git add sites/learn/src/routes/\(learn\)/components/forms/
git add sites/learn/src/routes/\(learn\)/components/palette-manager/
git add sites/learn/src/routes/\(learn\)/components/reveal/
git add sites/learn/src/routes/\(learn\)/components/shine/
git add sites/learn/src/routes/\(learn\)/components/tilt/
git add sites/learn/src/routes/\(learn\)/components/timeline/
git commit -m "feat(learn): add 7 playground-only components to learn site"
```

(floating-action committed separately in Task 2)

---

## Phase 3: Add Play Pages for Existing Learn Components

These 14 components have a learn page but no play page. We need to add `+layout.svelte` (if missing) and `play/+page.svelte`.

### Task 11: Add play pages — breadcrumbs, button, card

For each component:
1. Copy `+layout.svelte` (Learn/Play toggle) from Task 2 template — only needed if not already present
2. Adapt playground page → `play/+page.svelte` using `PlaySection`

**Files to create for each:**
- `sites/learn/src/routes/(learn)/components/{name}/+layout.svelte` (if missing)
- `sites/learn/src/routes/(learn)/components/{name}/play/+page.svelte`

**Reference files:**
- `sites/playground/src/routes/components/breadcrumbs/+page.svelte`
- `sites/playground/src/routes/components/button/+page.svelte`
- `sites/playground/src/routes/components/card/+page.svelte`

Adaptation pattern (same for all):
- Replace `import Playground from '$lib/Playground.svelte'` → `import PlaySection from '$lib/components/PlaySection.svelte'`
- Replace `<Playground title="..." description="...">` → `<PlaySection>`
- Replace `</Playground>` → `</PlaySection>`
- Replace `lang="ts"` → remove, add `// @ts-nocheck`
- Remove `as any` type casts

Commit: `git commit -m "feat(learn): add play pages for breadcrumbs, button, card"`

### Task 12: Add play pages — carousel, code, lazy-tree

Same pattern as Task 11.

**Reference files:**
- `sites/playground/src/routes/components/carousel/+page.svelte`
- `sites/playground/src/routes/components/code/+page.svelte`
- `sites/playground/src/routes/components/lazy-tree/+page.svelte`

Note: lazy-tree already has `+layout.svelte` — only add `play/+page.svelte`.

Commit: `git commit -m "feat(learn): add play pages for carousel, code, lazy-tree"`

### Task 13: Add play pages — pill, progress, range

Same pattern.

**Reference files:**
- `sites/playground/src/routes/components/pill/+page.svelte`
- `sites/playground/src/routes/components/progress/+page.svelte`
- `sites/playground/src/routes/components/range/+page.svelte`

Commit: `git commit -m "feat(learn): add play pages for pill, progress, range"`

### Task 14: Add play pages — rating, stepper, switch, table

Same pattern.

**Reference files:**
- `sites/playground/src/routes/components/rating/+page.svelte`
- `sites/playground/src/routes/components/stepper/+page.svelte`
- `sites/playground/src/routes/components/switch/+page.svelte`
- `sites/playground/src/routes/components/table/+page.svelte`

Commit: `git commit -m "feat(learn): add play pages for rating, stepper, switch, table"`

---

## Phase 4: Replace Existing Play Pages with Richer Playground Versions

These 4 components have both a learn play page and a playground page. The playground versions are richer.

### Task 15: Replace play pages — list, menu, select, tabs

For each: replace `play/+page.svelte` content with adapted playground version.

**Files to modify:**
- `sites/learn/src/routes/(learn)/components/list/play/+page.svelte`
- `sites/learn/src/routes/(learn)/components/menu/play/+page.svelte`
- `sites/learn/src/routes/(learn)/components/select/play/+page.svelte`
- `sites/learn/src/routes/(learn)/components/tabs/play/+page.svelte`

**Reference files:**
- `sites/playground/src/routes/components/list/+page.svelte`
- `sites/playground/src/routes/components/menu/+page.svelte`
- `sites/playground/src/routes/components/select/+page.svelte`
- `sites/playground/src/routes/components/tabs/+page.svelte`

Same adaptation pattern: `Playground` → `PlaySection`, remove `lang="ts"`, add `// @ts-nocheck`, remove `as any` casts.

Note: The **toggle** learn play page already has 3 demo variations (richer than playground's 2) — keep existing toggle play page as-is.

Note: **upload-progress** and **upload-target** play pages were just created in the prior task — keep as-is.

Commit: `git commit -m "feat(learn): replace play pages with richer playground versions for list, menu, select, tabs"`

---

## Phase 5: Verify Learn Site Builds

### Task 16: Verify build and tests

**Step 1: Run unit tests**

```bash
cd solution && bun run test:ci
```

Expected: All ~2658 tests pass.

**Step 2: Run lint**

```bash
cd solution && bun run lint
```

Expected: 0 errors.

**Step 3: Sync SvelteKit routes**

```bash
cd solution/sites/learn && bunx svelte-kit sync
```

Expected: Clean output, no errors.

**Step 4: Commit any fixes if needed**

---

## Phase 6: E2E Test Consolidation

### Task 17: Update learn e2e helpers

**Files:**
- Modify: `sites/learn/e2e/helpers.ts`

Add `setTheme()` and `themes` to match playground's e2e capabilities:

```typescript
import type { Page } from '@playwright/test'

export const themes = ['rokkit', 'minimal', 'material', 'glass'] as const
export type Theme = (typeof themes)[number]

export const modes = ['light', 'dark'] as const
export type Mode = (typeof modes)[number]

/** Navigate to a component's Play page and wait for it to be ready */
export async function goToPlayPage(page: Page, component: string) {
	await page.goto(`/components/${component}/play`)
	await page.waitForLoadState('networkidle')
}

/** Set theme by clicking the theme button in the PlaySection sidebar */
export async function setTheme(page: Page, theme: Theme) {
	const btn = page.locator('aside button', { hasText: new RegExp(`^${theme}$`, 'i') })
	await btn.click()
}

/** Set color mode directly on the document element */
export async function setMode(page: Page, mode: Mode) {
	await page.evaluate((m) => document.documentElement.setAttribute('data-mode', m), mode)
}
```

Commit: `git commit -m "feat(learn): add setTheme and themes to e2e helpers"`

### Task 18: Migrate playground e2e tests — toolbar, tree

Port these playground e2e tests to learn. They don't have existing learn e2e counterparts.

**Files:**
- Create: `sites/learn/e2e/toolbar.spec.ts`
- Create: `sites/learn/e2e/tree.spec.ts`
- Reference: `sites/playground/e2e/toolbar.spec.ts`
- Reference: `sites/playground/e2e/tree.spec.ts`

Adaptation:
- Replace `import { goToComponent, ...` → `import { goToPlayPage, ...`
- Replace `goToComponent(page, 'X')` → `goToPlayPage(page, 'X')`
- Add `.preview-area` scoping to component selectors where needed (play pages render inside `.preview-area`)
- Keep all keyboard/mouse/visual snapshot tests

### Task 19: Migrate playground e2e tests — menu, multi-select

**Files:**
- Create: `sites/learn/e2e/menu.spec.ts`
- Create: `sites/learn/e2e/multi-select.spec.ts`
- Reference: `sites/playground/e2e/menu.spec.ts`
- Reference: `sites/playground/e2e/multi-select.spec.ts`

Same adaptation as Task 18.

### Task 20: Merge playground e2e — toggle, tabs, select, list

These have BOTH playground and learn e2e tests. Merge the playground interaction + visual snapshot tests into the existing learn spec files.

**Files to modify:**
- `sites/learn/e2e/toggle.spec.ts` — add visual snapshot tests from playground
- `sites/learn/e2e/tabs.spec.ts` — add visual snapshot tests from playground
- `sites/learn/e2e/select.spec.ts` — add visual snapshot tests from playground
- `sites/learn/e2e/list.spec.ts` — add visual snapshot tests from playground

**Reference:**
- `sites/playground/e2e/toggle.spec.ts` (visual snapshots section)
- `sites/playground/e2e/tabs.spec.ts`
- `sites/playground/e2e/select.spec.ts`
- `sites/playground/e2e/list.spec.ts`

For each: add the `visual snapshots` describe block from the playground spec, using `goToPlayPage` and `setTheme`/`setMode` from the updated helpers.

### Task 21: Merge playground e2e — upload-target, upload-progress

These already exist in both. Add visual snapshot tests from playground versions.

**Files to modify:**
- `sites/learn/e2e/upload-target.spec.ts`
- `sites/learn/e2e/upload-progress.spec.ts`

### Task 22: Run e2e tests and update snapshots

```bash
cd solution/sites/learn && npx playwright test --update-snapshots
```

Expected: All tests pass, new snapshots generated.

Commit: `git commit -m "feat(learn): consolidate all playground e2e tests into learn site"`

---

## Phase 7: Cleanup

### Task 23: Delete playground site

```bash
rm -rf sites/playground
```

**Step 2: Verify workspace still works**

```bash
cd solution && bun install
```

Expected: Clean install, no errors (workspace glob `sites/*` auto-excludes deleted directory).

### Task 24: Update documentation references

**Files to modify:**
- `CLAUDE.md` line 65: change `cd sites/playground && npx playwright test` → `cd sites/learn && npx playwright test`
- `agents/memory.md`: update playground reference
- `agents/references.md`: update playground reference

### Task 25: Final verification and commit

**Step 1: Run all unit tests**

```bash
cd solution && bun run test:ci
```

**Step 2: Run lint**

```bash
cd solution && bun run lint
```

**Step 3: Commit cleanup**

```bash
git commit -m "chore: remove playground site, update docs references"
```

---

## Phase 8: Gap Documentation

### Task 26: Create backlog item for remaining coverage gaps

**File:** `docs/backlog/2026-03-02-component-coverage-gaps.md`

Document components that still need:
- Stories (StoryBuilder examples)
- llms.txt documentation
- Learn articles (beyond the minimal page)
- E2E tests

This is a future work item, not part of this migration.

```bash
git commit -m "docs: add component coverage gap backlog item"
```

---

## Verification Checklist

After all tasks complete:

1. `cd solution && bun run test:ci` — all unit tests pass
2. `cd solution && bun run lint` — 0 errors
3. `cd solution/sites/learn && bunx svelte-kit sync` — clean
4. `cd solution/sites/learn && npx playwright test` — all e2e tests pass
5. `sites/playground/` directory no longer exists
6. Start learn dev server → all component play pages accessible and themed
7. Learn/Play toggle works on every component page
