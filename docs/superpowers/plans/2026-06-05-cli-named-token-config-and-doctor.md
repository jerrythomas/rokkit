# CLI Named-Token Config + Doctor + LLM Docs — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `rokkit init` generate configs in the current named-token shape (selectable Tailwind-rgb vs Zen-Sumi OKLCH starters with a concise header comment), refresh `rokkit doctor` (real starter on `--fix`, config-shape validation, advisory z-scale migration hints), and rewrite the LLM-facing docs to teach named tokens.

**Architecture:** Pure functions (`resolveSkin`, `generateZenSumiConfig`, `serializeRokkitConfig`, `validateConfigShape`, `findLegacyZUtilities`) hold all logic and are unit-tested directly; the `init`/`doctor` command wrappers stay thin (gather files → call pure fns → print/write). The UnoCSS preset's z-scale back-compat is untouched.

**Tech Stack:** Node ESM, `sade` CLI, `prompts`, Vitest. Package: `packages/cli`. Run tests with `bun`.

**Spec:** `docs/superpowers/specs/2026-06-05-cli-named-token-config-and-doctor-design.md`

---

## File Structure

| File | Change | Responsibility |
|------|--------|----------------|
| `packages/cli/src/init.js` | modify | rgb skin gen, OKLCH starter, header serializer, prompt choice |
| `packages/cli/src/doctor.js` | modify | real-starter fix, `validateConfigShape`, `findLegacyZUtilities`, wiring |
| `packages/cli/spec/init.spec.js` | modify | migrate `colors`→`skin` assertions, add OKLCH + serializer tests |
| `packages/cli/spec/doctor.spec.js` | modify | add validation + z-scan tests, fix starter expectation |
| `docs/llms/index.txt` | modify | Theming section → named-token first |
| `docs/llms/packages/unocss.txt` | modify | tone-shortcut section → named tokens |
| `docs/llms/packages/themes.txt` | modify | utility-class reference line |
| `docs/llms/packages/core.txt` | modify | `semanticShortcuts` description note |
| `packages/unocss/README.md` | modify | line-60 example → named tokens |
| `agents/journal.md`, `docs/design/12-priority.md` | modify | repo hygiene |

**Implementer note on the header comment (option A):** Both starters serialize through a single `serializeRokkitConfig(config)` (header comment + `JSON.stringify`). The "inline section notes" from the spec are carried in the header (it explains `skin`, `tokens`, and — for OKLCH — `palettes`), rather than interleaved per-key comments, to keep one DRY serialization path. This is the intended realization of option A.

---

## Task 1: rgb starter — `generateConfig` emits the `skin` shape with `ink`

**Files:**
- Modify: `packages/cli/src/init.js` (constants `SKIN_PRESETS`/`DEFAULT_COLORS` ~lines 64-100; `resolveColors`/`generateConfig` ~lines 97-145)
- Test: `packages/cli/spec/init.spec.js`

- [ ] **Step 1: Update the failing tests first**

In `packages/cli/spec/init.spec.js`, replace the first three `generateConfig` tests' color assertions. Change the `'should generate default config object'` test body to:

```js
	it('should generate default config object', () => {
		const config = generateConfig({
			palette: 'default',
			icons: 'rokkit',
			themes: ['rokkit'],
			switcher: 'manual'
		})
		expect(config.skin).toBeDefined()
		expect(config.skin.primary).toBe('orange')
		expect(config.skin.surface).toBe('slate')
		expect(config.skin.ink).toBe('slate')
		expect(config.skin.secondary).toBeUndefined()
		expect(config.colorSpace).toBe('rgb')
		expect(config.tokens).toBe('core')
		expect(config.themes).toEqual(['rokkit'])
		expect(config.defaultTheme).toBe('rokkit')
		expect(config.switcher).toBe('manual')
		expect(config.colors).toBeUndefined()
	})
```

Update `'should apply vibrant skin preset'`:

```js
	it('should apply vibrant skin preset', () => {
		const config = generateConfig({
			palette: 'vibrant',
			icons: 'rokkit',
			themes: ['rokkit'],
			switcher: 'manual'
		})
		expect(config.skin.primary).toBe('blue')
		expect(config.skin.accent).toBe('sky')
	})
```

Update `'should apply custom colors'`:

```js
	it('should apply custom colors', () => {
		const config = generateConfig({
			palette: 'custom',
			customColors: { primary: 'red', surface: 'stone' },
			icons: 'rokkit',
			themes: ['rokkit'],
			switcher: 'system'
		})
		expect(config.skin.primary).toBe('red')
		expect(config.skin.surface).toBe('stone')
		expect(config.skin.ink).toBe('stone')
		expect(config.switcher).toBe('system')
	})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/cli && bun run test -- init.spec.js`
Expected: FAIL — `config.skin` is undefined (generator still emits `colors`).

- [ ] **Step 3: Rewrite the skin constants and `generateConfig`**

In `packages/cli/src/init.js`, replace the `SKIN_PRESETS` and `DEFAULT_COLORS` blocks (lines ~64-100) with:

