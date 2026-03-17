# Glyph Icon Collection Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename the `rokkit-components` icon collection to `rokkit-glyph` (prefix `i-glyph:`), add all 49 solar icons used in the site as glyph entries with 4 variants each, and migrate the site off `@iconify-json/solar` and `i-component:` references.

**Architecture:** A script (`add-solar-glyphs.js`) reads `glyph-map.json` and writes SVG files into `packages/icons/src/glyph/` using solar as the source for up to 4 variants per icon. Existing hand-crafted SVGs in `src/components/` are copied to `src/glyph/` and protected via `skipDefault: true` in the map. The `rokkit-cli build` pipeline is unchanged — it reads the new directory and produces `lib/glyph.json`. The site's `rokkit.config.js` registers the collection as `glyph:` which becomes the `i-glyph:` UnoCSS prefix.

**Tech Stack:** Node.js ESM scripts, `@iconify-json/solar`, `rokkit-cli build`, SvelteKit, UnoCSS

**Spec:** `docs/superpowers/specs/2026-03-17-glyph-icon-collection.md`

---

## Chunk 1: Script, mapping, and SVG generation

### Task 1: Create the generation script

**Files:**
- Create: `packages/icons/scripts/add-solar-glyphs.js`

The script reads `glyph-map.json` from the same directory and writes 4 SVG files per icon into `src/glyph/`. It is modelled on the existing `add-solar-methods.js`.

- [ ] **Step 1: Create the script**

```js
// packages/icons/scripts/add-solar-glyphs.js
import solar from '@iconify-json/solar/icons.json' with { type: 'json' }
import { writeFileSync } from 'fs'
import { resolve } from 'path'
import glyphMap from './glyph-map.json' with { type: 'json' }

const OUT = resolve('src/glyph')

// duotone is default (differs from auth icons which use bold as default)
const VARIANTS = [
	{ solarSuffix: '-bold-duotone', ourSuffix: '',                 skipDefault: true },
	{ solarSuffix: '-linear',       ourSuffix: '-outline' },
	{ solarSuffix: '-bold',         ourSuffix: '-solid' },
	{ solarSuffix: '-duotone',      ourSuffix: '-duotone-outline' }
]

function iconToSVG(body) {
	return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">\n${body}\n</svg>`
}

let written = 0
let skipped = 0
let missing = 0

for (const glyph of glyphMap) {
	for (const variant of VARIANTS) {
		if (variant.skipDefault && glyph.skipDefault) { skipped++; continue }
		const solarKey = glyph.solar + variant.solarSuffix
		const icon = solar.icons[solarKey]
		if (!icon) {
			console.warn(`MISSING: solar:${solarKey} (glyph: ${glyph.name})`)
			missing++
			continue
		}
		const filename = `${glyph.name + variant.ourSuffix}.svg`
		writeFileSync(`${OUT}/${filename}`, iconToSVG(icon.body))
		console.log(`Written: ${filename}`)
		written++
	}
}

