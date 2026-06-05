# CLI named-token config, doctor, and LLM-doc modernization

**Date:** 2026-06-05
**Status:** Design approved, pending spec review
**Area:** `@rokkit/cli` (`init`, `doctor`), `@rokkit/unocss` README, `docs/llms/*`

---

## Problem

The Rokkit token system moved to a **named-token vocabulary** (24 tokens:
`paper / paper-soft / paper-mute / paper-edge`, `ink / ink-mute / ink-soft /
ink-faint`, `primary / on-primary`, `accent / accent-soft`, status colors,
`focus-ring`, `shadow-tint`), resolved by `presetRokkit()` from a `skin` colormap
plus `tokens: 'core'`. Components use `bg-paper`, `text-ink`, `text-on-primary`,
`bg-success-soft`, etc. The legacy z-scale utilities (`bg-surface-z0`,
`text-primary-z5`) still resolve, but only as **back-compat aliases** that collapse
onto the named tokens.

Three surfaces still describe the *old* dialect, so anything (a developer, or an
LLM) inferring "how Rokkit works" is steered wrong:

1. **`rokkit init`** (`packages/cli/src/init.js → generateConfig`) emits the legacy
   shape: `colors: { primary, secondary, accent, surface, … }` — the deprecated
   `colors:` alias, **no `ink` role**, a non-preset `defaultTheme` key, no
   `colorSpace`, no `tokens`. It writes bare JSON with no explanatory header.
2. **`rokkit doctor`** (`packages/cli/src/doctor.js`) is token-system-agnostic and
   its missing-config auto-fix writes `export default {}` (an empty, useless config).
   It has no awareness of the named-token era.
3. **LLM-facing docs** — `docs/llms/index.txt` (the "Common Patterns" / theming
   section), `docs/llms/packages/{unocss,themes,core}.txt`, and
   `packages/unocss/README.md` — teach `bg-surface-z1` / `text-primary-z6` as *the*
   pattern. `docs/llms/*` is the hand-authored source; the learn app build copies it
   verbatim (`cp -r ../../docs/llms ./static`), so the source is the right place to fix.

The original report was an LLM-written `rokkit.config.js` whose header comment
("ink on warm paper / surface→stone / z-scale utilities") reflected this stale
guidance — confirming the docs are the root cause.

## Goals

- `rokkit init` generates a config in the current named-token shape, with a concise
  accurate header comment, selectable between a Tailwind-palette (rgb) starter and a
  Zen-Sumi (OKLCH) named-palette starter.
- `rokkit doctor` is refreshed (real starter on `--fix`), validates the config shape
  for the named-token system, and gives advisory migration hints for legacy z-scale usage.
- The LLM-facing docs describe the named-token vocabulary as primary and z-scale as
  legacy back-compat.

## Non-goals

- Removing z-scale back-compat from `presetRokkit` — it stays supported by design.
- The `~/.claude` `semantic-styles-rokkit` *skill* (outside this repo) — flagged
  separately, not changed here.
- Restyling existing components or `apps/learn` — only the generator, doctor, and docs.

---

## Design

### 1. Config generator — `packages/cli/src/init.js`

#### 1.1 Output shape

Two starter shapes, chosen by the palette prompt.

**Tailwind rgb starter** (existing `default` / `vibrant` / `seaweed` / `custom`
presets, modernized). Emitted object:

```js
{
  skin: {
    surface: 'slate',  // neutral background palette (drives paper-* tokens)
    ink:     'slate',  // text palette (drives ink-* tokens) — defaults to surface
    primary: 'orange',
    accent:  'sky',
    success: 'green',
    warning: 'yellow',
    danger:  'red',
    error:   'red',
    info:    'cyan'
  },
  colorSpace: 'rgb',
  tokens: 'core',
  themes: ['rokkit'],
  defaultTheme: 'rokkit',
  switcher: 'manual',
  storageKey: 'rokkit-theme',
  chart: { /* unchanged generateChartConfig output, when includeChart */ }
}
```

- `colors:` → `skin:` (the canonical key; `colors:` remains a back-compat alias in
  the preset, so existing user configs are unaffected).
- **`ink` role added**, defaulting to the `surface` value. Without it, `ink-*` text
  tokens silently fall back to `DEFAULT_SKIN.ink` (`slate`).
- `secondary` / `tertiary` **dropped** from the emitted skin — no named token reads
  them; they remain available via the preset's `DEFAULT_SKIN` merge if a consumer
  re-adds them for z-scale palette emit.
- `tokens: 'core'` and `colorSpace: 'rgb'` made explicit (both are the preset
  defaults, but explicit is clearer in a generated starter).
