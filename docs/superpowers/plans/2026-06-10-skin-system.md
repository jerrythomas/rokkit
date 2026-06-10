# Skin System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make **skin** (which palette backs each named token) a first-class switchable dimension — `vibe.skin` + `themable` writing `data-skin` + the preset emitting `[data-skin='name']` CSS (replacing `skin-{name}` classes) + a `SkinSwitcherToggle` + built-in skins + skill/guide.

**Architecture:** Exact parity with `style`/`mode`. The default skin's named-token vars go on `:root`; each non-default skin is emitted as `[data-skin='name'] { … }` (+ `[data-mode='dark'][data-skin='name']` for dual-palette). `themable` writes `data-skin` (already written pre-paint by `themeHook`). `skinnable` is kept as the runtime var-applicator (Phase 3 seam).

**Tech Stack:** Svelte 5, `@rokkit/states`/`@rokkit/actions`/`@rokkit/unocss`/`@rokkit/themes`/`@rokkit/app`/`@rokkit/cli`, Vitest.

**Design:** `docs/design/20-skin-system.md`.

**Conventions (read first):**
- `vibe`: `packages/states/src/vibe.svelte.js` — `#field = $state()`, `isAllowedValue(v, allowed, current)`, `allowedStyles` setter, `save()`/`load()`/`update()`.
- `themable`: `packages/actions/src/themable.svelte.js` — the `$effect` writing `root.dataset.*` + the `documentElement` mirror; `DEFAULT_THEME` fallback.
- preset: `packages/unocss/src/preset.ts` — `buildPreflights` (returns `[{ getCSS() }]`; emits `:root{…}` + `[data-mode="dark"]{…}`), `buildSkinShortcuts`, `resolveMappingForMode(map, mode)`, `theme.getPalette(map)`; `packages/unocss/src/config.js` `resolveColormap`, `DEFAULT_CONFIG.skins`.
- `ThemeSwitcherToggle`: `packages/app/src/components/ThemeSwitcherToggle.svelte` + `types/theme-switcher.ts` `buildThemeSwitcherOptions`.
- Tests: `bunx vitest run --project {states|actions|unocss|themes|app|cli}`. Lint `bunx eslint --config config/eslint.config.mjs <files>`. Lint disallows `no-console`/`no-implicit-coercion` (`!!`→`Boolean()`); `.svelte` files validated with the Svelte MCP autofixer; `index.spec.js` files are exact-match export lists (update when adding exports).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `packages/states/src/vibe.svelte.js` (modify) | add `#skin`/`#allowedSkins` + save/load/update |
| `packages/states/spec/vibe.spec.svelte.js` (modify) | skin tests |
| `packages/actions/src/themable.svelte.js` (modify) | write `data-skin` + `DEFAULT_THEME.skin` |
| `packages/actions/src/skinnable.svelte.js` (modify) | tighten JSDoc/types (rehabilitate) |
| `packages/actions/spec/themable.spec.svelte.js` (modify) | data-skin test |
| `packages/unocss/src/builtin-skins.js` (create) | `BUILTIN_SKINS` constant |
| `packages/unocss/src/preset.ts` (modify) | emit `[data-skin]` preflights; merge built-ins; drop `skin-{name}` class |
| `packages/unocss/spec/preset.spec.js` (modify) | `[data-skin]` emission tests |
| `packages/themes/src/palette.css` (modify) | drop `@apply skin-default` |
| `packages/app/src/components/SkinSwitcherToggle.svelte` (create) | skin switcher |
| `packages/app/src/types/skin-switcher.ts` (create) | options builder + types |
| `packages/app/src/components/index.ts` (modify) | export |
| `packages/app/spec/SkinSwitcherToggle.spec.svelte.ts` (create) | tests |
| `apps/learn/src/lib/stores/theme.svelte.ts` + `ThemeControls.svelte` (modify) | promote onto `vibe.skin` + `SkinSwitcherToggle` |
| `packages/cli/skills/skin-system-rokkit/SKILL.md` (create) + `packages/cli/spec/skills.spec.js` (modify) | skill (→ 4 skills) |
| `docs/llms/guides/skins.txt`, `docs/llms/components/skin-switcher-toggle.txt` (create); `docs/llms/packages/{states,actions,unocss,themes}.txt` + `guides/theming.txt` (modify); `apps/learn/src/lib/guides/skins/content.md` + `guides/index.ts` (modify) | docs |