```js
// Base rgb skin — named-token roles only (no secondary/tertiary; ink defaults to surface).
const DEFAULT_SKIN_BASE = {
	primary: 'orange',
	accent: 'sky',
	surface: 'slate',
	success: 'green',
	warning: 'yellow',
	danger: 'red',
	error: 'red',
	info: 'cyan'
}

const SKIN_PRESETS = {
	default: { primary: 'orange', accent: 'sky', surface: 'slate' },
	vibrant: { primary: 'blue', accent: 'sky', surface: 'slate' },
	seaweed: {
		primary: 'sky',
		accent: 'blue',
		surface: 'zinc',
		danger: 'rose',
		error: 'rose',
		success: 'lime',
		warning: 'amber',
		info: 'indigo'
	}
}

/**
 * Resolve a named-token rgb skin from a preset or custom colors.
 * `ink` defaults to the `surface` palette; `secondary`/`tertiary` are dropped
 * (no named token reads them — the preset's DEFAULT_SKIN merge still provides
 * them if a consumer re-adds them for z-scale palette emit).
 * @param {string} palette
 * @param {Record<string, string>} [customColors]
 * @returns {Record<string, string>}
 */
function resolveSkin(palette, customColors) {
	const merged =
		palette === 'custom'
			? { ...DEFAULT_SKIN_BASE, ...customColors }
			: { ...DEFAULT_SKIN_BASE, ...(SKIN_PRESETS[palette] || {}) }
	return {
		surface: merged.surface,
		ink: merged.ink ?? merged.surface,
		primary: merged.primary,
		accent: merged.accent,
		success: merged.success,
		warning: merged.warning,
		danger: merged.danger,
		error: merged.error,
		info: merged.info
	}
}
```

Then replace the existing `generateConfig` function (lines ~114-145) — for Task 1 write it WITHOUT the OKLCH branch (Task 2 adds it):

```js
export function generateConfig({
	palette,
	customColors,
	icons,
	iconPath,
	iconStyle,
	themes,
	defaultTheme,
	switcher,
	includeChart,
	chartColors,
	chartShades
}) {
	const config = {
		skin: resolveSkin(palette, customColors),
		colorSpace: 'rgb',
		tokens: 'core',
		themes,
		defaultTheme: defaultTheme || themes[0],
		switcher,
		storageKey: 'rokkit-theme'
	}

	const iconConfig = {}
	if (iconStyle) iconConfig.style = iconStyle
	if (icons === 'custom' && iconPath) iconConfig.custom = iconPath
	if (Object.keys(iconConfig).length > 0) config.icons = iconConfig

	if (includeChart) {
		config.chart = generateChartConfig({ chartColors, chartShades })
	}

	return config
}
```

Delete the now-unused `resolveColors` function.

- [ ] **Step 4: Confirm the custom-colors prompt wiring still works**

In `init()` (~lines 417-424) the custom branch builds `customColors` with `primary`/`secondary`/`accent`/`surface`. Leave it as-is — `resolveSkin` reads only the keys it emits, so the extra `secondary` is harmless. No change needed.

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/cli && bun run test -- init.spec.js`
Expected: PASS (the three updated tests; chart tests still pass).

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/init.js packages/cli/spec/init.spec.js
git commit -m "feat(cli): init emits named-token skin shape (skin + ink + tokens)"
```

---

## Task 2: Zen-Sumi OKLCH starter

**Files:**
- Modify: `packages/cli/src/init.js` (add `ZEN_SUMI_PALETTES`, `generateZenSumiConfig`, branch in `generateConfig`, add prompt choice)
- Test: `packages/cli/spec/init.spec.js`

- [ ] **Step 1: Write the failing test**

Add to `packages/cli/spec/init.spec.js` inside `describe('generateConfig', …)`:

```js
	it('should generate the zen-sumi OKLCH starter', () => {
		const config = generateConfig({
			palette: 'zen-sumi',
			icons: 'rokkit',
			themes: ['rokkit', 'zen-sumi'],
			switcher: 'full'
		})
		expect(config.colorSpace).toBe('oklch')
		expect(config.tokens).toBe('core')
		expect(config.palettes.kami).toBeDefined()
		expect(config.palettes.shu['500']).toBe('0.580 0.150 35')
		expect(config.skin.surface).toEqual({ light: 'kami', dark: 'sumi' })
		expect(config.skin.ink).toEqual({ light: 'kami', dark: 'sumi' })
		expect(config.skin.primary).toBe('shu')
		expect(config.shape.radius).toBe('soft')
		expect(config.colors).toBeUndefined()
	})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/cli && bun run test -- init.spec.js`
Expected: FAIL — `generateConfig` ignores `palette: 'zen-sumi'`, returns rgb shape (`config.colorSpace === 'rgb'`).

- [ ] **Step 3: Add the palettes + OKLCH generator**

In `packages/cli/src/init.js`, add above `generateConfig` (palette values copied verbatim from `apps/learn/rokkit.config.js`):