- `defaultTheme` retained — it is consumed by `generateInitScript` for the
  `<body data-style>` flash-prevention script, not by the preset. Orthogonal to this
  change.

**Zen-Sumi OKLCH starter** (new palette choice `zen-sumi`). Authored as a commented
template literal (it is fixed, not user-parameterized), a trimmed version of
`apps/learn/rokkit.config.js`:

```js
{
  palettes: { kami, sumi, shu, hisui, kohaku },   // bare OKLCH "L C H" components
  colorSpace: 'oklch',
  tokens: 'core',
  skin: {
    surface: { light: 'kami', dark: 'sumi' },     // dual-palette
    ink:     { light: 'kami', dark: 'sumi' },
    primary: 'shu',
    accent:  'shu',
    success: 'hisui',
    warning: 'kohaku',
    danger:  'shu',
    error:   'shu',
    info:    'kohaku'
  },
  shape: { radius: 'soft' },
  typography: { display, sans, mono },
  themes: ['rokkit', 'zen-sumi'],
  defaultTheme: 'zen-sumi',
  switcher: 'full',
  storageKey: 'rokkit-theme',
  chart: { /* generateChartConfig output */ }
}
```

Palette values are copied from `apps/learn/rokkit.config.js` (the canonical
zen-sumi palettes), trimmed of the app-specific `overrides`/`skins`/`canvas` extras.

#### 1.2 Header comment (option A)

`writeRokkitConfig` stops using bare `JSON.stringify` and prepends a concise header:

```
/**
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
 * `tokens: 'core'` emits the named vocabulary; 'extended' adds the full palette.
 */
```