---

## Task 1: `vibe.skin` + `vibe.allowedSkins` (`@rokkit/states`)

**Files:** Modify `packages/states/src/vibe.svelte.js`, `packages/states/spec/vibe.spec.svelte.js`.

- [ ] **Step 1: Write the failing test** — append to `packages/states/spec/vibe.spec.svelte.js`:

```js
describe('vibe.skin', () => {
	it('defaults to "default"', () => {
		expect(vibe.skin).toBe('default')
	})
	it('only accepts an allowed skin', () => {
		vibe.allowedSkins = ['default', 'ocean']
		vibe.skin = 'ocean'
		expect(vibe.skin).toBe('ocean')
		vibe.skin = 'nope'
		expect(vibe.skin).toBe('ocean')
	})
	it('persists skin in save() and restores in load()', () => {
		vibe.allowedSkins = ['default', 'ocean']
		vibe.skin = 'ocean'
		vibe.save('skin-test')
		expect(JSON.parse(localStorage.getItem('skin-test'))).toEqual(
			expect.objectContaining({ skin: 'ocean' })
		)
		vibe.skin = 'default'
		vibe.load('skin-test')
		expect(vibe.skin).toBe('ocean')
	})
})
```

- [ ] **Step 2: Run to verify it fails** — `bunx vitest run --project states packages/states/spec/vibe.spec.svelte.js` → FAIL (`vibe.skin` undefined).

- [ ] **Step 3: Implement** — in `packages/states/src/vibe.svelte.js`:
  (a) add fields beside `#style`/`#allowedStyles`:
```js
	#allowedSkins = $state(['default'])
	#skin = $state('default')
```
  (b) add getter/setter beside `style`/`allowedStyles` (reuse `isAllowedValue`):
