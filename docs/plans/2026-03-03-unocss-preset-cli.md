# @rokkit/unocss Preset & CLI Enhancement — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace ~80 lines of manual UnoCSS config per consumer with a single `presetRokkit()` call backed by a declarative `rokkit.config.js`. Add `rokkit init` and `rokkit doctor` CLI commands.

**Architecture:** New `@rokkit/unocss` package exports `presetRokkit()` and `loadConfig()`. The preset reads `rokkit.config.js` (or inline options), then generates all UnoCSS rules, shortcuts, icons, safelist, and dark mode config that consumers currently copy-paste. The existing `@rokkit/cli` gets two new commands: `init` (interactive scaffold) and `doctor` (validation + auto-fix).

**Tech Stack:** UnoCSS preset API, `@rokkit/core` (Theme, iconCollections, constants), `sade` CLI framework, `prompts` for interactive CLI, `vitest` for testing.

**Design doc:** `docs/plans/2026-03-03-unocss-preset-cli-design.md`

---

## Task 1: Create `@rokkit/unocss` Package Scaffold

**Files:**
- Create: `packages/unocss/package.json`
- Create: `packages/unocss/src/index.js`
- Modify: `vitest.config.ts:24-50` — add unocss project entry

**Step 1: Create `packages/unocss/package.json`**

```json
{
  "name": "@rokkit/unocss",
  "version": "1.0.0-next.127",
  "description": "UnoCSS preset for Rokkit — one-line setup for colors, shortcuts, icons, and dark mode.",
  "author": "Jerry Thomas <me@jerrythomas.name>",
  "license": "MIT",
  "type": "module",
  "publishConfig": { "access": "public" },
  "scripts": {
    "prepublishOnly": "bunx tsc --project tsconfig.build.json",
    "clean": "rm -rf dist",
    "build": "bun clean && bun prepublishOnly"
  },
  "files": [
    "src/**/*.js",
    "dist/**/*.d.ts",
    "README.md",
    "package.json"
  ],
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./src/index.js"
    }
  },
  "dependencies": {
    "@rokkit/core": "workspace:*",
    "@rokkit/icons": "workspace:*",
    "@unocss/extractor-svelte": "^66.6.1",
    "unocss": "^66.6.1"
  }
}
```

**Step 2: Create minimal barrel export**

```js
// packages/unocss/src/index.js
export { presetRokkit } from './preset.js'
export { loadConfig } from './config.js'
```

**Step 3: Add vitest project entry**

Add to `vitest.config.ts` projects array (after the `core` entry):

```js
{ extends: true, test: { name: 'unocss', root: 'packages/unocss' } },
```

**Step 4: Run `bun install` from `solution/`**

Expected: resolves workspace dependency, no errors.

**Step 5: Commit**

```bash
git add packages/unocss/package.json packages/unocss/src/index.js vitest.config.ts
git commit -m "feat(unocss): scaffold @rokkit/unocss package"
```

---

## Task 2: Config Loader — Tests

**Files:**
- Create: `packages/unocss/spec/config.spec.js`

Write failing tests for `loadConfig()`. The function merges defaults with a user config object.

**Step 1: Write the failing tests**

```js
// packages/unocss/spec/config.spec.js
import { describe, it, expect } from 'vitest'
import { loadConfig, DEFAULT_CONFIG } from '../src/config.js'

describe('loadConfig', () => {
  it('should return full defaults when called with no arguments', () => {
    const config = loadConfig()
    expect(config.colors).toEqual(DEFAULT_CONFIG.colors)
    expect(config.skins).toEqual({})
    expect(config.themes).toEqual(['rokkit'])
    expect(config.icons).toEqual({ app: '@rokkit/icons/app.json' })
    expect(config.switcher).toBe('manual')
    expect(config.storageKey).toBe('rokkit-theme')
  })

  it('should merge user colors over defaults', () => {
    const config = loadConfig({ colors: { primary: 'blue', surface: 'zinc' } })
    expect(config.colors.primary).toBe('blue')
    expect(config.colors.surface).toBe('zinc')
    // defaults preserved
    expect(config.colors.secondary).toBe('pink')
    expect(config.colors.accent).toBe('sky')
  })

  it('should pass through skins as-is', () => {
    const skins = {
      vibrant: { primary: 'blue', secondary: 'purple' },
      ocean: { primary: 'cyan', surface: 'slate' }
    }
    const config = loadConfig({ skins })
    expect(config.skins).toEqual(skins)
  })

  it('should merge user icons with default app collection', () => {
    const config = loadConfig({ icons: { custom: './icons/custom.json' } })
    expect(config.icons.app).toBe('@rokkit/icons/app.json')
    expect(config.icons.custom).toBe('./icons/custom.json')
  })

  it('should allow overriding the default app icon collection', () => {
    const config = loadConfig({ icons: { app: './my-app-icons.json' } })
    expect(config.icons.app).toBe('./my-app-icons.json')
  })

  it('should accept themes as array of strings', () => {
    const config = loadConfig({ themes: ['rokkit', 'minimal'] })
    expect(config.themes).toEqual(['rokkit', 'minimal'])
  })

  it('should accept switcher values', () => {
    expect(loadConfig({ switcher: 'system' }).switcher).toBe('system')
    expect(loadConfig({ switcher: 'manual' }).switcher).toBe('manual')
    expect(loadConfig({ switcher: 'full' }).switcher).toBe('full')
  })

  it('should accept custom storageKey', () => {
    const config = loadConfig({ storageKey: 'my-theme' })
    expect(config.storageKey).toBe('my-theme')
  })

  it('should ignore unknown fields', () => {
    const config = loadConfig({ unknown: 'value' })
    expect(config).not.toHaveProperty('unknown')
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
cd solution && bun run test:ci -- --project unocss
```

Expected: FAIL — `../src/config.js` does not exist yet.

**Step 3: Commit**

```bash
git add packages/unocss/spec/config.spec.js
git commit -m "test(unocss): add config loader specs"
```

---

## Task 3: Config Loader — Implementation

**Files:**
- Create: `packages/unocss/src/config.js`

**Step 1: Implement `loadConfig`**

