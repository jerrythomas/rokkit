# @rokkit/unocss Preset & CLI Enhancement — Design

## Goal

Simplify Rokkit setup from ~80 lines of manual UnoCSS config to a single `presetRokkit()` call backed by a declarative `rokkit.config.js`. Enhance the CLI with `init`, `doctor`, and `migrate` commands.

## Problem

Setting up Rokkit in a SvelteKit project today requires touching 6 files with boilerplate: `uno.config.js` (~80 lines of color rules, shortcuts, icon collections, safelist), `app.css` (theme imports), `app.html` (flash-prevention script), `+layout.svelte` (themable action), `vite.config.ts`, and `svelte.config.js`. The UnoCSS config is the main pain point — every consumer must copy and customize it.

## Architecture

### Packages

| Package | Role | Dependencies |
|---------|------|-------------|
| `@rokkit/unocss` (new) | UnoCSS preset + config loader | `@rokkit/core`, `unocss` |
| `@rokkit/cli` (enhanced) | `init`, `doctor`, `migrate` + existing `bundle`/`build` | `@rokkit/unocss` (config loader), `sade`, `prompts` |
| `@rokkit/themes` (unchanged) | Pure CSS — base layout + theme variant styles | None |

Themes stays separate. The preset references theme utilities from `@rokkit/core` but does not bundle CSS. Theme CSS imports remain in `app.css`.

### Config File

`rokkit.config.js` at project root. Single source of truth read by both the preset and CLI.

```js
export default {
  colors: {
    primary: 'orange',
    secondary: 'pink',
    accent: 'sky',
    surface: 'shark'
  },
  skins: {
    vibrant: { primary: 'blue', secondary: 'purple' }
  },
  themes: ['rokkit'],
  icons: {
    app: '@rokkit/icons/app.json'
  },
  switcher: 'manual',
  storageKey: 'rokkit-theme'
}
```

**Fields:**

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `colors` | `Record<string, string>` | `DEFAULT_THEME_MAPPING` | Semantic color → Tailwind palette name |
| `skins` | `Record<string, Record<string, string>>` | `{}` | Named palette overrides |
| `themes` | `string[]` | `['rokkit']` | CSS theme variants to include |
| `icons` | `Record<string, string>` | `{ app: '@rokkit/icons/app.json' }` | User icon collections (rokkit UI icons always included) |
| `switcher` | `'system' \| 'manual' \| 'full'` | `'manual'` | Theme switching level |
| `storageKey` | `string` | `'rokkit-theme'` | localStorage key for theme persistence |

### Consumer Setup (after init)

```js
// uno.config.js
import { defineConfig } from 'unocss'
import { presetRokkit } from '@rokkit/unocss'

export default defineConfig({
  presets: [presetRokkit()]
})
```

Inline options override config file: `presetRokkit({ colors: { primary: 'blue' } })`.

---

## `presetRokkit()` — Preset Output

The preset reads config and produces:

| UnoCSS Feature | Generated From |
|---|---|
| Dark mode (`attribute`, `data-mode`) | Hardcoded convention |
| Color rules (`bg-primary-500`, `text-surface-z5`) | `Theme.getColorRules()` from `config.colors` |
| Semantic shortcuts (`bg-primary-z5`, `text-on-primary`) | `semanticShortcuts()` + `contrastShortcuts()` |
| Skin shortcuts (`skin-vibrant`) | `Theme.getPalette()` from `config.skins` |
| Icon shortcuts (`checkbox-checked` → `i-rokkit:checkbox-checked`) | `iconShortcuts(DEFAULT_ICONS)` |
| Icon collections | `iconCollections()` — always includes `rokkit` + user `config.icons` |
| Safelist | Component icons + palette colors |
| Font families | `font-body`, `font-mono`, `font-heading` |

Internally wraps `presetUno()` and `presetIcons()` so consumers don't add those separately.

### Icon Collections

The `rokkit` icon collection (UI component icons) is always included — components depend on it. User-defined collections from `config.icons` are merged alongside:

```js
// Internal resolution
{
  rokkit: '@rokkit/icons/ui.json',   // always present
  ...config.icons                     // user collections (app, custom, etc.)
}
```

Default config includes `app: '@rokkit/icons/app.json'` for general-purpose app icons. Users can override or add collections.

---

## CLI Commands

### `rokkit init`

Interactive setup for an existing SvelteKit project.

**Prompts:**

1. **Color palette** — Skin preset (default/vibrant/seaweed) or "custom"
   - If custom: pick primary, secondary, accent, surface from Tailwind palette
2. **Icons** — "Rokkit icons only" / "Rokkit + custom collection path"
3. **Theme styles** — Multi-select: rokkit, minimal, material, glass (default: rokkit)
4. **Theme switching** — System only / Manual (light/dark) / Full (light/dark + style)

**Files created/modified:**

| File | Action | Condition |
|---|---|---|
| `rokkit.config.js` | Create | Always |
| `uno.config.js` | Create or patch | Always |
| `src/app.css` | Patch — append imports | Always |
| `src/app.html` | Patch — insert init script | switcher !== 'system' |
| `src/routes/+layout.svelte` | Patch — add themable + uno.css | switcher !== 'system' |

Non-destructive: never overwrites existing content. Warns on conflicts.

### `rokkit doctor [--fix]`

Validates project setup. Reports pass/fail with suggestions.

| Check | Auto-fixable? | --fix Action / Instructions |
|---|---|---|
| `rokkit.config.js` exists, parses | Yes | Generate with defaults |
| Required packages installed | Yes | Run install command |
| `uno.config.js` uses `presetRokkit()` | No | Print diff of what to change |
| `app.css` has theme imports | Yes | Append import lines |
| `app.html` has init script | Yes | Insert before `%sveltekit.body%` |
| Icon paths resolve | No | Print "not found: X, expected at Y" |
| Stale manual config detected | No | Print "run `rokkit migrate` to convert" |

Without `--fix`: report only (exit 0 = all pass, exit 1 = failures).
With `--fix`: auto-fix safe items, print instructions for unsafe items.

### `rokkit migrate` (Phase 2)

Converts from manual UnoCSS config to preset pattern. Parses existing `uno.config.js` to extract color mappings, icon collections, and shortcuts. Generates equivalent `rokkit.config.js` and simplified `uno.config.js`. Shows diff preview before writing.

---

## Testing

| What | How |
|---|---|
| Config loader | Unit — parse, merge defaults, resolve paths, invalid input |
| Preset output | Unit — given config, verify rules/shortcuts/safelist/icons |
| `rokkit init` | Unit — mock prompts + filesystem, verify output |
| `rokkit doctor` | Unit — mock filesystem states, verify detection |
| Dogfooding | Migrate `sites/learn` to `presetRokkit()`, existing e2e tests must pass |

---

## Phasing

**Phase 1 (this plan):**
- `@rokkit/unocss` — config loader + `presetRokkit()`
- `rokkit init` + `rokkit doctor --fix`
- Migrate `sites/learn` to preset (dogfooding)

**Phase 2 (backlog):**
- `rokkit migrate` — pattern detection from arbitrary uno.config files
- Migrate `sites/quick-start`