```js
// Zen-Sumi OKLCH palettes — bare "L C H" components (colorSpace: 'oklch').
const ZEN_SUMI_PALETTES = {
	kami: {
		50: '0.985 0.005 85', 100: '0.975 0.008 85', 200: '0.955 0.010 85',
		300: '0.920 0.012 85', 400: '0.850 0.010 70', 500: '0.750 0.008 50',
		600: '0.580 0.010 50', 700: '0.380 0.012 50', 800: '0.280 0.012 50',
		900: '0.220 0.012 50', 950: '0.170 0.010 50'
	},
	sumi: {
		50: '0.170 0.010 50', 100: '0.210 0.012 50', 200: '0.250 0.012 50',
		300: '0.320 0.012 50', 400: '0.420 0.010 50', 500: '0.570 0.010 50',
		600: '0.420 0.012 85', 700: '0.600 0.010 85', 800: '0.780 0.008 85',
		900: '0.940 0.008 85', 950: '0.975 0.008 85'
	},
	shu: {
		50: '0.970 0.020 35', 100: '0.940 0.040 35', 200: '0.880 0.070 35',
		300: '0.800 0.100 35', 400: '0.700 0.130 35', 500: '0.580 0.150 35',
		600: '0.500 0.140 35', 700: '0.420 0.120 35', 800: '0.350 0.100 35',
		900: '0.280 0.080 35', 950: '0.220 0.060 35'
	},
	hisui: {
		50: '0.970 0.015 160', 100: '0.940 0.030 160', 200: '0.880 0.050 160',
		300: '0.800 0.065 160', 400: '0.720 0.075 160', 500: '0.620 0.080 160',
		600: '0.540 0.075 160', 700: '0.460 0.065 160', 800: '0.380 0.055 160',
		900: '0.300 0.045 160', 950: '0.240 0.035 160'
	},
	kohaku: {
		50: '0.980 0.020 75', 100: '0.950 0.040 75', 200: '0.900 0.070 75',
		300: '0.850 0.095 75', 400: '0.790 0.110 75', 500: '0.720 0.120 75',
		600: '0.640 0.110 75', 700: '0.560 0.095 75', 800: '0.470 0.080 75',
		900: '0.380 0.065 75', 950: '0.300 0.050 75'
	}
}

/**
 * Build the Zen-Sumi OKLCH starter (ink-on-paper, dual-palette dark mode).
 * @param {{ themes?: string[], defaultTheme?: string, switcher?: string,
 *   includeChart?: boolean, chartColors?: string, chartShades?: string }} [opts]
 * @returns {Record<string, unknown>}
 */
export function generateZenSumiConfig(opts = {}) {
	const { themes, defaultTheme, switcher, includeChart, chartColors, chartShades } = opts
	const config = {
		palettes: ZEN_SUMI_PALETTES,
		colorSpace: 'oklch',
		tokens: 'core',
		skin: {
			surface: { light: 'kami', dark: 'sumi' },
			ink: { light: 'kami', dark: 'sumi' },
			primary: 'shu',
			accent: 'shu',
			success: 'hisui',
			warning: 'kohaku',
			danger: 'shu',
			error: 'shu',
			info: 'kohaku'
		},
		shape: { radius: 'soft' },
		typography: {
			display: "'Fraunces', 'Iowan Old Style', Georgia, serif",
			sans: "'Inter', system-ui, -apple-system, sans-serif",
			mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace"
		},
		themes: themes && themes.length ? themes : ['rokkit', 'zen-sumi'],
		defaultTheme: defaultTheme || 'zen-sumi',
		switcher: switcher || 'full',
		storageKey: 'rokkit-theme'
	}
	if (includeChart) config.chart = generateChartConfig({ chartColors, chartShades })
	return config
}
```

- [ ] **Step 4: Branch `generateConfig` to the OKLCH path**

In `generateConfig`, add as the first statement (before building the rgb `config`):

```js
	if (palette === 'zen-sumi') {
		return generateZenSumiConfig({ themes, defaultTheme, switcher, includeChart, chartColors, chartShades })
	}
```

- [ ] **Step 5: Add the prompt choice**

In `PROMPTS_CONFIG`, the `palette` select (~line 200), add a choice after `seaweed`:

```js
				{ title: 'Zen-Sumi (OKLCH ink-on-paper)', value: 'zen-sumi' },
```

- [ ] **Step 6: Run test to verify it passes**

Run: `cd packages/cli && bun run test -- init.spec.js`
Expected: PASS (all `generateConfig` tests including the new OKLCH one).

- [ ] **Step 7: Commit**

```bash
git add packages/cli/src/init.js packages/cli/spec/init.spec.js
git commit -m "feat(cli): add Zen-Sumi OKLCH starter to rokkit init"
```

---

## Task 3: `serializeRokkitConfig` with header comment

**Files:**
- Modify: `packages/cli/src/init.js` (add headers + `serializeRokkitConfig`; rewire `writeRokkitConfig`)
- Test: `packages/cli/spec/init.spec.js`

- [ ] **Step 1: Write the failing test**

Add to `packages/cli/spec/init.spec.js` (import `serializeRokkitConfig` and `generateZenSumiConfig` at top):

```js
describe('serializeRokkitConfig', () => {
	it('prepends a named-token header and emits parseable JSON for the rgb starter', () => {
		const config = generateConfig({ palette: 'default', icons: 'rokkit', themes: ['rokkit'], switcher: 'manual' })
		const src = serializeRokkitConfig(config)
		expect(src).toContain('named-token vocabulary')
		expect(src).toContain('bg-paper')
		expect(src).toContain('text-on-primary')
		expect(src).toContain('back-compat')
		const json = src.slice(src.indexOf('export default') + 'export default'.length).trim().replace(/\n$/, '')
		expect(JSON.parse(json).skin.primary).toBe('orange')
	})

	it('includes a palettes note for the OKLCH starter', () => {
		const src = serializeRokkitConfig(generateZenSumiConfig({}))
		expect(src).toContain('palettes')
		expect(src).toContain('oklch')
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/cli && bun run test -- init.spec.js`
Expected: FAIL — `serializeRokkitConfig` is not exported.