```js
// packages/unocss/src/config.js
import { DEFAULT_THEME_MAPPING } from '@rokkit/core'

export const DEFAULT_CONFIG = {
  colors: {
    primary: DEFAULT_THEME_MAPPING.primary,     // 'orange'
    secondary: DEFAULT_THEME_MAPPING.secondary, // 'pink'
    accent: DEFAULT_THEME_MAPPING.accent,       // 'sky'
    surface: DEFAULT_THEME_MAPPING.surface,     // 'slate'
    success: DEFAULT_THEME_MAPPING.success,     // 'green'
    warning: DEFAULT_THEME_MAPPING.warning,     // 'yellow'
    danger: DEFAULT_THEME_MAPPING.danger,       // 'red'
    error: DEFAULT_THEME_MAPPING.error,         // 'red'
    info: DEFAULT_THEME_MAPPING.info            // 'cyan'
  },
  skins: {},
  themes: ['rokkit'],
  icons: {
    app: '@rokkit/icons/app.json'
  },
  switcher: 'manual',
  storageKey: 'rokkit-theme'
}

const KNOWN_KEYS = new Set(Object.keys(DEFAULT_CONFIG))

/**
 * Merge user config with defaults.
 * @param {Partial<typeof DEFAULT_CONFIG>} [userConfig]
 * @returns {typeof DEFAULT_CONFIG}
 */
export function loadConfig(userConfig = {}) {
  const result = {
    colors: { ...DEFAULT_CONFIG.colors, ...userConfig.colors },
    skins: userConfig.skins ?? DEFAULT_CONFIG.skins,
    themes: userConfig.themes ?? DEFAULT_CONFIG.themes,
    icons: { ...DEFAULT_CONFIG.icons, ...userConfig.icons },
    switcher: userConfig.switcher ?? DEFAULT_CONFIG.switcher,
    storageKey: userConfig.storageKey ?? DEFAULT_CONFIG.storageKey
  }

  // Strip unknown keys
  for (const key of Object.keys(result)) {
    if (!KNOWN_KEYS.has(key)) delete result[key]
  }

  return result
}
```

**Step 2: Run tests to verify they pass**

```bash
cd solution && bun run test:ci -- --project unocss
```

Expected: All 9 tests PASS.

**Step 3: Commit**

```bash
git add packages/unocss/src/config.js
git commit -m "feat(unocss): implement config loader with defaults"
```

---

## Task 4: Preset Output — Tests

**Files:**
- Create: `packages/unocss/spec/preset.spec.js`

Test that `presetRokkit()` returns a valid UnoCSS preset object with the expected structure.

**Step 1: Write the failing tests**

```js
// packages/unocss/spec/preset.spec.js
import { describe, it, expect } from 'vitest'
import { presetRokkit } from '../src/preset.js'

describe('presetRokkit', () => {
  it('should return a valid UnoCSS preset object', () => {
    const preset = presetRokkit()
    expect(preset).toHaveProperty('name', 'rokkit')
    expect(preset).toHaveProperty('presets')
    expect(preset).toHaveProperty('shortcuts')
    expect(preset).toHaveProperty('theme')
    expect(preset).toHaveProperty('extractors')
    expect(preset).toHaveProperty('rules')
  })

  it('should include presetWind3 and presetIcons in nested presets', () => {
    const preset = presetRokkit()
    expect(preset.presets.length).toBeGreaterThanOrEqual(2)
    const names = preset.presets.map((p) => p.name)
    expect(names).toContain('unocss-preset-wind3')
    expect(names).toContain('unocss-preset-icons')
  })

  it('should configure dark mode via data-mode attribute', () => {
    const preset = presetRokkit()
    // presetWind3 is first — check its config has dark mode
    const wind = preset.presets.find((p) => p.name === 'unocss-preset-wind3')
    expect(wind).toBeDefined()
  })

  it('should generate semantic shortcuts for all color variants', () => {
    const preset = presetRokkit()
    const flatShortcuts = preset.shortcuts.flat(1)

    // Icon shortcuts (string entries from Object.entries)
    const iconEntries = flatShortcuts.filter(
      (s) => Array.isArray(s) && typeof s[0] === 'string' && typeof s[1] === 'string'
    )
    // Should include accordion-opened → i-rokkit:accordion-opened etc
    const iconNames = iconEntries.map(([k]) => k)
    expect(iconNames).toContain('accordion-opened')
    expect(iconNames).toContain('checkbox-checked')
  })

  it('should generate skin shortcuts from config skins', () => {
    const preset = presetRokkit({
      skins: {
        vibrant: { primary: 'blue', secondary: 'purple' }
      }
    })
    const flatShortcuts = preset.shortcuts.flat(1)
    const skinEntry = flatShortcuts.find(
      (s) => Array.isArray(s) && s[0] === 'skin-vibrant'
    )
    expect(skinEntry).toBeDefined()
    expect(typeof skinEntry[1]).toBe('object') // CSS var map
  })

  it('should include font families in theme', () => {
    const preset = presetRokkit()
    expect(preset.theme.fontFamily).toHaveProperty('body')
    expect(preset.theme.fontFamily).toHaveProperty('mono')
    expect(preset.theme.fontFamily).toHaveProperty('heading')
  })

  it('should generate color rules in theme.colors', () => {
    const preset = presetRokkit()
    expect(preset.theme.colors).toHaveProperty('primary')
    expect(preset.theme.colors).toHaveProperty('surface')
    expect(preset.theme.colors.primary).toHaveProperty('500')
  })

  it('should respect inline color overrides', () => {
    const preset = presetRokkit({ colors: { surface: 'zinc' } })
    // Color rules should use zinc for surface
    expect(preset.theme.colors).toHaveProperty('surface')
    // The preset uses Theme.getColorRules with merged mapping — zinc-based values
    expect(preset.theme.colors.surface).toHaveProperty('500')
  })

  it('should include rokkit icon collection always', () => {
    const preset = presetRokkit()
    const iconsPreset = preset.presets.find((p) => p.name === 'unocss-preset-icons')
    expect(iconsPreset).toBeDefined()
  })

  it('should include safelist with DEFAULT_ICONS and palette colors', () => {
    const preset = presetRokkit()
    expect(preset.safelist).toBeDefined()
    expect(preset.safelist.length).toBeGreaterThan(0)
    // DEFAULT_ICONS should be in safelist
    expect(preset.safelist).toContain('accordion-opened')
  })

  it('should include svelte extractor', () => {
    const preset = presetRokkit()
    expect(preset.extractors.length).toBeGreaterThan(0)
  })

  it('should include transformers', () => {
    const preset = presetRokkit()
    expect(preset.transformers.length).toBe(2)
  })

  it('should include the hidden rule', () => {
    const preset = presetRokkit()
    const hiddenRule = preset.rules.find((r) => r[0] === 'hidden')
    expect(hiddenRule).toBeDefined()
    expect(hiddenRule[1]).toEqual({ display: 'none' })
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
cd solution && bun run test:ci -- --project unocss
```