The rgb starter = header comment + `export default <JSON>` (output varies with the
user's color picks, so per-key inline comments are impractical). The OKLCH starter =
the commented template literal (header + inline section notes).

#### 1.3 Prompt change

The `palette` select adds a **`Zen-Sumi (OKLCH ink-on-paper)`** choice that routes to
the OKLCH starter. `default` / `vibrant` / `seaweed` / `custom` route to the rgb
starter. The `custom` sub-prompts keep asking `primary` / `secondary` / `accent` /
`surface`; `ink` is set equal to `surface` automatically (not prompted), and
`secondary` is accepted but not emitted into the skin.

#### 1.4 Functions

- `resolveColors` → renamed/reshaped to `resolveSkin(palette, customColors)` returning
  the named-token-aware skin (with `ink`). `SKIN_PRESETS` / `DEFAULT_COLORS` updated to
  drop `secondary`/`tertiary` from emitted output and add `ink`.
- New `generateZenSumiConfig()` returning the OKLCH starter object (palettes inline).
- New `serializeRokkitConfig(config, { header, oklch })` producing the file string
  (header comment + JSON, or the commented template for OKLCH).
- `generateConfig` branches on `palette === 'zen-sumi'`.

### 2. Doctor — `packages/cli/src/doctor.js`

#### 2.1 Refresh

`applyGenerateConfig` writes the **real default starter** (the rgb starter from
`init.js`, default presets) instead of `export default {}`. Stale wording scrubbed.

#### 2.2 Config-shape validation (new)

A pure function, kept separate from the text-based `runChecks(fs)` so both stay
unit-testable:

```js
export function validateConfigShape(config) → Array<Check>
```

The `doctor` command obtains the parsed config via the CLI's existing
`loadConfig` (`packages/cli/src/config.js`, dynamic import) and runs `validateConfigShape`
in addition to `runChecks`. When the config can't be loaded, these checks are skipped
(the `config-exists` text check already covers absence). Checks (all `warn`, none fail):

| id | Condition | Message |
|----|-----------|---------|
| `skin-ink-role` | colormap (skin / colors / skins.default) has no `ink` role | `ink` role missing — text tokens (ink-*) fall back to the surface palette. Add `ink: '<palette>'`. |
| `oklch-needs-palettes` | `colorSpace: 'oklch'` and no/empty `palettes` | oklch values require a `palettes` block; named Tailwind colors are rgb. |
| `colors-alias` | uses `colors:` instead of `skin:` | `colors:` is a back-compat alias; prefer `skin:`. |

#### 2.3 Legacy z-scale migration hints (new, advisory)

A pure scanner:

```js
export function findLegacyZUtilities(files) → { count, byFile: [{ path, hits: [{ token, suggestion }] }] }
```

`files` is `[{ path, content }]`; the command gathers `src/**/*.{svelte,css,ts,js}`
(skips `uno.config.js` so the safelist isn't flagged). Regex:
`\b(bg|text|border(?:-[tblr])?|fill|stroke|ring|outline|divide)-(surface|ink|primary|accent|success|warning|danger|error|info)-z([0-9]|10)\b`.

Suggestion mapping (z-slot → named token), per `Z_COLLAPSE_MAP_SURFACE` /
`Z_COLLAPSE_MAP_INK` and the role:
- surface: `z0→paper`, `z1→paper-soft`, `z2/z3→paper-mute`, `z4→paper-edge`,
  `z5/z6→ink-soft`, `z7/z8→ink-mute`, `z9/z10→ink`
- primary/accent/status: `z5→{role}`, `z1→{role}-soft` (other shades → nearest named token)

Reported as a single `legacy-z-utilities` check: **`warn` when hits found, never
`fail`**; prints file count + a few examples with suggestions. Purely advisory —
z-scale still works.

#### 2.4 Check count

`runChecks(fs)` keeps its 6 file checks. `validateConfigShape` and the z-utilities
scan are reported as additional lines by the `doctor` command (not part of the fixed
6-count assertion). `doctor`'s overall exit code stays driven by hard `fail`s only.

### 3. LLM-facing docs sweep

Rewrite to lead with named tokens; z-scale demoted to a short "legacy back-compat" note.

- **`docs/llms/index.txt`** — rewrite the "Common Patterns" / theming section
  (~lines 230–308): the role/z-table is replaced (or supplemented) with the
  named-token table; all the `bg-surface-z1`, `text-primary-z6`, `border-surface-z3`
  examples become `bg-paper`/`bg-paper-soft`, `text-primary`, `border-paper-edge`,
  `text-on-primary`, `bg-success-soft text-success`, etc. Keep one short paragraph:
  "z-scale utilities (`bg-surface-z0`…) still resolve for back-compat."
- **`docs/llms/packages/unocss.txt`** (lines ~175, 178), **`themes.txt`** (~204),
  **`core.txt`** (~115) — update the stale z-scale example lines to named tokens.
- **`packages/unocss/README.md`** (lines ~60, ~201) — align lingering z-scale
  examples; README already documents named tokens elsewhere, so this is touch-up.

The learn app's `static/llms` copies regenerate from source on next build — no manual
copy edits.

### 4. Tests

- **`packages/cli/spec/init.spec.js`**: migrate `config.colors.*` assertions →
  `config.skin.*`; assert `config.skin.ink`, `config.tokens === 'core'`,
  `config.colorSpace === 'rgb'`; add a `zen-sumi` test asserting `palettes`,
  `colorSpace: 'oklch'`, dual-palette `skin.surface`. Add a `serializeRokkitConfig`
  test asserting the header comment is present and the body parses.
- **`packages/cli/spec/doctor.spec.js`**: add `validateConfigShape` tests (missing
  `ink`, oklch-without-palettes, `colors:` alias) and `findLegacyZUtilities` tests
  (detects `bg-surface-z1`, maps to `paper-soft`; returns empty for named-token-only
  input). Update the `applyGenerateConfig` expectation (no longer `export default {}`).
- `bun run test:ci` and `bun run lint` to **zero errors** before finishing.

### 5. Breaking change

`generateConfig`'s **output shape changes** (`colors` → `skin`, adds `ink`/`tokens`,
drops `secondary`/`tertiary`). This only affects **newly generated** configs;
previously generated `colors:` configs keep working via the preset alias. Call out in
the journal and release notes.

---

## Components & interfaces (summary)

| Unit | File | Responsibility |
|------|------|----------------|
| `resolveSkin` | `init.js` | palette/custom → named-token skin (with `ink`) |
| `generateZenSumiConfig` | `init.js` | fixed OKLCH starter object |
| `serializeRokkitConfig` | `init.js` | config object → file string with header comment |
| `generateConfig` | `init.js` | branch rgb vs zen-sumi |
| `validateConfigShape` | `doctor.js` | parsed-config warnings (ink / oklch / alias) |
| `findLegacyZUtilities` | `doctor.js` | advisory z-scale scan of `src/**` |
| docs sweep | `docs/llms/*`, `unocss/README.md` | named-token-first guidance |

## Testing strategy

Pure functions (`resolveSkin`, `generateZenSumiConfig`, `serializeRokkitConfig`,
`validateConfigShape`, `findLegacyZUtilities`) are unit-tested directly with
objects/string inputs — no filesystem. The `doctor`/`init` command wrappers stay thin
(gather files, call pure functions, print) and are covered by the existing
adapter-injection pattern.

## Repo hygiene (per agents/workflow.md)

- Update `agents/journal.md` with summary + commit hashes.
- Mark the item in `docs/design/12-priority.md`.
- Touch the theming/whitelabeling design doc if it references the generated shape.