- [ ] **Step 3: Add headers + serializer**

In `packages/cli/src/init.js`, add near the top (after imports):

```js
const NAMED_TOKEN_HEADER = `/**
 * Rokkit token configuration — consumed by presetRokkit() in uno.config.js.
 *
 * Maps semantic roles (surface, ink, primary, accent, status…) to palettes.
 * The preset emits the named-token vocabulary used throughout components:
 *
 *   Surface  bg-paper · bg-paper-soft · bg-paper-mute · border-paper-edge
 *   Text     text-ink · text-ink-mute · text-ink-soft · text-ink-faint
 *   Accent   bg-primary · text-on-primary · bg-accent · bg-accent-soft
 *   Status   bg-success-soft · text-success   (+ warning / danger / error / info)
 *
 * Tokens flip automatically under [data-mode="dark"]. The older z-scale
 * utilities (bg-surface-z0, text-primary-z5) still resolve for back-compat,
 * but new code should prefer the named tokens above.
 *
 * tokens: 'core' emits the named vocabulary; 'extended' also emits the full
 * 11-shade palette ladder per role (for charts / data-viz).
 */
`

const OKLCH_PALETTES_NOTE = `/**
 * palettes: bare OKLCH "L C H" components (colorSpace: 'oklch'). surface/ink use
 * a { light, dark } dual palette — kami (warm paper) in light, sumi (ink) in dark.
 */
`

/**
 * Serialize a rokkit config object to a JS module string with a header comment.
 * @param {Record<string, unknown>} config
 * @returns {string}
 */
export function serializeRokkitConfig(config) {
	const palettesNote = config.palettes ? OKLCH_PALETTES_NOTE : ''
	return `${NAMED_TOKEN_HEADER}${palettesNote}export default ${JSON.stringify(config, null, 2)}\n`
}
```

- [ ] **Step 4: Rewire `writeRokkitConfig`**

In `writeRokkitConfig` (~line 324), replace the `writeFileSync` line:

```js
	writeFileSync(configPath, serializeRokkitConfig(config))
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/cli && bun run test -- init.spec.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/init.js packages/cli/spec/init.spec.js
git commit -m "feat(cli): write rokkit.config.js with named-token header comment"
```

---

## Task 4: doctor `--fix` writes the real starter (not `export default {}`)

**Files:**
- Modify: `packages/cli/src/doctor.js` (imports + `applyGenerateConfig` ~lines 4, 164-168)
- Test: `packages/cli/spec/doctor.spec.js`

- [ ] **Step 1: Write the failing test**

Add to `packages/cli/spec/doctor.spec.js` (add the import and a new `describe`):

```js
import { defaultStarterSource } from '../src/doctor.js'

describe('defaultStarterSource', () => {
	it('produces a real named-token starter, not an empty config', () => {
		const src = defaultStarterSource()
		expect(src).not.toBe('export default {}\n')
		expect(src).toContain('skin')
		const json = src.slice(src.indexOf('export default') + 'export default'.length).trim().replace(/\n$/, '')
		expect(JSON.parse(json).skin.ink).toBeDefined()
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/cli && bun run test -- doctor.spec.js`
Expected: FAIL — `defaultStarterSource` not exported.

- [ ] **Step 3: Implement `defaultStarterSource` and use it in the fix**

In `packages/cli/src/doctor.js`, update the import on line 4 to add the two functions:

```js
import {
	generateUnoConfig,
	generateAppCssImports,
	generateInitScript,
	generateChartConfig,
	generateConfig,
	serializeRokkitConfig
} from './init.js'
```

Add a pure helper (near the top, after imports):

```js
/**
 * Build the default named-token starter config source used by `doctor --fix`.
 * @returns {string}
 */
export function defaultStarterSource() {
	const config = generateConfig({
		palette: 'default',
		icons: 'rokkit',
		themes: ['rokkit'],
		switcher: 'manual',
		includeChart: true,
		chartColors: 'default',
		chartShades: 'standard'
	})
	return serializeRokkitConfig(config)
}
```

Replace `applyGenerateConfig` (~lines 164-168) body:

```js
function applyGenerateConfig(cwd, label) {
	const configPath = resolve(cwd, 'rokkit.config.js')
	writeFileSync(configPath, defaultStarterSource())
	console.info(`  Fixed: ${label}`)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/cli && bun run test -- doctor.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/cli/src/doctor.js packages/cli/spec/doctor.spec.js
git commit -m "fix(cli): doctor --fix writes a real named-token starter config"
```

---

## Task 5: `validateConfigShape` — parsed-config warnings

**Files:**
- Modify: `packages/cli/src/doctor.js` (add `validateConfigShape`; wire into `doctor()`)
- Test: `packages/cli/spec/doctor.spec.js`

- [ ] **Step 1: Write the failing tests**

Add to `packages/cli/spec/doctor.spec.js` (import `validateConfigShape` from `../src/doctor.js`):