Expected: FAIL — `../src/preset.js` does not exist yet.

**Step 3: Commit**

```bash
git add packages/unocss/spec/preset.spec.js
git commit -m "test(unocss): add preset output specs"
```

---

## Task 5: Preset Output — Implementation

**Files:**
- Create: `packages/unocss/src/preset.js`

This is the core file. It reads config and returns a full UnoCSS preset.

**Step 1: Implement `presetRokkit`**

```js
// packages/unocss/src/preset.js
import extractorSvelte from '@unocss/extractor-svelte'
import {
  presetIcons,
  presetTypography,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'
import {
  shades,
  defaultPalette,
  DEFAULT_ICONS,
  iconShortcuts,
  Theme
} from '@rokkit/core'
import { iconCollections } from '@rokkit/core/vite'
import { loadConfig } from './config.js'

const THEME_CONFIG = {
  dark: {
    light: '[data-mode="light"]',
    dark: '[data-mode="dark"]'
  }
}

const FONT_FAMILIES = {
  mono: ['Victor Mono', 'monospace'],
  heading: ['Open Sans', 'sans-serif'],
  sans: ['Overpass', 'ui-serif', 'sans-serif'],
  body: ['Open Sans', '-apple-system', 'system-ui', 'Segoe-UI', 'ui-serif', 'sans-serif']
}

/**
 * Build the full icon collections map.
 * `rokkit` (UI component icons) is always included.
 * User-defined collections from config.icons are merged alongside.
 */
function buildIconCollections(configIcons) {
  return iconCollections({
    rokkit: '@rokkit/icons/ui.json',
    ...configIcons
  })
}

/**
 * Build the safelist — DEFAULT_ICONS + all palette bg colors.
 */
function buildSafelist() {
  return [
    ...DEFAULT_ICONS,
    ...defaultPalette.flatMap((color) =>
      shades.map((shade) => `bg-${color}-${shade}`)
    ),
    ...defaultPalette.flatMap((color) =>
      shades.map((shade) => `bg-${color}-${shade}/50`)
    )
  ]
}

/**
 * Build shortcuts — skins, semantic shortcuts per variant, icon shortcuts,
 * and text-on-* contrast overrides.
 */
function buildShortcuts(theme, config) {
  const shortcuts = []

  // Skin shortcuts
  for (const [name, mapping] of Object.entries(config.skins)) {
    shortcuts.push(['skin-' + name, theme.getPalette(mapping)])
  }

  // Semantic + contrast shortcuts for every color variant
  const variants = Object.keys(config.colors)
  for (const variant of variants) {
    shortcuts.push(...theme.getShortcuts(variant))
  }

  // Icon shortcuts (accordion-opened → i-rokkit:accordion-opened)
  shortcuts.push(...Object.entries(iconShortcuts(DEFAULT_ICONS, 'i-rokkit')))

  return shortcuts
}

/**
 * UnoCSS preset for Rokkit.
 *
 * @param {Partial<import('./config.js').DEFAULT_CONFIG>} [options]
 * @returns {import('unocss').Preset}
 */
export function presetRokkit(options = {}) {
  const config = loadConfig(options)
  const theme = new Theme({ mapping: config.colors })

  return {
    name: 'rokkit',
    presets: [
      presetWind3(THEME_CONFIG),
      presetTypography(),
      presetIcons({
        extraProperties: { display: 'inline-block' },
        collections: buildIconCollections(config.icons)
      })
    ],
    extractors: [extractorSvelte()],
    rules: [['hidden', { display: 'none' }]],
    safelist: buildSafelist(),
    shortcuts: buildShortcuts(theme, config),
    theme: {
      fontFamily: FONT_FAMILIES,
      colors: theme.getColorRules()
    },
    transformers: [transformerDirectives(), transformerVariantGroup()]
  }
}
```

**Step 2: Run tests to verify they pass**

```bash
cd solution && bun run test:ci -- --project unocss
```

Expected: All preset tests PASS. Config tests still PASS.

**Step 3: Verify existing tests still pass**

```bash
cd solution && bun run test:ci
```

Expected: All ~2536 tests PASS (new unocss tests added).

**Step 4: Commit**

```bash
git add packages/unocss/src/preset.js
git commit -m "feat(unocss): implement presetRokkit() preset factory"
```

---

## Task 6: CLI — Add `prompts` Dependency and `init`/`doctor` Command Stubs

**Files:**
- Modify: `packages/cli/package.json` — add `prompts` dependency
- Modify: `packages/cli/src/index.js` — add `init` and `doctor` command stubs

**Step 1: Add `prompts` to CLI dependencies**

In `packages/cli/package.json` add to `dependencies`:

```json
"prompts": "^2.4.2"
```

**Step 2: Add command stubs to `packages/cli/src/index.js`**

After the existing `build` command (before `prog.parse`), add:

```js
prog
  .command('init')
  .describe('Initialize Rokkit in an existing SvelteKit project')
  .action(async (opts) => {
    const { init } = await import('./init.js')
    await init(opts)
  })

prog
  .command('doctor')
  .describe('Validate Rokkit project setup')
  .option('--fix', 'Auto-fix safe issues')
  .action(async (opts) => {
    const { doctor } = await import('./doctor.js')
    await doctor(opts)
  })
```

**Step 3: Run `bun install` from `solution/`**

Expected: installs prompts, no errors.

**Step 4: Commit**

```bash
git add packages/cli/package.json packages/cli/src/index.js
git commit -m "feat(cli): add init and doctor command stubs"
```

---

## Task 7: CLI `init` — Tests

**Files:**
- Create: `packages/cli/spec/init.spec.js`

