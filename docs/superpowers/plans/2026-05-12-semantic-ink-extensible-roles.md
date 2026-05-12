# Semantic Ink & Extensible Color Roles — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ink as an inverted-surface text role, support user-defined custom color roles and aliases, generalize dual-palette to all roles, and switch themes from pre-compiled dist to source-level compilation.

**Architecture:** Four layers of change — (1) core constants/theme to support ink + inverted z-scale, (2) unocss config/preset to handle aliases + custom roles + validation, (3) themes package.json to ship source instead of dist, (4) app CSS imports + demo config to use ink. Each task is independently testable via the existing unit test suite (`bun run test:ci`).

**Tech Stack:** JavaScript/TypeScript, UnoCSS, Vitest, CSS custom properties, OKLCH color space

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `packages/core/src/constants.js` | Modify | Add `ink` to `DEFAULT_THEME_MAPPING`, add `INVERTED_ROLES` set |
| `packages/core/src/theme.ts` | Modify | Inverted z-scale in `getZScaleCSS()`, alias-aware `getColorRules()` + `getPalette()` |
| `packages/core/spec/theme.spec.js` | Modify | Tests for ink z-scale inversion, alias resolution, custom roles |
| `packages/unocss/src/config.js` | Modify | Alias/custom role validation, `isAlias()` predicate, `resolveColormap()` handles alias objects |
| `packages/unocss/src/preset.ts` | Modify | Alias-aware `buildPreflights()`, `buildSemanticShortcuts()`, `buildTheme()` |
| `packages/unocss/spec/config.spec.js` | Modify | Validation tests: circular, chained, missing-target aliases |
| `packages/unocss/spec/preset.spec.js` | Modify | Integration test: alias color rules, ink shortcuts |
| `packages/themes/package.json` | Modify | Remap `.css` exports from `dist/` to `src/`, update `files` and `prepublishOnly` |
| `packages/themes/build.mjs` | Modify | Add validation-only mode banner, keep for CI |
| `demo/rokkit.config.js` | Modify | Add `ink` to default skin |
| `demo/src/app.css` | Modify | Change `@import` paths from `.css` to source paths |
| `site/src/app.css` | Modify | Same import path changes |
| `.github/workflows/publish.yml` | No change | `prepublishOnly` still runs; it just copies LICENSE now |

---

## Task 1: Add ink to DEFAULT_THEME_MAPPING + INVERTED_ROLES

**Files:**
- Modify: `packages/core/src/constants.js:155-166`
- Test: `packages/core/spec/theme.spec.js`

- [ ] **Step 1: Write failing tests for ink in default mapping**

Add to `packages/core/spec/theme.spec.js` at the end of the `Theme class` describe block:

```js
it('should include ink in default mapping', () => {
	const theme = new Theme()
	expect(theme.mapping).toHaveProperty('ink')
})

it('should fallback ink to surface palette when not explicitly set', () => {
	const theme = new Theme()
	expect(theme.mapping.ink).toBe('slate')
	expect(theme.mapping.surface).toBe('slate')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && bun run test -- --reporter=verbose 2>&1 | grep "ink"`
Expected: FAIL — `ink` not found in mapping

- [ ] **Step 3: Add ink to DEFAULT_THEME_MAPPING and COLOR_FALLBACKS**

In `packages/core/src/constants.js`, change `DEFAULT_THEME_MAPPING`:

```js
export const DEFAULT_THEME_MAPPING = {
	surface: 'slate',
	ink: 'slate',
	primary: 'orange',
	secondary: 'pink',
	tertiary: 'violet',
	accent: 'sky',
	success: 'green',
	warning: 'yellow',
	danger: 'red',
	error: 'red',
	info: 'cyan'
}
```

Add `INVERTED_ROLES` constant below `TONE_MAP`:

```js
export const INVERTED_ROLES = new Set(['ink'])
```

Export `INVERTED_ROLES` — it's already auto-exported by the `export const` syntax.