console.log(`\nDone: ${written} written, ${skipped} skipped (skipDefault), ${missing} missing solar icons.`)
```

- [ ] **Step 2: Verify the script file exists**

```bash
ls packages/icons/scripts/add-solar-glyphs.js
```

Expected: file listed

---

### Task 2: Create glyph-map.json

**Files:**
- Create: `packages/icons/scripts/glyph-map.json`
- Reference: `packages/icons/src/components/` (existing SVG names)
- Reference: `site/uno.config.js` `siteIcons` array (solar icons to add)

The map has two categories:
1. **New icons** — the 49 solar icons from `siteIcons` in `site/uno.config.js` (strip `-bold-duotone` suffix for both the glyph name and solar base)
2. **Existing component icons** — all 49 SVG files from `src/components/`, each with their best solar equivalent and `"skipDefault": true`

For existing icons, the solar value is the best available match. The implementer should run the script and check warnings for missing solar icons, then update the solar value accordingly. To find valid solar icon names, run: `node -e "import('@iconify-json/solar/icons.json', {with:{type:'json'}}).then(m => console.log(Object.keys(m.default.icons).filter(k => k.includes('YOUR_SEARCH')).join('\n')))"` from `packages/icons/`.

> **Note on duplicates:** Five names appear in both categories (`calendar`, `card`, `palette`, `settings`, `table`). These appear only once in the map — as `skipDefault: true` entries (the hand-crafted SVG is kept as default, solar generates the 3 variants).

- [ ] **Step 1: Create `glyph-map.json`**

```json
[
  { "name": "add-circle",                    "solar": "add-circle" },
  { "name": "alt-arrow-down",                "solar": "alt-arrow-down" },
  { "name": "alt-arrow-up",                  "solar": "alt-arrow-up" },
  { "name": "arrow-left",                    "solar": "arrow-left" },
  { "name": "atom",                          "solar": "atom" },
  { "name": "bell",                          "solar": "bell" },
  { "name": "book-2",                        "solar": "book-2" },
  { "name": "chart-2",                       "solar": "chart-2" },
  { "name": "chart",                         "solar": "chart" },
  { "name": "chart-square",                  "solar": "chart-square" },
  { "name": "chat-square-code",              "solar": "chat-square-code" },
  { "name": "check-circle",                  "solar": "check-circle" },
  { "name": "checklist-minimalistic",        "solar": "checklist-minimalistic" },
  { "name": "clock-circle",                  "solar": "clock-circle" },
  { "name": "close-circle",                  "solar": "close-circle" },
  { "name": "code",                          "solar": "code" },
  { "name": "code-square",                   "solar": "code-square" },
  { "name": "cursor",                        "solar": "cursor" },
  { "name": "database",                      "solar": "database" },
  { "name": "eye",                           "solar": "eye" },
  { "name": "file-text",                     "solar": "file-text" },
  { "name": "flag",                          "solar": "flag" },
  { "name": "folder-open",                   "solar": "folder-open" },
  { "name": "gallery-wide",                  "solar": "gallery-wide" },
  { "name": "gamepad",                       "solar": "gamepad" },
  { "name": "git-merge",                     "solar": "git-merge" },
  { "name": "graph-new",                     "solar": "graph-new" },
  { "name": "hamburger-menu",                "solar": "hamburger-menu" },
  { "name": "home",                          "solar": "home" },
  { "name": "hourglass",                     "solar": "hourglass" },
  { "name": "keyboard",                      "solar": "keyboard" },
  { "name": "layers",                        "solar": "layers" },
  { "name": "layers-minimalistic",           "solar": "layers-minimalistic" },
  { "name": "list-check",                    "solar": "list-check" },
  { "name": "magic-stick",                   "solar": "magic-stick" },
  { "name": "magnifer",                      "solar": "magnifer" },
  { "name": "minimize-square",               "solar": "minimize-square" },
  { "name": "minus-circle",                  "solar": "minus-circle" },
  { "name": "rocket",                        "solar": "rocket" },
  { "name": "shield",                        "solar": "shield" },
  { "name": "sidebar",                       "solar": "sidebar" },
  { "name": "user",                          "solar": "user" },
  { "name": "users-group-two-rounded",       "solar": "users-group-two-rounded" },
  { "name": "widget",                        "solar": "widget" },

  { "name": "accordion",   "solar": "alt-arrow-down",             "skipDefault": true },
  { "name": "button",      "solar": "widget",                     "skipDefault": true },
  { "name": "calendar",    "solar": "calendar",                   "skipDefault": true },
  { "name": "card",        "solar": "card",                       "skipDefault": true },
  { "name": "carousel",    "solar": "gallery-wide",               "skipDefault": true },
  { "name": "checkbox-group", "solar": "checklist-minimalistic",  "skipDefault": true },
  { "name": "checkbox",    "solar": "check-circle",               "skipDefault": true },
  { "name": "combobox",    "solar": "minimize-square",            "skipDefault": true },
  { "name": "crumbs",      "solar": "alt-arrow-right",            "skipDefault": true },
  { "name": "dropdown",    "solar": "alt-arrow-down",             "skipDefault": true },
  { "name": "gallery",     "solar": "gallery-wide",               "skipDefault": true },
  { "name": "grid-layout", "solar": "graph-new",                  "skipDefault": true },
  { "name": "icon",        "solar": "star",                       "skipDefault": true },
  { "name": "input-array", "solar": "layers",                     "skipDefault": true },
  { "name": "input-color", "solar": "palette",                    "skipDefault": true },
  { "name": "input-date",  "solar": "calendar",                   "skipDefault": true },
  { "name": "input-email", "solar": "letter",                     "skipDefault": true },
  { "name": "input-file",  "solar": "file-text",                  "skipDefault": true },
  { "name": "input-number","solar": "keyboard",                   "skipDefault": true },
  { "name": "input-object","solar": "layers-minimalistic",        "skipDefault": true },
  { "name": "input-password","solar": "lock-password",            "skipDefault": true },
  { "name": "input-tel",   "solar": "phone",                      "skipDefault": true },
  { "name": "input-text-area","solar": "document-add",            "skipDefault": true },
  { "name": "input-text",  "solar": "keyboard",                   "skipDefault": true },
  { "name": "input-textarea","solar": "document-add",             "skipDefault": true },
  { "name": "input-time",  "solar": "clock-circle",               "skipDefault": true },
  { "name": "input-url",   "solar": "link",                       "skipDefault": true },
  { "name": "item",        "solar": "widget",                     "skipDefault": true },
  { "name": "list-items",  "solar": "list-check",                 "skipDefault": true },
  { "name": "list",        "solar": "layers-minimalistic",        "skipDefault": true },
  { "name": "menu-sidebar","solar": "sidebar",                    "skipDefault": true },
  { "name": "message",     "solar": "chat-square-code",           "skipDefault": true },
  { "name": "multiselect", "solar": "users-group-two-rounded",    "skipDefault": true },
  { "name": "palette",     "solar": "palette",                    "skipDefault": true },
  { "name": "pill",        "solar": "add-circle",                 "skipDefault": true },
  { "name": "progress",    "solar": "hourglass",                  "skipDefault": true },
  { "name": "radio-group", "solar": "widget-add",                 "skipDefault": true },
  { "name": "radio",       "solar": "widget",                     "skipDefault": true },
  { "name": "range",       "solar": "slider-minimalistic",        "skipDefault": true },
  { "name": "rating",      "solar": "star",                       "skipDefault": true },
  { "name": "select",      "solar": "alt-arrow-down",             "skipDefault": true },
  { "name": "settings",    "solar": "settings",                   "skipDefault": true },
  { "name": "split-view",  "solar": "sidebar",                    "skipDefault": true },
  { "name": "stepper",     "solar": "checklist-minimalistic",     "skipDefault": true },
  { "name": "switch-button","solar": "switch-horizontal",         "skipDefault": true },
  { "name": "switch",      "solar": "switch-horizontal",          "skipDefault": true },
  { "name": "table",       "solar": "table",                      "skipDefault": true },
  { "name": "tabs",        "solar": "layers-minimalistic",        "skipDefault": true },
  { "name": "tree",        "solar": "layers",                     "skipDefault": true }
]
```

- [ ] **Step 2: Verify file created**

```bash
node -e "import('./scripts/glyph-map.json', {with:{type:'json'}}).then(m => console.log('entries:', m.default.length))"
```
Run from `packages/icons/`. Expected: `entries: 93` (44 new + 49 skipDefault; the 5 names shared between groups — `calendar`, `card`, `palette`, `settings`, `table` — appear only once as `skipDefault` entries)

---

### Task 3: Create `src/glyph/` and run the script

**Files:**
- Create: `packages/icons/src/glyph/` (directory)
- Modify: copy all 49 SVGs from `src/components/` into `src/glyph/`

- [ ] **Step 1: Copy existing component SVGs to new directory**

```bash
cp -r packages/icons/src/components packages/icons/src/glyph
```

- [ ] **Step 2: Run the generation script**

```bash
cd packages/icons && node scripts/add-solar-glyphs.js
```

Expected: per-file lines like `Written: rocket.svg`, `Written: rocket-outline.svg`, then a summary like `Done: 323 written, 49 skipped (skipDefault), 0 missing solar icons.` Check for any `MISSING:` warnings in the output.

- [ ] **Step 3: Review MISSING warnings**

For any `MISSING: solar:X` warning, find the correct solar icon name:

```bash
cd packages/icons
node -e "
import('@iconify-json/solar/icons.json', {with:{type:'json'}}).then(m => {
  const keys = Object.keys(m.default.icons)
  // replace 'search' with part of the icon name you're looking for
  console.log(keys.filter(k => k.includes('search')).join('\n'))
})
"
```

Update `glyph-map.json` with corrected solar names, rerun the script.

- [ ] **Step 4: Verify variant files were created**

```bash
ls packages/icons/src/glyph/rocket*.svg
```

Expected: `rocket.svg  rocket-duotone-outline.svg  rocket-outline.svg  rocket-solid.svg`

- [ ] **Step 5: Commit**

```bash
git add packages/icons/scripts/add-solar-glyphs.js packages/icons/scripts/glyph-map.json packages/icons/src/glyph/
git commit -m "feat(icons): add glyph collection - script, mapping, and generated SVGs"
```

---

## Chunk 2: Build pipeline and config updates

### Task 4: Run the build and update exports

**Files:**
- Modify: `packages/icons/package.json` (exports map)
- Verify: `packages/icons/lib/glyph/` exists after build

The `rokkit-cli build` auto-discovers source directories under `src/`. Renaming `src/components/` to `src/glyph/` is enough to produce `lib/glyph.json`. The `src/components/` directory must be **removed** so the old collection is no longer built.

- [ ] **Step 1: Remove the old source directory**

```bash
rm -rf packages/icons/src/components
```

- [ ] **Step 2: Run the build**

```bash
cd packages/icons && bun run build
```

Expected: build completes, `lib/glyph/` and `lib/glyph.json` appear. `lib/components.json` and `lib/components/` will no longer regenerate (but any existing ones stay until cleaned).

- [ ] **Step 3: Verify the glyph collection output**

```bash
ls packages/icons/lib/glyph/
node -e "import('./lib/glyph.json', {with:{type:'json'}}).then(m => console.log('icons:', Object.keys(m.default.icons).length))"
```
Run from `packages/icons/`. Expected: `icons.json`, `index.js`, etc. in the directory. The icon count should be 94+ (new icons × 4 variants + existing icons × up to 4).

- [ ] **Step 4: Update the exports map in `packages/icons/package.json`**

Add the glyph export and keep components as a deprecated alias so nothing downstream breaks yet:

```json
{
  "exports": {
    "./package.json": "./package.json",
    "./ui.json": "./lib/base.json",
    "./light.json": "./lib/light.json",
    "./solid.json": "./lib/solid.json",
    "./twotone.json": "./lib/twotone.json",
    "./glyph.json": "./lib/glyph.json",
    "./components.json": "./lib/glyph.json",
    "./auth.json": "./lib/auth.json",
    "./app.json": "./lib/app.json",
    ".": "./lib/base.json",
    "./utils": "./src/convert.js"
  }
}
```

Note: `"./components.json"` is aliased to `lib/glyph.json` as a backwards-compat bridge. It can be removed in a future cleanup.

- [ ] **Step 5: Run tests to verify build is intact**

```bash
cd packages/icons && bun run build
```

Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add packages/icons/package.json packages/icons/lib/
git commit -m "feat(icons): build glyph collection, update exports map"
```