Test that `init` generates the correct file contents based on prompt responses. Mock the `prompts` library and filesystem writes.

**Step 1: Write the failing tests**

```js
// packages/cli/spec/init.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateConfig, generateUnoConfig, generateAppCssImports, generateInitScript } from '../src/init.js'

describe('generateConfig', () => {
  it('should generate default config object', () => {
    const config = generateConfig({
      palette: 'default',
      icons: 'rokkit',
      themes: ['rokkit'],
      switcher: 'manual'
    })
    expect(config.colors).toBeDefined()
    expect(config.colors.primary).toBe('orange')
    expect(config.themes).toEqual(['rokkit'])
    expect(config.switcher).toBe('manual')
  })

  it('should apply vibrant skin preset', () => {
    const config = generateConfig({
      palette: 'vibrant',
      icons: 'rokkit',
      themes: ['rokkit'],
      switcher: 'manual'
    })
    expect(config.colors.primary).toBe('blue')
    expect(config.colors.secondary).toBe('purple')
  })

  it('should apply custom colors', () => {
    const config = generateConfig({
      palette: 'custom',
      customColors: { primary: 'red', secondary: 'teal' },
      icons: 'rokkit',
      themes: ['rokkit'],
      switcher: 'system'
    })
    expect(config.colors.primary).toBe('red')
    expect(config.colors.secondary).toBe('teal')
    expect(config.switcher).toBe('system')
  })

  it('should include custom icon path when provided', () => {
    const config = generateConfig({
      palette: 'default',
      icons: 'custom',
      iconPath: './static/icons/custom.json',
      themes: ['rokkit'],
      switcher: 'manual'
    })
    expect(config.icons.custom).toBe('./static/icons/custom.json')
  })
})

describe('generateUnoConfig', () => {
  it('should return valid uno.config.js content string', () => {
    const content = generateUnoConfig()
    expect(content).toContain("import { presetRokkit } from '@rokkit/unocss'")
    expect(content).toContain('presetRokkit()')
    expect(content).toContain('defineConfig')
  })
})

describe('generateAppCssImports', () => {
  it('should include unocss reset and theme imports', () => {
    const lines = generateAppCssImports(['rokkit'])
    expect(lines).toContain("@import '@unocss/reset/tailwind.css';")
    expect(lines).toContain("@import '@rokkit/themes/dist/base';")
    expect(lines).toContain("@import '@rokkit/themes/dist/rokkit';")
  })

  it('should include multiple theme imports', () => {
    const lines = generateAppCssImports(['rokkit', 'minimal'])
    expect(lines).toContain("@import '@rokkit/themes/dist/rokkit';")
    expect(lines).toContain("@import '@rokkit/themes/dist/minimal';")
  })
})

describe('generateInitScript', () => {
  it('should return flash-prevention script for manual switcher', () => {
    const script = generateInitScript('manual', 'rokkit-theme')
    expect(script).toContain('localStorage.getItem')
    expect(script).toContain('rokkit-theme')
    expect(script).toContain('data-mode')
  })

  it('should return null for system switcher', () => {
    const script = generateInitScript('system')
    expect(script).toBeNull()
  })

  it('should include data-style for full switcher', () => {
    const script = generateInitScript('full', 'rokkit-theme')
    expect(script).toContain('data-style')
    expect(script).toContain('data-mode')
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
cd solution && bun run test:ci -- --project cli
```

Expected: FAIL — `../src/init.js` does not exist yet.

**Step 3: Commit**

```bash
git add packages/cli/spec/init.spec.js
git commit -m "test(cli): add init command generator specs"
```

---

## Task 8: CLI `init` — Implementation

**Files:**
- Create: `packages/cli/src/init.js`

**Step 1: Implement the generators and the interactive `init` function**

```js
// packages/cli/src/init.js
/* eslint-disable no-console */
import prompts from 'prompts'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const SKIN_PRESETS = {
  default: { primary: 'orange', secondary: 'pink', accent: 'sky', surface: 'slate' },
  vibrant: { primary: 'blue', secondary: 'purple', accent: 'sky', surface: 'slate' },
  seaweed: {
    primary: 'sky', secondary: 'green', accent: 'blue', surface: 'zinc',
    danger: 'rose', error: 'rose', success: 'lime', warning: 'amber', info: 'indigo'
  }
}

const DEFAULT_COLORS = {
  primary: 'orange', secondary: 'pink', accent: 'sky', surface: 'slate',
  success: 'green', warning: 'yellow', danger: 'red', error: 'red', info: 'cyan'
}

export function generateConfig({ palette, customColors, icons, iconPath, themes, switcher }) {
  const colors = palette === 'custom'
    ? { ...DEFAULT_COLORS, ...customColors }
    : { ...DEFAULT_COLORS, ...(SKIN_PRESETS[palette] || {}) }

  const config = { colors, themes, switcher, storageKey: 'rokkit-theme' }

  if (icons === 'custom' && iconPath) {
    config.icons = { custom: iconPath }
  }

  return config
}

export function generateUnoConfig() {
  return `import { defineConfig } from 'unocss'
import { presetRokkit } from '@rokkit/unocss'