```js
describe('validateConfigShape', () => {
	it('warns when the colormap has no ink role', () => {
		const checks = validateConfigShape({ skin: { surface: 'slate', primary: 'orange' }, colorSpace: 'rgb' })
		const ink = checks.find((c) => c.id === 'skin-ink-role')
		expect(ink.status).toBe('warn')
	})

	it('passes (no ink warning) when ink is present', () => {
		const checks = validateConfigShape({ skin: { surface: 'slate', ink: 'slate', primary: 'orange' } })
		expect(checks.find((c) => c.id === 'skin-ink-role')).toBeUndefined()
	})

	it('warns when colorSpace is oklch but palettes is empty', () => {
		const checks = validateConfigShape({ skin: { surface: 'kami', ink: 'kami' }, colorSpace: 'oklch' })
		expect(checks.find((c) => c.id === 'oklch-needs-palettes').status).toBe('warn')
	})

	it('warns when using the legacy colors alias', () => {
		const checks = validateConfigShape({ colors: { surface: 'slate', ink: 'slate' } })
		expect(checks.find((c) => c.id === 'colors-alias').status).toBe('warn')
	})

	it('reads the colormap from skins.default', () => {
		const checks = validateConfigShape({ skins: { default: { surface: 'slate', primary: 'orange' } } })
		expect(checks.find((c) => c.id === 'skin-ink-role')).toBeDefined()
	})

	it('returns [] for a null config', () => {
		expect(validateConfigShape(null)).toEqual([])
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/cli && bun run test -- doctor.spec.js`
Expected: FAIL — `validateConfigShape` not exported.

- [ ] **Step 3: Implement `validateConfigShape`**

In `packages/cli/src/doctor.js`, add:

```js
/**
 * Validate a parsed rokkit config for the named-token system. All advisory (warn).
 * @param {Record<string, unknown> | null} config
 * @returns {Array<{ id: string, label: string, status: 'warn', fixable: false, fix: string }>}
 */
export function validateConfigShape(config) {
	if (!config) return []
	const checks = []
	const usesColorsAlias = Boolean(config.colors) && !config.skin
	const colormap = config.skins?.default ?? config.skin ?? config.colors ?? {}

	if (!('ink' in colormap)) {
		checks.push({
			id: 'skin-ink-role',
			label: 'skin defines an `ink` role',
			status: 'warn',
			fixable: false,
			fix: "Add `ink: '<palette>'` (reusing the surface palette is fine) — without it, ink-* text tokens fall back to the surface palette."
		})
	}
	if (config.colorSpace === 'oklch' && Object.keys(config.palettes ?? {}).length === 0) {
		checks.push({
			id: 'oklch-needs-palettes',
			label: 'colorSpace `oklch` has a `palettes` block',
			status: 'warn',
			fixable: false,
			fix: 'oklch values need a `palettes` block of bare "L C H" components; Tailwind named colors are rgb.'
		})
	}
	if (usesColorsAlias) {
		checks.push({
			id: 'colors-alias',
			label: 'config uses `skin` (not the legacy `colors` alias)',
			status: 'warn',
			fixable: false,
			fix: 'Rename `colors:` to `skin:` — `colors` is a back-compat alias.'
		})
	}
	return checks
}
```

- [ ] **Step 4: Wire into the `doctor()` command**

At the top of `packages/cli/src/doctor.js` add the parsed-config loader import:

```js
import { loadConfig as loadParsedConfig } from './config.js'
```

In `doctor()` (~line 338), after `const failures = printChecks(checks)` and before `handleResults`, add:

```js
	const parsed = await loadParsedConfig({ cwd })
	const shapeChecks = validateConfigShape(parsed)
	if (shapeChecks.length > 0) {
		console.info('\nConfig shape:')
		for (const c of shapeChecks) {
			console.info(`  WARN  ${c.label}`)
			console.info(`        ${c.fix}`)
		}
	}
```

`doctor()` is already `async` and awaited in `index.js`. `loadParsedConfig` returns `null` on missing/unparseable config, so `validateConfigShape` short-circuits to `[]`.

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/cli && bun run test -- doctor.spec.js`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/doctor.js packages/cli/spec/doctor.spec.js
git commit -m "feat(cli): doctor validates named-token config shape (ink / oklch / alias)"
```

---

## Task 6: `findLegacyZUtilities` — advisory z-scale migration hints

**Files:**
- Modify: `packages/cli/src/doctor.js` (add suggestion map, `findLegacyZUtilities`, `gatherSrcFiles`; wire into `doctor()`)
- Test: `packages/cli/spec/doctor.spec.js`

- [ ] **Step 1: Write the failing tests**

Add to `packages/cli/spec/doctor.spec.js` (import `findLegacyZUtilities`):

```js
describe('findLegacyZUtilities', () => {
	it('detects surface z-utilities and maps them to named tokens', () => {
		const files = [{ path: 'src/A.svelte', content: '<div class="bg-surface-z1 text-surface-z9 border-surface-z3">' }]
		const { count, byFile } = findLegacyZUtilities(files)
		expect(count).toBe(3)
		const suggestions = byFile[0].hits.map((h) => h.suggestion)
		expect(suggestions).toContain('bg-paper-soft')
		expect(suggestions).toContain('text-ink')
		expect(suggestions).toContain('border-paper-mute')
	})

	it('maps primary/status z-utilities', () => {
		const files = [{ path: 'src/B.svelte', content: 'text-primary-z5 bg-success-z1' }]
		const { byFile } = findLegacyZUtilities(files)
		const suggestions = byFile[0].hits.map((h) => h.suggestion)
		expect(suggestions).toContain('text-primary')
		expect(suggestions).toContain('bg-success-soft')
	})

	it('returns zero hits for named-token-only code', () => {
		const files = [{ path: 'src/C.svelte', content: 'bg-paper text-ink bg-primary text-on-primary' }]
		expect(findLegacyZUtilities(files).count).toBe(0)
	})
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd packages/cli && bun run test -- doctor.spec.js`
Expected: FAIL — `findLegacyZUtilities` not exported.