---

### Task 5: Update site configuration

**Files:**
- Modify: `site/rokkit.config.js`
- Modify: `site/uno.config.js`

- [ ] **Step 1: Update `site/rokkit.config.js`**

Change the `icons` map — rename `component` to `glyph` and point it at the new collection. Remove `solar` (it is now embedded in glyph):

```js
// site/rokkit.config.js
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
		glyph: '@rokkit/icons/glyph.json',
		file: './static/icons/files/icons.json'
	},
	switcher: 'full',
	storageKey: 'rokkit-theme'
}
```

- [ ] **Step 2: Update `site/uno.config.js`**

Replace `siteIcons` (currently `i-solar:*-bold-duotone` entries) with `i-glyph:*` equivalents. Replace `componentIcons` prefix. The mapping is 1-to-1: strip `-bold-duotone` from solar name to get the glyph name.

```js
// site/uno.config.js
import { defineConfig } from 'unocss'
import { presetRokkit, presetBackgrounds } from '@rokkit/unocss'
import config from './rokkit.config.js'

const siteIcons = [
	'i-glyph:add-circle',
	'i-glyph:alt-arrow-down',
	'i-glyph:alt-arrow-up',
	'i-glyph:arrow-left',
	'i-glyph:atom',
	'i-glyph:bell',
	'i-glyph:book-2',
	'i-glyph:calendar',
	'i-glyph:card',
	'i-glyph:chart-2',
	'i-glyph:chart',
	'i-glyph:chart-square',
	'i-glyph:chat-square-code',
	'i-glyph:check-circle',
	'i-glyph:checklist-minimalistic',
	'i-glyph:clock-circle',
	'i-glyph:close-circle',
	'i-glyph:code',
	'i-glyph:code-square',
	'i-glyph:cursor',
	'i-glyph:database',
	'i-glyph:eye',
	'i-glyph:file-text',
	'i-glyph:flag',
	'i-glyph:folder-open',
	'i-glyph:gallery-wide',
	'i-glyph:gamepad',
	'i-glyph:git-merge',
	'i-glyph:graph-new',
	'i-glyph:hamburger-menu',
	'i-glyph:home',
	'i-glyph:hourglass',
	'i-glyph:keyboard',
	'i-glyph:layers',
	'i-glyph:layers-minimalistic',
	'i-glyph:list-check',
	'i-glyph:magic-stick',
	'i-glyph:magnifer',
	'i-glyph:minimize-square',
	'i-glyph:minus-circle',
	'i-glyph:palette',
	'i-glyph:rocket',
	'i-glyph:settings',
	'i-glyph:shield',
	'i-glyph:sidebar',
	'i-glyph:table',
	'i-glyph:user',
	'i-glyph:users-group-two-rounded',
	'i-glyph:widget'
]

const componentIcons = [
	'accordion',
	'button',
	'card',
	'calendar',
	'carousel',
	'checkbox',
	'combobox',
	'crumbs',
	'dropdown',
	'icon',
	'input-text',
	'item',
	'list',
	'message',
	'palette',
	'pill',
	'progress',
	'range',
	'multiselect',
	'select',
	'settings',
	'stepper',
	'switch',
	'tabs',
	'table',
	'tree',
	'radio',
	'rating',
	'input-password'
].map((icon) => `i-glyph:${icon}`)

export default defineConfig({
	presets: [presetRokkit(config), presetBackgrounds()],
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
	content: {
		pipeline: {
			include: [
				'src/**/*.{svelte,js,ts}',
				'../packages/themes/src/**/*.css',
				'../packages/ui/src/**/*.svelte'
			]
		}
	}
})
```