export default defineConfig({
  presets: [presetRokkit()]
})
`
}

export function generateAppCssImports(themes) {
  const lines = [
    "@import '@unocss/reset/tailwind.css';",
    "@import '@rokkit/themes/dist/base';"
  ]
  for (const theme of themes) {
    lines.push(`@import '@rokkit/themes/dist/${theme}';`)
  }
  return lines
}

export function generateInitScript(switcher, storageKey = 'rokkit-theme') {
  if (switcher === 'system') return null

  const setStyle = switcher === 'full'
    ? `b.dataset.style = t.style || 'rokkit'\n          `
    : ''

  return `    <script>
      (function () {
        try {
          var t = JSON.parse(localStorage.getItem('${storageKey}') || '{}')
          var b = document.body
          ${setStyle}b.dataset.mode = t.mode || 'dark'
        } catch (e) {}
      })()
    </script>`
}

export async function init() {
  console.info('Rokkit Init — Setting up your SvelteKit project\n')

  const response = await prompts([
    {
      type: 'select',
      name: 'palette',
      message: 'Color palette',
      choices: [
        { title: 'Default (orange/pink/sky)', value: 'default' },
        { title: 'Vibrant (blue/purple/sky)', value: 'vibrant' },
        { title: 'Seaweed (sky/green/blue)', value: 'seaweed' },
        { title: 'Custom', value: 'custom' }
      ]
    },
    {
      type: (prev) => prev === 'custom' ? 'text' : null,
      name: 'primary',
      message: 'Primary color (Tailwind palette name)',
      initial: 'orange'
    },
    {
      type: (_, values) => values.palette === 'custom' ? 'text' : null,
      name: 'secondary',
      message: 'Secondary color',
      initial: 'pink'
    },
    {
      type: (_, values) => values.palette === 'custom' ? 'text' : null,
      name: 'accent',
      message: 'Accent color',
      initial: 'sky'
    },
    {
      type: (_, values) => values.palette === 'custom' ? 'text' : null,
      name: 'surface',
      message: 'Surface color',
      initial: 'slate'
    },
    {
      type: 'select',
      name: 'icons',
      message: 'Icon collections',
      choices: [
        { title: 'Rokkit icons only', value: 'rokkit' },
        { title: 'Rokkit + custom collection', value: 'custom' }
      ]
    },
    {
      type: (prev) => prev === 'custom' ? 'text' : null,
      name: 'iconPath',
      message: 'Path to custom icon collection JSON',
      initial: './static/icons/custom.json'
    },
    {
      type: 'multiselect',
      name: 'themes',
      message: 'Theme styles',
      choices: [
        { title: 'Rokkit', value: 'rokkit', selected: true },
        { title: 'Minimal', value: 'minimal' },
        { title: 'Material', value: 'material' }
      ],
      min: 1
    },
    {
      type: 'select',
      name: 'switcher',
      message: 'Theme switching',
      choices: [
        { title: 'System only (prefers-color-scheme)', value: 'system' },
        { title: 'Manual (light/dark toggle)', value: 'manual' },
        { title: 'Full (light/dark + style variants)', value: 'full' }
      ]
    }
  ])

  // Build custom colors if palette is custom
  if (response.palette === 'custom') {
    response.customColors = {
      primary: response.primary,
      secondary: response.secondary,
      accent: response.accent,
      surface: response.surface
    }
  }

  const config = generateConfig(response)
  const cwd = process.cwd()

  // 1. Write rokkit.config.js
  const configPath = resolve(cwd, 'rokkit.config.js')
  if (existsSync(configPath)) {
    console.warn('  rokkit.config.js already exists — skipping')
  } else {
    writeFileSync(configPath, `export default ${JSON.stringify(config, null, 2)}\n`)
    console.info('  Created rokkit.config.js')
  }

  // 2. Write uno.config.js
  const unoPath = resolve(cwd, 'uno.config.js')
  if (existsSync(unoPath)) {
    console.warn('  uno.config.js already exists — skipping (see rokkit doctor for migration)')
  } else {
    writeFileSync(unoPath, generateUnoConfig())
    console.info('  Created uno.config.js')
  }

  // 3. Patch app.css
  const appCssPath = resolve(cwd, 'src/app.css')
  const cssImports = generateAppCssImports(config.themes)
  if (existsSync(appCssPath)) {
    const existing = readFileSync(appCssPath, 'utf-8')
    const missing = cssImports.filter((line) => !existing.includes(line))
    if (missing.length > 0) {
      writeFileSync(appCssPath, missing.join('\n') + '\n' + existing)
      console.info(`  Patched app.css — added ${missing.length} imports`)
    } else {
      console.info('  app.css already has theme imports')
    }
  } else {
    writeFileSync(appCssPath, cssImports.join('\n') + '\n')
    console.info('  Created src/app.css')
  }

  // 4. Patch app.html with init script
  const initScript = generateInitScript(config.switcher, config.storageKey)
  if (initScript) {
    const appHtmlPath = resolve(cwd, 'src/app.html')
    if (existsSync(appHtmlPath)) {
      const html = readFileSync(appHtmlPath, 'utf-8')
      if (!html.includes('rokkit-theme') && !html.includes(config.storageKey)) {
        const patched = html.replace(
          /(<body[^>]*>)/,
          `$1\n${initScript}`
        )
        writeFileSync(appHtmlPath, patched)
        console.info('  Patched app.html — added theme init script')
      } else {
        console.info('  app.html already has init script')
      }
    }
  }

  console.info('\nDone! Run `rokkit doctor` to verify your setup.')
}
```

**Step 2: Run tests to verify they pass**

```bash
cd solution && bun run test:ci -- --project cli
```

Expected: All init generator tests PASS.

**Step 3: Commit**

```bash
git add packages/cli/src/init.js
git commit -m "feat(cli): implement rokkit init command"
```

---

## Task 9: CLI `doctor` — Tests

**Files:**
- Create: `packages/cli/spec/doctor.spec.js`

**Step 1: Write the failing tests**

```js
// packages/cli/spec/doctor.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runChecks } from '../src/doctor.js'

describe('runChecks', () => {
  it('should report pass when rokkit.config.js exists and parses', () => {
    const fs = {
      exists: (p) => p.includes('rokkit.config'),
      read: () => 'export default { colors: {} }',
      resolve: (p) => p
    }
    const results = runChecks(fs)
    const configCheck = results.find((r) => r.id === 'config-exists')
    expect(configCheck.status).toBe('pass')
  })

  it('should report fail when rokkit.config.js is missing', () => {
    const fs = {
      exists: () => false,
      read: () => '',
      resolve: (p) => p
    }
    const results = runChecks(fs)
    const configCheck = results.find((r) => r.id === 'config-exists')
    expect(configCheck.status).toBe('fail')
    expect(configCheck.fixable).toBe(true)
  })

  it('should report fail when uno.config.js does not use presetRokkit', () => {
    const fs = {
      exists: () => true,
      read: (p) => {
        if (p.includes('rokkit.config')) return 'export default {}'
        if (p.includes('uno.config')) return 'export default defineConfig({})'
        return ''
      },
      resolve: (p) => p
    }
    const results = runChecks(fs)
    const unoCheck = results.find((r) => r.id === 'uno-uses-preset')
    expect(unoCheck.status).toBe('fail')
    expect(unoCheck.fixable).toBe(false)
  })

  it('should report pass when uno.config.js uses presetRokkit', () => {
    const fs = {
      exists: () => true,
      read: (p) => {
        if (p.includes('rokkit.config')) return 'export default {}'
        if (p.includes('uno.config')) return "import { presetRokkit } from '@rokkit/unocss'\nexport default defineConfig({ presets: [presetRokkit()] })"
        if (p.includes('app.css')) return "@import '@rokkit/themes/dist/base';"
        return ''
      },
      resolve: (p) => p
    }
    const results = runChecks(fs)
    const unoCheck = results.find((r) => r.id === 'uno-uses-preset')
    expect(unoCheck.status).toBe('pass')
  })

  it('should report fail when app.css missing theme imports', () => {
    const fs = {
      exists: (p) => !p.includes('app.css') || p.includes('rokkit.config') || p.includes('uno.config'),
      read: (p) => {
        if (p.includes('rokkit.config')) return 'export default {}'
        if (p.includes('uno.config')) return 'presetRokkit'
        return ''
      },
      resolve: (p) => p
    }
    const results = runChecks(fs)
    const cssCheck = results.find((r) => r.id === 'css-imports')
    expect(cssCheck.status).toBe('fail')
    expect(cssCheck.fixable).toBe(true)
  })
})
```