- [ ] **Step 3: Implement the scanner (uses `String.matchAll`, no `RegExp` loop)**

In `packages/cli/src/doctor.js`, add:

```js
// z-slot → named token (matches @rokkit/core Z_COLLAPSE maps).
const SURFACE_Z = {
	z0: 'paper', z1: 'paper-soft', z2: 'paper-mute', z3: 'paper-mute', z4: 'paper-edge',
	z5: 'ink-soft', z6: 'ink-soft', z7: 'ink-mute', z8: 'ink-mute', z9: 'ink', z10: 'ink'
}
const INK_Z = {
	z0: 'ink', z1: 'ink-mute', z2: 'ink-mute', z3: 'ink-soft', z4: 'ink-soft',
	z5: 'paper-edge', z6: 'paper-edge', z7: 'paper-mute', z8: 'paper-mute', z9: 'paper-soft', z10: 'paper'
}

/**
 * Map a z-scale role+slot to its nearest named token.
 * @param {string} role
 * @param {string} z — e.g. 'z5'
 * @returns {string}
 */
function suggestNamedToken(role, z) {
	if (role === 'surface') return SURFACE_Z[z]
	if (role === 'ink') return INK_Z[z]
	// accent + status roles have a `-soft` companion; primary does not.
	if (role !== 'primary' && (z === 'z1' || z === 'z2')) return `${role}-soft`
	return role
}

const Z_UTILITY_RE =
	/\b(bg|text|border(?:-[tblr])?|fill|stroke|ring|outline|divide)-(surface|ink|primary|accent|success|warning|danger|error|info)-(z(?:10|[0-9]))\b/g

/**
 * Scan files for legacy z-scale utilities and suggest named-token equivalents.
 * Advisory only — z-scale still resolves via the preset's back-compat layer.
 * @param {Array<{ path: string, content: string }>} files
 * @returns {{ count: number, byFile: Array<{ path: string, hits: Array<{ token: string, suggestion: string }> }> }}
 */
export function findLegacyZUtilities(files) {
	const byFile = []
	let count = 0
	for (const { path: filePath, content } of files) {
		const hits = []
		for (const match of content.matchAll(Z_UTILITY_RE)) {
			const [token, prefix, role, z] = match
			hits.push({ token, suggestion: `${prefix}-${suggestNamedToken(role, z)}` })
		}
		if (hits.length > 0) {
			byFile.push({ path: filePath, hits })
			count += hits.length
		}
	}
	return { count, byFile }
}
```

- [ ] **Step 4: Add the `src/` gatherer and wire into `doctor()`**

Extend the `fs` import on line 2 to include `readdirSync` and `statSync`:

```js
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
```

Add the IO helper:

```js
const SCAN_EXTS = new Set(['.svelte', '.css', '.ts', '.js'])

/**
 * Recursively gather scannable source files under cwd/src.
 * Skips node_modules and uno.config.js (its safelist legitimately lists z-utilities).
 * @param {string} cwd
 * @returns {Array<{ path: string, content: string }>}
 */
function gatherSrcFiles(cwd) {
	const root = resolve(cwd, 'src')
	if (!existsSync(root)) return []
	const out = []
	const walk = (dir) => {
		for (const name of readdirSync(dir)) {
			if (name === 'node_modules') continue
			const full = resolve(dir, name)
			if (statSync(full).isDirectory()) {
				walk(full)
			} else if (SCAN_EXTS.has(full.slice(full.lastIndexOf('.'))) && !full.endsWith('uno.config.js')) {
				out.push({ path: full.slice(cwd.length + 1), content: readFileSync(full, 'utf-8') })
			}
		}
	}
	walk(root)
	return out
}
```

In `doctor()`, after the config-shape block from Task 5, add:

```js
	const { count, byFile } = findLegacyZUtilities(gatherSrcFiles(cwd))
	if (count > 0) {
		console.info(`\nLegacy z-scale utilities (advisory — ${count} in ${byFile.length} file(s)):`)
		for (const { path: filePath, hits } of byFile.slice(0, 10)) {
			const examples = [...new Map(hits.map((h) => [h.token, h.suggestion]))].slice(0, 3)
			const shown = examples.map(([t, s]) => `${t} → ${s}`).join(', ')
			console.info(`  ${filePath}: ${shown}${hits.length > 3 ? ', …' : ''}`)
		}
		console.info('        Named tokens are preferred; z-scale still works via back-compat.')
	}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd packages/cli && bun run test -- doctor.spec.js`
Expected: PASS (all doctor specs).

- [ ] **Step 6: Verify the 6-count assertion still holds**

Run: `cd packages/cli && bun run test -- doctor.spec.js -t "exactly 6 checks"`
Expected: PASS — `runChecks` is unchanged; new functions are separate.

- [ ] **Step 7: Commit**

```bash
git add packages/cli/src/doctor.js packages/cli/spec/doctor.spec.js
git commit -m "feat(cli): doctor reports advisory z-scale migration hints"
```

---

## Task 7: Docs sweep — `docs/llms/index.txt` Theming section