- [ ] **Step 3: Commit config changes**

```bash
git add site/rokkit.config.js site/uno.config.js
git commit -m "feat(site): register glyph collection, update safelist to i-glyph:"
```

---

## Chunk 3: Site migration

### Task 6: Migrate solar icon references in site files

**Files to update:** All `.svelte` files in `site/src/` that use `i-solar:*`

The solar icons in the site are all `*-bold-duotone` variants. Each maps directly to an `i-glyph:*` name by stripping `-bold-duotone`.

- [ ] **Step 1: Find all files using i-solar:**

```bash
grep -rl "i-solar:" site/src --include="*.svelte"
```

- [ ] **Step 2: For each file found, replace solar references**

Common substitution pattern — all are `*-bold-duotone`. Include `.js` files since `site/src/lib/stories.js` contains solar icon references for the sidebar section headers (chrome, not demo content):

```bash
# Bulk replacement: strip -bold-duotone and change prefix
# Run from repo root
find site/src \( -name "*.svelte" -o -name "*.js" \) | xargs sed -i '' 's/i-solar:\([a-z0-9-]*\)-bold-duotone/i-glyph:\1/g'
```

- [ ] **Step 3: Verify no i-solar: references remain in site/src**

```bash
grep -r "i-solar:" site/src --include="*.svelte" --include="*.js" --include="*.ts"
```