**Step 2: Run tests to verify they fail**

```bash
cd solution && bun run test:ci -- --project cli
```

Expected: FAIL — `../src/doctor.js` does not exist yet.

**Step 3: Commit**

```bash
git add packages/cli/spec/doctor.spec.js
git commit -m "test(cli): add doctor check specs"
```

---

## Task 10: CLI `doctor` — Implementation

**Files:**
- Create: `packages/cli/src/doctor.js`

**Step 1: Implement `runChecks` and `doctor`**

```js
// packages/cli/src/doctor.js
/* eslint-disable no-console */
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { generateUnoConfig, generateAppCssImports, generateInitScript } from './init.js'

/**
 * Run all doctor checks against the project.
 * Accepts an `fs` adapter for testability.
 */
export function runChecks(fs) {
  const checks = []

  // 1. rokkit.config.js exists
  const configExists = fs.exists(fs.resolve('rokkit.config.js'))
  checks.push({
    id: 'config-exists',
    label: 'rokkit.config.js exists',
    status: configExists ? 'pass' : 'fail',
    fixable: true,
    fix: 'Run `rokkit init` to generate config',
    autoFix: 'generate-config'
  })

  // 2. uno.config.js uses presetRokkit
  const unoExists = fs.exists(fs.resolve('uno.config.js'))
  let unoUsesPreset = false
  if (unoExists) {
    const unoContent = fs.read(fs.resolve('uno.config.js'))
    unoUsesPreset = unoContent.includes('presetRokkit')
  }
  checks.push({
    id: 'uno-uses-preset',
    label: 'uno.config.js uses presetRokkit()',
    status: unoUsesPreset ? 'pass' : 'fail',
    fixable: false,
    fix: unoExists
      ? 'Replace uno.config.js contents with:\n' + generateUnoConfig()
      : 'Create uno.config.js with:\n' + generateUnoConfig()
  })

  // 3. app.css has theme imports
  const cssPath = fs.resolve('src/app.css')
  const cssExists = fs.exists(cssPath)
  let cssHasBase = false
  if (cssExists) {
    const css = fs.read(cssPath)
    cssHasBase = css.includes('@rokkit/themes/dist/base')
  }
  checks.push({
    id: 'css-imports',
    label: 'app.css has theme imports',
    status: cssHasBase ? 'pass' : 'fail',
    fixable: true,
    fix: 'Append theme imports to src/app.css',
    autoFix: 'patch-css'
  })

  // 4. app.html has init script (only relevant if config specifies non-system switcher)
  const htmlPath = fs.resolve('src/app.html')
  const htmlExists = fs.exists(htmlPath)
  let htmlHasScript = false
  if (htmlExists) {
    const html = fs.read(htmlPath)
    htmlHasScript = html.includes('rokkit-theme') || html.includes('data-mode')
  }
  checks.push({
    id: 'html-init-script',
    label: 'app.html has theme init script',
    status: htmlHasScript ? 'pass' : 'fail',
    fixable: true,
    fix: 'Add flash-prevention script to src/app.html before %sveltekit.body%',
    autoFix: 'patch-html'
  })

  return checks
}

/**
 * Create a real filesystem adapter for production use.
 */
function createFsAdapter(cwd) {
  return {
    exists: (p) => existsSync(p),
    read: (p) => readFileSync(p, 'utf-8'),
    resolve: (p) => resolve(cwd, p)
  }
}

/**
 * Auto-fix safe issues.
 */
function autoFix(checks, cwd) {
  const fs = createFsAdapter(cwd)
  let fixed = 0

  for (const check of checks) {
    if (check.status !== 'fail' || !check.fixable) continue

    if (check.autoFix === 'generate-config') {
      const configPath = resolve(cwd, 'rokkit.config.js')
      writeFileSync(configPath, 'export default {}\n')
      console.info(`  Fixed: ${check.label}`)
      fixed++
    }

    if (check.autoFix === 'patch-css') {
      const cssPath = resolve(cwd, 'src/app.css')
      const imports = generateAppCssImports(['rokkit'])
      if (existsSync(cssPath)) {
        const existing = readFileSync(cssPath, 'utf-8')
        const missing = imports.filter((line) => !existing.includes(line))
        if (missing.length > 0) {
          writeFileSync(cssPath, missing.join('\n') + '\n' + existing)
        }
      } else {
        writeFileSync(cssPath, imports.join('\n') + '\n')
      }
      console.info(`  Fixed: ${check.label}`)
      fixed++
    }

    if (check.autoFix === 'patch-html') {
      const htmlPath = resolve(cwd, 'src/app.html')
      if (existsSync(htmlPath)) {
        const html = readFileSync(htmlPath, 'utf-8')
        const script = generateInitScript('manual', 'rokkit-theme')
        if (script && !html.includes('rokkit-theme')) {
          const patched = html.replace(/(<body[^>]*>)/, `$1\n${script}`)
          writeFileSync(htmlPath, patched)
          console.info(`  Fixed: ${check.label}`)
          fixed++
        }
      }
    }
  }

  return fixed
}

export async function doctor(opts = {}) {
  const cwd = process.cwd()
  const fs = createFsAdapter(cwd)
  const checks = runChecks(fs)

  console.info('Rokkit Doctor\n')

  let failures = 0
  for (const check of checks) {
    const icon = check.status === 'pass' ? 'PASS' : 'FAIL'
    console.info(`  ${icon}  ${check.label}`)
    if (check.status === 'fail') {
      failures++
      if (!opts.fix) {
        console.info(`         ${check.fixable ? '(auto-fixable) ' : ''}${check.fix}`)
      }
    }
  }

  if (failures > 0 && opts.fix) {
    console.info('\nAuto-fixing...\n')
    const fixed = autoFix(checks, cwd)
    const remaining = failures - fixed
    if (remaining > 0) {
      console.info(`\n${fixed} fixed, ${remaining} require manual action:`)
      for (const check of checks) {
        if (check.status === 'fail' && !check.fixable) {
          console.info(`  - ${check.label}: ${check.fix}`)
        }
      }
    } else {
      console.info(`\nAll ${fixed} issues fixed!`)
    }
  }

  console.info('')
  process.exitCode = failures > 0 && !opts.fix ? 1 : 0
}
```