In `packages/core/src/theme.ts`, add `ink` to `COLOR_FALLBACKS`:

```js
const COLOR_FALLBACKS = {
	ink: 'surface',
	tertiary: 'primary',
	secondary: 'primary',
	accent: 'primary',
	error: 'danger'
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/core && bun run test`
Expected: All 36+ tests pass including the 2 new ones

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/constants.js packages/core/src/theme.ts packages/core/spec/theme.spec.js
git commit -m "feat(core): add ink to DEFAULT_THEME_MAPPING with surface fallback"
```

---

## Task 2: Inverted z-scale for ink in getZScaleCSS()

**Files:**
- Modify: `packages/core/src/theme.ts:257-274`
- Test: `packages/core/spec/theme.spec.js`

- [ ] **Step 1: Write failing test for inverted z-scale**

Add to `packages/core/spec/theme.spec.js`:

```js
import { INVERTED_ROLES } from '../src/constants'

describe('getZScaleCSS — inverted roles', () => {
	it('should generate inverted z-scale for ink (z1 light → shade 900)', () => {
		const theme = new Theme()
		const css = theme.getZScaleCSS()
		// Normal: surface z1 → 100 in light
		expect(css).toContain('--color-surface-z1: var(--color-surface-100);')
		// Inverted: ink z1 → 900 in light (1000 - 100 = 900)
		expect(css).toContain('--color-ink-z1: var(--color-ink-900);')
	})

	it('should generate inverted dark z-scale for ink (z1 dark → shade 100)', () => {
		const theme = new Theme()
		const css = theme.getZScaleCSS()
		// In the dark block: normal surface z1 → 900
		// In the dark block: inverted ink z1 → 100
		const darkBlock = css.split('[data-mode="dark"]')[1]
		expect(darkBlock).toContain('--color-ink-z1: var(--color-ink-100);')
		expect(darkBlock).toContain('--color-surface-z1: var(--color-surface-900);')
	})

	it('should keep z5 identical for both surface and ink (midpoint)', () => {
		const theme = new Theme()
		const css = theme.getZScaleCSS()
		expect(css).toContain('--color-surface-z5: var(--color-surface-500);')
		expect(css).toContain('--color-ink-z5: var(--color-ink-500);')
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/core && bun run test -- --reporter=verbose 2>&1 | grep "inverted"`
Expected: FAIL — ink z1 maps to 100 (not inverted yet)

- [ ] **Step 3: Implement inverted z-scale in getZScaleCSS()**

In `packages/core/src/theme.ts`, update the import:

```js
import { DEFAULT_THEME_MAPPING, defaultColors, TONE_MAP, INVERTED_ROLES } from './constants'
```

Replace `getZScaleCSS()` method:

```js
getZScaleCSS() {
	const names = Object.keys(this.#mapping)

	const lightLines = names.flatMap((name) =>
		Object.entries(TONE_MAP).map(([zone, light]) => {
			const value = INVERTED_ROLES.has(name) ? 1000 - light : light
			return `  --color-${name}-${zone}: var(--color-${name}-${value});`
		})
	)

	const darkLines = names.flatMap((name) =>
		Object.entries(TONE_MAP).map(([zone, light]) => {
			const dark = 1000 - light
			const value = INVERTED_ROLES.has(name) ? light : dark
			return `  --color-${name}-${zone}: var(--color-${name}-${value});`
		})
	)

	return `:root {\n${lightLines.join('\n')}\n}\n[data-mode="dark"] {\n${darkLines.join('\n')}\n}`
}
```

Logic: for normal roles, light=shade, dark=1000-shade. For inverted roles, light=1000-shade, dark=shade. This means ink's z-scale is always the complement of surface's.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/core && bun run test`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/theme.ts packages/core/spec/theme.spec.js
git commit -m "feat(core): inverted z-scale for ink role in getZScaleCSS()"
```

---

## Task 3: Alias detection + validation in config.js

**Files:**
- Modify: `packages/unocss/src/config.js`
- Test: `packages/unocss/spec/config.spec.js`

- [ ] **Step 1: Write failing validation tests**

Add to `packages/unocss/spec/config.spec.js`:

```js
describe('alias validation', () => {
	it('should detect alias objects in colormap', () => {
		const config = loadConfig({
			skins: {
				default: {
					surface: 'slate',
					primary: 'orange',
					paper: { alias: 'surface' }
				}
			}
		})
		const colormap = resolveColormap(config)
		expect(colormap.paper).toEqual({ alias: 'surface' })
	})

	it('should reject circular aliases', () => {
		expect(() => loadConfig({
			skins: {
				default: {
					surface: { alias: 'paper' },
					paper: { alias: 'surface' },
					primary: 'orange'
				}
			}
		})).toThrow(/[Cc]ircular/)
	})

	it('should reject chained aliases', () => {
		expect(() => loadConfig({
			skins: {
				default: {
					surface: 'slate',
					paper: { alias: 'surface' },
					parchment: { alias: 'paper' },
					primary: 'orange'
				}
			}
		})).toThrow(/[Cc]hain/)
	})

	it('should reject alias pointing to undefined role', () => {
		expect(() => loadConfig({
			skins: {
				default: {
					surface: 'slate',
					paper: { alias: 'canvas' },
					primary: 'orange'
				}
			}
		})).toThrow(/not defined/)
	})

	it('should accept valid forward alias', () => {
		const config = loadConfig({
			skins: {
				default: {
					surface: 'slate',
					primary: 'orange',
					paper: { alias: 'surface' }
				}
			}
		})
		expect(resolveColormap(config).paper).toEqual({ alias: 'surface' })
	})

	it('should accept custom roles as plain strings', () => {
		const config = loadConfig({
			skins: {
				default: {
					surface: 'slate',
					primary: 'orange',
					canvas: 'stone',
					annotation: 'amber'
				}
			}
		})
		const colormap = resolveColormap(config)
		expect(colormap.canvas).toBe('stone')
		expect(colormap.annotation).toBe('amber')
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/unocss && bun run test -- --reporter=verbose 2>&1 | grep -E "alias|circular|chain"`
Expected: FAIL — no validation exists yet

- [ ] **Step 3: Implement alias validation in config.js**

In `packages/unocss/src/config.js`, add the helper and validation:

```js
/**
 * Returns true when a colormap value is an alias object ({ alias: 'target' }).
 */
export function isAlias(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value) && 'alias' in value
}

/**
 * Validates alias entries in a colormap.
 * - Alias target must exist as a non-alias entry
 * - No circular aliases (A→B, B→A)
 * - No chained aliases (A→B, B→C where B is also an alias)
 */
function validateAliases(colormap) {
	const aliases = Object.entries(colormap).filter(([, v]) => isAlias(v))
	const aliasNames = new Set(aliases.map(([k]) => k))

	for (const [name, value] of aliases) {
		const target = value.alias

		// Target must exist in the colormap
		if (!(target in colormap)) {
			throw new Error(`Alias '${name}' points to '${target}' which is not defined in this skin.`)
		}

		// Target must not be another alias (no chaining)
		if (isAlias(colormap[target])) {
			// Check if it's circular (A→B, B→A)
			if (colormap[target].alias === name) {
				throw new Error(`Circular alias: '${name}' → '${target}' → '${name}'.`)
			}
			throw new Error(`Chained alias: '${name}' → '${target}' which is itself an alias. Aliases must point to a real palette.`)
		}
	}
}
```

Update `resolveColormap()` to call validation:

```js
export function resolveColormap(config) {
	let colormap
	if (Object.keys(config.skins).length > 0) {
		colormap = config.skins.default ?? config.skin
	} else {
		colormap = config.skin
	}
	validateAliases(colormap)
	return colormap
}
```

Export `isAlias` for use in preset.ts.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd packages/unocss && bun run test`
Expected: All tests pass including 6 new alias validation tests

- [ ] **Step 5: Commit**

```bash
git add packages/unocss/src/config.js packages/unocss/spec/config.spec.js
git commit -m "feat(unocss): alias validation — circular, chained, missing target detection"
```

---

## Task 4: Alias-aware color rules + shortcuts in preset.ts

**Files:**
- Modify: `packages/unocss/src/preset.ts:44-168`
- Test: `packages/unocss/spec/preset.spec.js`

- [ ] **Step 1: Write failing tests for alias color rule resolution**

Add to `packages/unocss/spec/preset.spec.js`:

```js
describe('alias color rules', () => {
	it('should generate color rules for alias target, keyed by alias name', () => {
		const config = loadConfig({
			skins: {
				default: {
					surface: 'slate',
					primary: 'orange',
					paper: { alias: 'surface' }
				}
			}
		})
		const colormap = resolveColormap(config)
		const theme = buildTheme(config, colormap)
		const rules = theme.getColorRules()
		// paper should have color rules that point to surface's CSS vars
		expect(rules).toHaveProperty('paper')
		expect(rules.paper[500]).toContain('--color-surface-500')
	})

	it('should generate semantic shortcuts for alias names', () => {
		const config = loadConfig({
			skins: {
				default: {
					surface: 'slate',
					primary: 'orange',
					paper: { alias: 'surface' }
				}
			}
		})
		const colormap = resolveColormap(config)
		const theme = buildTheme(config, colormap)
		const shortcuts = buildSemanticShortcuts(theme, colormap)
		const paperShortcuts = shortcuts.filter(s =>
			typeof s === 'string' ? s.includes('paper') :
			Array.isArray(s) && typeof s[0] === 'string' && s[0].includes('paper')
		)
		expect(paperShortcuts.length).toBeGreaterThan(0)
	})

	it('should generate color rules for custom roles', () => {
		const config = loadConfig({
			palettes: {},
			skins: {
				default: {
					surface: 'slate',
					primary: 'orange',
					canvas: 'stone'
				}
			}
		})
		const colormap = resolveColormap(config)
		const theme = buildTheme(config, colormap)
		const rules = theme.getColorRules()
		expect(rules).toHaveProperty('canvas')
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/unocss && bun run test -- --reporter=verbose 2>&1 | grep "alias\|custom"`
Expected: FAIL — alias not handled

- [ ] **Step 3: Implement alias-aware buildTheme and buildSemanticShortcuts**

In `packages/unocss/src/preset.ts`, import `isAlias`:

```ts
import { loadConfig, resolveColormap, isAlias } from './config.js'
```

Update `buildTheme()` to pass alias-resolved mapping to Theme:

```ts
function buildTheme(config, colormap) {
	const resolvedMapping = resolveAliasMapping(colormap, config)
	return new Theme({
		colors: { ...defaultColors, ...config.palettes },
		mapping: resolveMappingForMode(resolvedMapping, 'light'),
		colorSpace: config.colorSpace
	})
}
```

Add `resolveAliasMapping()` helper:

```ts
/**
 * Builds a flat mapping from colormap, resolving aliases.
 * An alias `paper: { alias: 'surface' }` is excluded from the palette mapping
 * (no CSS vars generated) but gets color rules that point to the target's vars.
 *
 * Custom roles (non-core, non-alias) are passed through as normal palette entries.
 */
function resolveAliasMapping(colormap, config) {
	const mapping = {}
	for (const [role, value] of Object.entries(colormap)) {
		if (isAlias(value)) continue // aliases handled separately in color rules
		if (isDualPalette(value)) {
			mapping[role] = value.light ?? value.dark ?? null
		} else {
			mapping[role] = value
		}
	}
	return mapping
}
```

Update `buildSemanticShortcuts()` to include alias shortcuts:

```ts
function buildSemanticShortcuts(theme, colormap) {
	const shortcuts = []
	for (const [role, value] of Object.entries(colormap)) {
		if (isAlias(value)) {
			// Alias shortcuts: bg-paper-z5 expands same as bg-surface-z5
			shortcuts.push(...theme.getShortcuts(role))
		} else {
			shortcuts.push(...theme.getShortcuts(role))
		}
	}
	return shortcuts
}
```

Update `buildPreflights()` to handle aliases in dark block and custom roles:

```ts
function buildPreflights(theme, colormap, config) {
	const rootVars = toCssBlock(theme.getPalette())
	const extraVars = [...buildTypographyVars(config.typography), ...buildRadiusVars(config.shape)]
	const allVars = extraVars.length > 0 ? `${rootVars};${extraVars.join(';')}` : rootVars

	let darkBlock = ''
	const nonAliasColormap = Object.fromEntries(
		Object.entries(colormap).filter(([, v]) => !isAlias(v))
	)
	if (hasDualPaletteMapping(nonAliasColormap)) {
		const darkTheme = new Theme({
			colors: { ...defaultColors, ...config.palettes },
			mapping: resolveMappingForMode(nonAliasColormap, 'dark'),
			colorSpace: config.colorSpace
		})
		darkBlock = `[data-mode="dark"]{${toCssBlock(darkTheme.getPalette())}}`
	}

	return [{ getCSS: () => `:root{${allVars}}${darkBlock}` }]
}
```

For alias color rules, update `Theme.getColorRules()` in `packages/core/src/theme.ts` to accept an `aliases` map:

```ts
getColorRules(mapping = null, aliases = {}) {
	const variants = Object.entries({ ...this.#mapping, ...mapping })
	const rules = variants.reduce(
		(acc, [variant, key]) => ({
			...acc,
			[variant]: this.mapVariant(this.#colors[key], variant)
		}),
		{}
	)
	// Alias color rules: point to the target's CSS variables
	for (const [aliasName, targetName] of Object.entries(aliases)) {
		if (rules[targetName]) {
			rules[aliasName] = this.mapVariant(this.#colors[this.#mapping[targetName]], targetName)
		}
	}
	return rules
}
```

In `preset.ts`, pass aliases to `getColorRules()`:

```ts
function buildThemeColors(theme, colormap, config) {
	const aliases = {}
	for (const [role, value] of Object.entries(colormap)) {
		if (isAlias(value)) aliases[role] = value.alias
	}
	return { ...theme.getColorRules(null, aliases), ...config.palettes }
}
```

Update the `presetRokkit()` function to use `buildThemeColors()`:

```ts
theme: {
	fontFamily: FONT_FAMILIES,
	colors: buildThemeColors(theme, colormap, config)
}
```

- [ ] **Step 4: Run full test suite**

Run: `bun run test:ci`
Expected: All 3348+ tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/unocss/src/preset.ts packages/core/src/theme.ts packages/unocss/spec/preset.spec.js
git commit -m "feat(unocss): alias-aware color rules and semantic shortcuts"
```

---

## Task 5: Generalize dual-palette to all roles

**Files:**
- Modify: `packages/unocss/src/preset.ts` (already partially supports dual-palette for surface)
- Test: `packages/unocss/spec/preset.spec.js`

- [ ] **Step 1: Write failing test for dual-palette on non-surface role**

Add to `packages/unocss/spec/preset.spec.js`:

```js
it('should generate dark overrides for any dual-palette role', () => {
	const preset = presetRokkit({
		palettes: {},
		skins: {
			default: {
				surface: 'slate',
				primary: { light: 'orange', dark: 'amber' },
			}
		}
	})
	const css = preset.preflights[0].getCSS()
	// Dark block should contain primary vars with amber palette
	expect(css).toContain('[data-mode="dark"]')
	expect(css).toContain('--color-primary')
})
```

- [ ] **Step 2: Run test — should already pass (existing code handles this)**

Run: `cd packages/unocss && bun run test`
Expected: PASS — `hasDualPaletteMapping()` + `resolveMappingForMode()` already handle any role. If it passes, this task confirms existing behavior works. If it fails, debug.

- [ ] **Step 3: Commit test as documentation**

```bash
git add packages/unocss/spec/preset.spec.js
git commit -m "test(unocss): verify generalized dual-palette works on all roles"
```

---

## Task 6: Source-level theme distribution

**Files:**
- Modify: `packages/themes/package.json`
- Modify: `demo/src/app.css`
- Modify: `site/src/app.css`

- [ ] **Step 1: Update themes package.json exports to point to src/**

In `packages/themes/package.json`, replace the `.css` export entries that point to `dist/`:

```json
"./base.css": { "style": "./src/base/index.css", "default": "./src/base/index.css" },
"./rokkit.css": { "style": "./src/rokkit/index.css", "default": "./src/rokkit/index.css" },
"./minimal.css": { "style": "./src/minimal/index.css", "default": "./src/minimal/index.css" },
"./material.css": { "style": "./src/material/index.css", "default": "./src/material/index.css" },
"./frosted.css": { "style": "./src/frosted/index.css", "default": "./src/frosted/index.css" },
"./zen-sumi.css": { "style": "./src/zen-sumi/index.css", "default": "./src/zen-sumi/index.css" }
```

Remove the `./dist/*` entries entirely. Keep `./dist` for backward compat warning if needed.

Update `files` field — remove `"dist"`:

```json
"files": ["src", "build.mjs", "README.md", "LICENSE"]
```

Update `prepublishOnly` — remove build step:

```json
"prepublishOnly": "cp ../../LICENSE ."
```

- [ ] **Step 2: Update demo/src/app.css imports**

The imports `@import '@rokkit/themes/base.css'` now resolve to `src/base/index.css` (source CSS with `@apply`). No path changes needed — the package.json export remap handles it.

Verify the demo still builds:

Run: `cd demo && bun run build 2>&1 | tail -5`
Expected: Build succeeds — UnoCSS `transformerDirectives` processes the `@apply` directives in the imported source CSS.

- [ ] **Step 3: Verify site builds**

Run: `cd site && bun run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Run full test suite**

Run: `bun run test:ci`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add packages/themes/package.json
git commit -m "feat(themes)!: ship source CSS instead of pre-compiled dist

BREAKING CHANGE: @rokkit/themes exports now point to src/ with @apply
directives. Consumers must have presetRokkit() with transformerDirectives
configured (already the default setup)."
```

---

## Task 7: Add ink to demo config + migrate zen-sumi text tokens

**Files:**
- Modify: `demo/rokkit.config.js:99-121`
- Modify: `packages/themes/src/zen-sumi/*.css` (selective text token migration)

- [ ] **Step 1: Add ink to demo rokkit.config.js default skin**

```js
default: {
	surface:   { light: 'kami', dark: 'sumi' },
	ink:       { light: 'sumi', dark: 'kami' },
	primary:   'shu',
	secondary: 'hisui',
	tertiary:  'kohaku',
	accent:    'shu',
	success:   'hisui',
	warning:   'kohaku',
	danger:    'shu',
	error:     'shu',
	info:      'kohaku'
},
```

- [ ] **Step 2: Migrate key zen-sumi text tokens to use ink**

Search for `text-surface-z7`, `text-surface-z8`, `text-surface-z9` in zen-sumi CSS files. These are text/foreground usages that should use `text-ink-z*` instead. The z-level stays the same but the mapping inverts.

Since ink is inverted, `text-surface-z9` (dark text in light mode) becomes `text-ink-z1` (dark text from the ink scale). The mapping:

| Old token | z-level meaning | New token |
|-----------|----------------|-----------|
| `text-surface-z9` | darkest text | `text-ink-z1` |
| `text-surface-z8` | near-dark text | `text-ink-z2` |
| `text-surface-z7` | medium-dark text | `text-ink-z3` |
| `text-surface-z6` | medium text | `text-ink-z4` |
| `text-surface-z5` | mid-weight text | `text-ink-z5` |

Do NOT migrate `bg-surface-*` or `border-surface-*` — only `text-surface-*` tokens used for foreground text.

Run a grep to find candidates:

```bash
grep -n 'text-surface-z[5-9]' packages/themes/src/zen-sumi/*.css
```

For each file, replace `text-surface-zN` with the corresponding `text-ink-zM` where M = 10 - N (to maintain the same visual appearance, since ink's z-scale is inverted).

- [ ] **Step 3: Rebuild themes and verify**

Run: `cd packages/themes && bun run build`
Expected: Build succeeds, zero `oklch(var(` patterns in dist

- [ ] **Step 4: Verify demo builds and renders**

Run: `cd demo && bun run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 5: Run full test suite**

Run: `bun run test:ci`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add demo/rokkit.config.js packages/themes/src/zen-sumi/
git commit -m "feat(demo): add ink role to zen-sumi skin, migrate text tokens"
```

---

## Task 8: Contrast warning for ink/surface pairs

**Files:**
- Modify: `packages/unocss/src/preset.ts`
- Test: `packages/unocss/spec/preset.spec.js`

- [ ] **Step 1: Write failing test for contrast warning**

Add to `packages/unocss/spec/preset.spec.js`:

```js
describe('contrast warnings', () => {
	it('should warn when ink and surface have low contrast at z1', () => {
		const warnings = []
		const origWarn = console.warn
		console.warn = (msg) => warnings.push(msg)

		// Use the same palette for both ink and surface WITHOUT inversion
		// This simulates a misconfigured palette
		presetRokkit({
			palettes: {
				flat: {
					50: '0.5 0 0', 100: '0.5 0 0', 200: '0.5 0 0', 300: '0.5 0 0',
					400: '0.5 0 0', 500: '0.5 0 0', 600: '0.5 0 0', 700: '0.5 0 0',
					800: '0.5 0 0', 900: '0.5 0 0', 950: '0.5 0 0'
				}
			},
			colorSpace: 'oklch',
			skins: {
				default: {
					surface: 'flat',
					ink: 'flat',
					primary: 'flat'
				}
			}
		})

		console.warn = origWarn
		expect(warnings.some(w => /contrast/i.test(w))).toBe(true)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/unocss && bun run test -- --reporter=verbose 2>&1 | grep "contrast"`
Expected: FAIL — no warning emitted

- [ ] **Step 3: Implement contrast check in presetRokkit()**

Add a contrast check function in `packages/unocss/src/preset.ts`:

```ts
/**
 * Checks OKLCH lightness contrast between ink and surface at key z-levels.
 * Warns if the contrast is too low for readable text.
 */
function checkInkContrast(config, colormap) {
	const inkPalette = resolvePaletteForRole('ink', colormap, config)
	const surfacePalette = resolvePaletteForRole('surface', colormap, config)
	if (!inkPalette || !surfacePalette) return

	const checkLevels = [
		{ z: 'z1', inkShade: 900, surfaceShade: 100 },
		{ z: 'z3', inkShade: 700, surfaceShade: 300 },
	]

	for (const { z, inkShade, surfaceShade } of checkLevels) {
		const inkL = parseLightness(inkPalette[inkShade])
		const surfaceL = parseLightness(surfacePalette[surfaceShade])
		if (inkL !== null && surfaceL !== null) {
			const diff = Math.abs(inkL - surfaceL)
			if (diff < 0.3) {
				console.warn(
					`rokkit: ink-${z} on surface-${z} has low lightness contrast (${diff.toFixed(2)}). ` +
					`Consider a palette with more tonal range for ink.`
				)
			}
		}
	}
}

function resolvePaletteForRole(role, colormap, config) {
	const value = colormap[role]
	if (!value) return null
	if (isAlias(value)) return null
	const paletteName = isDualPalette(value) ? (value.light ?? value.dark) : value
	return config.palettes[paletteName] ?? null
}

function parseLightness(oklchStr) {
	if (!oklchStr || typeof oklchStr !== 'string') return null
	const parts = oklchStr.trim().split(/\s+/)
	return parts.length >= 1 ? parseFloat(parts[0]) : null
}
```

Call `checkInkContrast()` in `presetRokkit()` after building the theme:

```ts
export function presetRokkit(options = {}): Preset {
	const config = loadConfig(options)
	const colormap = resolveColormap(config)
	const theme = buildTheme(config, colormap)
	checkInkContrast(config, colormap)
	// ... rest unchanged
```

- [ ] **Step 4: Run tests**

Run: `cd packages/unocss && bun run test`
Expected: All tests pass including contrast warning test

- [ ] **Step 5: Commit**

```bash
git add packages/unocss/src/preset.ts packages/unocss/spec/preset.spec.js
git commit -m "feat(unocss): build-time contrast warning for low ink/surface pairs"
```

---

## Task 9: Update CI + docs references

**Files:**
- Modify: `packages/cli/src/init.js` (import paths)
- Modify: `docs/llms/packages/themes.txt`
- Modify: `docs/llms/index.txt`
- Modify: `packages/themes/README.md`

- [ ] **Step 1: Update CLI init to use source imports**

In `packages/cli/src/init.js:168-170`, the generated `app.css` already uses `@import '@rokkit/themes/base.css'` which resolves through the package.json exports. No change needed — the export remap in Task 6 handles it.

Verify: `grep -n "themes" packages/cli/src/init.js`

- [ ] **Step 2: Update docs/llms references**

In `docs/llms/index.txt`, replace:
```
@import '@rokkit/themes/dist/base';
@import '@rokkit/themes/dist/rokkit';
```
with:
```
@import '@rokkit/themes/base.css';
@import '@rokkit/themes/rokkit.css';
```

In `docs/llms/packages/themes.txt`, remove references to `shadcn.css` (deleted theme), verify import examples are correct.

Update `packages/themes/README.md` to remove `dist/` references and add note about UnoCSS requirement.

- [ ] **Step 3: Run CLI tests**

Run: `cd packages/cli && bun run test`
Expected: All tests pass

- [ ] **Step 4: Run full test suite + lint**

Run: `bun run test:ci && bun run lint`
Expected: 3348+ tests pass, 0 lint errors

- [ ] **Step 5: Commit**

```bash
git add docs/llms/ packages/themes/README.md packages/cli/
git commit -m "docs: update theme import paths for source-level distribution"
```

---

## Task 10: Final integration verification

**Files:** None (verification only)

- [ ] **Step 1: Full test suite**

Run: `bun run test:ci`
Expected: All tests pass

- [ ] **Step 2: Lint**

Run: `bun run lint`
Expected: 0 errors

- [ ] **Step 3: Demo build + preview**

Run: `cd demo && bun run build && npx vite preview --port 4177 &`
Navigate to `http://localhost:4177/settings`, switch to zen-sumi, verify:
- Light mode renders correctly
- Dark mode renders correctly
- Focus rings visible on interactive elements
- Text contrast appropriate

- [ ] **Step 4: Site build**

Run: `cd site && bun run build`
Expected: Build succeeds

- [ ] **Step 5: Themes validation build**

Run: `cd packages/themes && bun run build`
Expected: All theme CSS files compile successfully (validation mode)

- [ ] **Step 6: Verify ink CSS variables exist in compiled output**

Run: `grep 'ink' packages/themes/dist/zen-sumi.css | head -5`
Expected: `--color-ink-*` variables present in compiled CSS

- [ ] **Step 7: Update journal**

Add entry to `agents/journal.md` documenting the ink + extensible roles implementation.

- [ ] **Step 8: Final commit**

```bash
git add agents/journal.md
git commit -m "docs(journal): log semantic ink + extensible roles implementation"
```