**Files:**
- Modify: `docs/llms/index.txt` (Theming section, lines ~232-309)

- [ ] **Step 1: Replace the "UnoCSS Utility Classes" example block**

Replace the code block under `### UnoCSS Utility Classes (primary authoring model)` (the `bg-surface-z1 …` example) with:

```svelte
<!-- ✅ Correct: theme-aware, responds to data-mode switching -->
<div class="bg-paper-soft border border-paper-edge text-ink rounded-lg p-4">
  <h2 class="text-primary font-semibold">Title</h2>
  <p class="text-ink-mute text-sm">Subtitle</p>
</div>

<!-- ❌ Wrong: not theme-aware -->
<div style="background: var(--paper-soft)">...</div>
```

- [ ] **Step 2: Replace the "Z-Scale Color System" subsection**

Replace the entire `### Z-Scale Color System` subsection (heading, the z-level table, the `{prefix}-{role}-z{n}` table) with:

```markdown
### Named Token Vocabulary (primary authoring model)

Components use **named tokens** that flip automatically under `[data-mode="dark"]`.
The core vocabulary (`tokens: 'core'`):

| Group   | Tokens                                                        | Use                                   |
|---------|---------------------------------------------------------------|---------------------------------------|
| Surface | `paper` · `paper-soft` · `paper-mute` · `paper-edge`          | canvas / card / panel / hairline      |
| Text    | `ink` · `ink-mute` · `ink-soft` · `ink-faint`                 | body / secondary / placeholder / disabled |
| Primary | `primary` · `on-primary`                                      | CTA fill / text on primary            |
| Accent  | `accent` · `accent-soft`                                      | accent fill / tinted accent bg        |
| Status  | `success`/`-soft`, `warning`/`-soft`, `danger`/`-soft`, `error`/`-soft`, `info`/`-soft` | solid / tinted-bg callout |
| Misc    | `focus-ring` · `shadow-tint`                                  | focus ring / shadow color             |

Prefixes: `bg-`, `text-`, `border-` (+ `-t/-b/-l/-r`), `fill-`, `stroke-`, `ring-`,
`outline-`, `divide-`. Example: `bg-paper`, `text-ink-mute`, `border-paper-edge`,
`text-on-primary`, `bg-success-soft text-success`.

**Legacy:** z-scale utilities (`bg-surface-z0`, `text-primary-z5`, …) still resolve
as a back-compat layer that collapses onto the named tokens above, but new code
should use named tokens. Opt into the full 11-shade palette ladder per role with
`tokens: 'extended'` (for charts / data-viz).
```

- [ ] **Step 3: Replace the "Common Patterns" block**

Replace the `### Common Patterns` code block with:

```svelte
<!-- Page background -->
<div class="bg-paper text-ink">

<!-- Card -->
<div class="bg-paper-soft border border-paper-edge rounded-lg p-4">

<!-- Section header -->
<h2 class="text-xs font-semibold text-ink-soft uppercase tracking-wider">

<!-- Primary link -->
<a class="text-primary hover:text-accent transition-colors">

<!-- Input field -->
<input class="bg-paper-mute border border-paper-edge text-ink focus:border-primary focus:outline-none rounded px-3 py-2">

<!-- Status indicators -->
<span class="text-warning">Stale</span>
<span class="text-success">Active</span>
<span class="text-error">Failed</span>

<!-- Table row separator -->
<tr class="border-b border-paper-mute last:border-b-0">
  <td class="px-4 py-2.5 text-ink-mute">...</td>
</tr>
```

- [ ] **Step 4: Fix the inline-styles example**

In `### Inline styles: only for dynamic computed values`, change the ❌ example from `var(--color-surface-z1)` to:

```svelte
<!-- ❌ Not OK: use utility class instead -->
<div style="background: var(--paper-soft)">
```

- [ ] **Step 5: Verify no stale z-scale survives in index.txt prose**

Run: `grep -n "surface-z\|primary-z\|Z-Scale\|z-level" docs/llms/index.txt`
Expected: only the single "Legacy:" mention remains (the back-compat note). No example/table rows.

- [ ] **Step 6: Commit**

```bash
git add docs/llms/index.txt
git commit -m "docs(llms): teach named tokens as primary in index.txt theming section"
```

---

## Task 8: Docs sweep — package docs + README

**Files:**
- Modify: `docs/llms/packages/unocss.txt` (~171-184), `docs/llms/packages/themes.txt` (~204), `docs/llms/packages/core.txt` (~114), `packages/unocss/README.md` (~50-61)

- [ ] **Step 1: `unocss.txt` — rewrite the tone-shortcut section**

Replace the `### Semantic Tone Shortcuts` section body (the `bg-primary-z5` / `text-surface-z7` example and the "Tone scale: z0…z10" line) with:

````markdown
### Named Token Shortcuts

`presetRokkit` emits named-token utilities that adapt between light and dark mode:

```html
<!-- surface / text -->
<div class="bg-paper text-ink border border-paper-edge">
<!-- accent + status -->
<span class="bg-success-soft text-success">Active</span>
<button class="bg-primary text-on-primary">Save</button>
```

Groups: `paper*` (surface), `ink*` (text), `primary`/`on-primary`, `accent`/`-soft`,
status `*`/`-soft`, `focus-ring`, `shadow-tint`. The legacy z-scale utilities
(`bg-primary-z5`, `text-surface-z7`) remain as a back-compat layer pointing at the
named tokens; `tokens: 'extended'` adds the full 11-shade palette ladder per role.
````