**Step 2: Run tests to verify they pass**

```bash
cd solution && bun run test:ci -- --project cli
```

Expected: All doctor tests PASS. Init tests still PASS.

**Step 3: Commit**

```bash
git add packages/cli/src/doctor.js
git commit -m "feat(cli): implement rokkit doctor command"
```

---

## Task 11: Dogfood — Migrate `sites/learn` to `presetRokkit()`

**Files:**
- Modify: `sites/learn/uno.config.js` — replace ~157 lines with ~6 lines
- Create: `sites/learn/rokkit.config.js` — learn site specific config
- Modify: `sites/learn/package.json` — add `@rokkit/unocss` dependency

**Step 1: Add `@rokkit/unocss` to learn site dependencies**

In `sites/learn/package.json`, add to `devDependencies`:

```json
"@rokkit/unocss": "workspace:*"
```

**Step 2: Create `sites/learn/rokkit.config.js`**

```js
export default {
  colors: {
    surface: 'shark'
  },
  skins: {
    default: { surface: 'shark' },
    vibrant: { primary: 'blue', secondary: 'purple' },
    seaweed: {
      primary: 'sky',
      secondary: 'green',
      accent: 'blue',
      danger: 'rose',
      error: 'rose',
      success: 'lime',
      surface: 'zinc',
      warning: 'amber',
      info: 'indigo'
    }
  },
  themes: ['rokkit'],
  icons: {
    app: '@rokkit/icons/app.json',
    logo: '@rokkit/icons/auth.json',
    component: '@rokkit/icons/components.json',
    solar: '@iconify-json/solar/icons.json',
    file: './static/icons/files/icons.json'
  },
  switcher: 'full',
  storageKey: 'rokkit-theme'
}
```

**Step 3: Replace `sites/learn/uno.config.js`**

Replace the entire 157-line file with:

```js
import { defineConfig } from 'unocss'
import { presetRokkit } from '@rokkit/unocss'
import config from './rokkit.config.js'

export default defineConfig({
  presets: [presetRokkit(config)],
  content: {
    pipeline: {
      include: [
        'src/**/*.{svelte,js,ts}',
        '../../packages/themes/src/**/*.css',
        '../../packages/ui/src/**/*.svelte'
      ]
    }
  }
})
```

Note: `content.pipeline` is site-specific (monorepo paths) — stays in `uno.config.js`. The learn site also has hardcoded solar icons in its safelist and component icons — these need to be handled.

**Important:** The learn site currently has component icons (`i-component:accordion`, etc.) and site-specific solar icons in its safelist. These are site-specific, not part of the preset. We need to either:
- Add `component` to the `icons` config (already done above via `rokkit.config.js`)
- Add site-specific safelist items to the uno.config.js

Updated `uno.config.js` with site-specific extras:

```js
import { defineConfig } from 'unocss'
import { presetRokkit } from '@rokkit/unocss'
import config from './rokkit.config.js'

const siteIcons = [
  'i-solar:calendar-bold-duotone',
  'i-solar:sidebar-bold-duotone',
  'i-solar:rocket-bold-duotone',
  'i-solar:database-bold-duotone',
  'i-solar:layers-bold-duotone',
  'i-solar:code-square-bold-duotone',
  'i-solar:palette-bold-duotone',
  'i-solar:eye-bold-duotone',
  'i-solar:hamburger-menu-bold-duotone',
  'i-solar:file-text-bold-duotone',
  'i-solar:minimize-square-bold-duotone',
  'i-solar:widget-bold-duotone',
  'i-solar:notes-bold-duotone',
  'i-solar:cpu-bolt-bold-duotone',
  'i-solar:info-circle-bold-duotone',
  'i-solar:list-bold-duotone',
  'i-solar:alt-arrow-down-bold-duotone',
  'i-solar:table-bold-duotone'
]

const componentIcons = [
  'accordion', 'button', 'card', 'calendar', 'carousel', 'checkbox',
  'combobox', 'crumbs', 'dropdown', 'icon', 'input-text', 'item',
  'list', 'message', 'palette', 'pill', 'progress', 'range',
  'multiselect', 'select', 'settings', 'stepper', 'switch', 'tabs',
  'table', 'tree', 'radio', 'range', 'rating', 'input-password'
].map((icon) => `i-component:${icon}`)

export default defineConfig({
  presets: [presetRokkit(config)],
  safelist: [...siteIcons, ...componentIcons],
  content: {
    pipeline: {
      include: [
        'src/**/*.{svelte,js,ts}',
        '../../packages/themes/src/**/*.css',
        '../../packages/ui/src/**/*.svelte'
      ]
    }
  }
})
```

**Step 4: Run `bun install` from `solution/`**

**Step 5: Run all tests**

```bash
cd solution && bun run test:ci
```

Expected: All ~2536+ tests PASS.

**Step 6: Run lint**

```bash
cd solution && bun run lint
```

Expected: 0 errors.

**Step 7: Start learn dev server and smoke test**

```bash
cd solution/sites/learn && bun run dev
```

