# Glyph Icon Collection Design

## Goal

Expand and rename the `rokkit-components` icon collection to `rokkit-glyph` (`i-glyph:` prefix), bringing in all solar icons used across the site so the codebase no longer depends on `@iconify-json/solar` or `@iconify-json/lucide` at runtime. Every icon gets 4 variants generated from solar source data; existing 49 hand-crafted SVGs keep their defaults and gain 3 additional variant files.

---

## Collection Structure

**Source directory:** `packages/icons/src/glyph/` (renamed from `src/components/`)

**Collection ID:** `rokkit-glyph`

**UnoCSS prefix:** `i-glyph:`

**Output:** `packages/icons/lib/glyph/` (built by `rokkit-cli build`, same pipeline as all other collections)

Each icon has up to 4 SVG files:

| Filename                     | Variant label     | Solar source suffix |
| ---------------------------- | ----------------- | ------------------- |
| `{name}.svg`                 | duotone (default) | `-bold-duotone`     |
| `{name}-outline.svg`         | outline / linear  | `-linear`           |
| `{name}-solid.svg`           | solid / filled    | `-bold`             |
| `{name}-duotone-outline.svg` | duotone outline   | `-duotone`          |

> **Note:** The variant labels (e.g. "duotone outline") are display names chosen for clarity. They do not correspond to solar suffix names. In particular, the fourth variant file `{name}-duotone-outline.svg` is sourced from solar's `-duotone` style — a lighter version — not from any solar "-duotone-outline" suffix. This differs from the auth icon collection where `-bold` is the default; here `-bold-duotone` is the default.

---

## Generation Script

**Script:** `packages/icons/scripts/add-solar-glyphs.js`

**Mapping file:** `packages/icons/scripts/glyph-map.json` — the script reads this file, so adding icons or changing `skipDefault` requires no script edits.

All 49 existing hand-crafted icons must appear in `glyph-map.json` with `"skipDefault": true`. The script generates only their 3 missing variant files (outline, solid, duotone-outline). New icons (without `skipDefault`) get all 4 variants generated.

Example structure:

```json
[
  { "name": "rocket", "solar": "rocket" },
  { "name": "accessibility", "solar": "accessibility" },
  { "name": "accordion", "solar": "sort-vertical", "skipDefault": true },
  { "name": "button", "solar": "widget", "skipDefault": true }
]
```

To replace a hand-crafted default with solar later: remove `"skipDefault": true` from that entry and rerun the script. Note: removing `skipDefault` does not delete the previously hand-crafted file if it exists — remove it manually first.

**Variant map** (differs from auth icons — duotone is default, not bold):

```js
const VARIANTS = [
  { solarSuffix: '-bold-duotone', ourSuffix: '' }, // skipped when skipDefault: true
  { solarSuffix: '-linear', ourSuffix: '-outline' },
  { solarSuffix: '-bold', ourSuffix: '-solid' },
  { solarSuffix: '-duotone', ourSuffix: '-duotone-outline' }
]
```

The script overwrites files it generates on each run. It does not delete files for entries that now have `skipDefault: true` after previously generating without it. Missing solar icons log a warning and are skipped.

**Dev dependency:** `@iconify-json/solar` stays in `packages/icons/package.json` (already present, needed at script runtime).

---

## Icon Audit (Implementation Step)

Before populating `glyph-map.json`, do an audit to enumerate all icons in scope:

1. **New solar icons:** Search `site/` for `i-solar:*` references — the `siteIcons` array in `site/uno.config.js` is the canonical list of safelisted solar icons. These map directly to `{ name: 'x', solar: 'x' }` entries (strip the `-bold-duotone` suffix to get the solar base name).

2. **Existing 49 component icons:** Each SVG filename in `packages/icons/src/components/` needs a matching solar equivalent identified. Add as `{ name, solar, skipDefault: true }`.

3. **Lucide icons in site chrome:** The handful of `i-lucide:*` usages in layout/navigation files (not demo content) need solar equivalents. Lucide usages inside demo stories, playground pages, and docs fragments are **out of scope** — they are illustration icons that change per component demo, not part of the site chrome.

---

## Site Migration

1. All `i-solar:*-bold-duotone` references in site → `i-glyph:*`
2. `i-lucide:*` references in site layout/chrome files only → `i-glyph:*` solar equivalents
3. All `i-component:*` references → `i-glyph:*`
4. `site/uno.config.js`: replace `siteIcons` solar entries with glyph entries, update `componentIcons` prefix from `i-component:` to `i-glyph:`

---

## Build Integration

The following files require changes:

| File                             | Change                                                                                                          |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `packages/icons/src/config.json` | Rename collection entry from `rokkit-components` → `rokkit-glyph`                                               |
| `packages/icons/package.json`    | Add export `"./glyph.json": "./lib/glyph.json"`, remove or alias `"./components.json"`                          |
| `site/rokkit.config.js`          | In the `icons` map: rename `component` key → `glyph` pointing to `@rokkit/icons/glyph.json`; remove `solar` key |
| `site/uno.config.js`             | Update safelist and shortcuts (see Site Migration above)                                                        |

> The `packages/unocss/src/preset.ts` preset does **not** need changes — it reads the collection from `config.icons` which is set by `rokkit.config.js`. There is no hard-coded `rokkit-components` reference in the preset.

---

## What Is Not Changing

- The `rokkit-cli build` pipeline is unchanged
- Other collections (base, app, auth, light, solid, twotone) are untouched
- Lucide icons inside playground stories, demo pages, and doc fragments are not migrated
- `packages/unocss/src/preset.ts` requires no changes