- [ ] **Step 2: `themes.txt` — update the utility-class reference line**

Change the line under `## Utility Classes and Data Attributes` from:

```
For utility classes (`bg-primary-z5`, `text-surface-z8`, `data-mode`, etc.) and the full data attribute reference, see `docs/llms/index.txt`.
```

to:

```
For utility classes (named tokens: `bg-paper`, `text-ink`, `bg-primary`, `text-on-primary`; z-scale `bg-*-z*` is back-compat) and the full data attribute reference, see `docs/llms/index.txt`.
```

- [ ] **Step 3: `core.txt` — note named tokens on `semanticShortcuts`**

Change the `### semanticShortcuts(name) / contrastShortcuts(name)` description line from:

```
Generate UnoCSS shortcut arrays for semantic tone utilities (`bg-primary-z5`, etc.) and on-color text utilities (`text-on-primary`).
```

to:

```
Generate UnoCSS shortcut arrays for semantic z-scale tone utilities (`bg-primary-z5`, etc.) and on-color text utilities (`text-on-primary`). Note: z-scale is the back-compat layer — app code should prefer named tokens (`bg-primary`, `bg-paper`), which `presetRokkit` emits via `buildNamedShortcuts`.
```

- [ ] **Step 4: `README.md` — reframe the line-60 example**

In `packages/unocss/README.md`, change the sentence (~line 60):

```
Colors are referenced by palette name (e.g. Tailwind color names). The preset generates CSS variable-backed scale utilities like `bg-primary-z5`, `text-secondary-z8`, etc.
```

to:

```
Colors are referenced by palette name (e.g. Tailwind color names). The preset emits the named-token vocabulary (`bg-paper`, `text-ink`, `bg-primary`, `text-on-primary`, `*-soft`); the z-scale utilities (`bg-primary-z5`, `text-surface-z8`) remain as a back-compat layer pointing at the named tokens.
```

- [ ] **Step 5: Verify**

Run: `grep -rno "primary-z[0-9]\|surface-z[0-9]" docs/llms/packages/unocss.txt docs/llms/packages/themes.txt docs/llms/packages/core.txt packages/unocss/README.md`
Expected: only mentions that sit next to the word "back-compat"/"legacy" remain.

- [ ] **Step 6: Commit**

```bash
git add docs/llms/packages/unocss.txt docs/llms/packages/themes.txt docs/llms/packages/core.txt packages/unocss/README.md
git commit -m "docs: named-token-first guidance in package llms docs + unocss README"
```

---

## Task 9: Full verification + repo hygiene

**Files:**
- Modify: `agents/journal.md`, `docs/design/12-priority.md`

- [ ] **Step 1: Full test suite**

Run: `bun run test:ci`
Expected: all pass (baseline was 3503). No failures.

- [ ] **Step 2: Lint**

Run: `bun run lint`
Expected: 0 errors (pre-existing warnings acceptable).

- [ ] **Step 3: Smoke-test the generator output**

Run:
```bash
cd /tmp && rm -rf rokkit-init-smoke && mkdir rokkit-init-smoke && cd rokkit-init-smoke
node --input-type=module -e "import('/Users/Jerry/Developer/rokkit/packages/cli/src/init.js').then(m => { process.stdout.write(m.serializeRokkitConfig(m.generateConfig({palette:'default',icons:'rokkit',themes:['rokkit'],switcher:'manual'}))); process.stdout.write('\n--- ZEN ---\n'); process.stdout.write(m.serializeRokkitConfig(m.generateZenSumiConfig({}))) })"
```
Expected: two configs print; both start with the named-token header; rgb one has `skin.ink: "slate"`; zen one has `palettes` + `colorSpace: "oklch"`.

- [ ] **Step 4: Update the journal**

Append a dated entry to `agents/journal.md` summarizing: CLI `init` now emits named-token `skin` shape (rgb + Zen-Sumi OKLCH starters) with a header comment; `doctor` writes a real starter on `--fix`, validates config shape, and reports advisory z-scale migration hints; LLM docs (`index.txt`, package docs, unocss README) rewritten to teach named tokens. Note the breaking change to `generateConfig` output. Include commit hashes.

- [ ] **Step 5: Mark the item in the priority doc**

Add/complete the item in `docs/design/12-priority.md` referencing this plan and the spec.

- [ ] **Step 6: Commit**

```bash
git add agents/journal.md docs/design/12-priority.md
git commit -m "docs: journal + priority for CLI named-token config/doctor/docs update"
```

---

## Self-review notes

- **Spec coverage:** §1 config generator → Tasks 1-3; §2 doctor (refresh/validate/migration) → Tasks 4/5/6; §3 docs sweep → Tasks 7/8; §4 tests interleaved per task + Task 9; §5 breaking change → journal in Task 9.
- **Type/name consistency:** `serializeRokkitConfig` (init.js, used by doctor `defaultStarterSource`), `generateZenSumiConfig`, `validateConfigShape`, `findLegacyZUtilities`, `suggestNamedToken`, `gatherSrcFiles` — names consistent across tasks. `loadConfig` from `./config.js` imported as `loadParsedConfig` to avoid colliding with unocss's `loadConfig` mental model.
- **Out of scope (unchanged):** preset z-scale back-compat; `~/.claude` skill.