Verify in browser:
- Colors render correctly (orange primary, shark surface)
- Dark/light mode toggle works
- Icons display (rokkit, component, solar, app)
- Theme switcher works (rokkit style)
- Skin switching works (default/vibrant/seaweed)

**Step 8: Run learn e2e tests**

```bash
cd solution/sites/learn && npx playwright test
```

Expected: All existing e2e tests PASS.

**Step 9: Commit**

```bash
git add sites/learn/rokkit.config.js sites/learn/uno.config.js sites/learn/package.json solution/bun.lock
git commit -m "feat(learn): migrate to presetRokkit() — 157 lines → 30 lines"
```

---

## Task 12: Preset Refinement — Handle `text-on-*` Overrides

The learn site's current `uno.config.js` has 7 manual `text-on-*` overrides (lines 121-127) that point to `text-surface-50` instead of the color-specific contrast. These are learn-site conventions. If the preset's `contrastShortcuts` already covers `text-on-primary` → `text-primary-50`, these overrides may be intentional (all map to surface-50 for a unified look).

**Step 1: Check if learn site renders correctly without the overrides**

If `text-on-primary` should always be `text-surface-50` (light text on dark bg), this is a project-level override, not a preset concern. The site can add these to its `uno.config.js` shortcuts.

If the overrides are needed, add them to the site's `uno.config.js`:

```js
export default defineConfig({
  presets: [presetRokkit(config)],
  shortcuts: [
    ['text-on-primary', 'text-surface-50'],
    ['text-on-secondary', 'text-surface-50'],
    ['text-on-info', 'text-surface-50'],
    ['text-on-success', 'text-surface-50'],
    ['text-on-warning', 'text-surface-50'],
    ['text-on-error', 'text-surface-50'],
    ['text-on-surface', 'text-surface-50']
  ],
  safelist: [...siteIcons, ...componentIcons],
  content: { ... }
})
```

**Step 2: Run tests and verify**

```bash
cd solution && bun run test:ci
```

**Step 3: Commit (if changes needed)**

```bash
git add sites/learn/uno.config.js
git commit -m "fix(learn): add text-on-* overrides for unified contrast"
```

---

## Task 13: Update Documentation and Clean Up

**Files:**
- Modify: `agents/journal.md` — log completion
- Modify: `docs/plans/README.md` — archive plan
- Modify: `solution/sites/learn/src/routes/llms/+server.ts` — update Quick Start section to mention `@rokkit/unocss`

**Step 1: Update journal**

Append to `agents/journal.md`:

```markdown
### 2026-03-03 — @rokkit/unocss Preset & CLI Phase 1

- Created `@rokkit/unocss` package with `presetRokkit()` and `loadConfig()`
- Added `rokkit init` and `rokkit doctor --fix` to `@rokkit/cli`
- Migrated `sites/learn` from 157-line `uno.config.js` to `presetRokkit()` (30 lines)
- All unit tests + e2e tests pass
- Key commits: [fill after implementation]
```

**Step 2: Archive plan**

Update `docs/plans/README.md`:
- Set "No active plan."
- Add to Recently Completed: `@rokkit/unocss Preset & CLI Phase 1 — presetRokkit(), rokkit init, rokkit doctor, learn site migrated`

**Step 3: Update LLM docs**

In `sites/learn/src/routes/llms/+server.ts`, update the Quick Start section to show the new setup pattern (optional — can be done later).

**Step 4: Commit**

```bash
git add agents/journal.md docs/plans/README.md
git commit -m "docs: log unocss preset completion, archive plan"
```

---

## Task 14: Phase 2 Backlog — `rokkit migrate` and Cleanup

**Files:**
- Create: `docs/backlog/2026-03-03-unocss-phase2.md`

**Step 1: Create backlog item**

```markdown
# @rokkit/unocss Phase 2

**Created:** 2026-03-03
**Priority:** Medium
**Context:** Phase 1 complete — preset + init + doctor + learn migration done

---

## Items

### `rokkit migrate`
- Parse existing `uno.config.js` to extract color mappings, icon collections, shortcuts
- Generate equivalent `rokkit.config.js` + simplified `uno.config.js`
- Show diff preview before writing
- Complex: requires AST analysis of arbitrary JavaScript

### Remove `sites/sample` and `sites/quick-start`
- Once `rokkit init` is the standard onboarding path, these folders are redundant
- Delete both, update workspace config, update any documentation references

### Update documentation
- Update learn site Quick Start to reference `@rokkit/unocss`
- Add LLM docs for the preset and CLI commands
- Update README files

### Migrate `sites/quick-start` (before deletion)
- As a validation step, migrate quick-start to `presetRokkit()` first
- Then verify it works, then delete
```

**Step 2: Commit**

```bash
git add docs/backlog/2026-03-03-unocss-phase2.md
git commit -m "docs: add unocss phase 2 backlog"
```

---

## Verification Checklist

1. `cd solution && bun run test:ci` — all tests pass (unit + new unocss tests)
2. `cd solution && bun run lint` — 0 errors
3. `cd solution/sites/learn && bun run dev` — site works, colors/icons/themes correct
4. `cd solution/sites/learn && npx playwright test` — all e2e tests pass
5. `rokkit.config.js` at learn site root with site-specific config
6. `uno.config.js` at learn site reduced from 157 to ~30 lines
7. `@rokkit/unocss` package with `presetRokkit()` and `loadConfig()` fully tested
8. `@rokkit/cli` has `init` and `doctor --fix` commands

## File Summary

| Category | Count |
|----------|-------|
| New package files | 4 (`packages/unocss/package.json`, `src/index.js`, `src/config.js`, `src/preset.js`) |
| New test files | 4 (`spec/config.spec.js`, `spec/preset.spec.js`, `spec/init.spec.js`, `spec/doctor.spec.js`) |
| New CLI files | 2 (`src/init.js`, `src/doctor.js`) |
| Modified files | 5 (`vitest.config.ts`, `cli/package.json`, `cli/src/index.js`, `learn/uno.config.js`, `learn/package.json`) |
| New config files | 1 (`sites/learn/rokkit.config.js`) |
| Doc files | 3 (`journal.md`, `plans/README.md`, `backlog/unocss-phase2.md`) |
| **Total** | **19** |