Expected: 0 lines (note: `site/src/routes/(learn)/docs/utilities/unocss/+page.svelte` may contain the literal text `i-solar:icon-name` in a `<code>` documentation block — this is safe as it uses `-icon-name`, not `-bold-duotone`, so the sed pattern above would not have matched it)

---

### Task 7: Migrate component icon references in site files

**Files to update:** All `.svelte` files in `site/src/` that use `i-component:*`

- [ ] **Step 1: Find all files using i-component:**

```bash
grep -rl "i-component:" site/src --include="*.svelte"
```

- [ ] **Step 2: Replace component references with glyph**

```bash
find site/src -name "*.svelte" -exec sed -i '' 's/i-component:/i-glyph:/g' {} \;
```

- [ ] **Step 3: Verify no i-component: references remain**

```bash
grep -r "i-component:" site/src --include="*.svelte" | wc -l
```

Expected: 0

- [ ] **Step 4: Commit migration**

```bash
git add site/src/
git commit -m "feat(site): migrate i-solar: and i-component: references to i-glyph:"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run the full test suite**

```bash
bun run test:ci
```

Expected: all tests pass, zero failures.

- [ ] **Step 2: Run lint**

```bash
bun run lint
```

Expected: zero errors.

- [ ] **Step 3: Start the site dev server and visual check**

```bash
cd site && bun dev
```

Open the playground layout (`/playground`) and verify:
- Section header icons (Inputs, Display, Layout, etc.) render using `i-glyph:*`
- Component icons in the sidebar (accordion, button, etc.) render correctly
- No broken icon placeholders (missing icon = renders as empty square)

- [ ] **Step 4: Verify no remaining solar/component references across all of site/src**

```bash
grep -r "i-solar:\|i-component:" site/src --include="*.svelte" --include="*.js" --include="*.ts"
grep "solar:" site/rokkit.config.js site/uno.config.js
```

Expected: 0 matches for both commands.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(icons): complete glyph collection migration - i-glyph: replaces i-solar: and i-component:"
```