```js
	get skin() {
		return this.#skin
	}
	set skin(value) {
		if (isAllowedValue(value, this.#allowedSkins, this.#skin)) this.#skin = value
	}
	get allowedSkins() {
		return this.#allowedSkins
	}
	set allowedSkins(input) {
		const skins = (Array.isArray(input) ? input : [input]).filter(Boolean)
		if (skins.length > 0) this.#allowedSkins = skins
	}
```
  (c) add `skin: this.#skin` to the `save()` config object; (d) add `if (value.skin) this.skin = value.skin` to `update()` (guard so a stored config without skin doesn't reset it; place AFTER setting allowedSkins if load sets them — for v1 the consumer sets allowedSkins, and `load()` calls `update()`, so guard with `value.skin` truthiness). Confirm `load()` routes through `update()`.

  NOTE: the validating setter means `load()` only restores `skin` if it's in `allowedSkins`. Since the consumer sets `allowedSkins` before load in practice, and the test sets it first, this holds. If `load()` runs before `allowedSkins` is set, document that the app must set `allowedSkins` first (same constraint as `allowedStyles`).

- [ ] **Step 4: Run to verify it passes** — same command → PASS. Then full `bunx vitest run --project states` (update `packages/states/spec/index.spec.js` only if vibe's export list is asserted — it isn't; `vibe` is already exported).

- [ ] **Step 5: Commit**

```bash
git add packages/states/src/vibe.svelte.js packages/states/spec/vibe.spec.svelte.js
git commit -m "feat(states): vibe.skin + allowedSkins (persisted)"
```

---

## Task 2: `themable` writes `data-skin` + `skinnable` docs (`@rokkit/actions`)

**Files:** Modify `packages/actions/src/themable.svelte.js`, `packages/actions/src/skinnable.svelte.js`, `packages/actions/spec/themable.spec.svelte.js`.

- [ ] **Step 1: Write the failing test** — append to `packages/actions/spec/themable.spec.svelte.js` (match the file's existing setup — it mounts `themable` on a node with a `$state` theme + `flushSync()`):

```js
it('writes data-skin to the node and mirrors to documentElement', () => {
	// `theme` and `node` are set up like the existing themable tests in this file
	theme.skin = 'ocean'
	flushSync()
	expect(node.dataset.skin).toBe('ocean')
	expect(document.documentElement.dataset.skin).toBe('ocean')
})
```
(If the existing tests use a local helper to mount + a `theme` object, reuse it; ensure `theme` includes a `skin` field.)

- [ ] **Step 2: Run to verify it fails** — `bunx vitest run --project actions packages/actions/spec/themable.spec.svelte.js` → FAIL (`data-skin` not written).

- [ ] **Step 3: Implement** — in `packages/actions/src/themable.svelte.js`:
  (a) add to the `$effect` beside the `dataset.style/mode/density` writes:
```js
		root.dataset.skin = theme.skin
```
  and in the `documentElement` mirror block:
```js
		el.dataset.skin = theme.skin
```
  (b) add `skin: 'default'` to the `DEFAULT_THEME` fallback object (top of file) so the no-`vibe` path has a skin.

- [ ] **Step 4: Run to verify it passes** — same command → PASS; then full `bunx vitest run --project actions` (the existing save-to-storage themable test may assert the serialized shape — if it does, add `skin` to its expected object).

- [ ] **Step 5: Tighten `skinnable` docs** — in `packages/actions/src/skinnable.svelte.js`, update the JSDoc to:
```js
/**
 * Apply named-token CSS custom properties to an element as inline styles.
 * A per-instance / runtime color applicator — complementary to the `data-skin`
 * cascade (use `vibe.skin` + `themable` for app-wide named skins; use this to
 * apply a colorset that isn't pre-baked, e.g. a dynamic or server-configured skin).
 *
 * @param {HTMLElement} node
 * @param {Record<string, string>} variables - CSS var name → value (e.g. { '--primary': 'oklch(...)' })
 */
```
(No behavior change.)

- [ ] **Step 6: Commit**

```bash
git add packages/actions/src/themable.svelte.js packages/actions/src/skinnable.svelte.js packages/actions/spec/themable.spec.svelte.js
git commit -m "feat(actions): themable writes data-skin; document skinnable as the runtime applicator"
```

---

## Task 3: Built-in skins + preset emits `[data-skin]` CSS (`@rokkit/unocss`)

**Files:** Create `packages/unocss/src/builtin-skins.js`; modify `packages/unocss/src/preset.ts`, `packages/unocss/spec/preset.spec.js`.

This is the crux. The preset must (a) merge a curated `BUILTIN_SKINS` set into `config.skins` so `data-skin` works out of the box, (b) emit each non-default skin as `[data-skin='name'] { …named-token vars… }` (+ `[data-mode='dark'][data-skin='name']` for dual-palette skins) via a preflight, and (c) STOP emitting the `skin-{name}` utility classes. The default skin's vars already come from the existing `:root` preflight (`resolveColormap` favors `skins.default`).

- [ ] **Step 1: Create `BUILTIN_SKINS`** — `packages/unocss/src/builtin-skins.js`. Use only Tailwind palettes already present in `@rokkit/core` `defaultColors` (no custom palette bundling):

```js
/**
 * Curated built-in skins (role → palette). All palettes are Tailwind names
 * available in @rokkit/core defaultColors, so `data-skin` works with no extra config.
 * Consumers' `skins` in rokkit.config.js merge on top (and can override these).
 */
export const BUILTIN_SKINS = {
	default: { surface: 'slate', ink: 'slate', primary: 'orange', accent: 'sky' },
	ocean: { surface: 'slate', ink: 'slate', primary: 'sky', accent: 'teal' },
	violet: { surface: 'zinc', ink: 'zinc', primary: 'violet', accent: 'indigo' },
	rose: { surface: 'stone', ink: 'stone', primary: 'rose', accent: 'orange' },
	emerald: { surface: 'slate', ink: 'slate', primary: 'emerald', accent: 'cyan' }
}
```
(Confirm the role keys + palette names against `packages/unocss/src/config.js` `DEFAULT_CONFIG.skin` and `@rokkit/core` `defaultColors`; adjust role set to match the project's named-token roles. `default` must match the preset's current default colormap so `:root` and `[data-skin='default']` agree.)

- [ ] **Step 2: Write the failing test** — append to `packages/unocss/spec/preset.spec.js` (mirror the existing `preflights — dark mode CSS block` describe):

```js
describe('preflights — skin blocks', () => {
	function skinCss(config = {}) {
		const preset = presetRokkit(config)
		return preset.preflights.map((p) => p.getCSS()).join('\n')
	}
	it('emits [data-skin="ocean"] for a non-default skin', () => {
		expect(skinCss({ skins: { default: { surface: 'slate', primary: 'sky' }, ocean: { surface: 'slate', primary: 'teal' } } }))
			.toContain("[data-skin='ocean']")
	})
	it('emits a dark selector for a dual-palette skin', () => {
		expect(skinCss({ skins: { default: { surface: 'slate', primary: 'sky' }, duo: { surface: { light: 'slate', dark: 'zinc' }, primary: 'sky' } } }))
			.toMatch(/\[data-mode=['"]dark['"]\]\[data-skin=['"]duo['"]\]/)
	})
	it('built-in skins are available with no skins config', () => {
		expect(skinCss({})).toContain("[data-skin='ocean']")
	})
	it('no longer emits a skin-default utility class shortcut', () => {
		const preset = presetRokkit({ skins: { default: { surface: 'slate', primary: 'sky' } } })
		const names = (preset.shortcuts ?? []).map((s) => (Array.isArray(s) ? s[0] : s))
		expect(names).not.toContain('skin-default')
	})
})
```

- [ ] **Step 3: Run to verify it fails** — `bunx vitest run --project unocss packages/unocss/spec/preset.spec.js` → FAIL.

- [ ] **Step 4: Implement** — in `packages/unocss/src/preset.ts`:
  (a) import `BUILTIN_SKINS`; merge built-ins UNDER user config where `config.skins` is resolved (built-ins first, user skins override): e.g. in `config.js` `loadConfig`/`resolveConfig`, `config.skins = { ...BUILTIN_SKINS, ...userSkins }` (place so the `default` precedence in `resolveColormap` still works — user `default` wins over built-in `default`).
  (b) Add a `buildSkinPreflights(theme, config)` that, for every skin in `config.skins` EXCEPT the resolved default, emits a `[data-skin='name']` block of the named-token vars (light), plus a `[data-mode='dark'][data-skin='name']` block when the skin has any dual-palette role. Mirror `buildPreflights`' var-building (`resolveMappingForMode(map, 'light')` → the same `toCssBlock` of named-token vars used for `:root`; reuse the existing helper that turns a colormap into the `--paper`/`--ink`/… declarations). Append its `{ getCSS }` entries to the `preflights` array returned by `presetRokkit`. Use single-quoted attribute selectors `[data-skin='name']` (match the dark-block quoting style already in the file).
  (c) **Remove** the `buildSkinShortcuts` call from `buildShortcuts` (drop the `skin-{name}` shortcuts). Delete `buildSkinShortcuts` if now unused.

  Follow the EXACT var-emission used by the `:root`/`[data-mode="dark"]` blocks so `[data-skin]` blocks set the same named-token custom properties. The tests above pin the selectors; match the existing block-building helpers rather than hand-rolling CSS.

- [ ] **Step 5: Run to verify it passes** — `bunx vitest run --project unocss` → all pass (the new skin tests + existing preset/backgrounds/config/custom-tokens/patterns/hooks specs). Fix any existing test that asserted `skin-{name}` shortcuts (update it to assert `[data-skin]` instead).

- [ ] **Step 6: Commit**

```bash
git add packages/unocss/src/builtin-skins.js packages/unocss/src/preset.ts packages/unocss/src/config.js packages/unocss/spec/preset.spec.js
git commit -m "feat(unocss): emit [data-skin] blocks + built-in skins; drop skin-{name} class"
```

---

## Task 4: Default skin on `:root` — drop `@apply skin-default` (`@rokkit/themes`)

**Files:** Modify `packages/themes/src/palette.css`.

- [ ] **Step 1: Edit** — in `packages/themes/src/palette.css`, remove the `@apply skin-default;` line, keeping the other `:root` vars:

```css
@layer base {
	:root {
		--scroll-width: 0.5rem;
		--tab-size: 2;
	}
}
```
The default skin's named-token vars now come from the preset's `:root` preflight (Task 3). `themable` writes `data-skin='default'` by default (Task 2's `DEFAULT_THEME.skin`), and `[data-skin='default']` is the resolved-default skin so `:root` already carries its vars — no regression.

- [ ] **Step 2: Verify themes build + coverage** — `bunx vitest run --project themes` → green. If a theme build/snapshot test referenced `skin-default`, update it.

- [ ] **Step 3: Commit**

```bash
git add packages/themes/src/palette.css
git commit -m "feat(themes): default skin vars from preset :root (drop @apply skin-default)"
```

---

## Task 5: `SkinSwitcherToggle` (`@rokkit/app`)

**Files:** Create `packages/app/src/components/SkinSwitcherToggle.svelte`, `packages/app/src/types/skin-switcher.ts`, `packages/app/spec/SkinSwitcherToggle.spec.svelte.ts`; modify `packages/app/src/components/index.ts`.

- [ ] **Step 1: Write the failing test** — `packages/app/spec/SkinSwitcherToggle.spec.svelte.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { vibe } from '@rokkit/states'
import SkinSwitcherToggle from '../src/components/SkinSwitcherToggle.svelte'

beforeEach(() => {
	vibe.allowedSkins = ['default', 'ocean', 'violet']
	vibe.skin = 'default'
})

describe('SkinSwitcherToggle', () => {
	it('renders an option per allowed skin', () => {
		const { container } = render(SkinSwitcherToggle, { props: { skins: ['default', 'ocean', 'violet'] } })
		expect(container.querySelectorAll('[data-toggle-option]').length).toBe(3)
	})
	it('switching options updates vibe.skin', async () => {
		const { container } = render(SkinSwitcherToggle, { props: { skins: ['default', 'ocean', 'violet'] } })
		const ocean = container.querySelector('[data-toggle-option][data-value="ocean"]')
		await fireEvent.click(ocean!)
		expect(vibe.skin).toBe('ocean')
	})
})
```
(Confirm the Toggle's per-option selector — `[data-toggle-option]` / `data-value` — against `ThemeSwitcherToggle.spec` and `Toggle.svelte`; adjust the query to match how the group variant renders options.)

- [ ] **Step 2: Run to verify it fails** — `bunx vitest run --project app packages/app/spec/SkinSwitcherToggle.spec.svelte.ts` → FAIL.

- [ ] **Step 3: Implement types** — `packages/app/src/types/skin-switcher.ts`:

```ts
export interface SkinSwitcherOption {
	value: string
	text: string
	icon?: string
}

export function buildSkinSwitcherOptions(
	skins: Array<string | { name: string; label?: string; icon?: string }>,
	labels: Record<string, string> = {}
): SkinSwitcherOption[] {
	return skins.map((s) => {
		const name = typeof s === 'string' ? s : s.name
		const label = typeof s === 'string' ? (labels[s] ?? s) : (s.label ?? labels[s] ?? s.name)
		const icon = typeof s === 'string' ? undefined : s.icon
		return { value: name, text: label, icon }
	})
}
```

- [ ] **Step 4: Implement component** — `packages/app/src/components/SkinSwitcherToggle.svelte` (mirror `ThemeSwitcherToggle` but for skin; no system/resolved split):

```svelte
<script lang="ts">
	import { vibe } from '@rokkit/states'
	import { Toggle } from '@rokkit/ui'
	import { buildSkinSwitcherOptions, type SkinSwitcherOption } from '../types/skin-switcher.js'

	let {
		skins = undefined,
		labels = {},
		showLabels = false,
		size = 'sm',
		disabled = false,
		class: className = '',
		onchange
	}: {
		skins?: Array<string | { name: string; label?: string; icon?: string }>
		labels?: Record<string, string>
		showLabels?: boolean
		size?: 'sm' | 'md' | 'lg'
		disabled?: boolean
		class?: string
		onchange?: (skin: string) => void
	} = $props()

	const options = $derived(buildSkinSwitcherOptions(skins ?? vibe.allowedSkins, labels))
	let value = $derived(vibe.skin)

	function handleChange(newValue: unknown) {
		vibe.skin = newValue as string
		onchange?.(newValue as string)
	}
</script>

<Toggle
	variant="group"
	{options}
	{value}
	onchange={handleChange}
	{showLabels}
	{size}
	{disabled}
	class={className}
/>
```
Validate with the Svelte MCP autofixer; fix what it flags.

- [ ] **Step 5: Export** — add to `packages/app/src/components/index.ts`:
```ts
export { default as SkinSwitcherToggle } from './SkinSwitcherToggle.svelte'
```

- [ ] **Step 6: Run to verify it passes** — `bunx vitest run --project app` → all pass.

- [ ] **Step 7: Commit**

```bash
git add packages/app/src/components/SkinSwitcherToggle.svelte packages/app/src/types/skin-switcher.ts packages/app/src/components/index.ts packages/app/spec/SkinSwitcherToggle.spec.svelte.ts
git commit -m "feat(app): SkinSwitcherToggle"
```

---

## Task 6: Promote learn's skin system onto the core (`apps/learn`)

**Files:** Modify `apps/learn/src/lib/stores/theme.svelte.ts`, `apps/learn/src/lib/components/ThemeControls.svelte` (+ set `vibe.allowedSkins`).

- [ ] **Step 1: Set allowed skins + delegate `setSkin` to `vibe`.** In `apps/learn/src/lib/stores/theme.svelte.ts`: set `vibe.allowedSkins` to the learn skin names on init; change the `skin` field + `setSkin(v)` to delegate to `vibe.skin` (so `data-skin` is written by `themable`, which the learn layout already uses). Keep per-role overrides (`applyRoleColor`) as-is. For learn's CUSTOM skins (kami/sumi/shu zen-sumi colorset, not Tailwind built-ins), keep `installSkinSheet()`/`applySkin` as the dynamic path (those skins aren't in `BUILTIN_SKINS`) — OR ensure learn's `rokkit.config.js` `skins:` defines them so the preset emits their `[data-skin]` blocks (preferred — then drop `installSkinSheet`). Decide per what's in learn's config; report which.
- [ ] **Step 2: Render `SkinSwitcherToggle`** in `ThemeControls.svelte` (replace the hand-rolled skin picker, or keep the picker but drive `vibe.skin`). Validate `.svelte` with autofixer.
- [ ] **Step 3: Smoke test** — `cd apps/learn && bun run dev`, open `/app`, switch skin → `data-skin` on `<body>` flips → token colors change; persists on reload.
- [ ] **Step 4: Verify + commit** — `bunx vitest run --project learn` green; `git add apps/learn/src && git commit -m "feat(learn): drive skin switching through vibe.skin + data-skin"`

---

## Task 7: `skin-system-rokkit` skill (`@rokkit/cli`)

**Files:** Create `packages/cli/skills/skin-system-rokkit/SKILL.md`; modify `packages/cli/spec/skills.spec.js`.

- [ ] **Step 1: Update catalog test first** — add to the `listSkills` assertion in `packages/cli/spec/skills.spec.js`:
```js
		expect(names).toContain('skin-system-rokkit')
```
- [ ] **Step 2: Run to verify it fails** — `bunx vitest run --project cli packages/cli/spec/skills.spec.js` → FAIL.
- [ ] **Step 3: Author** `packages/cli/skills/skin-system-rokkit/SKILL.md`, beginning EXACTLY:
```
---
name: skin-system-rokkit
description: Use when switching color skins (which palette backs paper/ink/primary/accent) in a Rokkit (Svelte 5) app — the vibe.skin state, the data-skin mechanism, themable sync, defining skins in rokkit.config.js (skins:), built-in skins, SkinSwitcherToggle, and the skinnable action for dynamic/runtime skins.
---
```
Body (verified against the shipped API from Tasks 1–6; match `semantic-styles-rokkit` voice, ~150–250 lines): the skin concept (palette per named token); defining skins (`skins:` in rokkit.config + built-ins); switching at runtime (`vibe.skin` + `vibe.allowedSkins`, `themable` writes `data-skin`, `SkinSwitcherToggle`); the `data-skin` CSS mechanism (default on `:root`, `[data-skin='name']` overrides); `skinnable` for dynamic/server skins; common mistakes (forgetting to set `allowedSkins`; using the removed `skin-{name}` class instead of `data-skin`; hand-rolling skin CSS).
- [ ] **Step 4: Verify** — frontmatter exact; `bunx vitest run --project cli packages/cli/spec/skills.spec.js` → PASS; fences balanced.
- [ ] **Step 5: Commit** — `git add packages/cli/skills/skin-system-rokkit packages/cli/spec/skills.spec.js && git commit -m "feat(cli): add skin-system-rokkit skill"`

---

## Task 8: Guides + reference docs

**Files:** Create `docs/llms/guides/skins.txt`, `docs/llms/components/skin-switcher-toggle.txt`, `apps/learn/src/lib/guides/skins/content.md`; modify `docs/llms/packages/{states,actions,unocss,themes}.txt`, `docs/llms/guides/theming.txt`, `apps/learn/src/lib/guides/index.ts`.

- [ ] **Step 1: llms skins guide** `docs/llms/guides/skins.txt` (mirror `theming.txt`): the skin concept, `skins:` config + built-ins, `data-skin` mechanism, `vibe.skin`/`allowedSkins` + `themable`, `SkinSwitcherToggle`, `skinnable` for dynamic skins.
- [ ] **Step 2: component doc** `docs/llms/components/skin-switcher-toggle.txt` (mirror an existing component doc): props (`skins`, `labels`, `showLabels`, `size`, `disabled`, `onchange`), that it drives `vibe.skin`.
- [ ] **Step 3: package docs** — `states.txt` (`vibe.skin`/`allowedSkins`), `actions.txt` (`themable` writes `data-skin`; `skinnable` as runtime applicator), `unocss.txt` (`[data-skin]` emission + `BUILTIN_SKINS`), `themes.txt` (skins). Update `guides/theming.txt`'s skin section to describe `data-skin` as the live mechanism (it currently says `skin-{name}` class from the earlier audit) and reference the skins guide.
- [ ] **Step 4: learn guide page** `apps/learn/src/lib/guides/skins/content.md` + register in `apps/learn/src/lib/guides/index.ts` (import `?raw` + add a `{ slug: 'skins', ... }` entry, same as `commands`/`theming`).
- [ ] **Step 5: Verify fences balanced** in each created/edited file; confirm no snippet references the removed `skin-{name}` class as current API.
- [ ] **Step 6: Commit** — `git add docs/llms apps/learn/src/lib/guides && git commit -m "docs: skin system guide + reference (llms + learn)"`

---

## Task 9: Full verification

- [ ] **Step 1:** `bun run test:ci` → all projects pass (incl. new states/actions/unocss/app/cli specs).
- [ ] **Step 2:** `bun run lint` → 0 errors (warnings acceptable).
- [ ] **Step 3:** `node packages/cli/src/index.js skills list` → 4 skills incl. `skin-system-rokkit`.
- [ ] **Step 4:** Grep that the removed `skin-{name}` class isn't referenced as current API anywhere (`grep -rn "skin-default\|skin-{name}\|@apply skin-" packages apps docs | grep -v node_modules | grep -v dist`) — only intentional/historical mentions remain.
- [ ] **Step 5:** Confirm every new/modified `.svelte` passed the Svelte MCP autofixer.

---

## Release (after completion — only when the user authorizes)

Coordinated patch via `bun run bump patch --yes` → next version; merge `develop → main`; CI publishes. **Breaking:** the `skin-{name}` utility class is removed from `@rokkit/unocss` (consumers using `class="skin-x"` switch to `data-skin="x"`) — call it out in release notes. `rokkit skills add skin-system-rokkit` then goes live.

## Phasing note (out of scope for this plan)
- **Phase 2:** per-role overrides folded into skins config (`vibe.skin` → `{ name, overrides }` or a config override layer; `PaletteManager` wired in).
- **Phase 3:** dynamic skins not in `rokkit.config` — runtime/server colorsets applied via `skinnable` + `data-skin`.
