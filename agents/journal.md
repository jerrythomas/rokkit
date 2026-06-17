# Project Journal

## 2026-06-15 — Theme-contrast regression checkpoint + auto on-color (vermillion restored)

**Regression checkpoint.** Built an isolated component gallery (`apps/learn/
src/routes/embed/gallery`) + a Playwright WCAG-contrast gate (`e2e/
theme-contrast.e2e.ts` + `contrast-collector.mjs`) that drives the full
style × mode × skin matrix (5×2×5) and ratchets against
`theme-contrast.baseline.json` (`comp|part` keys). Burned the content debt
down (33→12 keys): `text-ink-soft`/`text-paper-edge` → `text-ink-mute`
across table/list/tree/select/menu/dropdown/divider/tabs; stepper/timeline
active circles use `--ink` number with the saffron ring kept; 4 brand skins
made dual-palette (kami/sumi) so named tokens flip in dark. Quarantined 4
orphaned koan e2e specs (old Shell/Welcome composer, no route mounts).

**Vermillion course-correction.** Option A (darkening filled controls via
`color-mix(var(--role) 70%, black)`) muddied the brand vermillion to brown.
Reverted all filled controls back to **solid `var(--role)`** and re-anchored
`shu`-500 at `#e8552b` (oklch 0.641 0.190 36) — the fill IS the brand color;
contrast comes from the on-color, not from darkening the fill.

**Auto on-color (the general fix).** `@rokkit/core` now derives every
on-color (near-black `#161616` / near-white `#fafafa`) from the fill's
relative luminance, instead of a fixed light tint. New
`relativeLuminance(value, space)` in `color-space.js` (hex / bare-RGB /
bare-OKLCH → Y via inverse OKLab matrices). `Theme.#onColorHex(role)` picks
the endpoint at the `Y≈0.19` crossover; `--on-primary` (runtime, per-skin)
and the baked `text-on-{accent,danger,…}` utilities both use it. Result: a
bright 500 (vermillion, teal, amber) gets readable black text; a dark 500
(violet, indigo) gets white — automatically, per "pick a 500 where black or
white works." Removed the hand-set `on-primary` learn override. Ocean skin
set to teal / emerald / sky.

Solid filled controls (all variants, all skins) now clear AA. Remaining
baselined debt is deliberate/marginal: frosted translucent glass fills,
`ink-mute`-in-dark (4.07), message status soft-bg. Gate green.

Verified: core 240 ✓, full unit suite 3566 ✓, lint 0 errors, e2e 56 passed /
28 skipped / 0 failed, contrast gate ✓; vermillion #e8552b renders bright
(not brown) in light + dark with readable near-black text, ocean = teal.

## 2026-06-13 — Frosted gradient + per-component dist follow-ups; learn Cloudflare deploy (v1.1.17)

**Themes follow-ups (from v1.1.16).** Fixed the two non-blocking items noted last release.
(a) The frosted `gradient`/`default` button silently rendered no fill: `from-paper-mute/70
to-paper-soft/50` are named-token *shortcuts*, not wind3 colors, so they drop as `@apply`
gradient stops (unlike primary/accent/danger, which resolve via `theme.getColorRules()` and
were left untouched). Rewrote it as raw `background: linear-gradient(… color-mix(in oklch,
var(--paper-mute) 70%, transparent) …)` — same workaround as `rokkit/button.css`. The #135
build guard can't catch this class (a dropped stop leaves no `@apply` behind), so it was
visual-only. (b) `build.mjs` now compiles every `src/<style>/<comp>.css` →
`dist/<style>/<comp>.css` (177 files, all `@apply` expanded + scanned by the guard), and the
`./<style>/*` exports point at `dist` instead of raw `src` — single-component imports now get
resolved CSS, not raw `@apply`.

**learn Cloudflare deploy config.** Mirrors `dbd-rs/site`: `svelte.config.js` "keep both"
adapter selection (`@sveltejs/adapter-cloudflare` when `CF_PAGES`/`WORKERS_CI`, else
`adapter-auto`); committed `wrangler.jsonc` (`_worker.js` + Static Assets + `nodejs_compat`).
Unlike dbd (fully static), learn ships as a Worker — it has a server endpoint
(`api/llm/openrouter`) and SSR routes — so no global prerender (per-section `guides` prerender
stays). `CF_PAGES=1` build emits `.svelte-kit/cloudflare/_worker.js`; the default build still
selects adapter-auto.

**Verification.** dist 0 real `@apply` (incl. per-component); `test:ci` 3566 · themes 66 ·
cli 192 · lint 0 errors; both learn build paths exit 0; published v1.1.17 tarball confirmed
(per-component dist present, default gradient `color-mix` shipped, `./<style>/*` exports →
dist). npm: all packages live at 1.1.17; Publish CI green.

---

## 2026-06-10 — Fix @rokkit/themes @apply leak / lightningcss warnings (v1.1.16)

**Bug.** Consumer sites saw `[lightningcss minify] Unknown at rule: @apply`. Root cause = three
compounding defects: (1) `rokkit init`'s generated `uno.config.js` had no `transformerDirectives()`,
so consumers resolved no `@apply`; (2) `@rokkit/themes` shipped `src` (raw `@apply`), never the
resolved `dist` (built by `build.mjs` but unexported/unpackaged); (3) frosted's `/opacity`
named-token `@apply` (`bg-paper-edge/38`, …) can't resolve via shortcuts anywhere — broken
translucency + guaranteed leak. (Recurrence of closed #135.)

**Fix.** Ship resolved `dist`: `exports` → `./dist/*.css`, `files` += `dist`, `prepublishOnly` +
new `prepare` build it (workspace self-heals on install; consumers get the pre-built tarball).
Rewrote ~100 `/opacity` `@apply` → `color-mix(in oklch, var(--token) N%, transparent)` across
frosted (restores translucency + kills the leak). Added a `build.mjs` guard that fails the build on
any real `@apply` left in dist (so #135 can't silently recur). Added `transformerDirectives()` to the
CLI's generated `uno.config.js` for consumers' own `@apply`.

**Verification.** dist 0 real `@apply`; the learn app (a consumer) builds with zero `@apply`/
lightningcss warnings; `test:ci` 3566 · themes 66 · cli 126. **Follow-ups (non-blocking):** one frosted
gradient-stop `/opacity` silently drops (no leak — visual only); per-component `./<style>/*` exports
stay on `src`.

---

## 2026-06-10 — Skin system + follow-ups + docs/CLI sync (v1.1.15)

**Skin system (public, first-class — parallel to theming).** `vibe.skin` + `vibe.allowedSkins`
(`@rokkit/states`, persisted); `themable` writes `data-skin` (`@rokkit/actions`); preset emits
`[data-skin='name']` blocks (default on `:root`, + dark variant) + `BUILTIN_SKINS`
(default/ocean/violet/rose/emerald), **`skin-{name}` class removed** (`@rokkit/unocss` + `palette.css`);
`SkinSwitcherToggle` (`@rokkit/app`); `skinnable` rehabilitated as the runtime var-applicator; learn
promoted onto `vibe.skin`+`data-skin`; `skin-system-rokkit` skill (catalog → 4) + skins guide. Design:
`docs/design/20-skin-system.md`. Built subagent-driven (two-stage review) — reviews caught a cross-package
test break, the config-merge edge cases, two `@rokkit/app` export gaps, an allowedSkins-before-load
ordering bug, and several stale `skin-{name}` doc refs.

**Follow-ups.** Fixed `ThemeSwitcherToggle` (options keyed by `label`, not the nonexistent `text` field —
empty aria-labels); removed dead skin-injection code in learn `skins.ts`; single-sourced the theme
`storageKey` — `rokkit init` derives it from `package.json` name (omit, don't hardcode), learn reads
`'rokkit-learn-app'` via a `$lib/theme-config` accessor used by the SSR hook, `themable`, and the store.

**Dead code + sync audit.** Removed leftover `packages/stories` cruft (the package was already deleted).
Audited guides/llms/learn/CLI/config for drift and fixed it: the CLI flash script now reuses
`@rokkit/unocss` `themeInitScript` (no more hand-rolled divergence); `doctor` uses the configured
storageKey; llms docs corrected (`skin:` canonical, `messages` direct-access, `switcher` system, variant
prop, skills catalog, troubleshooting → `themeHook`); learn demo `fields` use `label`; learn config drops
the redundant `skin:` block.

**Breaking.** `skin-{name}` utility class removed from `presetRokkit` output — use `data-skin='name'`.
(Plus the earlier `navigable` removal from `@rokkit/actions`, shipped here too.)

**Verification.** `test:ci` 3566 pass · lint 0 errors · 4 skills in the catalog · final review = ship.

---

## 2026-06-10 — Command system shipped (v1.1.14)

**Why.** Keyboard shortcuts + a Cmd+K palette were ad-hoc/absent (the `⌘K` badge was decorative).
Built a public, first-class command system parallel to theming, plus a guided skill — and folded in
the long-pending legacy keyboard-nav consolidation.

**Shipped (5 packages + learn + skill + docs).** `commands` registry + `normalizeShortcut`/
`eventToShortcut` + `command` messages namespace (`@rokkit/states`); `shortcuts` action — structural
`{resolve,execute}` param, no states dep, input-focus guard (`@rokkit/actions`); `CommandPalette`
(`@rokkit/ui`) themed across all 5 styles (`@rokkit/themes`); wired into `apps/learn` `/app`
(`use:shortcuts={commands}` + `<CommandPalette>` + palette.open/theme.toggle/conversation.new);
`command-system-rokkit` skill (catalog → 3 skills) + commands guide + reference docs. Design:
`docs/design/19-command-system.md`. Built via subagent-driven dev (two-stage review per task — caught
a Critical re-register index-leak, a ui package-root export gap, and navigable doc-drift).

**Consolidation.** Removed legacy `kbd.js` + `navigable` action (superseded by `keymap.js`/`navigator`),
migrated `TableOfContents` to the `keyboard` action. Also removed 86 leftover `apps/archive/static`
files missed in the earlier archive removal.

**Breaking.** `navigable` export removed from `@rokkit/actions` (only consumer was `TableOfContents`,
migrated in the same change).

**Verification.** `test:ci` 3553 pass · lint 0 errors · final holistic review = ship.

**Commits.** `9d66dbf3` … `52984635` (registry → messages → shortcuts → palette → themes → learn wiring →
ToC migration → navigable/kbd removal → skill → docs → ToC keyboard-action remap). Released as v1.1.14.

**Next (designed, not yet built).** Skin system — first-class `data-skin` dimension
(`docs/design/20-skin-system.md`).

---

## 2026-06-10 — CommandPalette themed across all 5 styles (Task 5 of command system)

**Why.** The CommandPalette component was already built but had no theme coverage in
`@rokkit/themes`. Without it, the palette renders as a bare floating box — no surface
colour, no active-item highlight, no backdrop scrim.

**What shipped.**
- `packages/themes/src/base/command-palette.css` — structural only (layout, sizing, no color).
- `packages/themes/src/{rokkit,minimal,material,frosted,zen-sumi}/command-palette.css` — colour
  and surface per style, each including `[data-command-item][data-active]` with a `bg-` token.
- All 6 `index.css` files updated with `@import './command-palette.css'`.
- Coverage guard extended: 6 new assertions added to `packages/themes/spec/coverage.spec.js`.
- Full themes suite: 66/66 pass (was 60 before new tests were added).

**Active-item token choices per style.**
| Style     | Active bg token      | Active text token |
| --------- | -------------------- | ----------------- |
| rokkit    | `bg-primary`         | `text-on-primary` |
| minimal   | `bg-paper-mute`      | `text-ink` + `border-l-accent` |
| material  | `bg-primary`         | `text-on-primary` |
| frosted   | `bg-primary/80`      | `text-on-primary` |
| zen-sumi  | `bg-paper-mute`      | `text-ink-mute` + `border-l-primary` |

## 2026-06-09 — `rokkit skills list|add` — AI skill guides shipped with the CLI

**Why.** Coding agents working in Rokkit projects needed authoritative guides for
the two most error-prone areas: theming with the named-token system and building
UI with components. Bundling SKILL.md files directly into `@rokkit/cli` lets any
consumer project pull them in with a single command. Spec:
`docs/backlog/2026-06-09-rokkit-skills-add.md`; plan:
`docs/superpowers/plans/2026-06-09-rokkit-skills-add.md`.

**CLI commands (`packages/cli/src/skills.js`, wired in `src/index.js`).**
- `rokkit skills list` — reads the `name`/`description` YAML frontmatter from each
  bundled SKILL.md and prints the catalog (name + description), marking
  already-installed skills with a `✓`.
- `rokkit skills add [names…]` — installs named skills into the consumer project's
  `.claude/skills/<name>/SKILL.md`; no args → interactive multi-select via
  `prompts`; `--all` installs every bundled skill; `--force` overwrites an
  existing install (default: skip if present).
- Skills resolve against `../skills/` relative to the module (via
  `new URL('../skills/', import.meta.url)`, ESM) inside the package, so they
  travel with the published tarball.

**Bundled skills (v1 catalog).**
- `semantic-styles-rokkit` — migrated from the global `~/.claude` skill; covers
  the named-token vocabulary, `skin`/`overrides` config, and UnoCSS shortcuts.
  (`e340526e`)
- `rokkit-components` — net-new, consumer-usage focused: data-first API patterns,
  field mapping, snippets, keyboard navigation, and theming hooks.
  (`0c75e845`)

**Packaging.**
- `"skills/**"` added to `packages/cli/package.json` `files` array so both
  SKILL.md files ride the published package. `bun pm pack --dry-run` confirms
  count = 2. (`8972b8b6`)

**Commits:** `e340526e` (bundle semantic-styles-rokkit skill) · `0c75e845`
(add rokkit-components skill) · `8c3361d1` (catalog listing from frontmatter) ·
`2238a81a` (install skills into .claude/skills) · `2576a572` (wire list|add
commands) · `8972b8b6` (include skills/ in published package).

**Verification.** `bun run test:ci` passes (existing suite). `bun run lint` →
0 errors. Pack dry-run shows both SKILL.md files.

## 2026-06-06 — CLI `init`/`doctor` + LLM docs modernized to named tokens

**Why.** The token system moved to the named-token vocabulary (`bg-paper`,
`text-ink`, `text-on-primary`, `*-soft`) with `tokens: 'core'`, but `rokkit
init`/`doctor` and the LLM-facing docs still spoke the legacy `colors:` +
z-scale dialect. An LLM (or developer) inferring "how Rokkit works" was being
steered to write outdated configs (the original report was an LLM-written
`rokkit.config.js` whose header described `surface`/z-scale). This closes that
gap end-to-end. Spec: `docs/superpowers/specs/2026-06-05-cli-named-token-config-and-doctor-design.md`;
plan: `docs/superpowers/plans/2026-06-05-cli-named-token-config-and-doctor.md`.

**CLI `init` (`packages/cli/src/init.js`).**
- `generateConfig` now emits the named-token `skin` shape — `skin` (with an
  `ink` role; `ink` defaults to `surface`), `colorSpace: 'rgb'`, `tokens:
  'core'` — instead of the legacy `colors:` alias. `secondary`/`tertiary` are
  dropped from emitted skins (no named token reads them).
- New `generateZenSumiConfig` + a `zen-sumi` palette prompt choice: a second
  selectable starter shipping the OKLCH ink-on-paper palettes (kami/sumi/shu/
  hisui/kohaku, copied from `apps/learn`), dual-palette `surface`/`ink`,
  `shape.radius: 'soft'`, typography.
- `serializeRokkitConfig` prepends a concise named-token header comment
  (names the vocabulary, marks z-scale as back-compat); OKLCH starter also gets
  a palettes note. `writeRokkitConfig` routes through it.
- **Breaking** to *generated* output shape (`colors` → `skin`); existing user
  configs keep working via the preset's `colors:` back-compat alias.
- Commits: `3727860b`, `1fdd9435`, `34a18a53`, `cd07eb07`, `2617db35`, `77958e6b`.

**CLI `doctor` (`packages/cli/src/doctor.js`).**
- `--fix` for a missing config now writes the real named-token starter
  (`defaultStarterSource`) instead of `export default {}`. (`0fc81481`)
- New pure `validateConfigShape(config)` — advisory warnings for: missing `ink`
  role, `colorSpace: 'oklch'` with no `palettes`, legacy `colors:` alias. Colormap
  precedence mirrors the preset's `resolveColormap` (`skins.default ?? skin ??
  colors`). (`28d695fb`, `3bdeb346`; spec precedence note `968d2234`)
- New pure `findLegacyZUtilities(files)` + `gatherSrcFiles(cwd)` — scans `src/**`
  for z-scale utilities and prints advisory named-token suggestions (never fails
  the doctor, never affects exit code). z0–z2 on accent/status correctly collapse
  to `-soft`, matching `theme.ts getZAliasesOther`. (`8a8dfb30`, `0eae0f9c`)

**LLM-facing docs.**
- `docs/llms/index.txt` Theming section rewritten: named-token vocabulary table +
  examples lead; z-scale demoted to one "Legacy" back-compat note. (`df3f2a74`, `4297259b`)
- `docs/llms/packages/{unocss,themes,core}.txt` + `packages/unocss/README.md`
  reframed to named-token-first (z-scale = back-compat). Fixed a duplicate
  "Named Token Shortcuts" heading in `unocss.txt`. (`e081c229`, `4ec37f7a`)

**Verification.** `bun run test:ci` → 255 files, 3519 passed (+16 new CLI tests,
zero regressions). `bun run lint` → 0 errors (75 pre-existing warnings). Smoke-tested
both generated starters. Out of scope (unchanged): preset z-scale back-compat;
the `~/.claude` `semantic-styles-rokkit` skill (lives outside the repo — flag for
separate update).

## 2026-06-02 — Merge `custom:` into `overrides:` in rokkit.config

**Breaking change to the preset config API.** Replaced the two-block
`custom:` / (proposed) `overrides:` split with a single `overrides:`
block that accepts any token name. Reserved names (e.g. `paper-edge`)
override the named-token defaults via cascade order; non-reserved names
emit as new custom tokens. Same resolution pipeline for both — palette
ref → light/dark pick → colorSpace adapter.

**Motivation**

When porting Rokkit tokens into the sensei app, a `paper-edge` override
in dark mode was needed (default `sumi.400` is lighter than `sumi.50`
paper bg → "lifted edge" instead of an etched hairline). The previous
`custom:` block rejected reserved names with "use the skin palette
mapping instead", but skin mapping is role-level, not token-level — no
way to redirect one shade without disturbing the rest. The compat.css
override pattern worked but pushed config concerns into stylesheets.

**Why a single field, not two**

The check between custom-vs-override added nothing — the resolver is
name-agnostic and the cascade does the right thing automatically.
Dropping the validator collapses the API surface to one concept: "CSS
custom-property definitions, resolved per-mode."

**Changes**

- `packages/unocss/src/custom-tokens.js`: dropped
  `validateCustomTokenNames`; renamed `resolveCustomTokens` →
  `resolveTokens`; removed the `NAMED_TOKENS` import (no longer needed).
- `packages/unocss/src/config.js`: `DEFAULT_CONFIG.custom: {}` →
  `DEFAULT_CONFIG.overrides: {}`; `loadConfig` reads `cfg.overrides`.
- `packages/unocss/src/preset.ts`: imports `NAMED_TOKENS`, builds a
  `NAMED_TOKEN_SET` used by `buildOverrideTokenShortcuts` to skip
  shortcut emission for reserved-name overrides (the named layer
  already emits those). Resolver call sites switched to
  `config.overrides`; dark-block trigger now keys off `hasDarkOverride`.
- `apps/learn/rokkit.config.js`: `custom:` → `overrides:`, with
  `'paper-edge': { light: 'kami.400', dark: 'oklch(0.04 0.025 85)' }`
  folded in as proof of the new mechanism.
- `apps/learn/src/lib/koan/compat.css`: removed the
  `[data-mode='dark'] { --paper-edge: ... }` block and the explanatory
  comment block — now config-driven.
- Tests rewritten for the merged field, plus two new assertions:
  reserved-name overrides win in `:root`, and per-mode reserved-name
  overrides land correctly in both `:root` and `[data-mode="dark"]`.

**Migration impact**

External consumers (sensei) need a one-shot rename of `custom:` →
`overrides:` in their `rokkit.config.js`. No semantic change for
non-reserved entries.

Lint: 0 errors (84 pre-existing warnings unchanged). Tests:
3518 passed (3518).

## 2026-06-01 — Split guides into /guides section + migrate prose docs to .md

Two coordinated changes landed on `develop`. Backlog/spec/plan:
`docs/backlog/2026-06-01-guides-section-split.md` and
`docs/plans/2026-06-01-guides-section.md`.

**Information architecture**

Eleven guide pages moved out of the `/app` chat-shell into a dedicated
`/guides` section with its own layout — top-bar with brand + section nav
+ search, 240px left TOC rail grouped by category, scrollable content
column. No composer / conversation list / canvas tabs. The chat shell
now hosts only interactive demos.

- New routes: `/guides/` (index, cards by category) and
  `/guides/[slug]/+page.svelte` (renders content via the existing
  `GuidePage` component).
- Registry at `src/lib/guides/index.ts` exports the ordered `guides`
  array, `findGuide(slug)`, and `guidesByCategory()`. All three are
  consumed by the layout, index page, and slug route.
- `Search.svelte` wires `minisearch` over title / description / content.
- Layout uses a deterministic `min-height: 0` chain so both rail and
  content column scroll independently — the previously hit-bug class
  where a missing `min-height: 0` somewhere up the flex/grid path
  silently kills scroll.
- Legacy URLs preserved: `/app/guide-[slug]` is a 301 to `/guides/<slug>`.
- 11 demo folders (`koan/demos/guide-*/`), 11 static route folders
  (`/app/guide-*/`), and 11 `ShellDemoType`/`DemoKind`/`catalog` literals
  removed.

**Storage migration: .ts → .md**

All 59 prose-doc files (11 guide bodies + 48 component docs) moved from
TypeScript template-literal exports (`` export const xDocs = `…` ``) to
plain `.md` files loaded via Vite's `?raw` import suffix. Eliminates
~300 hand-escaped `\` ` and `\${` sequences across the tree, gives full
markdown editor support (preview, syntax highlighting, format-on-save),
and lets non-developers edit prose without touching TS.

Converter discovered two real bugs during execution:
- `tabs/docs.ts` has a JSDoc preamble before its export — the regex
  anchored at `^\s*export\s+const` rejected it. Fixed by stripping a
  leading `/** ... */` block before pattern-matching.
- Initial converter unescaped `` \` `` and `\${` but not `\\` → `\`.
  Result: source `\\\`` (4 source bytes, TS runtime `\` + `` ` ``, 2
  chars) was producing `\\` + `` ` `` (3 chars) in `.md` output — one
  extra visible backslash visible in rendered code blocks. Verified
  against the bun-evaluated TS runtime that the converter output now
  matches byte-for-byte. Affected 5 files documenting nested
  template-literal / fenced-block syntax (`code/docs.md`,
  `markdown-renderer/docs.md`, `guide-charts/content.md`,
  `guide-ai-chatbots/content.md`, plus the JSDoc-preamble case).
- All 59 generated `.md` files validated with prettier 3.8
  `--embedded-language-formatting=off` (so code-fence content isn't
  reformatted). 16 files needed cosmetic normalization (table column
  padding, `*italic*` → `_italic_`, list marker style); applied.

**Verification**

`bun run test:ci` — 3518/3518 pass (was 3511 — added 7 new
`guides/index.spec.ts` tests). `bun run lint` — 0 errors. Production
build clean. Legacy URL redirect verified.

**Commits**: `3bade079`, `8a747b1e`, `7a23ed4b`, `7250af66`, `0de107cb`,
`2a2aab8f`, `2533b08e`, plus the journal/cleanup commit.

### Trimmed Token Vocabulary (release 1) — complete (2026-05-15)

**What was done:**

- **Named-token vocabulary constants** — `NAMED_TOKENS` in `@rokkit/core` defines the 20-name vocabulary
- **`tokens` mode config** — `tokens: 'core'` (new default) emits 20 named vars with palette values inlined; `tokens: 'extended'` preserves legacy ~120-var output
- **`--color-*-z*` aliases preserved** — back-compat z-alias layer emitted alongside named tokens; `getZAliasesForCore` / `getZAliasesForExtended` in `Theme`
- **`custom` config block** — app-level tokens with palette-ref + mode-aware resolution; `customTokenResolver` + Uno shortcuts for color-valued custom tokens
- **Named-layer Uno shortcuts** — `bg-paper`, `text-ink-mute`, etc. generated from named vocabulary; `bg-*` shortcuts use `background-color`
- **Preflight branching** — `buildPreflights` branches on `tokens` mode to emit the right CSS var set
- **Demo smoke test** — `tokens: 'core'` + `custom.canvas` wired in the demo app to verify end-to-end
- **Docs** — `docs/unocss` updated with `tokens` mode and custom-tokens config documentation

**Emit-size impact (per skin):**
- `tokens: 'extended'` (today's behavior preserved): ~120 CSS vars
- `tokens: 'core'` (new default): ~40 CSS vars (20 named + ~22 z-aliases)

**Out of scope (next release):** migrate `packages/themes/src/base/*.css` to use named vars instead of z-scale patterns; migrate zen-sumi style; eventually drop the z-alias emit.

**Spec:** `docs/superpowers/specs/2026-05-15-trimmed-token-vocabulary-design.md`
**Plan:** `docs/superpowers/plans/2026-05-15-trimmed-token-vocabulary.md`

**Results:**
- 3469 unit tests — all passing
- 1026 UI tests — all passing
- 0 lint errors (14 pre-existing warnings)
- Demo + site builds: passing

**Commits (newest first):**
- `e093efe4` docs(unocss): document tokens mode and custom-tokens config
- `d76c99e0` demo: enable tokens:'core' and add custom canvas tokens as smoke test
- `9d297cc6` refactor(unocss): dedupe palette-ref regex
- `065ceac9` feat(unocss): Uno shortcuts for color-valued custom tokens
- `c3bf46e8` refactor(unocss): bg-* named shortcuts use background-color
- `c706ec54` feat(unocss): named-layer Uno shortcuts (bg-paper, text-ink-mute, etc.)
- `58e9331b` refactor(unocss): tighten preflight emit — drop dead cast, refine dark trigger
- `336e01f9` feat(unocss): preset preflights branch on tokens mode
- `3c8bca5a` feat(unocss): custom-token resolver
- `fc11b042` feat(unocss): config — tokens mode + custom block
- `2cc9d1a9` feat(core): Theme.getZAliasesForExtended — named-as-palette-aliases
- `ed5f6d53` refactor(core): tighten getZAliasesForCore types and dedupe Z_SLOTS
- `0e5623ba` feat(core): Theme.getZAliasesForCore — back-compat z-alias layer
- `efe9dcde` refactor(core): extract Theme #resolveDerivedToken to reduce complexity
- `e8fd0e95` feat(core): Theme.getNamedTokens — palette-inlined named layer
- `3406c54c` refactor(core): tighten named-token types + add edge-case tests
- `33070edf` feat(core): add named-token vocabulary constants

---

### Semantic Ink + Extensible Color Roles — complete (2026-05-12)

**What was done:**

- **Zen-sumi focus ring cleanup** — simplified 13 `oklch(var(--color-*) / 1)` to `var(--color-*)` across 11 zen-sumi CSS files. Old pattern was invalid nested oklch after ColorSpace adapter wrapped values.
- **Semantic Ink role** — added `ink` to `DEFAULT_THEME_MAPPING` with surface fallback. Inverted z-scale: `ink-z1` light=shade 900 (dark text), complements `surface-z1` light=shade 100 (light bg). Same z-level = matched contrast pair.
- **Alias validation** — `isAlias()`, `validateAliases()` in config.js. Detects circular, chained, and missing-target aliases at build time.
- **Alias-aware preset** — `buildTheme`, `buildPreflights`, `buildSemanticShortcuts` all filter aliases. `buildThemeColors` generates color rules for aliases pointing to target's CSS vars.
- **Generalized dual-palette** — verified any role (not just surface) supports `{ light, dark }` palette syntax.
- **Source-level theme distribution** — themes package.json exports remapped from `dist/` to `src/`. Consumers compile via their own UnoCSS. Breaking change (major bump on @rokkit/themes).
- **Ink in demo** — `ink: { light: 'sumi', dark: 'kami' }` in default skin. ~120 text tokens migrated from `text-surface-zN` to `text-ink-zM` across 22 zen-sumi CSS files.
- **Contrast warnings** — build-time OKLCH lightness check between ink/surface at z1, z3.
- **Demo cleanup** — deleted outdated local zen-sumi copy (10 files, 1133 lines), switched to package import. Fixed all `oklch(var())` patterns in app.css, EnsoRing, Sparkline, inline styles.
- **Docs** — updated llms, CLI, site learn pages to use source-level import paths.

**Design spec:** `docs/superpowers/specs/2026-05-12-semantic-ink-and-extensible-roles-design.md`
**Implementation plan:** `docs/superpowers/plans/2026-05-12-semantic-ink-extensible-roles.md`

**Results:**
- 3367 unit tests — all passing (19 new tests)
- 0 lint errors
- Demo + site builds: passing

**Commits:** `09895724`–`d998e8f2` (14 commits on develop)

**Backlog added:**
- Settings sidebar cleanup — remove dark mode + language from sidebar
- Settings skin customizer — predefined skin picker + semantic color customization

---

### Phase 9: Final Verification — complete (2026-05-11)

**What was done:**

- Updated `e2e/helpers.ts`: added `setStyle()`, `setDensity()`, `setRadius()` helpers alongside existing `setMode()`; added `Style`, `Density`, `Radius` types
- Fixed broken `setup-wizard.e2e.ts`: replaced old `.stage.completed` / `.wiz-bottom .btn-solid` selectors with post-migration equivalents (`[data-button]` on wiz-bottom buttons; Back button = first, Continue = last)
- Fixed broken `sessions.e2e.ts` filter test: replaced `.filter-group`/`.filter-pill` (old custom) with `[data-tabs][aria-label="outcome-filter"] [data-tabs-trigger]` (rokkit Tabs component)
- Added `settings.e2e.ts`: smoke tests (load, 5 cards, appearance controls), behavior tests (theme/mode/density/radius apply to body.dataset immediately), and 2 snapshot tests (light + dark)
- Added Cross-Theme Visual Regression suite in `settings.e2e.ts`: 10 observatory snapshots (all 5 themes × light/dark) + 5 settings-page snapshots (each theme, light mode)

**Results:**
- 55 e2e tests — all passing
- 3321 unit tests — all passing
- 0 lint errors
- Demo app production build: ✅

**Commits:** `73b13037` feat(demo): Phase 9 — Final Verification e2e test suite

---

### Phase 8: Settings Panel + Theme Switcher — complete (2026-05-08)

**What was done:**

- Built `/settings` route — replaced placeholder with a full settings page
- Live theme switcher: 5 theme style cards (zen-sumi, rokkit, minimal, material, frosted) with immediate `body.dataset.style` update
- Appearance controls: Mode (Light/Dark), Density (Compact/Comfortable/Cozy), Corners (Sharp/Soft/Rounded/Pill) — all chip buttons wired to body dataset + localStorage
- Language section: locale chips matching LanguageSwitcher behavior
- Created `$lib/stores/theme.svelte.ts` — Svelte 5 rune store (`$state` getters) as single source of truth for all 4 axes, shared between `+layout.svelte` and `+page.svelte`
- Updated layout: removed local `mode` state + `toggleMode`, imports `theme` store instead — sidebar mode button stays in sync with settings page
- Added settings message keys to all 3 locales (en/es/ar): 16 keys per locale
- All changes apply immediately; persisted to `sensei-theme` localStorage key

**Tests:** 3321 passed, 0 lint errors

**Commits:** `31faf83c` feat(demo): Phase 8 — Settings Panel + Theme Switcher

---

### Phase 7: Token migration + literal icon support — complete (2026-05-08)

**What was done:**

- Migrated all remaining `color-mix(in srgb, var(--color-*-500))` → `color-mix(in oklch, oklch(var(--color-*-z5)/1))` across all affected theme files:
  - `frosted/button.css` (6 rules), `frosted/card.css` (5), `frosted/menu.css` (4), `frosted/switch.css` (2), `frosted/dropdown.css` (5), `frosted/step-indicator.css` (1)
  - `rokkit/step-indicator.css` (1), `material/step-indicator.css` (1)
- Fixed demo app: `EnsoRing.svelte` (3 old SVG stroke/fill tokens), `Sparkline.svelte` (default color), `observatory/+page.svelte` (inline style), `setup/+page.svelte` (project confirmed border), `zen-sumi/card.css` (retro-* borders — success, warning, mute all now z-scale oklch)
- Added `[data-item-icon-literal]` color support to `rokkit`, `minimal`, `material`, `frosted` list.css — matching each theme's existing icon color pattern (default/hover/active states)

**Tests:** 3321 passed, 0 lint errors

**Commits:** `c5f70e10` feat(themes): Phase 7 token migration

---

### Phase 6 follow-up: CSS-driven list states — complete (2026-05-08)

**What was done:**

- Rewrote `demo/src/lib/components/ListItem.svelte`: removed all inline styles (`iconStyle` derived var, tick inline styles, subtitle inline styles). Added `data-item-status` attribute on the literal icon span; tick renders as `<span data-item-tick>`; subtitle always renders as `<span data-item-description>`. Zero inline styles — all visual state driven by CSS data-attribute selectors.
- Fixed dark-mode active state in `demo/src/themes/zen-sumi/list.css`: replaced `bg-surface-z0 text-surface-z9` (which rendered as a white box in dark mode because z0=paper does not invert in zen-sumi) with `color-mix(in oklch, oklch(var(--color-primary-z5)/1) 10%, transparent)` + `box-shadow: inset 2px 0 0` left-border indicator. Mode-adaptive: no z-scale hardcoding.
- Added complete wizard step CSS in `list.css` using `:disabled` (pending), `:not([data-active]):not(:disabled)` (done), `[data-active='true']` (current) — icon colors, tick opacity transition, description mono font. No inline styles needed in component.

**Tests:** 3321 passed, 0 lint errors

**Commits:** `801e6fa6` fix(demo): CSS-driven list states

---

### Phase 5.5: Zen-Sumi Theme — complete (2026-05-05)

**What was done:**

- Created 25 component CSS files in `packages/themes/src/zen-sumi/` covering all components: button, input, list, tabs, toggle, switch, tree, select, menu, dropdown, card, table, toolbar, search-filter, range, timeline, floating-navigation, toc, message, status-list, step-indicator, chart, swatch, floating-action, and index
- Design language: no shadows, no gradients, hairline borders (surface-z2), ink-on-paper primary button (surface-z9 bg / surface-z0 text), shu vermillion accent (primary-z5), border-darkening focus (no glow rings), tabs as filled pills (surface-z9 active)
- Updated `build.mjs` to compile zen-sumi and include it in the full bundle; added `// nosemgrep` suppressions for pre-existing false-positive path traversal warnings on hardcoded-array values
- Updated `package.json` exports with four entry points: `./dist/zen-sumi`, `./zen-sumi.css`, `./zen-sumi`, `./zen-sumi/*`
- Built successfully: `dist/zen-sumi.css` = 1938 lines of compiled CSS
- Marked zen-sumi in priority checklist as done; sensei `rokkit.config.js` has commented `themes: ['zen-sumi']` ready to uncomment once published

**Tests:** 3321 passed, 0 lint errors

**Commits:** `546affd3` zen-sumi theme + build/exports

---

Chronological log of confirmations, progress, milestones, and decisions.
Design details live in `docs/design/` — modular docs per module.

### Phase 3: Playwright Visual Baseline — complete (2026-04-28)

**What was done:**

- Installed Playwright in `demo/` with Chromium at 1440x900
- Created test helpers (`e2e/helpers.ts`): locale navigation, mode switching (body data-mode), font wait
- Observatory snapshots: 4 smoke + 5 full-page (en light/dark, es light, ar light/dark) + 4 section-level (sidebar, koan, insights, sessions table)
- Sessions snapshots: 2 smoke + 3 full-page (en light/dark, ar RTL) + 2 section (retro, table) + 1 filtered state
- Setup wizard snapshots: 2 smoke + 5 full-page (folders light/dark, welcome light, welcome ar-rtl, projects light) + 2 stepper rail (default + mid-wizard)
- All 30 tests pass on Chromium with zero flaky diffs

**Tests:** 30 visual regression tests, 22 snapshot PNGs

**Commits:** `c7b177bc` config, `f4ef4abd` helpers, `616f5adc` observatory, `7a4fe487` sessions, `9d8ba7c1` setup wizard, `f93db9ac` Chromium-only cleanup

---

### P4 design docs + responsive-grid + layout doc — complete (2026-03-27)

**What was done:**

- `docs/design/06-themes.md` — Complete theme system reference: CSS layer architecture, color token z-levels, dark mode mechanics (`fixModeSelectors`), density CSS custom properties, `vibe` singleton API, `themable` action, adding a new theme
- `docs/design/07-charts.md` — Chart system reference: component hierarchy (3 layers), PlotState, aesthetic channels, geom types, stat system, palette/preset, pattern fills, AnimatedPlot pipeline, FacetPlot, CrossFilter, accessibility, zoom
- `docs/design/08-tools.md` — Toolchain reference: `rokkit.config.js`, `presetRokkit` (shortcuts, safelist, preflights, fonts), icon system, all CLI commands
- `site/src/routes/(play)/playground/components/grid/` — Grid playground page exists (tile demo + custom snippets); added to playground index
- `docs/design/components/layout.md` — Stack, Divider, Grid design doc with props, data attributes, CSS custom properties, usage examples

**Commits:** see git log for individual commits

### Table multi-select + density system — complete (2026-03-27)

**What was done:**

- `packages/themes/src/base/density.css` — Created CSS custom property tiers: `:root`/`[data-density='comfortable']` (baseline), `[data-density='compact']` (dense), `[data-density='cozy']` (spacious); tokens: `--density-spacing-*`, `--density-font-size-*`, `--density-line-height`, `--density-icon-size`, `--density-radius-base`
- `packages/themes/src/base/index.css` — Added `@import './density.css'` so tokens cascade everywhere
- Updated `button.css`, `list.css`, `menu.css`, `dropdown.css`, `card.css` to use `var(--density-*)` tokens for their default/md size variants
- `site/src/routes/(play)/playground/themes/+page.svelte` — Added density switcher (compact/comfortable/cozy) above themes grid
- `packages/ui/src/types/table.ts` — Added `selectable?: 'single' | 'multi' | false` and `values?: unknown[]` to `TableProps`
- `packages/ui/src/components/Table.svelte` — Wired `selectable` prop, `values = $bindable()`, `multiselect` option to `TableController`, `$effect` sync, `data-selectable` attribute, `handleSelectAction` guard; fixed `scrollIntoView?.()` for JSDOM compatibility
- `packages/themes/src/base/table.css` — Added `cursor:default` rule for `[data-selectable='false']` rows
- `packages/ui/spec/Table.spec.svelte.ts` — 7 new tests covering all selectable modes and multi-select interactions

**Commits:** density system (prior session), `834935d2` (Table multi-select)

**Tests:** 3196 passing. 0 lint errors.

---

### Multi-step forms — complete (2026-03-27)

**What was done:**

- `FormBuilder` (builder.svelte.js): Added `#currentStep` `$state` field, `isMultiStep`/`totalSteps`/`currentStep`/`canAdvance` getters; `next()`/`prev()`/`goToStep()` navigation; `validateStep(index)` with synthesized flat layout; `validate()` cross-step flattening for full-form validation; `#applyStepValidation()` + `isAllValid()` helpers; `#getActiveElements()` returns only current step's layout elements
- `FormRenderer.svelte`: Fixed pre-existing `$state` proxy comparison loop in data sync effect; added `data-form-step` attribute; step-content wrapper `data-form-step-content`; conditional Prev/Next/Submit buttons for multi-step mode
- `StepIndicator.svelte`: New presentational component — receives `steps[]`, `current`, `onclick`; emits click for complete steps only; `data-step-item`/`data-step-state`/`data-step-number`/`data-step-label` data attributes; accessible with `role=button` + `tabindex` + `onkeydown`
- `packages/forms/src/index.js`: Added `StepIndicator` export
- `packages/forms/spec/MultiStep.spec.svelte.js`: 25 tests — FormBuilder multi-step navigation + validation, StepIndicator rendering and interaction, FormRenderer integration

**Tests:** 3189 passing. 0 lint errors.

---

### Chart preset system — complete (2026-03-26)

**What was done:**

- `packages/chart/src/lib/preset.js` — `defaultPreset` (14 colors, shade indices, 4 opacity values, patterns, symbols) + `createChartPreset(overrides)` with deep-merge for shades/opacity
- Deleted `packages/chart/src/lib/brewing/palette.json` (21 hardcoded hex entries); rewrote `assignColors(values, mode, preset)` to shade-index into `lib/palette.json`
- `assignSymbols(values, preset)` now uses `preset.symbols` for configurable order
- `PlotState`: added `#chartPreset` field + `chartPreset` getter; passes preset to `assignColors`/`assignSymbols`
- `ChartProvider.svelte` — sets `'chart-preset'` Svelte context; `Plot.svelte` reads context with `defaultPreset` fallback
- Geom opacity from preset: `Area` → `preset.opacity.area`, `Box` → `preset.opacity.box`, `Violin` → `preset.opacity.violin`, `Point` → `preset.opacity.point`; `options.opacity` prop still overrides per-instance
- `jitterOffset(i, range)` LCG helper + `buildPoints()` jitter option; `ScatterPlot` exposes `jitter` prop
- Exports: `ChartProvider`, `createChartPreset`, `defaultPreset` added to `packages/chart/src/index.js`

**Tests:** 3145 passing (up from 2967). New: `spec/lib/preset.spec.js` (8), `spec/brewing/marks/points.spec.js` (7). 0 lint errors.

**Commit:** `56a9618a` — feat(chart): add chart preset system with shade-mapping, ChartProvider, and jitter

---

### Chart Plan 4: CrossFilter system — complete (2026-03-23)

**What was done:**

All 7 tasks of Plan 4 (dc.js-style CrossFilter linked interactive charts) implemented and reviewed:

- `createCrossFilter.svelte.js` — reactive filter state: categorical toggle, range, isDimmed/isFiltered, clearAll (16 tests)
- `CrossFilter.svelte` — context provider: sets `'crossfilter'` + `'crossfilter-mode'` context, bind:filters, reactive mode getter object
- `lib/plot/crossfilter.js` — `applyDimming(data, cf, channels)` utility (7 tests)
- `geoms/Bar.svelte` — `filterable` prop + x-only dimming via `data-dimmed`, `onMount(syncDimming)`, `&& x` onclick guard (4 crossfilter tests)
- `crossfilter/FilterBar.svelte` — thin wrapper: PlotChart + Bar filterable=true (3 tests)
- `crossfilter/FilterSlider.svelte` — interim dual range slider with data-attribute styling, reactive min/max reset via `$effect` (4 tests)
- `index.js` exports + `docs/features/07-Charts.md` status updated

**Key design decisions:**

- CrossFilter mode context uses getter object `{ get mode() { return mode } }` for reactivity
- Bar dimming is x-dimension only (matches what `toggleCategorical` operates on)
- FilterSlider is interim (HTML inputs); spec calls for Point+brush architecture (deferred)
- `data-dimmed` attribute on bars; opacity handled by theme CSS — no inline styles

**Tests:** 2967 passing (up from 2946). 0 lint errors.

**Commits:** `4e5a70eb`, `e075b1a6`, `62dd2a5f`, `d54788fb`, `03b83930`, `29bdd757`, `50beb882`, `110a83b4`, `4f24910f`, `f2a02db5`

---

### Chart Task 2: palette.json & assignColors — complete (2026-03-22)

**What was done:**

- Created `packages/chart/src/lib/brewing/palette.json` with 21 chart-safe colors (blue, emerald, rose, amber, violet, sky, pink, teal, orange, indigo, lime, cyan, fuchsia, yellow, red, green, purple, slate, stone, zinc, neutral)
- Each color has light/dark mode shades with fill and stroke properties
- Created `packages/chart/src/lib/brewing/colors.js` with `distinct()` and `assignColors()` utilities
  - `distinct(data, field)` — extracts unique values for a field
  - `assignColors(values, mode)` — maps values to palette entries, cycling past 21 series
- Created `packages/chart/spec/brewing/colors.spec.js` with 7 passing tests

**Tests:** 2665 passing (up from 2536). 0 lint errors.

**Commit:** `70ffa748` — feat(chart): add 21-color palette.json and assignColors utility

---

### StatusList — complete (2026-03-18)

Component and unit tests already existed. Added the missing pieces:

- Theme CSS for rokkit/minimal/material/glass covering both `@rokkit/ui` (pass/fail/warn/unknown) and `@rokkit/forms` (error/warning/info/success severity groups)
- Playground page with live per-item status toggling
- Docs page with live password-strength demo and all four variant states
- E2E tests (rendering + visual snapshots across all 4 themes × 2 modes)
- Updated `site/static/llms/components/status-list.txt` to document both ui and forms variants

**Tests:** 2582 passing. 0 lint errors.

**Commit:** `b4f2e362` — feat: add StatusList theme CSS, playground, docs, and e2e tests

**Priority:** `docs/design/12-priority.md` — StatusList ✅

---

## 2026-03-07

### Nav Restructure & Playground Alignment COMPLETE

**What was done:**

- Deleted orphaned `components/meta.json` (was creating empty collapsible group in sidebar)
- Moved forms group order 6 → 20, charts group order 8 → 21 (both now appear after Effects)
- Removed dead `+page.svelte`, `meta.json`, `+layout.svelte`, and `play/` from `utilities/reveal|shine|tilt` (keep `+page.js` redirects)
- Deleted untracked `sites/quick-start/` and `sites/sample/` from filesystem
- Restructured playground home page into four grouped sections (Navigation & Selection, Inputs, Display, Layout)
- Restructured playground sidebar to match same four collapsible groups
- Updated `pages.e2e.ts`: removed redirected utilities URLs, added EFFECTS constant + COMBINED_SECTIONS constant with test suites
- Added `playground.e2e.ts`: home group headings test + all 27 component pages coverage
- Fixed `components/forms/+page.svelte`: wrong `Code` import (`@rokkit/ui` → `$lib/components/Story`), rewrote with real content
- Wrote Grid component documentation (components/grid/+page.svelte)
- Wrote toolchain/overview page (other overviews already had content)

**Final docs nav group order:**
Navigation & Selection (10) → Inputs (11) → Display (12) → Layout (13) → Effects (14) → Forms (20) → Charts (21)

**Key commits:** `593410b4` (meta cleanup), `bf5cf8a8` (utilities cleanup), `5434d37a` (playground restructure), `c287c41f` (e2e tests), `96764ab3` (forms fix), `ebd6784c` (grid docs), `de173ba8` (toolchain overview)

**Tests:** 2750/2750 unit tests passing; 0 new lint errors

---

## 2026-03-06

### Quick Wins COMPLETE (3 steps)

**Step 1 — Fix 3 failing vibe tests** (`a0e5e24b`)

- Root cause: Node.js v25 exposes a native `localStorage` global broken without `--localstorage-file`
- Fix: `packages/states/spec/setup.js` stubs localStorage via `vi.stubGlobal` with in-memory impl
- Also added `afterEach` restore to the `mocked` describe block in vibe.spec.svelte.js
- `vitest.config.ts` updated to use this setup file for the states project
- Result: 2696/2696 tests passing

**Step 2 — text→label field mapping rename** (`72a239f2`)

- `BASE_FIELDS.label` changed from raw key `'text'` → `'label'`
- Removed `text: 'label'` from `LEGACY_KEY_MAP` in `normalizeFields()`
- `field-mapper.js`: removed `hasText`, updated `prop()` and `getFormattedText()`
- Updated `derive.svelte.js`, `proxy.svelte.js` (testbed), `Select.svelte`
- 35 test files updated: test data items and field mapping keys
- Result: 2696/2696 tests passing

**Step 3 — Missing test coverage** (`056fb07c`)

- `packages/actions/spec/trigger.spec.js`: 20 tests for Trigger class (open/close, keyboard, click-outside, destroy)
- `packages/actions/spec/keymap.spec.js`: 29 tests for buildKeymap + resolveAction (all orientations, modifiers)
- table-controller already covered by existing `tabular.spec.svelte.js`
- Result: 2745/2745 tests passing

### Website Redesign COMPLETE

Feature branch `feature/website-redesign` merged into `develop` (`df08ce58`).

**What was done:**

- Deleted `sites/quick-start/` and `sites/sample/` entirely
- Restructured learn site nav from flat component list to **feature-first pillars**: Getting Started, Data Binding, Composability, Theming & Design, Accessibility & i18n, Forms, Components, Charts, Utilities, Toolchain
- Moved existing doc pages into pillar subfolders (field-mapping, snippets, color-system, styling, keyboard-navigation, state-management, icons, effects/\*)
- Added **placeholder pages** for all planned-but-unbuilt features (data-sources, density, whitelabeling, tooltips, i18n, conditional-fields, multi-step, badge, avatar, data-table, stack, grid, divider, pie-donut, scatter, interactivity, accessibility, animation, custom-primitives, cli, icon-sets)
- Added `(preview)` route group with **Nexus demo app** at `/preview/*`: dashboard (KPI cards, activity list), projects (Tree, Select filters, detail panel), reports (chart placeholders, DataTable placeholder), admin (Tabs, appearance settings)
- Floating `ThemePanel` overlay on all `/preview/*` routes — switches `vibe.style` and `vibe.mode` live
- Preview link added to learn site header and home page
- Updated `docs/design/05-website.md` with preview app section (section 10)
- Updated e2e tests for restructured URLs; added `preview.e2e.ts` (8 new passing tests)
- Design docs: kept your `01–12` numbering scheme; `05-website.md` retains the website doc

**Key commits:** `5e6b57f6` (cleanup), `c9076723` (pillars), `25593645` (charts/utilities/toolchain), `fa8393fd` (preview app), `627e2449` + `818438cf` (bug fixes), `0919c850` (e2e)

**Tests:** 2745/2745 unit tests passing; 0 new lint errors; 156/265 e2e passing (109 pre-existing failures, 0 regressions)

---

## 2026-03-02

### Playground → Learn Consolidation COMPLETE

Merged the entire `sites/playground` into `sites/learn`. The playground site has been deleted.

**What was done:**

- Enhanced `PlaySection` with theme selector sidebar (ThemeManager + ThemeSwitcherToggle)
- Created 8 new learn entries for playground-only components (breadcrumbs, button, card, carousel, code, floating-action, floating-navigation, pill)
- Added play pages for all 14 existing learn components that lacked them
- Replaced list play page with richer playground version (multiselect, badge, descriptions)
- Migrated all 8 playground e2e specs to learn site (toolbar, tree, menu, multi-select + visual snapshots for toggle, tabs, select, list, upload-target, upload-progress)
- Deleted `sites/playground/` entirely (179 files, -5413 lines)
- Updated CLAUDE.md, agents/memory.md, agents/references.md
- Created backlog item for remaining coverage gaps (docs/backlog/2026-03-02-learn-site-coverage.md)

**Key commits:** `15489412`, `607e4e45`, `6acae5c0`, `3250deef`

**Result:** 2658 tests passing, 0 lint errors, single site for all demos + tutorials + e2e tests.

---

### Backlog #62 COMPLETE — ThemeSwitcherToggle `includeSystem` prop

Added `includeSystem?: boolean` prop (default `true`) to `ThemeSwitcherToggleProps`. When `false`, filters `'system'` from modes via `effectiveModes` derived before building options.

### Backlog #68 COMPLETE — Toggle types cleanup

Removed deprecated `ToggleItemHandlers` interface and `LegacyToggleItemSnippet` type from `toggle.ts`. Added `label?: string` to `ToggleProps` (was only in inline component type extension). Cleaned up Toggle.svelte inline type.

---

### Backlog #64 COMPLETE — Component Labels (Translatable Strings via MessagesStore)

**Task 1:** Extended MessagesStore with 16 nested component label keys + deep-merge in `set()`. Commit: `da92eae4`

**Tasks 2-10:** 15 UI components migrated to read aria-labels from MessagesStore with `label`/`labels` prop overrides:

1. **Pattern A (single label):** List, Toolbar, Toggle, Rating, Stepper, BreadCrumbs — `label` prop defaulting from `messages.current.<component>.label`
2. **Pattern A (existing label default):** Menu — changed `label = 'Menu'` to `label = messages.current.menu.label`
3. **Pattern B (multi-label):** Tree, LazyTree, Carousel, Tabs, Code, Range, SearchFilter, FloatingNavigation — `labels` prop merged over store defaults via `$derived({ ...messages.current.<component>, ...userLabels })`
   Commit: `c169ac0c`

**Task 11:** ThemeSwitcherToggle — `buildThemeSwitcherOptions()` reads from `messages.current.mode`, accepts `labels` prop. Commit: `03908e31`

**Test count:** 2530 pass (178 files).

---

### Backlog #63 COMPLETE — Semantic Icons

6 new icon names + SVGs added, 7 components migrated to `icons` prop pattern:

1. **New icons** (`01937636`, `509e36ab`) — action-check, action-save, action-pin, action-unpin, palette-presets, palette-hex added to DEFAULT_ICONS + 6 SVGs
2. **7 components migrated** (`273164e8`) — Rating, Stepper, FloatingAction, Pill, BreadCrumbs, FloatingNavigation, PaletteManager all use DEFAULT_STATE_ICONS with `icons` prop for overrides
3. **Breaking changes:** Rating (filledIcon/emptyIcon → icons), FloatingAction (icon/closeIcon → icons), BreadCrumbs (separator → icons), Stepper (icons.completed → icons.check)
4. **Remaining:** Carousel (chevron-left/right) and Tabs (plus) still have i-lucide: strings — out of scope

**Test count:** 2488 pass (177 files). Lint: pre-existing errors only.

---

## 2026-03-01

### Backlog #3 COMPLETE — ItemProxy + Proxy → ProxyItem Unification

All 12 tasks completed via subagent-driven development:

1. **ProxyItem fields getter** (`c43501c7`) — added `get fields()` accessor + test
2. **Migrate 8 components** (`9c0abe41`) — BreadCrumbs, Timeline, Toolbar, FloatingAction, FloatingNavigation, Button, Pill, Switch all use ProxyItem from `@rokkit/states`
3. **Delete ItemProxy** (`bab5230a`) — removed class, spec (500+ lines), ItemFields type, updated 16 files
4. **Delete legacy Proxy** (`f7974c13`) — removed Ramda-dependent class + spec, migrated InputRadio, replaced Proxy in deriveLookupWithProxy with lightweight wrapper

**Key API renames:** `.text`→`.label`, `.itemValue`→`.value`, `.icon`→`.get('icon')`, `.description`→`.get('subtext')`

**Final test count:** 2471 pass (176 files). Lint: pre-existing errors only.

---

### Tasks 10–11: Delete ItemProxy and legacy Proxy

1. **Delete ItemProxy** (`bab5230a`) — Removed `ItemProxy` class, spec (500+ lines), `ItemFields` type, and all references. Updated 16 files: tree.ts migrated to `ProxyItem` from `@rokkit/states`, type files that depended on `ItemFields` now use `Record<string, string>` or inline interfaces, JSDoc comments updated throughout. Learn site LLM text files updated.

2. **Delete legacy Proxy** (`f7974c13`) — Removed Ramda-dependent `Proxy` class from `@rokkit/states` and its 14-test spec. Migrated `InputRadio` from `Proxy` → `ProxyItem`. Replaced `Proxy` usage in `deriveLookupWithProxy` with a lightweight field-mapping wrapper that preserves `ListController`'s API contract (`.value`, `.label`, `.get()`).

**Test count:** 2471 pass (176 files). Lint: pre-existing errors only.

---

### Backlog #75 COMPLETE — ProxyTree + Wrapper Unification

All 7 tasks completed via subagent-driven development:

1. **Wrapper accepts ProxyTree** (`0c15556a`) — constructor refactored, 81 new production tests
2. **LazyWrapper extends Wrapper** (`a4acb4f0`) — removed ~90 lines of duplicated navigation
3. **Flat components migrated** (`09d150c5`) — List, Menu, Select, MultiSelect, Toggle, Tabs use `ProxyTree + Wrapper`
4. **Tree components migrated** (`e35f41cb`) — Tree, LazyTree use `ProxyTree + LazyWrapper`
5. **showLines → lineStyle** (`23dea3fb`) — `'none'|'solid'|'dashed'|'dotted'`, CSS variants, 6 new tests
6. **Dead code cleanup** (`66641154`) — removed AbstractWrapper, buildProxyList, buildFlatView, PROXY_ITEM_FIELDS, legacy constructors
7. **Project files updated** — plan archived, backlog marked done

**Final test count:** 2562 pass. Lint: pre-existing errors only.

---

### Backlog #75 Task 6 — Dead Code Cleanup

Removed dead code from the ProxyTree + Wrapper unification:

- **Deleted** `packages/states/src/abstract-wrapper.js` — base class no longer needed since Wrapper is the base
- **Removed** `buildProxyList` and `buildFlatView` functions from `proxy-item.svelte.js` — ProxyTree handles the data pipeline now
- **Removed** `PROXY_ITEM_FIELDS` deprecated alias from `proxy-item.svelte.js`
- **Removed** exports from `index.js`: `AbstractWrapper`, `buildProxyList`, `buildFlatView`, `PROXY_ITEM_FIELDS`
- **Removed** backward-compat constructor from `wrapper.svelte.js` (instanceof ProxyTree detection + 3-arg legacy path)
- **Removed** backward-compat constructor from `lazy-wrapper.svelte.js` (same pattern)
- **Removed** unused `ProxyTree` import from `wrapper.svelte.js` (was only used for instanceof check)
- **Updated** `@rokkit/actions` navigator.js JSDoc: `AbstractWrapper` → `Wrapper`
- **Updated** UI type files (toggle, tabs, menu, select): `PROXY_ITEM_FIELDS` → `BASE_FIELDS` in JSDoc comments
- **Updated** learn site llms.txt: `PROXY_ITEM_FIELDS` → `BASE_FIELDS`
- **Updated** `lazy-wrapper.spec.svelte.js`: all 32 tests migrated from legacy 3-arg constructor to `new LazyWrapper(new ProxyTree(...))`
- **Removed** legacy constructor tests from `wrapper.spec.svelte.js`
- **Updated** `index.spec.js` export list

Testbed's local copies of `AbstractWrapper`, `buildProxyList`, `buildFlatView` left intact (testbed-local, not affected).

**Tests:** 2562 pass. Lint: pre-existing errors only (no new).

---

### Backlog #75 Task 3 — Migrate Flat Components to ProxyTree + Wrapper

Updated all 6 flat components (List, Menu, Select, MultiSelect, Toggle, Tabs) to create ProxyTree externally and pass it to Wrapper, instead of relying on Wrapper's legacy backward-compatible constructor. Each component now follows the pattern: `const proxyTree = $derived(new ProxyTree(items, fields))` then `const wrapper = $derived(new Wrapper(proxyTree, { onselect }))`. No behavioral changes — purely a construction pattern refactoring.

**Tests:** 2563 pass. Lint: pre-existing warnings only (no new).

---

### Backlog #75 Task 2 — LazyWrapper Extends Wrapper

Refactored LazyWrapper to extend Wrapper instead of AbstractWrapper. Removed all duplicated navigation methods (next, prev, first, last, collapse, moveTo, moveToValue, findByText, cancel, blur, extend, range) and duplicated fields (#navigable, #focusedKey, #selectedValue, #onselect, #onchange, flatView getter, lookup getter). LazyWrapper now only overrides expand(), select(), and toggle() for lazy sentinel detection (proxy.loaded === false), plus adds loadMore() for root-level pagination. Added backward-compatible constructor matching Wrapper's pattern (instanceof ProxyTree detection + legacy 3-arg signature).

**Commit:** `a4acb4f0`
**Tests:** 2563 pass. Lint: 12 pre-existing errors (no new).

---

### Backlog #75 Task 1 — Refactor Wrapper to Accept ProxyTree

Refactored Wrapper to accept a ProxyTree instance instead of raw `(items, fields, options)`. Wrapper now delegates `flatView` and `lookup` to ProxyTree. Added backward-compatible constructor that detects whether the first arg is a ProxyTree instance or raw items array (for existing component callers). Removed `extends AbstractWrapper` and `buildProxyList`/`buildFlatView` imports. Added `get proxyTree()` accessor.

Updated testbed: created local ProxyTree at `packages/testbed/src/proxy/proxy-tree.svelte.js`, refactored testbed Wrapper to accept ProxyTree, updated all 66 spec tests to use `new Wrapper(new ProxyTree(...))`.

**Tests:** 2482 pass. Lint: 12 pre-existing errors (no new).

---

### Backlog #74 — ItemContent Migration CSS Cleanup (DONE)

Removed dead CSS selectors from base and all 4 theme variants (rokkit, minimal, material, glass) for both list.css and menu.css. Renamed `data-list-divider`→`data-list-separator` and `data-menu-divider`→`data-menu-separator` to match actual component output. Added structural styles for `data-list-expand-icon`, `data-menu-expand-icon`, `data-menu-group-text`.

**Commit:** `d9dca813`
**Tests:** 2482 pass. Lint: 12 pre-existing errors (no new).

---

### Tree UI Refinements + ItemContent Flags + Housekeeping

**Tree rendering improvements:**

- Leaf spacer removal: leaf nodes no longer get trailing `'empty'` in lineTypes (proxy-tree.svelte.js)
- Added `folder-opened`/`folder-closed` to DEFAULT_ICONS (constants.js) — Tree uses `DEFAULT_STATE_ICONS.folder` instead of `.node`
- ItemContent.svelte: added `showIcon` (default true) and `showSubtext` (default true) boolean flags
- Tree/LazyTree: use `<ItemContent {proxy} showIcon={!node.isExpandable} showSubtext={false} />` — parent nodes show chevron+label only, leaf nodes show icon+label
- Removed redundant `role="separator"` from List.svelte `<hr>` (a11y fix)

**Housekeeping:**

- Cleaned backlog files: removed all completed/DONE items from 01-forms, 02-ui-components, 03-effects, 04-infrastructure
- Updated #70/#71/#72 checklist progress in backlog
- Deleted `docs/llms/` directory (content lives on learn site llms.txt routes)
- Updated plan.md — archived stale migration phases, active work is #70 Wrapper unification

**Tests:** 832 UI pass. Lint: a11y warning fixed.

---

### Legacy DEFAULT_FIELDS Cleanup (Backlog #71 — Phase 1)

Removed dead legacy code and deprecated DEFAULT_FIELDS.

**Commits:**

- `fb839416` — refactor: remove dead legacy code, deprecate DEFAULT_FIELDS
- `e97d5007` — refactor: migrate ProxyItem/ProxyTree to BASE_FIELDS + normalizeFields

**What was removed:**

- mapping.js: 8 dead functions (-786 lines), NestedController (deleted), findValueFromPath
- Core barrel exports: getValue, hasChildren, isExpanded, findValueFromPath

**What was kept:** DEFAULT_FIELDS (deprecated) + active legacy chain (Toolbar/Table → ListController → FieldMapper → Proxy). Removed when those components migrate.

**ProxyItem/ProxyTree:** PROXY_ITEM_FIELDS re-exports BASE_FIELDS. Constructors use normalizeFields() for legacy key remapping. Tests added.

**Tests:** 2482 pass. Lint 0 new errors.

---

## 2026-02-28

### ProxyTree + Lazy Loading Enhancements (Backlog #70)

Implemented ProxyTree class and refactored lazy loading stack.

**Commits:**

- `5a3a834c` — feat(states): add ProxyTree reactive collection manager
- `55b9f16d` — refactor(states): LazyWrapper delegates to ProxyTree
- `cb3d6f0a` — feat(states): add onlazyload callback + loadMore() to LazyWrapper
- `4e2baa23` — feat(ui): LazyTree onlazyload + hasMore + Load More button
- `2975acde` — docs: update LazyTree site pages — onlazyload rename, hasMore demo
- `0c7c2cf8` — fix: remove unused PROXY_ITEM_FIELDS import from lazy-wrapper

**What was built:**

- `ProxyTree` class in `@rokkit/states` — reactive collection manager with `append()`, `addChildren()`, `flatView`, `lookup`
- LazyWrapper refactored to delegate data management to ProxyTree
- `onloadchildren` → `onlazyload` rename throughout (LazyWrapper, LazyTree, playground, learn site, llms.txt)
- `loadMore()` method on LazyWrapper — calls `onlazyload()` (no args) for root pagination
- `hasMore` prop on LazyTree — renders "Load More" button when true
- 35 new tests (30 ProxyTree + 5 loadMore)

**Tests:** 2520 pass (up from 2485). Lint 0 new errors. Both sites build.

---

### States Design Doc — Resolved All Discussion Items

Updated `docs/design/011-states.md` and `docs/requirements/011-states.md` with all resolved decisions from design discussion:

**ProxyItem API:**

- `text` → `label`, `raw` → `original`, added `id` (auto-generated), added `mutate()`
- Limited direct getters to `label`, `value`, `id` — all others via `get(fieldName)`
- Fallback resolution chains not needed (primitive handling covers stringify)
- `getSnippet` superseded by `resolveSnippet`

**Canonical BASE_FIELDS:**

- Single field mapping replacing `DEFAULT_FIELDS`, `PROXY_ITEM_FIELDS`, `defaultItemFields`
- 18 fields: id, value, label, icon, avatar, subtext, tooltip, badge, shortcut, children, type, snippet, href, hrefTarget, disabled, expanded, selected
- `avatar` for image URLs (rendered as `<img>`), `icon` for iconify classes (mutually exclusive)
- Semantic keys map to common raw keys for backward compat (`label`→`'text'`, `subtext`→`'description'`, `tooltip`→`'title'`)

**Architecture:**

- Wrapper receives ProxyTree (does not create it)
- LazyWrapper extends Wrapper (overrides expand/select only, no code duplication)
- `toggle()` stays on Wrapper for accordion-trigger pattern
- `showLines` → `lineStyle` prop with `data-line-style` attribute (none|dotted|dashed|solid)
- "sentinel" → "lazy marker" terminology throughout

**Backlog updates:**

- Added #71 (Canonical BASE_FIELDS + ProxyItem API Refinements)
- Added #72 (Shared Content Component)
- Updated #70 with all resolved decisions

---

## 2026-02-27 (continued)

### SimpleTree → Tree Rename + Learn Pages

Renamed SimpleTree → Tree (deleted old NestedController-based Tree.svelte). Created LazyTree as separate component.

**Changes:**

- Deleted old `Tree.svelte`, renamed `SimpleTree.svelte` → `Tree.svelte`
- Updated barrel exports (`components/index.ts`, `src/index.ts`) — removed SimpleTree
- Renamed test file `SimpleTree.spec.svelte.ts` → `Tree.spec.svelte.ts` (28 tests pass)
- Updated LazyTree doc comment reference
- Rewrote tree playground page (removed old props: multiselect, expandAll, onloadchildren)
- Deleted simple-tree playground (merged into tree)
- Created Tree learn page: 5 story examples (intro, no-lines, mapping, icons, snippets), 3 fragments, +page.svelte, +layout.svelte, updated meta.json
- Created LazyTree learn page: 2 story examples (intro, nested), 2 fragments, full page
- Rewrote Tree llms.txt for new API (Wrapper+Navigator based, no multiselect/expandAll/onloadchildren)
- Created LazyTree llms.txt

**Tests:** Tree 28/28, List 35/35, States 182/182. Build ✓. Lint 0 new errors.

### Tree Rewrite: Wrapper + Navigator Pattern

Fully rewrote `Tree.svelte` to use `Wrapper` + `Navigator` + `ProxyItem` pattern (matching List/Toggle/Tabs).

**Key architecture decisions:**

- `Wrapper` as `$derived` with `loadVersion` trick for lazy loading re-derivation
- Navigator with `collapsible: true` handles all keyboard navigation
- Event listeners registered in explicit order: pre-Navigator (lazy interception) → Navigator → post-Navigator (expansion sync)
- Expansion sync: `$effect.pre` for prop→proxy direction, explicit `syncExpandedToProps()` for proxy→prop direction
- Tree lines computed from `wrapper.flatView` using existing `getLineTypes()` helper
- Custom snippets via `resolveSnippet(snippets, proxy, ITEM_SNIPPET)` (replaces old item snippet API)
- `getComputedStyle(el).direction || 'ltr'` to handle JSDOM test environments

**Tests:** 48/48 pass. Testbed 244/244. Tabs 59/59. States 131/131. Lint 0 errors.

### Architecture Decision: Components Built from List Pattern

After reviewing Menu, Toggle, Tree migrations, adopted a cleaner approach:

- **Toggle**: Copy List.svelte, set `orientation: 'horizontal'` on Navigator, add external value sync effect. No group content. Uses `wrapper.flatView` loop and `resolveSnippet`.
- **Menu**: Copy List + add `Trigger` class (new in `@rokkit/actions`) for open/close management. Pre-flatten leaf items for Wrapper; use `renderNodes` array for group/item rendering. Panel renders like List inside `{#if trigger?.isOpen}`.
- **Tree**: Copy List + tree-line helper (`getTreeLineType`). Everything else (collapsible Navigator) stays same.
- **Select/MultiSelect**: Will use Trigger class + List pattern for dropdown panel.

**Key additions:**

- `ProxyItem.raw` getter added — exposes `#raw` directly so `handleSelect` can return raw item without `itemPathMap`
- Backlog items #67, #68, #69 updated with new architecture

### Toggle Rewrite — In Progress

**`packages/states/src/proxy-item.svelte.js`:**

- Added `get raw() { return this.#raw }` — exposes original raw item

**`packages/ui/src/components/Toggle.svelte` rewritten:**

- Uses `wrapper.flatView` loop (like List) instead of index-based `wrapper.lookup.get(String(index))`
- `new Navigator(containerRef, wrapper, { orientation: 'horizontal' })` — left/right arrow keys
- External value sync: `$effect` calls `wrapper.moveTo(key)` when `value` changes
- `resolveSnippet(snippets, proxy, 'item')` from `@rokkit/core` — no local `resolveItemSnippet`
- `...snippets` rest props instead of `item: itemSnippet` destructuring
- `proxy.raw` in `handleSelect` (second arg to `onchange` callback)
- 1600 tests pass, 0 lint errors

---

## 2026-02-28

### Select Migration to Navigator/Wrapper/ProxyItem Stack — Complete

**`packages/ui/src/components/Select.svelte` rewritten:**

- Uses `Wrapper`, `ProxyItem`, `PROXY_ITEM_FIELDS` from `@rokkit/states`; `Navigator` from `@rokkit/actions`
- `mergedFields = { ...PROXY_ITEM_FIELDS, ...userFields }` (text → 'label' default)
- `filteredOptions` derived from `options + filterQuery` (group-aware filter)
- `flatItems` pre-flattens groups to leaf items for Wrapper
- `wrapper = $derived(new Wrapper(flatItems, mergedFields, { onselect: handleSelect }))`
- Navigator attached via `$effect` on `dropdownRef`; DOM focus synced via `$effect` on `wrapper.focusedKey`
- Snippet API: `option(proxy)`, `groupLabel(proxy)`, `selectedValue(proxy)`
- `handleSelect` recovers raw item via `flatItems[parseInt(proxy.key)]`

**`packages/ui/src/types/select.ts` updated:**

- New snippet types: `SelectOptionSnippet`, `SelectGroupLabelSnippet`, `SelectValueSnippet`
- Legacy types kept for MultiSelect backward compat (`SelectItemHandlers`, `SelectItemSnippet`, etc.)
- `SelectBaseProps.option` prop uses new `SelectOptionSnippet = Snippet<[ProxyItem]>`

**Learn site `elements/select/` updated:**

- Rewrote `+page.svelte` with comprehensive docs (6 sections, props table, ProxyItem API, snippets)
- Updated `properties/App.svelte`, `fields/App.svelte` with `label:` field names
- Created `grouped/App.svelte`, `filterable/App.svelte`, `snippet/App.svelte`
- Updated fragments 01–02, created fragments 03–04
- Created `llms.txt` with full API reference
- `play/+page.svelte` already updated (previous session)
- E2e tests: `sites/learn/e2e/select.spec.ts` already written

**Tests:** 1600 passing, lint 0 errors, build ✓

---

## 2026-02-27

### List Docs, E2E Tests, llms.txt, Design Patterns, Backlog — Complete

**SimplifiedList removed:**

- Deleted `packages/ui/src/components/SimplifiedList.svelte`
- Removed from `packages/ui/src/components/index.ts` and `packages/ui/src/index.ts`
- Deleted `sites/learn/src/routes/poc/+page.svelte` and `sites/learn/e2e/poc.spec.ts`

**Learn site play page updated (`elements/list/play/+page.svelte`):**

- Changed all `text:` → `label:` in items
- Removed `multiselect` prop (not in new API)
- Added `expanded: true` to grouped items (so groups start open for e2e)
- Fixed `value` binding and `onselect` callbacks

**E2E tests rewritten (`sites/learn/e2e/list.spec.ts`):**

- Play page tests: keyboard flat list, keyboard grouped, mouse interaction, learn/play toggle
- Group expansion uses `aria-expanded` attribute (not old `data-list-group-collapsed`)
- Learn page tests: intro example, primitives, nested groups toggle, itemContent snippet badges, interactive checkboxes

**`llms.txt` updated (`sites/learn/src/routes/docs/components/list/llms.txt/+server.ts`):**

- Props table: removed `multiselect`/`expanded`/`selected`, added `class` prop
- Field mapping: `text → 'label'` default (was `'text'`)
- New snippet API: `itemContent(proxy)`, `groupContent(proxy)`, per-item named snippets
- Added ProxyItem API table
- Added Interactive Elements section and Custom Class section
- Updated data attributes: no `data-list-group`, uses `aria-expanded` on group label

**Design patterns documented (`agents/design-patterns.md`):**

- New: Navigator/Wrapper/ProxyItem Stack pattern
- New: Snippet Customization pattern (`itemContent`/`groupContent`/per-item)
- New: `class` prop convention
- Updated: State Icons pattern to use `DEFAULT_STATE_ICONS` / `DEFAULT_ICONS` (UPPER_SNAKE_CASE)

**Migration backlog added (`agents/backlog/02-ui-components.md`):**

- #65 Select — migrate to Navigator/Wrapper/ProxyItem stack
- #66 MultiSelect — migrate to Navigator/Wrapper/ProxyItem stack
- #67 Menu — migrate to Navigator/Wrapper/ProxyItem stack
- #68 Toggle — migrate to Navigator/Wrapper/ProxyItem stack
- #69 Tree — migrate to Navigator/Wrapper/ProxyItem stack

---

### ProxyItem + Wrapper + Navigator — Production Migration Complete

Promoted the testbed Navigator/Wrapper/ProxyItem stack to production packages and rewrote the List component.

**Constants rename — `@rokkit/core`:**

- All `default*` constants renamed to `DEFAULT_*` (UPPER_SNAKE_CASE):
  - `defaultFields` → `DEFAULT_FIELDS`, `defaultIcons` → `DEFAULT_ICONS`
  - `defaultOptions` → `DEFAULT_OPTIONS`, `defaultKeyMap` → `DEFAULT_KEYMAP`
  - `defaultThemeMapping` → `DEFAULT_THEME_MAPPING`, `defaultStateIcons` → `DEFAULT_STATE_ICONS`
- Updated all dependents: `mapping.js`, `nested.js`, `field-mapper.js`, `theme.js`, `themes/index.js`
- Updated `states/src/`: `proxy.svelte.js`, `derive.svelte.js`, `list-controller.svelte.js`, `vibe.svelte.js`
- Updated all `packages/ui/src/types/*.ts`, `forms/InputCheckbox.svelte`, `app/ThemeSwitcherToggle.ts`
- Updated `sites/learn/uno.config.js`, `sites/playground/uno.config.ts`, `sites/quick-start/uno.config.js`
- Added `resolveSnippet` to `@rokkit/core/src/utils.js`

**New files in `@rokkit/actions`:**

- `nav-constants.js` — ACTIONS, PLAIN_FIXED, CTRL_FIXED, SHIFT_FIXED, ARROWS, TYPEAHEAD_RESET_MS
- `keymap.js` — `buildKeymap`, `resolveAction`
- `navigator.js` — `Navigator` class (not a Svelte action); exported as capital-N to avoid conflict with existing `navigator` Svelte action

**New files in `@rokkit/states`:**

- `abstract-wrapper.js` — base class with uniform method signatures (all params use `_path` for lint compliance)
- `proxy-item.svelte.js` — `ProxyItem`, `buildProxyList`, `buildFlatView`, `PROXY_ITEM_FIELDS` (text → 'label' default)
- `wrapper.svelte.js` — `Wrapper extends AbstractWrapper` with full navigation + selection state

**`@rokkit/ui` List.svelte rewrite:**

- Uses `Wrapper` from `@rokkit/states`, `Navigator` class via `$effect`, `resolveSnippet` from `@rokkit/core`
- Icons: `$derived({ ...DEFAULT_STATE_ICONS.accordion, ...userIcons })`
- Single flat `{#each wrapper.flatView}` loop; separators/spacers/groups/links/buttons all handled
- Snippets: `itemContent(proxy)`, `groupContent(proxy)`, per-item via `item.snippet = 'name'`

**Learn site List docs rewritten:**

- New examples: `primitives/`, `icons/`, `interactive/` (checkbox in snippet)
- Updated: `nested/`, `mapping/`, `snippets/` (itemContent badge demo), `mixed/` (per-item snippet)
- Removed old image/component-field examples (not in new API)
- New fragments: `01-basic-items.js`, `02-field-mapping.js`, `03-item-snippet.svelte`, `04-per-item-snippet.svelte`
- `+page.svelte` fully rewritten with ProxyItem API reference table

**Tests:** 1600 passing, lint 0 errors, build ✓

---

## 2026-02-26

### Testbed Package — 100% Coverage

Achieved 100% coverage on all production files in `packages/testbed/src/`:

**New test files:**

- `keymap.spec.js` — 37 tests covering ACTIONS, all three orientations (vertical/horizontal-ltr/horizontal-rtl), collapsible variants, `resolveAction` for all modifier combinations including null-returning branches
- `wrapper.spec.js` — 19 tests covering `Wrapper` base class: initial `focusedKey = null`, all 12 action methods callable without error, `findByText` returns null

**Extended existing specs:**

- `navigator.spec.js` — 4 new tests for `navigator()` Svelte action adapter (returns `{ destroy }`, wires events, destroy removes listeners, passes options through)
- `proxy.spec.svelte.js` — 9 new tests: `get('value')`, `get('hasChildren')`, `get('disabled')`, `get('selected')` delegates; `text ?? ''` fallback (items without label); `children ?? []` fallback; `buildProxyList(undefined)`, `buildProxyList(null)`, `buildProxyList([])` edge cases

**Coverage result:**

```
keymap.js     100 | 100 | 100 | 100
navigator.js  100 | 100 | 100 | 100
wrapper.js    100 | 100 | 100 | 100
proxy.svelte  100 | 100 | 100 | 100
```

`types.ts` excluded from coverage (TypeScript interface-only file, no runtime code — added to global `vitest.config.ts` coverage exclude).

**Tests:** 1508 passing (up from 1446 — 62 new tests)

---

### Navigator + Wrapper + Keymap POC (`sites/learn/src/lib/list/`)

Built a clean three-layer keyboard/mouse navigation architecture as a POC before promoting to
`packages/`. All 1402 tests pass.

**`keymap.js`:**

- `ACTIONS` frozen object with 10 semantic actions (next/prev/first/last/expand/collapse/select/extend/range/cancel)
- Three modifier layers: `plain`, `shift`, `ctrl`
- Orientation variants: vertical, horizontal-ltr, horizontal-rtl
- `collapsible` flag adds arrow key bindings for expand/collapse
- `Escape → cancel` in PLAIN_FIXED

**`wrapper.js`:**

- `Wrapper` base class with uniform signature — every method receives `path`
- Movement methods (`next/prev/first/last/expand/collapse`) receive path but ignore it
- Selection methods (`select/extend/range/toggle/moveTo`) use path (fall back to `focusedKey`)
- `focusedKey` property — Navigator reads after keyboard actions to scroll focused item into view

**`navigator.js`:**

- Plain class (not just a Svelte action) — testable without framework
- Handles: keydown (keymap lookup), click (modifier-aware), focusin (path redirect), focusout (blur detection)
- Typeahead: 500ms buffer, accumulates chars, calls `wrapper.findByText`, scrolls match
- `scrollIntoView` after keyboard navigation only (not click, not focusin)
- `data-accordion-trigger` attribute signals click → `toggle` not `select`
- Svelte action adapter: `export function navigator(node, options)` for `use:navigator`

**`navigator.spec.js`:**

- 44 tests across 7 describe blocks
- MockWrapper records all calls as `{ action, path }`
- Tests: movement keys, expand/collapse, selection, scrollIntoView, click modifiers, focusin/focusout, typeahead, destroy

**Design documented at `docs/design/000-navigator-wrapper.md`**

Key design decision: Navigator always passes path to ALL wrapper methods (resolved from
`document.activeElement` for keyboard, `event.target` for click). Wrappers decide what to use.
This eliminates branching in dispatch.

Composite widget pattern documented: trigger handles open/close; Navigator attaches only to the
list half; shared Wrapper coordinates both (Escape → cancel, focusout → blur → close).

---

### Learn Site — Layout Redesign + Theme Fix

Replaced partial theme imports and rebuilt the learn layout as a proper two-column design.

**Theme fix (`app.css`):**

- Replaced `@rokkit/themes/palette.css` + `theme/base.css` + `theme/rokkit.css` with `@import '@rokkit/themes'` (full bundle)
- Kept only learn-site-exclusive CSS: `shiki.css`, `article.css`, `typography.css`
- Moved `[data-story-root]` rule into `app.css` (was in the deleted `base.css` aggregate)

**Layout redesign:**

- Root `+layout.svelte`: `showRootHeader` derived flag hides top-level `<Header>` on all learn routes (shows only on `/` and `/playground/...`)
- `(learn)/+layout.svelte`: Full rewrite — two-column flex layout with sidebar overlay on small/medium screens
  - Top bar: hamburger toggle (lg:hidden), logo (icon on small, full on larger), version, ThemeSwitcher, GitHub link
  - Sub-header: breadcrumbs + page title/icon/description
  - Sidebar: fixed overlay with slide-in animation on mobile, static inline column on `≥1024px`
  - Scoped CSS uses `-z` semantic shades (`--color-surface-z0`, `--color-surface-z2`) for sidebar background/border
- Deleted `(learn)/Header.svelte` — content inlined into layout

**Tests:** 1356 passing, build ✓

---

### Learn/Play Integration — FileTabs + URL-Routed Play Pages

Added interactive Play pages to the learn site for List, Select, and Tabs. Approach: URL routing (`/elements/{component}/play`) with a Toggle header in per-component layouts.

**FileTabs.svelte rewrite:**

- Replaced manual `<div role="tablist">` with `<Tabs>` from `@rokkit/ui` (same pattern as `CodeViewer.svelte`)
- Pre-computes icons via `processedFiles = $derived(files.map(f => ({ ...f, _icon: getFileIcon(f) })))`
- `fields = { value: 'id', text: 'name', icon: '_icon' }` — backward-compatible `selectedFile` binding
- `tabPanel` snippet uses reactive `activeFile`/`highlightedCode` (all panels share same derived state)

**PlaySection.svelte** (new shared component):

- Two-column layout: preview area (dotted grid background) + 280px controls sidebar

**(learn)/+layout.svelte fix:**

- Added `canonicalPath` stripping `/play` suffix before `findSection`/`findGroupForSection` lookups
- Play sub-routes inherit correct title/breadcrumbs from parent component's meta.json

**Per-component layouts** (`elements/{list,select,tabs}/+layout.svelte`):

- `Toggle` with Learn/Play options at top-right; navigates via `goto()` on change

**Play pages** — new routes at `elements/{list,select,tabs}/play/+page.svelte`:

- List: 4 variants (Navigation, Button, Grouped, Descriptions) + FormRenderer controls
- Select: Simple + Grouped + FormRenderer controls
- Tabs: With-icons + Simple + FormRenderer controls

**Tests:** 1356 passing, learn site build ✓ (0 errors)

### Learn Site E2E Test Fixes

Fixed all 48 Playwright e2e tests after diagnosing selector and timing issues.

**Root causes and fixes:**

1. **Toggle tests** — Multiple `[data-toggle]` elements on page (ThemeSwitcherToggle in header + Learn/Play toggle). Fixed by adding `data-view-toggle` to the layout wrapper div and updating tests to use `[data-view-toggle] [data-toggle]` as the scoped locator.

2. **List index tests** — `page.locator('[data-list]')` included the sidebar List (nth(0)), causing demo lists to be off by one. Fixed by scoping to `page.locator('main [data-list]')`, matching the expected indices (nth(1) = Button items, nth(2) = Grouped).

3. **Select keyboard navigation** — After opening dropdown via ArrowDown, a `requestAnimationFrame` defers focus to the first option. Pressing ArrowDown immediately triggered on the still-focused trigger (not the option), which is a no-op when `isOpen`. Fixed by adding `await expect(options.first()).toBeFocused()` between opening and navigating — matching the playground test pattern.

All 48 e2e tests now pass. Unit tests: 1356 passing.

---

## 2026-02-25

### Learn Site Build Fixes + LLMs.txt Updates

Fixed learn site build failures and rewrote all component llms.txt documentation to match current APIs.

**Build fixes:**

- Added `@rokkit/app` and `@rokkit/data` to `sites/learn/package.json` (missing workspace dependencies)
- Rewrote `FileTabs.svelte` without `bits-ui` (ADR-003 compliance — bits-ui removed)

**LLMs.txt rewrites** — corrected against actual TypeScript type files:

- `List`, `Tree`: correct props (`items`, `fields`, `value`, `multiselect`, `expanded`, lazy loading)
- `Select`, `MultiSelect`: `filterable`/`filterPlaceholder` (not `searchable`), added `align`/`maxRows`/`selected`
- `Toggle`: removed non-existent `square`/`label` props, added `showLabels`
- `Switch`: complete rewrite — iOS-style binary toggle (`options` tuple `[off,on]`, `showLabels`)
- `Tabs`: correct snippet names (`tabItem`, `tabPanel`), correct callbacks
- `Menu` (dropdown route): updated from old `DropDown` component to current `Menu` component API
- `FloatingActions`: rewrite for single `FloatingAction` component with `items` array (not two-component pattern)
- `SearchFilter`: rewrite for structured `FilterObject[]` API (was documenting obsolete text filter API)
- `Toolbar`, `Table`: created new llms.txt endpoints
- Main `docs/llms.txt` index: updated component list, removed stale entries (`NestedList`, `ResponsiveGrid`, `ValidationReport`, `InputField`), added `Toolbar`/`Table`/`FloatingNavigation`

**Commits:** `1c1dcfe7` (Svelte warnings), `19417499` (chart+states warnings), `cc4ed227` (learn site + llms.txt)
**Tests:** 1356 passing, 0 lint errors, learn site build ✓ (2179 modules)

---

### Enhanced Lookup System — Backlog #18

Extended `@rokkit/forms` lookup system end-to-end: fetch/filter hooks, `disabled` state, reactive injection into form elements, and `FormRenderer` wiring.

**`lookup.svelte.js` changes:**

- Extended `LookupConfig` typedef: `fetch` (async hook), `source` (pre-loaded array), `filter` (client-side filter), `cacheKey` (custom cache key fn)
- Added `disabled = $state(false)` — set to `true` when dep check fails, `false` when deps met
- `fetch()` branches: filter+source (synchronous), fetch hook (async, optional caching via `cacheKeyFn`), URL (unchanged)
- `clearCache()` guards `if (!url) return` for non-URL configs
- `reset()` also resets `disabled = false`
- `createLookupManager.initialize()` now always calls `fetch()` for all lookups (lets missing-dep check set `disabled = true` on init)

**`builder.svelte.js` changes:**

- `getLookupState()` returns `disabled` property
- `#convertToFormElement()` injects `options`, `loading`, `disabled`, `fields` from lookup state into `finalProps` (reactive via `$derived(#buildElements())`)
- `updateField()` clears dependent field values (`null`) before triggering lookup re-fetch
- New `isFieldDisabled(path)` and `refreshLookup(path)` public methods

**`FormRenderer.svelte` changes:**

- Added `lookups = {}` prop, passed to `FormBuilder` constructor
- `onMount` calls `formBuilder.initializeLookups()` (fire-and-forget)

**Reactive chain:** `onMount → initializeLookups() → lookup.fetch() → options/disabled ($state) → $derived(#buildElements()) re-runs → element.props updated → FormRenderer re-renders`

**Tests:** 16 new tests in `lookup.spec.js` (fetch hook, filter hook, disabled state, cacheKey, clearCache guard) + 5 new integration tests in `FormRenderer.spec.svelte.js` (options injection, disabled state, value clearing). 1355 total passing, 0 lint errors.

---

### ArrayEditor Component — Backlog #17

Added `ArrayEditor.svelte` to `@rokkit/forms` — a composable input component that manages a dynamic list of array items within the form renderer pipeline.

**Architecture:**

- `type: 'array'` schema fields now resolve to `ArrayEditor` via `defaultRenderers.array`
- Primitive items (`string`, `number`, etc.) render via `resolveRenderer({ type: itemSchema.type }, defaultRenderers)` + `svelte:component`
- Object items render a nested `<FormRenderer data={item} schema={itemSchema} onupdate={...} />`, using `onupdate` callback (not `bind:data`) to avoid Svelte 5 array-index binding issues
- Default item creation via `createDefaultItem(schema)` — fills object properties with type defaults
- Always produces new array references (no in-place mutations)
- `renderers` not forwarded through `Input.svelte` restProps — ArrayEditor imports `defaultRenderers` directly (custom renderer propagation deferred)

**DOM structure:** `[data-array-editor]` root with `[data-array-editor-empty]` / `[data-array-editor-disabled]` boolean attributes; `[data-array-editor-items]` → `[data-array-editor-item]` × N; `[data-array-editor-remove]` buttons (hidden when `readonly`); `[data-array-editor-add]` button (hidden when `readonly`, disabled when `disabled`)

**Files created/modified:**

- `packages/forms/src/input/ArrayEditor.svelte` — new component
- `packages/forms/src/lib/renderers.js` — added `array: ArrayEditor`
- `packages/forms/src/input/index.js` — exported `ArrayEditor`
- `packages/forms/spec/input/ArrayEditor.spec.svelte.js` — 14 tests
- `packages/forms/spec/input/index.spec.js` — updated component list

**Tests:** 1339 passing (up from 1322), 0 lint errors

---

### Playground Sidebar — List Component + E2E Tests

Replaced the hand-rolled `<nav>` sidebar in `sites/playground/src/routes/+layout.svelte` with the `List` component. Items from `$lib/components` (which have `text`, `href`, `icon`) are passed with `fields={{ value: 'href' }}` so active state tracks `page.url.pathname`. Sidebar wrapper uses `data-style="rokkit"` for consistent styling.

Added `e2e/sidebar-nav.spec.ts` covering:

- Active item reflects current route on load
- Click navigates to the correct page and updates active state
- ArrowDown/Up moves keyboard focus through items
- Home/End jump to first/last item
- Enter on focused link navigates (browser-native, no `preventDefault`)

**Files modified:**

- `sites/playground/src/routes/+layout.svelte` — sidebar replaced with `List` component
- `sites/playground/e2e/sidebar-nav.spec.ts` — new e2e test file (10 tests)

**Tests:** 1322 unit tests passing, 0 lint errors

---

### Navigator — Keyboard Enter Fix on Href Items

**Bug:** `handleKeydown` mapped Enter/Space → `'select'` action → `handleAction()` which called `event.preventDefault()`, blocking native link activation for `<a href>` items. The `handleListKeyDown` `stopPropagation()` in `List.svelte` did not prevent same-element navigator handler from running.

**Fix:** In `handleKeydown`, early return when `action === 'select' && event.target.closest('a[href]')` — browser handles Enter/Space natively on focused anchor.

**Files modified:**

- `packages/actions/src/navigator.svelte.js` — `handleKeydown` anchor early return
- `packages/actions/spec/navigator.spec.svelte.js` — 2 new keyboard anchor tests (dispatched on anchor element so `event.target` is set correctly)

**Tests:** 1322 passing (up from 1320)

---

### Navigator — Anchor Click Fix (Backlog #61)

**Bug:** `handleClick` in `navigator.svelte.js` called `event.preventDefault()` unconditionally via `handleAction()`, blocking `<a href>` navigation on click. Keyboard was already protected (`handleListKeyDown` in `List.svelte` stops propagation for Enter/Space on href items), but click had no equivalent guard.

**Fix:** In `handleClick`, detect `event.target.closest('a[href]')` and bypass `handleAction` — call the controller handler directly (preserving focus/select state updates) without calling `preventDefault()`.

**Files modified:**

- `packages/actions/src/navigator.svelte.js` — fix `handleClick`
- `packages/actions/spec/navigator.spec.svelte.js` — 4 new anchor click tests

**Tests:** 1320 passing (up from 1316)

---

## 2026-02-24

### HoverLift, Magnetic, Ripple Actions (Backlog #53)

Three new Svelte actions in `@rokkit/actions`:

- **`use:hoverLift`** — translateY + elevated box-shadow on hover. Options: `distance`, `shadow`, `duration`.
- **`use:magnetic`** — element shifts toward cursor on mousemove, springs back on leave. Options: `strength`, `duration`.
- **`use:ripple`** — material-design click ripple. Creates expanding circle span at click point. Options: `color`, `opacity`, `duration`. Injects keyframes stylesheet once.

All three respect `prefers-reduced-motion`, use `$effect()` wrapper with cleanup, restore original styles on destroy.

**Files created:**

- `actions/src/hover-lift.svelte.js`, `actions/src/magnetic.svelte.js`, `actions/src/ripple.svelte.js`
- `actions/spec/hover-lift.spec.svelte.js` (12 tests), `actions/spec/magnetic.spec.svelte.js` (10 tests), `actions/spec/ripple.spec.svelte.js` (14 tests)

**Files modified:** `actions/src/index.js`, `actions/spec/index.spec.js`
**Tests:** 1316 CI passing
**Backlog:** #53 marked done

---

### Button Style Enhancements (Backlog #51)

Added `gradient` and `link` style variants plus micro-animations.

**Type changes:** `ButtonStyle` now includes `'gradient' | 'link'`

**Base CSS additions:**

- Gradient structural style (border: none)
- Link structural style (no bg/border/height, underline on hover)
- Hover lift (`translateY(-1px)`) for non-link/ghost styles
- Press feedback (`scale(0.97)`)
- Icon shift (trailing icon moves right on hover)
- Loading pulse (opacity animation)

**Theme CSS:**

- Rokkit: added gradient (diagonal) + link colors for all 4 variants
- Glass: **new file** — full button theme with glassmorphism (backdrop-blur, transparency)
- Minimal: **new file** — full button theme with clean borders
- Material: **new file** — full button theme with elevation shadows
- All 3 new themes added to their respective `index.css`

**Files created:** `glass/button.css`, `minimal/button.css`, `material/button.css`
**Files modified:** `types/button.ts`, `base/button.css`, `rokkit/button.css`, playground page, 3 theme index files

**Backlog:** #51 marked done
**Tests:** 1282 CI passing, 0 lint errors

---

### FloatingNavigation Component (Backlog #50)

Implemented `FloatingNavigation.svelte` — floating, collapsible page navigation widget.

**Component features:**

- Data-driven with ItemProxy field mapping
- 4-position layouts: left, right, top, bottom (screen edge anchoring)
- Hover expand/collapse with pin toggle to lock expanded
- IntersectionObserver for automatic active section tracking
- CSS animations: entrance slide-in, expand/collapse, label fade, active indicator, item hover, stagger
- Keyboard: arrow navigation (direction-aware), Enter/Space to activate, Escape to collapse
- Renders `<a>` when href provided, `<button>` otherwise
- Active indicator bar with smooth CSS transition
- `prefers-reduced-motion` support

**Files created:**

- `packages/ui/src/components/FloatingNavigation.svelte`
- `packages/ui/src/types/floating-navigation.ts`
- `packages/ui/spec/FloatingNavigation.spec.svelte.ts` (34 tests)
- `packages/themes/src/base/floating-navigation.css`
- `packages/themes/src/rokkit/floating-navigation.css`
- `packages/themes/src/glass/floating-navigation.css`
- `packages/themes/src/minimal/floating-navigation.css`
- `packages/themes/src/material/floating-navigation.css`
- `sites/playground/src/routes/components/floating-navigation/+page.svelte`

**Files modified:** component index, types index, 5 CSS index files, components.ts nav

**Backlog:** #50 marked done
**Tests:** 1282 CI passing, 34 FloatingNavigation UI tests, 0 lint errors

---

### Monorepo Restructure + Legacy Cleanup

- Moved `packages/` and `sites/` into `solution/` directory (user-initiated)
- Fixed undeclared workspace dependencies exposed by restructuring (states, forms, ui → @rokkit/data; core → @unocss/preset-mini; chart → d3-format; stories → shiki; learn → ramda)
- Moved `tsconfig.json` into `solution/` (packages reference `../../tsconfig.json`)
- Added svelte, svelte-eslint-parser, globals to root devDependencies
- Updated `.husky/pre-commit` to `cd solution`
- Removed stale root `bun.lock`

### Legacy Component Cleanup (#8)

- `FieldLayout.svelte` — already migrated to Svelte 5 runes, kept as internal component
- Deleted `ListEditor.svelte` — broken (`./List.svelte` import doesn't exist), unused, not exported
- Deleted `NestedEditor.svelte` — broken (`generateTreeTable`, `deriveNestedSchema` don't exist), unused, not exported
- Deleted `DataEditor.svelte` — internal-only wrapper, no consumers after NestedEditor removal
- Deleted stale `__snapshots__/NestedEditor.spec.svelte.js.snap`
- All superseded by FormRenderer + List/Tree composition

**Tests:** 1267 CI — all passing. Lint: 0 errors.

---

### Forms Phase 7: Form Submission Handling (#19)

- Added `onsubmit` prop to `FormRenderer` — validate-before-submit flow
- When `onsubmit` provided: renders as `<form>` (not `<div>`), enables Enter-to-submit
- Submit flow: `validate()` → `onvalidate('*', data, 'submit')` → focus first error if invalid → call `onsubmit` → `snapshot()`
- Loading state via `data-form-submitting` attribute, fields become non-interactive
- Default submit/reset buttons rendered when `onsubmit` set (no custom `actions` snippet)
- Custom `actions` snippet prop receives `{ submitting, isValid, isDirty, submit, reset }`
- Reset button calls `formBuilder.reset()`, syncs data back to bindable prop
- Error handling: caught in `handleSubmit` (consumer handles errors in their callback)
- Added "Submit" tab to playground with contact form demo + simulated async submission

**Files modified:** `FormRenderer.svelte`, `input.css`, `forms/+page.svelte`
**Files modified (tests):** `FormRenderer.spec.svelte.js`
**Tests added:** 12 FormRenderer submission tests (form/div rendering, buttons, submit flow, validation, focus, loading state, reset, onvalidate, error handling)
**Tests:** 1267 CI — all passing. Lint: 0 errors.

**New public API:** `FormRenderer.onsubmit`, `FormRenderer.actions` (snippet)

---

### Forms Phase 6: ValidationReport Component (#14)

- Created `ValidationReport.svelte` — grouped summary of validation messages by severity
- Groups items by state (error, warning, info, success) with count headers
- Items render as `<button>` when `onclick` is provided (click-to-focus), `<div>` otherwise
- Empty state: renders nothing
- Added `messages` getter to FormBuilder — returns all validation messages sorted by severity
- CSS: severity-colored count badges, clickable item hover states
- Updated playground Validation tab to show ValidationReport with click-to-focus

**Files created:** `ValidationReport.svelte`, `spec/ValidationReport.spec.svelte.js`
**Files modified:** `builder.svelte.js`, `index.js`, `input.css`, `forms/+page.svelte`
**Tests added:** 12 ValidationReport tests, 4 FormBuilder messages getter tests
**Tests:** 1255 CI — all passing. Lint: 0 errors.

**New public API:** `FormBuilder.messages`, `ValidationReport` component

---

### Forms Phase 5: Recursive Group Rendering (#8 partial, #16)

- FormRenderer now renders `type: 'group'` elements as `<fieldset data-form-group>` with recursive child rendering
- Extracted element rendering into a `{#snippet renderElement(element)}` for recursion
- Group label renders as `<legend data-form-group-label>` (optional)
- Fixed FormBuilder `#convertToFormElement` to extract top-level properties (label, etc.) from combined group elements into props
- Fixed `Input.svelte` `{@const}` placement for Svelte 5 compatibility
- Added `[data-form-group]` and `[data-form-group-label]` CSS to base theme
- Added "Nested Form" demo tab to playground with address + emergency contact groups
- Deeply nested groups (group within group) supported

**Files modified:** `FormRenderer.svelte`, `Input.svelte`, `builder.svelte.js`, `input.css`, `forms/+page.svelte`
**Files created:** `spec/FormRenderer.spec.svelte.js`
**Tests added:** 7 FormRenderer group tests, 4 FormBuilder group tests
**Tests:** 1238 CI — all passing. Lint: 0 errors.

---

### Forms Playground Page

Created playground page at `/components/forms` with travel planner scenario. 7 tabbed demos: Input Form, Pick a Flight (display-table), Hotel Cards (display-cards), Itinerary Review (display-section + display-list), Mixed Layout (display + input), Validation, Dirty Tracking.

**Files created:** `sites/playground/src/routes/components/forms/+page.svelte`
**Files modified:** `sites/playground/src/lib/components.ts` (nav entry)

---

### Forms Phase 4: InputToggle Component (#15)

- Created `InputToggle.svelte` — thin wrapper around `@rokkit/ui` Toggle
- Converts string option arrays to `{ text, value }` objects automatically
- Registered as `toggle` in `defaultRenderers` registry
- Usage: `{ scope: '#/field', props: { renderer: 'toggle' } }` in layout
- Updated playground traveler form `travelClass` field to use toggle renderer

**Files created:** `input/InputToggle.svelte`, `spec/input/InputToggle.spec.svelte.js`
**Files modified:** `input/index.js`, `renderers.js`, `spec/input/index.spec.js`, `forms/+page.svelte`
**Tests added:** 8 InputToggle tests
**Tests:** 1227 CI — all passing. Lint: 0 errors.

---

### Forms Phase 3: Dirty Tracking (#9)

- Added `deepClone()` / `deepEqual()` helpers to builder (no external dependencies, handles $state proxies)
- `#initialData` snapshot taken at construction via `deepClone(data)`
- `isDirty` getter — compares current data vs initial snapshot
- `dirtyFields` getter — returns `Set<string>` of modified field paths
- `isFieldDirty(fieldPath)` — single field check
- `snapshot()` — updates initial snapshot to current data (post-save workflow)
- `reset()` — restores data to initial snapshot, clears validation
- `dirty: boolean` added to `FormElement.props` via `#convertToFormElement`
- `data-field-dirty` attribute added to `InputField.svelte`
- Playground "Dirty Tracking" tab with snapshot/reset buttons

**Files modified:** `builder.svelte.js`, `InputField.svelte`, `forms/+page.svelte`
**Tests added:** 14 dirty tracking tests in `builder.spec.svelte.js`
**Tests:** 1219 CI — all passing. Lint: 0 errors.

**New public API:** `FormBuilder.isDirty`, `FormBuilder.dirtyFields`, `FormBuilder.isFieldDirty()`, `FormBuilder.snapshot()`

---

### Forms Phase 1: FormBuilder Stability (#7) + Validation Integration (#13)

**FormBuilder stability (#7):**

- Replaced `$derived(new FormBuilder(...))` in FormRenderer with stable instance + `$effect` sync
- Builder's `$state` fields + `$derived` elements handle reactivity via setters
- Added `builder` prop to FormRenderer for external builder injection

**Validation integration (#13):**

- Added `validateField(fieldPath)`, `validate()`, `isValid`, `errors` to FormBuilder
- Wired into FormRenderer with `validateOn` prop ('blur'|'change'|'manual')
- External `onvalidate` callback for custom validation logic
- Validation messages flow to InputField via `message` prop as `{ state, text }` objects

**Ramda removal:** Removed `ramda` imports from FormBuilder, InputField, InfoField — replaced with native destructuring and strict equality checks.

**Files modified:** `builder.svelte.js`, `FormRenderer.svelte`, `InputField.svelte`, `InfoField.svelte`, `index.js`
**Tests added:** builder validation tests (11), validation.spec.js (37)
**Tests:** 1151 CI, 819 UI — all passing. Lint: 0 errors.

---

### Forms Phase 2: Type Renderer Registry (#12) + Display-Only Rendering (#60)

**Type Renderer Registry (#12):**

- Created `packages/forms/src/lib/renderers.js` — `defaultRenderers` map (21 type→component mappings) + `resolveRenderer()` with 3-level resolution (explicit renderer → type → fallback to InputText)
- Refactored `Input.svelte` — replaced 30-line if/else chain with registry-based `<svelte:component>` dispatch
- `renderers` prop flows FormRenderer → InputField → Input for custom type overrides

**Display-Only Rendering (#60):**

- 5 new display components: `DisplayValue` (format-aware: currency/datetime/duration/number/boolean/badge), `DisplaySection` (key-value pairs), `DisplayTable` (wraps @rokkit/ui Table), `DisplayCardGrid` (responsive grid with single/multi selection), `DisplayList` (styled list)
- FormBuilder handles `display-*` layout types, resolves data from scope, supports `renderer` hint for custom type overrides
- FormRenderer routes `display-*` elements to display components, new `onselect` prop
- `packages/themes/src/base/display.css` — base structural CSS with responsive grid

**Files created:** `renderers.js`, `display/DisplayValue.svelte`, `display/DisplaySection.svelte`, `display/DisplayTable.svelte`, `display/DisplayCardGrid.svelte`, `display/DisplayList.svelte`, `display/index.js`, `base/display.css`
**Files modified:** `Input.svelte`, `InputField.svelte`, `FormRenderer.svelte`, `builder.svelte.js`, `forms/index.js`, `base/index.css`
**Tests added:** `renderers.spec.js` (10), `DisplayValue.spec` (13), `DisplaySection.spec` (9), `DisplayList.spec` (7), `DisplayCardGrid.spec` (10), builder display tests (5)
**Tests:** 1205 CI, 819 UI — all passing. Lint: 0 errors.

**New public API:** `defaultRenderers`, `resolveRenderer`, `DisplayValue`, `DisplayTable`, `DisplayCardGrid`, `DisplaySection`, `DisplayList`
**Layout types:** `display-table`, `display-cards`, `display-section`, `display-list`

---

### Housekeeping: Consolidate .rules → agents, split backlog

**Consolidated `.rules/` into `agents/`:**

- Created `agents/references.md` — coding conventions, styling rules (theme/layout separation), story conventions, color system, architecture principles, project structure table
- Removed `.rules/` folder entirely (16 files across 4 subdirectories)
- Updated `CLAUDE.md` — proper project description, correct commands, references new file, removed placeholder text
- Content preserved from .rules where unique; agents/ content preferred where conflicts existed
- Outdated bits-ui references in .rules discarded (ADR-003 removed bits-ui)

**Split backlog into priority-ordered files:**

- `agents/backlog/01-forms.md` — FormBuilder stability, validation, display schemas, legacy migration, dirty tracking (items #7-22, #60)
- `agents/backlog/02-ui-components.md` — Table phases 2-4, FloatingNav, Button styles, type-ahead, MultiSelect value contract (items #3, #11, #28, #46-51)
- `agents/backlog/03-effects.md` — HoverLift, Magnetic, Ripple, Glow, decorative components (items #53-57)
- `agents/backlog/04-infrastructure.md` — Ramda removal, Svelte 4→5 migration, chart cleanup (items #23-25, #58)
- `agents/backlog/05-charts.md` — Full visualization suite (item #59)
- Removed all completed items (items #1, #4-6, #10, #26-27, #29-45, #48, #52)
- `agents/backlog.md` now a pointer to the directory

**Documented backlog #60 as requirement:**

- Added §18 "Display-Only Schema Rendering" to `docs/requirements/010-form.md`
- Added design section to `docs/design/010-form.md` — DisplayValue component, FormBuilder integration, FormRenderer routing, data attributes
- Updated gaps summary in both docs

### Chart Visualization Suite — Backlog #59 Created

Created comprehensive requirements and design docs for the chart package overhaul:

**Files created:**

- `docs/requirements/020-chart.md` — updated from skeleton to full requirements covering: 6 chart types (bar, line, area, scatter, pie, sparkline), animated time series (chart race), data mapping & brewer, SVG/PNG/animated SVG export, accessibility, theme integration
- `docs/design/020-chart.md` — full technical design: AnimatedChart wrapper architecture, custom tweened store for object array interpolation, TimelineControls, VisualBrewer (data→pattern+color+symbol), Sparkline component, SVG export pipeline (static + raster + SMIL animated), @rokkit/data rollup integration for keyframe alignment, 5-phase implementation plan

**Backlog #59 added** with 5 phases: Foundation & Static Charts → Chart Type Components → Animated Time Series → Animated Export & Polish → Advanced Features

**Key design decisions:**

- All rendering in SVG (not HTML elements like the reference example)
- AnimatedChart is a wrapper; base charts have zero animation awareness
- @rokkit/data rollup provides keyframe alignment (groupDataByKeys + fillAlignedData)
- VisualBrewer assigns pattern + color + symbol per distinct data value with tailwind shade ramps (50–950)
- Sparklines drawn from FitTrack analytics card patterns (metric sparkline: headline stat + trend + mini chart + summary)
- Animated SVG export uses SMIL `<animate>` for standalone playback

**Research sources:** russellgoldenberg/svelte-bar-chart-race (tweened stores, rank-based bar repositioning, timer controls), existing chart package (patterns, symbols, palette, ChartBrewer, swatch, old_lib/brewer), @rokkit/data rollup.js, fitness project analytics requirements (sparkline/dashboard card anatomy)

---

### Reveal Effect — Backlog #52 Complete

Implemented scroll-triggered reveal animations: `use:reveal` action + `Reveal` wrapper component.

**Files created:**

- `packages/actions/src/reveal.svelte.js` — action: IntersectionObserver + CSS data-attribute transitions, `prefers-reduced-motion` bypass
- `packages/ui/src/components/Reveal.svelte` — component: wraps action, adds stagger support (DOM-based child delay iteration)
- `packages/themes/src/base/reveal.css` — base CSS for `[data-reveal]` + `[data-reveal-visible]` transitions
- `packages/actions/spec/reveal.spec.svelte.js` — 22 action tests (attributes, CSS vars, observer lifecycle, once/repeat, reduced-motion, cleanup)
- `packages/ui/spec/Reveal.spec.svelte.ts` — 16 component tests (rendering, CSS vars, observer, class, stagger)
- `sites/playground/src/routes/components/reveal/+page.svelte` — playground page with single + staggered demos

**Files modified:** actions index.js (export), actions index.spec.js (expected keys), themes base index.css (import), ui components/index.ts + index.ts (export), playground components.ts (nav entry)

**Tests:** 1099 CI + 819 UI all pass. Lint: 0 new errors.

---

## 2026-02-23

### New Requirements — FloatingNavigation, Button Styles, Interactive Effects (Enriched)

Added requirements, design docs, and backlog entries based on reference site at `/Users/Jerry/Work/website/site` (React + Framer Motion).

**Additional patterns discovered from deeper reference site analysis:**

- **SectionDivider** (Backlog #55): Animated decorative divider — lines scale in from edges, dots pop in center. IntersectionObserver triggered. Added to `060-effects.md §11`.
- **GradientText** (Backlog #56): CSS utility for gradient-colored text via `background-clip: text`. Added to `060-effects.md §12`.
- **BackgroundOrbs** (Backlog #57): Decorative blurred gradient circles for hero/section backgrounds. Added to `060-effects.md §13`.
- Reference site button patterns confirmed: gradient CTA (`from-orange-500 to-pink-500`), `group-hover:translate-x-1` trailing arrow, outline-with-brand-color variant, white/transparent CTA variants. All covered by existing Backlog #51.

**FloatingNavigation** (Backlog #50):

- Requirements added to `docs/requirements/009-navigation.md §6` — data-driven collapsible floating nav with 4-edge positioning, pin toggle, IntersectionObserver active tracking, CSS animations
- Design doc created: `docs/design/009-floating-navigation.md` — architecture, position layouts, animation strategy (pure CSS), template structure, size variants

**Button Style Enhancements** (Backlog #51):

- Requirements added to `docs/requirements/001-button.md §6` — new `gradient` and `link` style variants, standardized micro-animations (press feedback, hover lift, focus ring, icon shift, loading pulse, pop on click) across all themes

**Interactive Effects** (Backlog #52–54):

- Requirements rewritten: `docs/requirements/060-effects.md` — expanded from 6 vague sections to 14 detailed sections covering:
  - `Reveal` component + `use:reveal` action (scroll-triggered entry animations) — highest priority
  - `use:hoverLift`, `use:magnetic`, `use:ripple` actions
  - `Glow` and `FloatingBubbles` decorative components
  - CSS utility animations (`rk-float`, `rk-shimmer`, `rk-pulse-glow`)
  - `prefers-reduced-motion` support mandate

**Backlog entries:** #50 (FloatingNavigation), #51 (Button styles), #52 (Reveal), #53 (HoverLift/Magnetic/Ripple), #54 (Glow/FloatingBubbles)

---

### Tree — Lazy Loading of Children — Backlog #6 Complete

Implemented async lazy loading for Tree nodes. Convention: `children: true` (boolean, not array) marks a node as "has children, not yet loaded."

**Changes:**

- `ItemProxy` (`packages/ui/src/types/item-proxy.ts`): Added `canLoadChildren` getter — detects truthy non-array children field
- `TreeProps` (`packages/ui/src/types/tree.ts`): Added `onloadchildren?: (value, item) => Promise<TreeItem[]>` callback
- `Tree.svelte` (`packages/ui/src/components/Tree.svelte`):
  - `loadingPaths` state (Set) tracks nodes currently loading
  - `loadVersion` counter forces `$derived` re-computation after in-place mutation
  - `loadLazyChildren(pathKey)` async helper: calls callback, mutates item's children, updates controller
  - `toggleNodeByKey` made async: intercepts expanding lazy nodes, skips double-toggle when `expandAll` already expanded the loaded node
  - `handleTreeKeyDown` intercepts ArrowRight for lazy nodes before navigator
  - Template: spinner in toggle button during loading, `aria-busy`, `data-tree-loading`
  - `FlatNode.isExpandable` includes `canLoadChildren` for connectors/toggle visibility
- `base/tree.css`: Loading spinner styles (`[data-tree-spinner]` with border animation)
- 6 new tests: expand toggle for lazy nodes, onloadchildren callback, children rendering after load, no re-call after loaded, rejection handling, nested lazy loading
- Playground: "Lazy Loading" demo with simulated 800ms async load, nested lazy folders

**Key insight:** After `loadLazyChildren` mutates item children and calls `syncExpandedToController()`, if `expandAll=true` the node is already expanded. Must skip `toggleExpansion()` to avoid toggling it back to collapsed.

**Tests:** 803 UI + 1075 CI — all pass.

---

### Timeline — View-Only Vertical Steps Component — Backlog #43 Complete

New component for instructions, changelogs, and process visualization. Purely presentational — no interaction, no state controller.

**Architecture:**

- Single `Timeline.svelte` with `ItemProxy` for field mapping (text, icon, description)
- `completed` / `active` boolean fields on items for state indicators
- Completed items show check icon (configurable), others show step number or custom icon
- `content` snippet for rich custom content per step
- Connector lines between items (except last)
- ARIA: `role="list"` / `role="listitem"`, `aria-hidden` on markers

**Files created:**

- `packages/ui/src/types/timeline.ts` — TimelineProps, TimelineFields, TimelineIcons
- `packages/ui/src/components/Timeline.svelte` — Timeline component
- `packages/themes/src/base/timeline.css` — structural styles
- `packages/themes/src/{rokkit,glass,material,minimal}/timeline.css` — 4 theme files
- `packages/ui/spec/Timeline.spec.svelte.ts` — 21 tests
- `sites/playground/src/routes/components/timeline/+page.svelte` — playground page

**Tests:** 786 UI, 1067 CI — all passing.

---

### Range — Custom Slider Component — Backlog #48 Complete

Migrated and consolidated the archived Range slider (4 files: Range, RangeMinMax, RangeSlider, RangeTick) into a single `Range.svelte` component.

**Architecture:**

- Single component with `range` boolean prop for dual-handle mode
- `lerp`/`inverseLerp` inline helpers replace D3 `scaleLinear` (same pattern as Tilt)
- `use:pannable` from `@rokkit/actions` for drag interaction on thumbs
- `generateTicks` from `@rokkit/core` for tick mark generation
- Snap-to-step on drag end and keyboard input
- ArrowLeft/Right/Up/Down for increment/decrement, Home/End for min/max

**Files created:**

- `packages/ui/src/types/range.ts` — RangeProps interface
- `packages/ui/src/components/Range.svelte` — Range component
- `packages/themes/src/base/range.css` — structural styles
- `packages/themes/src/{rokkit,glass,material,minimal}/range.css` — 4 theme files
- `packages/ui/spec/Range.spec.svelte.ts` — 31 tests
- `sites/playground/src/routes/components/range/+page.svelte` — playground page

**Files modified:**

- `packages/ui/src/components/index.ts` — added Range export
- `packages/ui/src/index.ts` — added Range to named re-exports
- `packages/ui/src/types/index.ts` — added range type export
- `packages/themes/src/base/index.css` + 4 theme `index.css` — added range.css imports

**Tests:** 765 UI, 1067 CI — all passing.

---

### Table Learn Site Page + index.ts Fix

Added learn site page for Table component following List page pattern.

**Files created:**

- `sites/learn/src/routes/(learn)/elements/table/+page.svelte` — article with intro, sorting, custom columns, filtering sections
- `sites/learn/src/routes/(learn)/elements/table/stories.js` — StoryBuilder wiring
- `sites/learn/src/routes/(learn)/elements/table/{intro,sorting,filtering,custom-columns}/App.svelte` — 4 examples
- `sites/learn/src/routes/(learn)/elements/table/fragments/{01-data-object.js,02-custom-columns.js,03-search-filter.svelte}` — code snippets

**Fix:** Added `Table` and `SearchFilter` to `packages/ui/src/index.ts` named re-exports (were in `components/index.ts` but missing from top-level barrel).

---

### Table Component Phase 1 + SearchFilter — Backlog #47 Phase 1 + #10 Complete

Implemented flat Table component with sortable columns, keyboard navigation, and standalone SearchFilter component. Multi-package feature spanning `@rokkit/data`, `@rokkit/states`, `@rokkit/ui`, and `@rokkit/themes`.

**Architecture:**

- `TableController` in `@rokkit/states` — composition wrapping `ListController` (not inheritance). Manages columns, sort state (single + multi-column via Shift+click), delegates focus/selection/navigation to internal ListController.
- `Table.svelte` — creates `TableController`, uses `use:navigator` for keyboard/click on rows, sort via `<th>` click handlers. Auto-derives columns from data via `deriveColumns()`. Supports custom columns with field mapping, formatters.
- `SearchFilter.svelte` — standalone component parsing user input with `parseFilters()` from `@rokkit/data`. Debounced input, filter tags with remove, clear button. Composes with Table via `filterData()`.

**Files created:**

- `packages/ui/src/types/table.ts` — TableColumn, TableProps, SortState, TableSortIcons types
- `packages/ui/src/types/search-filter.ts` — SearchFilterProps, FilterObject types
- `packages/states/src/table-controller.svelte.js` — TableController class (replaces old TableWrapper stub)
- `packages/ui/src/components/Table.svelte` — Table component
- `packages/ui/src/components/SearchFilter.svelte` — SearchFilter component
- `packages/themes/src/base/table.css` + `search-filter.css` — structural styles
- `packages/themes/src/{rokkit,glass,material,minimal}/table.css` — 4 theme files
- `packages/themes/src/{rokkit,glass,material,minimal}/search-filter.css` — 4 theme files
- `packages/ui/spec/Table.spec.svelte.ts` — 26 tests
- `packages/ui/spec/SearchFilter.spec.svelte.ts` — 13 tests
- `sites/playground/src/routes/components/table/+page.svelte` — playground page

**Files modified:**

- `packages/data/src/index.js` — exported `deriveColumns`, `deriveMetadata`, `deriveSortableColumn`, `parseFilters`, `filterData`, `filterObjectArray` (backlog #10)
- `packages/states/src/index.js` — replaced `TableWrapper` with `TableController` export
- `packages/ui/src/types/index.ts` — added table + search-filter type exports
- `packages/ui/src/components/index.ts` — added Table + SearchFilter component exports
- `packages/themes/src/base/index.css` + 4 theme `index.css` — added table + search-filter imports
- `packages/data/spec/index.spec.js` + `packages/states/spec/index.spec.js` — updated export tests
- `packages/states/spec/tabular.spec.svelte.js` — replaced TableWrapper tests with TableController tests

**Tests:** 734 UI, 1067 CI — all passing.

---

### NestedController Tree-style Focus Navigation — Backlog #29 Complete

Added WAI-ARIA treeview keyboard patterns to NestedController:

- **ArrowRight on expanded group** → focus first child (was no-op)
- **ArrowLeft on child** → focus parent (was no-op)
- **ArrowRight on leaf** → no-op (correctly returns false)
- **ArrowLeft on root** → no-op (correctly returns false)
- **Expand on leaf** → returns false (node has no children)

**Files modified:**

- `packages/states/src/nested-controller.svelte.js` — `expand()` checks for children, moves to first child when already expanded. `collapse()` moves to parent when not expandable.
- `packages/actions/src/navigator.svelte.js` — emits `'move'` event + scroll when expand/collapse changes focus (so Tree/List update DOM focus)
- `packages/states/spec/nested-controller.spec.svelte.js` — 8 new tests, 1 updated expectation

**Tests:** 655 UI, 1055 CI — all passing.

---

### Stepper Component — Backlog #38 Complete

Built a new Stepper component for multi-step wizard indicators (onboarding, checkout flows).

**Design decisions:**

- Single `Stepper.svelte` (no sub-components) — steps/dots are tightly coupled to stepper layout
- No controller/navigator needed — simple clickable buttons, not a focus-roving widget
- CSS connector lines via data attributes, not SVG Connector component
- Sub-stage dots when `step.stages > 1`

**Component:** `packages/ui/src/components/Stepper.svelte`

- TypeScript interfaces: `StepperStep`, `StepperIcons`, `StepperProps`
- `$bindable` current/currentStage, linear mode (only completed + next clickable)
- Horizontal/vertical orientation, custom completed icon, content snippet
- ARIA: `role="group"`, `aria-current="step"`, `aria-label` on buttons

**Files created:**

- `packages/ui/src/components/Stepper.svelte`
- `packages/ui/spec/Stepper.spec.svelte.ts` (29 tests)
- `packages/themes/src/base/stepper.css`
- `sites/playground/src/routes/components/stepper/+page.svelte`
- `sites/learn/src/routes/(learn)/layout/stepper/` — full story (stories.js, intro/App.svelte, fragments/01-basic.svelte, +page.svelte)

**Files modified:**

- `packages/ui/src/components/index.ts`, `packages/ui/src/index.ts` — added exports
- `packages/themes/src/base/index.css` — added CSS import
- `sites/playground/src/lib/components.ts` — added nav entry

**Tests:** 655 UI, 1047 CI — all passing. Learn site builds.

---

### Learn Site Stories — Phase 2b Complete

Created new interactive stories for all existing components and updated existing ones:

**New stories created:**

- `elements/toggle` — intro, fields, configuration examples
- `elements/toolbar` — intro, separators examples
- `elements/menu` — intro, groups examples
- `elements/carousel` — intro, transitions examples
- `elements/breadcrumbs` — intro example
- `primitives/button` — intro, variants examples (replaced ComingSoon)
- `primitives/card` — intro, snippets examples (replaced ComingSoon)
- `primitives/code` — intro example (new route)
- `layout/progress` — intro, indeterminate examples (replaced ComingSoon)

**Updated stories:**

- `primitives/pill` — text corrections (ItemWrapper → Pill)
- `input/rating` — fixed broken `<section>` tag, heading levels h1→h2
- `elements/list` — added nested/collapsible groups example

**Layout improvements:**

- Added breadcrumb navigation to `(learn)/+layout.svelte`
- Fixed `findGroupForSection` to use `slug` instead of `id`

Learn site builds. All tests pass: 626 UI, 1047 CI.

---

### Learn Site Build — Phase 2a Complete

Fixed all broken imports preventing the learn site from building:

**Root causes fixed:**

- `uno.config.js`: imported JS (`iconShortcuts`, `defaultIcons`, `Theme`) from `@rokkit/themes` (CSS-only) → changed to `@rokkit/core`
- `ThemeSwitcher.svelte`: `ToggleThemeMode` from `@rokkit/ui` → `ThemeSwitcherToggle` from `@rokkit/app`
- `Connector` missing from `@rokkit/ui` barrel export → added to `index.ts`

**Shared components fixed (Icon → CSS class span):**

- `ComingSoon.svelte`, `CopyToClipboard.svelte`, learn `Header.svelte`, root `Header.svelte`
- `Sidebar.svelte`: added `collapsible` prop to List, replaced Icon with CSS span
- `DropDown.svelte`: removed `Item` import, inline text rendering
- `tabs/orientation/Controls.svelte`: `Switch` → `Toggle`
- `pill/intro/App.svelte`: removed `Item` import/mapping
- `list/mixed/App.svelte`: removed `Item` import

**Broken story routes → ComingSoon:**
Removed story subdirectories and replaced +page.svelte with ComingSoon for:

- Routes: accordion, table, icon, item, calendar, range, stepper
- Stories: inputfield, validation-report, responsive-grid, templates/editor
- Forms stories: overview, schema, layout, validation, advanced

**Kept valid stories intact:** List, Select, MultiSelect, Tabs, Pill, Rating, Connector, nav-content, forms/inputs, charts

Learn site builds successfully. All tests pass: 626 UI, 1047 CI.

---

### Table & Range — Backlog Corrections

Corrected plan status for Table and Range:

- **Table** (#47): NOT "separate package" — has full requirements (`docs/requirements/004-table.md`) and design (`docs/design/004-table.md`) as a `@rokkit/ui` component. Multi-phase: flat+SearchFilter → hierarchy → pagination → polish. Uses `TableController` in `@rokkit/states`, `@rokkit/data` utilities for columns/sorting/filtering.
- **Range** (#48): Current `InputRange` in forms is a minimal native wrapper. The archived custom slider had dual handles, tick marks, step markers, styled ends/selected range, pannable thumbs. Needs full migration to `@rokkit/ui` as a standalone component.

---

### Pill & Rating — Phase 1 Complete (backlog #44, #45)

Migrated both components from archive to Svelte 5:

**Pill** (`packages/ui/src/components/Pill.svelte`):

- Tag/chip with optional remove button
- `ItemProxy` for field mapping, `use:keyboard` for Delete/Backspace removal
- Props: value, fields, removable, disabled, onremove, content (snippet), class
- Data attributes: `data-pill`, `data-pill-icon`, `data-pill-text`, `data-pill-remove`, `data-pill-disabled`
- 16 unit tests

**Rating** (`packages/ui/src/components/Rating.svelte`):

- Star/icon rating input with keyboard navigation
- ARIA: `role="radiogroup"` container, `role="radio"` per star
- Keyboard: ArrowLeft/Right/Up/Down, digit keys for direct set
- Props: value (bindable), max, disabled, filledIcon, emptyIcon, onchange, class
- Data attributes: `data-rating`, `data-rating-item`, `data-filled`, `data-hovering`, `data-rating-disabled`
- 26 unit tests

Also added: base CSS (pill.css, rating.css), playground pages, nav entries, LLM docs (ui.md, themes.md, README.md updated to 24 components).

All tests pass: 626 UI, 1047 CI.

---

### Learn Site Audit — Component Gap Analysis

Audited all learn site routes against current `@rokkit/ui` exports. Identified:

- **2 components to migrate** (Pill, Rating) — needed by learn stories, added to backlog #44, #45
- **5 deprecated stories to remove** (Accordion, DropDown, Switch, Icon, Message)
- **9+ new stories to create** (Toggle, Toolbar, Menu, Carousel, Card, Button, ProgressBar, BreadCrumbs, Code)
- **3 stories to update** (List add collapsible, Item fix import, Select/MultiSelect/Tabs review)
- **Header** already supports breadcrumbs prop but layout doesn't pass data
- **Build blocker**: pre-existing CSS import error prevents learn site from building

Created plan in `agents/plan.md` with Phase 1 (migrate Pill + Rating) and Phase 2 (learn site story updates). Updated backlog with #44 Pill, #45 Rating, #46 Learn Site Stories.

---

### Carousel — New Component

Built a Carousel component using `use:swipeable` + `use:keyboard` actions (no ListController needed).

**Actions used:**

- `use:swipeable` — touch/mouse swipe gestures → `swipeLeft`/`swipeRight` events
- `use:keyboard` — maps ArrowLeft/Right/Home/End → `prev`/`next`/`first`/`last` custom events

**Features:**

- Slide/fade/none transitions via CSS `data-carousel-transition` attribute + CSS custom properties (`--carousel-current`)
- Autoplay with pause-on-hover, configurable interval
- Loop/wrap option (disables arrows at boundaries when off)
- Prev/next arrow buttons + dot navigation
- ARIA: `role="group"` + `aria-roledescription="carousel"`, dots as `role="tab"`, slides as `role="tabpanel"`
- Bindable `current` index

**Files created:**

- `packages/ui/src/components/Carousel.svelte`
- `packages/ui/spec/Carousel.spec.svelte.ts` (22 tests)
- `packages/themes/src/base/carousel.css`
- `sites/playground/src/routes/components/carousel/+page.svelte`

**Tests:** 1047 unit (584 UI) — all passing. Playground builds.

---

### BreadCrumbs, Card, ProgressBar — Migrate from Archive

Migrated three presentational components from archive to `@rokkit/ui` with Svelte 5 runes, TypeScript types, data-attribute theming, and proper ARIA.

**BreadCrumbs** — navigation breadcrumbs with `nav`/`ol`/`li` ARIA pattern:

- Uses `ItemProxy` for field mapping (text, value, icon)
- Last item marked `aria-current="page"`, non-last rendered as buttons
- Custom separator icon, custom crumb snippet support

**Card** — flexible content container:

- Renders as `<div>` (static), `<a>` (href), or `<button>` (onclick)
- Snippet-based `header`, `footer`, `children` slots

**ProgressBar** — determinate/indeterminate progress indicator:

- `role="progressbar"` with `aria-valuenow/min/max`
- Indeterminate mode when `value` is null (CSS animation)
- Percentage clamped to 0-100%

**Files created:**

- `packages/ui/src/components/BreadCrumbs.svelte`, `Card.svelte`, `ProgressBar.svelte`
- `packages/ui/spec/BreadCrumbs.spec.svelte.ts` (16 tests), `Card.spec.svelte.ts` (7 tests), `ProgressBar.spec.svelte.ts` (13 tests)
- `packages/themes/src/base/breadcrumbs.css`, `card.css`, `progress.css`
- `sites/playground/src/routes/components/breadcrumbs/+page.svelte`, `card/+page.svelte`, `progress/+page.svelte`

**Files modified:**

- `packages/ui/src/components/index.ts`, `packages/ui/src/index.ts` — added exports
- `packages/themes/src/base/index.css` — added CSS imports
- `sites/playground/src/lib/components.ts` — added nav entries

**Tests:** 1047 unit (562 UI) — all passing. Playground builds.

---

### Tilt & Shine — Migrate Effect Components from Archive

Migrated two visual effect components from archive to `@rokkit/ui` with Svelte 5 runes, TypeScript types, and data-attribute theming.

**Tilt** — parallax tilt effect responding to mouse position:

- Replaced D3 `scaleLinear` with simple `lerp()` function (zero new dependencies)
- CSS variables: `--tilt-perspective`, `--tilt-rotate-x`, `--tilt-rotate-y`, `--tilt-brightness`
- Props: `maxRotation`, `setBrightness`, `perspective`

**Shine** — specular lighting effect using SVG `feSpecularLighting` + `fePointLight`:

- Uses `@rokkit/core` `id()` for unique SVG filter IDs
- Props: `color`, `radius`, `depth`, `surfaceScale`, `specularConstant`, `specularExponent`

**Files created:**

- `packages/ui/src/components/Tilt.svelte`, `Shine.svelte`
- `packages/ui/spec/Tilt.spec.svelte.ts` (12 tests), `Shine.spec.svelte.ts` (12 tests)
- `packages/themes/src/base/tilt.css`, `shine.css`
- `sites/playground/src/routes/components/tilt/+page.svelte`, `shine/+page.svelte`

**Files modified:**

- `packages/ui/src/components/index.ts`, `packages/ui/src/index.ts` — added exports
- `packages/themes/src/base/index.css` — added CSS imports
- `sites/playground/src/lib/components.ts` — added nav entries

**Tests:** 1047 unit (526 UI), 213 e2e — all passing.

---

### Toolbar — Add ListController + Navigator (ADR-003 pattern)

Added arrow-key navigation to Toolbar via `ListController` + `use:navigator`, following the same pattern used in Toggle, Tabs, and List.

**Key design decisions:**

- Separators and spacers don't get `data-path` attributes → invisible to navigator, naturally skipped
- `ListController#isDisabled()` skips disabled items during arrow-key navigation
- `focusin` listener syncs controller position when items receive focus externally (e.g. Tab)
- Removed `onclick`/`onkeydown` from `defaultItem` buttons — navigator handles all clicks and keyboard via `action` events
- `createHandlers()` still provides `onclick`/`onkeydown` for custom snippets
- Orientation derived from `position` prop: left/right → vertical (ArrowUp/Down), top/bottom → horizontal (ArrowLeft/Right)

**Files modified:**

- `packages/ui/src/components/Toolbar.svelte` — added controller + navigator integration
- `packages/ui/spec/Toolbar.spec.svelte.ts` — added 12 new tests (arrow keys, Home/End, skip separators/spacers/disabled, vertical orientation)

**Files created:**

- `sites/playground/e2e/toolbar.spec.ts` — 25 e2e tests (keyboard, mouse, visual snapshots × 5 themes × 2 modes)

**Tests:** 1047 unit (502 UI), 213 e2e — all passing.

### ADR-003 Phase D — Remove @rokkit/composables

Deleted the `@rokkit/composables` package (55 files, 26 tests). No active consumers remained (all migrated in Phase A).

Also assessed Proxy/ItemProxy unification (Phase C item) and deferred — they are fundamentally different abstractions: `states.Proxy` is reactive+mutable data model, `ItemProxy` is read-only view-layer field mapper.

**What was removed:**

- `packages/composables/` — entire directory (List, GroupedList, Switch, TabGroup, FloatingNav)
- `docs/llms/composables.md` — LLM reference doc
- Composables entries from: llms/README.md, .rules/project/structure.md, agents/memory.md
- Composables import references from: learn site LLM generators, commented import in tabs page

**What was updated:**

- `bun.lock` — regenerated (1 package removed: bits-ui)
- `docs/llms/states.md` — updated "Depended on by" list
- `docs/decisions/003-mvc-separation.md` — marked Phase D complete

**Tests:** 1047 unit tests (125 files), all passing. Delta: -26 tests (composables tests removed), -8 test files.

**ADR-003 is now fully complete** (Phases A–D).

---

### Tree — Migrated to NestedController + use:navigator (ADR-003 Phase C)

Sixth component in Phase C. Most complex migration — hierarchical data with expand/collapse, tree lines/connectors, ArrowLeft/Right for expand/collapse and parent navigation.

**Key decisions:**

- Used `NestedController` (not `ListController`) — Tree has true nested expand/collapse.
- Navigator with `nested: true` — maps ArrowLeft→collapse, ArrowRight→expand via kbd.js `getVerticalExpandActions`.
- Kept `flattenTree()` for rendering (computes `lineTypes`, `level`, `isLast` per node) — reads expansion from `controller.expandedKeys`.
- Same pathKey↔nodeKey sync pattern as List: `expanded` prop uses node values as keys (e.g., `{ src: true }`), controller uses path keys (e.g., `"0"`). `syncExpandedToController()` bridges them.
- `expandAll` populates all parent nodes into controller's `expandedKeys` during sync.
- `data-path` on `data-tree-item-content` elements for navigator click/focus interception.
- Toggle buttons (`data-tree-toggle-btn`) call `toggleNodeByKey()` directly, don't use `data-path`.

**What was removed:**

- `focusedPath` state, `focusPath()`, inline `handleFocusIn()`, `handleItemKeyDown()` (~80 lines keyboard switch)
- `handleItemSelect()`, `internalExpanded` / `effectiveExpanded`, `isNodeExpanded()` / `toggleNode()`

**Files changed:**

- `packages/ui/src/components/Tree.svelte` — full migration
- `docs/decisions/003-mvc-separation.md` — marked Tree checkbox

**Tests:** 1073 unit tests (457 UI, 37 Tree) all passing, no test changes needed.

---

### Toolbar — Skipped Migration (ADR-003 Phase C)

Assessed Toolbar.svelte (198 lines). **Decision: skip** — minimal keyboard code (~7 lines Enter/Space only), no arrow navigation, relies on native tab order. Supports non-interactive items (separator, spacer) and slot-based content that would complicate controller integration.

---

### MultiSelect — Migrated to ListController + use:navigator (ADR-003 Phase C)

Fifth component in Phase C. Same dropdown pattern as Select with toggle selection (don't close on select) and array-of-items value binding.

**Key decisions:**

- Same `Map<unknown, string>` pattern as Select for `itemPathMap`.
- `handleSelectAction()` calls `toggleItemSelection()` instead of closing dropdown.
- No `lastSyncedValue` guard needed — MultiSelect's value is array of full items, not a single primitive.

**Files changed:**

- `packages/ui/src/components/MultiSelect.svelte` — full migration
- `docs/decisions/003-mvc-separation.md` — marked MultiSelect checkbox

**Tests:** 1073 unit tests (457 UI) all passing, no test changes needed.

---

### Select — Migrated to ListController + use:navigator (ADR-003 Phase C)

Fourth component in Phase C (after Toggle, List, Menu). Same dropdown pattern as Menu with additional concerns: bindable `value`/`selected`, `lastSyncedValue` guard, maxHeight measurement, check mark rendering.

**Key decisions:**

- Used `Map<unknown, string>` (not `WeakMap`) for `itemPathMap` — Select supports string/number arrays (`['foo', 'bar']`) where items are primitives, not objects.
- `lastSyncedValue` guard pattern (from Toggle) prevents value-sync `$effect` from fighting navigator focus moves.
- `scrollIntoView?.()` with optional chaining — forms tests run in JSDOM which doesn't implement `scrollIntoView`.
- On `openDropdown()`: focuses selected item via `controller.moveToValue(value)`, or first item if no selection.

**What was removed:**

- `focusedIndex` state tracking
- `focusItem()` — manual DOM query + focus + scroll
- `handleKeyDown()` — 35-line keyboard switch
- `handleItemKeyDown()` — per-item Enter/Space handler

**Files changed:**

- `packages/ui/src/components/Select.svelte` — full migration
- `docs/decisions/003-mvc-separation.md` — marked Select checkbox

**Tests:** 1073 unit tests (457 UI) all passing, no test changes needed.

---

## 2026-02-22

### Menu — Migrated to ListController + use:navigator (ADR-003 Phase C)

Third component in Phase C (after Toggle, List). Replaced inline keyboard/focus code in Menu.svelte with `ListController` + `use:navigator`.

**Key decisions:**

- Used `ListController` (not `NestedController`) — Menu groups are presentation-only headers, not collapsible. All children are flattened into a single navigable list.
- Pre-flattens `options` into `flatItems` (leaf items only) for the controller. Groups are skipped. Uses `WeakMap<object, string>` to map raw item objects → flat index keys for `data-path`.
- Navigator is applied to the dropdown container (`[data-menu-dropdown]`), not the root `[data-menu]`. Trigger button keyboard handling (ArrowDown/Up → open + focus first/last) remains manual.
- Escape and click-outside remain document-level listeners (toggled via `$effect` when `isOpen` changes).
- Enter/Space on individual items uses `stopPropagation()` to prevent navigator from double-handling. This preserves backward compat for custom snippet `handlers.onkeydown`.
- Dropped wrapping behavior (ArrowDown on last item no longer wraps to first) — matches WAI-ARIA standard.

**What was removed:**

- `focusedIndex` state tracking
- `focusItem()` — manual DOM query + focus
- `handleKeyDown()` — 35-line keyboard switch (ArrowDown/Up wrapping, Home/End, Enter/Space, Escape)
- `handleItemKeyDown()` — per-item Enter/Space handler

**What was added:**

- `ListController` + `use:navigator` for arrow keys, Home/End, disabled skip, focus tracking
- `flatItems` derived (pre-flatten groups → children for controller)
- `itemPathMap` derived (`WeakMap` for raw item → flat index key)
- Action event listener for 'move' (focus DOM) and 'select' (fire onselect + close)
- `handleFocusIn` to sync DOM focus → controller

**Files changed:**

- `packages/ui/src/components/Menu.svelte` — full migration
- `docs/decisions/003-mvc-separation.md` — marked Menu checkbox

**Tests:** 1073 unit tests (457 UI) all passing, no test changes needed.

---

### Fix Issues from docs/issues/001.md — All Resolved

Fixed 6 reported issues (3 were already implemented). `docs/issues/001..md` cleared.

**Bug fixes:**

1. **Input text value binding** — already fixed in `b660d747`. Added regression test in `InputText.spec.svelte.js`.
2. **Menu first item highlighted** — added `tabindex="-1"` to menu item buttons (WAI-ARIA menu pattern), removed focus-within outline ring from dropdown container.

**Style fixes:** 3. **Select inside input-root: extra thick border / 2px→1px / height mismatch** — root cause was `data-select` using `display: inline-block` inside flex `data-input-root`, creating a baseline gap. Fix: `data-select` now uses `display: flex; self-stretch` and trigger uses `flex-1; self-stretch; min-width: 0` in base/input.css. 4. **Danger button text invisible in dark mode** — changed outline/ghost danger text from `text-danger-z6` to `text-danger-z4` (semantic shortcut handles both light/dark) in rokkit/button.css. 5. **Minimal theme underline inputs** — already implemented correctly. 6. **Material theme floating label inputs** — already implemented correctly. 7. **menu-opened/menu-closed icons** — already in defaultIcons, icon bundles, and Menu component.

**Files changed:**

- `packages/themes/src/base/input.css` — select-inside-input-root structural fix
- `packages/themes/src/base/menu.css` — dropdown focus-within outline removal
- `packages/themes/src/rokkit/button.css` — danger text `z6`→`z4`
- `packages/ui/src/components/Menu.svelte` — `tabindex="-1"` on menu items
- `packages/forms/spec/input/InputText.spec.svelte.js` — regression test

**Tests:** 1073 unit tests passing.

---

## 2026-02-21

### List — Migrated to NestedController + use:navigator (ADR-003 Phase B)

Second component in Phase B (after Toggle). Replaced ~100 lines of inline keyboard navigation in List.svelte with `NestedController` + `use:navigator`.

**Key decisions:**

- Used `NestedController` (not `ListController`) because expand/collapse is handled by NestedController. Navigator handles all keyboard when `nested: collapsible`.
- Created `expandedByPath` (`$state<Record<string, boolean>>`) as reactive bridge for template rendering. Svelte 5 cannot track reactivity through `controller.lookup` ($derived Map) → `proxy.expanded` ($state). The `expandedByPath` state is the template's source of truth for expansion.
- Removed `onclick` from group label button — navigator intercepts clicks on `data-path` elements. Without this, click would double-toggle (button onclick + navigator select → handleSelectAction toggle).
- `handleSelectAction` handles both button items (fires `onselect`) and group labels (toggles expansion).
- `handleListKeyDown` only intercepts Enter/Space on link items (`<a>`) to let native navigation through.
- `handleFocusIn` syncs DOM focus → controller via `controller.moveTo(path)`.

**Expansion bridge pattern:**

1. External `expanded` prop (keyed by group name: `{ "Favorites": true }`) → `syncExpandedToController()` → controller proxy.expanded + expandedByPath
2. User toggles → `toggleGroupByKey(pathKey)` → controller.toggleExpansion + expandedByPath update → `deriveExpandedFromPath()` → expanded prop + onexpandedchange
3. Navigator toggle action → sync controller proxy states → expandedByPath → expanded prop

**E2e tests (33 total):**

- 9 flat list keyboard tests (ArrowDown/Up repeated, Home, End, no-wrap, Enter, Space, focus≠select)
- 5 grouped list keyboard tests (navigation through groups, collapse/expand, Enter toggle, repeated cycles)
- 3 mouse tests (click select, deselect, group toggle)
- 16 visual snapshots (4 themes × 2 modes × 2 states)

**Not implemented (backlog):**

- ArrowRight on expanded group → move to first child (tree-style navigation)
- ArrowLeft on child → move to parent group label

**Tests:** 1058 unit tests + 60 e2e tests (27 toggle + 33 list) all passing.

### ListController — Skip Disabled Items (Backlog #36)

Added `disabled: 'disabled'` to `@rokkit/core` defaultFields and `#isDisabled(index)` helper to `ListController`. All four movement methods (`moveNext`, `movePrev`, `moveFirst`, `moveLast`) now skip disabled items. `moveToIndex()` and `moveTo()` remain unchanged — they're used for explicit focus (focusin handler, selection) where any index should be reachable.

**Files changed:**

- `packages/core/src/constants.js` — added `disabled: 'disabled'` field
- `packages/core/spec/constants.spec.js` — updated defaultFields snapshot
- `packages/states/src/list-controller.svelte.js` — added `#isDisabled()` + updated 4 movement methods
- `packages/states/spec/list-controller.spec.svelte.js` — 7 new disabled item tests
- `sites/playground/e2e/list.spec.ts` — updated End/ArrowDown tests to verify disabled skip

**Tests:** 1065 unit tests + 60 e2e tests all passing.

### Proxy State Isolation — Controller-Owned expandedKeys

Moved expansion state from Proxy (which mutated original items via `proxy.expanded = true` → `item._expanded = true`) into a `SvelteSet` owned by the controller. Original items are no longer polluted with internal state flags when returned via `onselect`/`onchange`.

**Approach:** Added `expandedKeys = new SvelteSet()` to `ListController`. `flatVisibleNodes` now accepts an optional `expandedKeys` parameter — when provided, checks `expandedKeys.has(key)` instead of `item[fields.expanded]`. Falls back to item field for backward compat when `expandedKeys` is null. `NestedController.expand/collapse/toggleExpansion` now manipulate `expandedKeys` directly instead of `proxy.expanded`. Proxy's `expanded` setter removed; getter kept for reading initial data.

**List.svelte simplification:** Removed the `expandedByPath` reactive bridge (which was a workaround for Svelte 5 reactivity not tracking through `$derived` Map → `proxy.expanded` `$state`). Now reads `controller.expandedKeys.has(pathKey)` directly — `SvelteSet` is natively reactive.

**Files changed:**

- `packages/states/src/derive.svelte.js` — `flatVisibleNodes` accepts `expandedKeys` param
- `packages/states/src/list-controller.svelte.js` — added `expandedKeys`, `#initExpandedKeys()`
- `packages/states/src/nested-controller.svelte.js` — expand/collapse/toggle use `expandedKeys`
- `packages/states/src/proxy.svelte.js` — removed `expanded` setter
- `packages/ui/src/components/List.svelte` — removed `expandedByPath`, use `controller.expandedKeys`
- `packages/core/src/mapping.js` — added deprecation note to `isExpanded`
- Tests: updated proxy spec, added derive expandedKeys test, added nested-controller non-mutation test

**Tests:** 1068 unit tests + 60 e2e tests all passing.

---

## 2026-02-20 (session 2)

### Documentation Restructuring — Requirements Split, LLMs Reference, ADR-003

Restructured documentation per approved plan: split catch-all requirements file, created per-component requirements, built package reference docs, and wrote architecture decision for MVC separation.

**Phase 1 — Split 000-component-requirements.md:**

- Created `000-patterns.md` (type system, architecture patterns, TypeScript strategy)
- Created `000-rtl.md` (RTL detection, Vibe direction)
- Created `020-chart.md` (AnimatedChart, accessible patterns)
- Created `060-effects.md` (Tilt, Shine, Glow, Depth3D, Motion, Parallax)
- Created `080-cli.md` (CLI scaffolding, svelte-add)
- Appended TreeTable subsection to `004-table.md`
- Deleted `000-component-requirements.md`

**Phase 2 — Active component requirements (5 new files):**

- `001-button.md`, `005-select.md`, `006-menu.md`, `007-toggle.md`, `008-toolbar.md`

**Phase 3 — Archived component requirements (4 new files):**

- `009-navigation.md` (Tabs, BreadCrumbs, Stepper, PageNavigator)
- `040-layout.md` (Card, Panel, Overlay, ResponsiveGrid, Carousel, SlidingColumns)
- `050-feedback.md` (ProgressBar, Message, Pill, Separator, Summary, Icon, Link, Accordion)
- `070-data.md` (SearchFilter, Calendar)

**Phase 4 — docs/llms/ package reference (14 files + README):**

- Created `docs/llms/` with reference docs for all 14 packages
- Each doc: dependency hierarchy, exports table, key patterns, internal modules

**ADR-003 — MVC Separation (docs/decisions/003-mvc-separation.md):**

- Analysis found ~1200 lines of duplicated keyboard/navigation/focus code across List, Select, Menu, Tree
- Decision: fold composables into ui, add states/actions as ui dependencies, remove bits-ui entirely
- Found chart has dead bits-ui dependency; composables fully superseded by ui equivalents

**Backlog updated:** #28 expanded (ramda project-wide), added #29–#33 (helpers exports, chart bits-ui, ui MVC adoption, parseFilters, composables fold)

**READMEs updated:** requirements + design READMEs with expanded numbering (000–089)

---

## 2026-02-20

### Requirements & Design Documentation — List, Tree, Form

Documented requirements and design for three component areas based on existing code analysis.

**Files created:**

- `docs/requirements/002-list.md` — 10 sections, identified 4 gaps (navigator refactor, multi-selection, type-ahead, missing role="listbox")
- `docs/requirements/003-tree.md` — 12 sections, identified 6 gaps (navigator refactor, multi-selection, drag-and-drop, lazy loading, proxy recreation, search/filter)
- `docs/requirements/010-form.md` — 17 sections covering current + future features (custom type renderers, validation integration, enhanced lookups, master-detail, semantic command input, dirty tracking, form submission, audit fields)
- `docs/design/002-list.md` — Current architecture + proposed `use:navigator` + `ListDataController` refactor (~118 lines saved)
- `docs/design/003-tree.md` — Current architecture + proposed `use:navigator` + `NestedController` refactor (~54 lines saved)
- `docs/design/010-form.md` — Current architecture + 5-phase enhancement plan (FormBuilder stability, type registry, validation, lookups, master-detail, semantic command)

**Backlog updated:**

- Items #8-#16: List/Tree navigator refactor, multi-selection, lazy loading, FormBuilder recreation, legacy migration, dirty tracking, parseFilters export, type-ahead search
- Items #17-#28: Custom type renderer registry, validation integration, ValidationReport migration, InputToggle, FieldGroup, ArrayEditor, enhanced lookups, form submission, audit metadata, master-detail, semantic command input, ramda removal

**Key decisions:**

- Forms do NOT benefit from `use:navigator` — standard tab order is sufficient, arrow keys would break text inputs
- List (~100 lines inline keyboard code) and Tree (~80 lines) should be refactored to use `use:navigator` + controllers
- Form enhancement follows 5-phase strategy: fix current → type renderers → lookups/validation → master-detail → semantic command

---

## 2026-02-19

### Forms Phase 1 — Complete (Steps 1–8)

Implemented form-driven property controls via `@rokkit/forms`.

**Steps completed:**

1. Replaced `Icon` import with `<span class={icon}>` in InputField
2. Replaced InputSelect native `<select>` with `@rokkit/ui` Select component
3. Created `InfoField.svelte` for read-only value display
4. Added `info` and `separator` type dispatch in Input.svelte
5. Extended FormBuilder type resolution (options, separator, info/readonly, type at top level)
6. Handle separator elements in FormRenderer render loop
7. Exported InfoField + lib utilities from forms index
8. Pilot conversion: toggle playground page → FormRenderer with schema + layout

**Additional fixes during phase 1:**

- Changed InputCheckbox default variant to 'custom' (icon-based, not native blue checkbox)
- Moved checkbox outside `[data-input-root]` (doesn't need gradient border wrapper)
- Added `[data-input-root] [data-select] { flex-1 }` to stretch Select in input wrapper
- Created theme CSS files: `base/input.css`, `rokkit/input.css`, `minimal/input.css`
- Updated index.css files in base, rokkit, minimal to import input.css
- Added `@rokkit/forms` dependency to playground
- Wrote comprehensive `@rokkit/forms` README with future enhancements

**Commits:**

- `910499e0` — feat: form-driven property controls via @rokkit/forms

**Tests:** 1057 passing, all green

### Forms Phase 2 — Complete

Converted 8 playground pages to FormRenderer and cleaned up deprecated code.

**Page conversions (8):** list, tree, toolbar, code, floating-action, menu, select, multi-select

- Each page: replaced individual `$state()` + Prop\* imports with single `props = $state({})` + schema + layout + `<FormRenderer>`
- PaletteManager skipped (uses custom snippets, not expressible as schema)

**Controls deletion:** removed `sites/playground/src/lib/controls/` (PropSelect, PropCheckbox, PropText, PropInfo, index.ts)

**Archive/deprecated cleanup:**

- Deleted `archive/forms/` (forms-old, inp, lib-deprecated, spec-inp)
- Deleted rebuilt components from `archive/ui/` (Button, List, Tree, Select, MultiSelect, Toggle, FloatingAction(s), Connector, Node, Item, NestedList + specs/snapshots)
- Deleted `packages/states/deprecated/` (hierarchy.js)
- Deleted `packages/forms/src/forms-old/`, `packages/forms/src/inp/`, `packages/forms/src/lib/deprecated/`
- Kept `archive/themes/` (reference for theme migration)
- Kept un-rebuilt components in `archive/ui/` (47 components)

**Commits:**

- `7af488f8` — feat: convert playground pages to FormRenderer and clean up deprecated code

**Tests:** 1057 passing, all green

---

### 2026-02-23 — NestedController Tree-style Navigation (Backlog #29)

Implemented WAI-ARIA treeview keyboard patterns for NestedController:

- `expand()` on already-expanded group → moves focus to first child
- `expand()` on leaf node → returns false (no children to expand)
- `collapse()` on child/leaf → moves focus to parent
- `collapse()` on root (not expanded) → returns false
- Navigator emits `'move'` event when expand/collapse changes focusedKey

**Files modified:**

- `packages/states/src/nested-controller.svelte.js` — expand/collapse with tree-style focus
- `packages/actions/src/navigator.svelte.js` — emit 'move' + scroll on focus-changing expand/collapse
- `packages/states/spec/nested-controller.spec.svelte.js` — 8 new tests

**Tests:** 1055 passing (682 UI), all green
**Backlog:** #29 done

---

### 2026-02-23 — Switch Component (iOS-style Binary Toggle)

Built new `Switch` component for `@rokkit/ui` — an iOS-style sliding toggle for binary state.

**Design:**

- Single `<button role="switch">` with track + sliding thumb
- Two options only (default `[false, true]`), also supports `['x', 'y']` or `[{icon, value}, ...]`
- ItemProxy for field mapping (same contract as Toggle/Select/List)
- Keyboard: Space/Enter toggle, ArrowRight → on, ArrowLeft → off
- No ListController/navigator needed (2 options, simple toggle)

**Files created:**

- `packages/ui/src/types/switch.ts` — SwitchProps, SwitchFields, SwitchItem types
- `packages/ui/src/components/Switch.svelte` — component
- `packages/themes/src/base/switch.css` — base structural styles (3 size variants, CSS custom property for thumb travel)
- `packages/themes/src/{rokkit,glass,material,minimal}/switch.css` — 4 theme styles
- `packages/ui/spec/Switch.spec.svelte.ts` — 27 unit tests
- `sites/playground/src/routes/components/switch/+page.svelte` — playground page

**Files modified:**

- `packages/ui/src/components/index.ts` — added Switch export
- `packages/ui/src/index.ts` — added Switch to component list
- `packages/ui/src/types/index.ts` — added switch types export
- `packages/themes/src/base/index.css` — added switch.css import
- `packages/themes/src/{rokkit,glass,material,minimal}/index.css` — added switch.css import (4 files)

**Backlog:** #1 updated (InputSwitch migration to Switch deferred), #2 removed (user decision)
**Tests:** 1055 CI + 682 UI passing, all green

---

### 2026-02-23 — InputSwitch Migration — Backlog #1 Complete

Migrated `InputSwitch.svelte` in `@rokkit/forms` from wrapping `Toggle` to wrapping `Switch`. Removed dead `handle()` function and `@rokkit/core` dependency.

**Files modified:**

- `packages/forms/src/input/InputSwitch.svelte` — replaced Toggle import with Switch

**Backlog:** #1 marked done
**Tests:** 1055 CI passing, all green

---

### 2026-02-23 — Select Typeahead Filter — Backlog #41 Complete

Added `filterable` prop to Select component. When enabled, shows a text input at the top of the dropdown for filtering options by case-insensitive substring match.

**Features:**

- `filterable` prop enables filter input in dropdown header
- `filterPlaceholder` prop (default "Search...") for custom placeholder text
- `filteredOptions` derived filters before `flatItems` — controller only sees visible items, keyboard nav works naturally
- Groups: filters children, hides groups with no matches
- Empty state ("No results") when filter has no matches
- Escape: clears filter first (with stopPropagation), closes dropdown on second press
- Filter cleared on dropdown close and after selection
- `selectedItem` searches all options (not filtered) so trigger always shows selected value

**Files modified:**

- `packages/ui/src/types/select.ts` — added `filterable`, `filterPlaceholder` to SelectBaseProps
- `packages/ui/src/components/Select.svelte` — filter state, filteredOptions derived, handleFilterKeyDown, template changes
- `packages/themes/src/base/select.css` — structural styles for filter input and empty state
- `packages/themes/src/{rokkit,glass,material,minimal}/select.css` — theme colors for filter input (4 files)
- `packages/ui/spec/Select.spec.svelte.ts` — 13 new tests in `describe('filterable')` block
- `sites/playground/src/routes/components/select/+page.svelte` — added filterable control

**Backlog:** #41 marked done
**Tests:** 1055 CI + 695 UI passing, all green

---

### 2026-02-23 — List/Tree Multi-Selection — Backlog #5 Complete

Added Ctrl+click toggle and Shift+click range selection to both List and Tree components.

**Architecture (4 layers, bottom-up):**

1. **ListController** — `#anchorKey` tracks range start, `selectRange(key)` selects all non-disabled items between anchor and target, anchor set on `select()` and `extendSelection()` but not on range (so Shift+click extends from original anchor)
2. **Navigator + kbd/utils** — new `'range'` action: `getClickAction()` detects `shiftKey`, `getKeyboardAction()` detects `Shift+Space`, `EVENT_MAP` maps range to `['move', 'select']`, handler calls `wrapper.selectRange(path)`
3. **List/Tree components** — `multiselect` prop, `selected = $bindable([])`, `onselectedchange` callback, `data-selected`/`aria-selected` on items, `data-multiselect`/`aria-multiselectable` on container
4. **CSS** — base: `user-select: none` for multiselect items; 4 themes × 2 components: selected state colors (rokkit: primary-z3/z4, glass: primary-z5/20-30, material: primary-z2, minimal: border-primary-z3/z4)

**Files modified:**

- `packages/states/src/list-controller.svelte.js` — `#anchorKey`, `selectRange()`, updated `select()`/`extendSelection()`
- `packages/actions/src/kbd.js` — `createShiftKeyboardActionMap()`, shift detection in `getKeyboardAction()`
- `packages/actions/src/utils.js` — shift detection in `getClickAction()`
- `packages/actions/src/navigator.svelte.js` — `range` in EVENT_MAP + getHandlers
- `packages/ui/src/types/list.ts` — `multiselect`, `selected`, `onselectedchange` props
- `packages/ui/src/types/tree.ts` — same props
- `packages/ui/src/components/List.svelte` — multiselect wiring, `syncSelectedFromController()`, `isItemSelected()`, template attributes
- `packages/ui/src/components/Tree.svelte` — same pattern
- `packages/themes/src/base/{list,tree}.css` — user-select: none
- `packages/themes/src/{rokkit,glass,material,minimal}/{list,tree}.css` — selected state colors (8 files)
- `packages/states/spec/list-controller.spec.svelte.js` — 8 range selection tests
- `packages/ui/spec/List.spec.svelte.ts` — 6 multi-selection tests
- `packages/ui/spec/Tree.spec.svelte.ts` — 5 multi-selection tests
- `sites/playground/src/routes/components/{list,tree}/+page.svelte` — multiselect toggle + selected display

**Backlog:** #5 marked done
**Tests:** 1075 CI + 797 UI passing, all green

---

### 2026-02-24 — Monorepo Restructure + Legacy Cleanup

**Monorepo restructure:** Moved packages/ and sites/ under `solution/` directory. Fixed tsconfig path, undeclared workspace dependencies (7 packages), husky pre-commit hook, ESLint dependencies. Commit `cbe786d0`.

**Backlog #8 (Legacy Component Migration):** Deleted broken/unused ListEditor, NestedEditor, DataEditor. Kept FieldLayout (already migrated). Stale snapshot removed.

**Backlog #25 (bits-ui in chart):** Already removed — marked done.
**Backlog #58 (Svelte 4→5 migration):** No legacy patterns remain — marked done.

---

### 2026-02-24 — Type-Ahead Search (Backlog #11)

Implemented type-ahead search for List and Tree components.

**Changes:**

- `packages/states/src/list-controller.svelte.js` — `findByText(query, startAfterKey)`: wrapping prefix search, case-insensitive, skips disabled
- `packages/actions/src/kbd.js` — added `typeahead: false` to `defaultNavigationOptions`
- `packages/actions/src/navigator.svelte.js` — type-ahead buffer + 500ms reset timer, triggers on single printable chars (no modifiers), emits 'move' action, scrolls into view, resets on navigation actions
- `packages/ui/src/components/List.svelte` — `typeahead: true` in navigator options
- `packages/ui/src/components/Tree.svelte` — `typeahead: true` in navigator options
- `packages/states/spec/list-controller.spec.svelte.js` — 7 findByText tests
- `packages/actions/spec/navigator.spec.svelte.js` — 7 typeahead tests

**Not enabled for:** Select/MultiSelect (have filter input), Menu (transient), Toolbar/Tabs/Toggle (not applicable)

**Backlog:** #11 marked done
**Tests:** 1282 CI passing, 0 lint errors

---

### 2026-02-24 — MultiSelect Value Contract Alignment (Backlog #28)

Aligned MultiSelect with the Value Binding Contract used by Select/List/Tree.

**Before:** `value: SelectItem[]`, `onchange: (items) => void`
**After:** `value: unknown[]` (extracted primitives), `selected: SelectItem[]` (bindable full items), `onchange: (values, items) => void`

**Changes:**

- `packages/ui/src/types/select.ts` — `MultiSelectProps.value: unknown[]`, added `selected: SelectItem[]`, `onchange: (values, items)`
- `packages/ui/src/components/MultiSelect.svelte` — selection logic uses extracted values via `ItemProxy.itemValue`, `isSelected` compares primitives, `toggleItemSelection`/`removeItem` emit both values and items
- `packages/ui/spec/MultiSelect.spec.svelte.ts` — all assertions updated for primitive values
- `sites/playground/.../multi-select/+page.svelte` — `value` type to `unknown[]`
- `agents/design-patterns.md` — MultiSelect row updated to "Compliant"

**Backlog:** #28 marked done
**Tests:** 1282 CI passing, 0 lint errors

---

## 2026-02-25 — LLM Documentation Restructure

Reorganized `docs/llms/` from 13 flat files into a structured hierarchy with an index and per-item files.

**New structure (60 files):**

- `docs/llms/index.md` — master index with dependency graph, section links, common patterns
- `docs/llms/components/` — 27 files: `index.md` + one file per component
  - Interactive: List, Tree, Select, MultiSelect, Menu, Toggle, Tabs, Toolbar, Switch, Carousel, Table, Range, SearchFilter
  - Presentational: Button, BreadCrumbs, Card, Pill, ProgressBar, Rating, Stepper, Timeline, Code
  - Overlay: FloatingAction, FloatingNavigation
  - Effects: Reveal, Tilt, Shine
- `docs/llms/actions/` — 13 files: `index.md` + one file per action
  - Navigation: navigator, keyboard, navigable, dismissable
  - Gestures: swipeable, pannable
  - Visual effects: reveal, hoverLift, magnetic, ripple
  - Theming: themable, skinnable
- `docs/llms/states/` — 6 files: `index.md` + ListController, NestedController, Proxy, Vibe, Messages
- `docs/llms/forms/` — 4 files: `index.md` + form-builder, input-types, schema-layout
- `docs/llms/packages/` — 8 files: core, data, chart, themes, icons, app, cli, helpers

**Updated content:**

- All new components documented: Switch, Switch, Table, Range, SearchFilter, Stepper, Timeline, FloatingNavigation, Reveal
- All new actions documented: reveal, hoverLift, magnetic, ripple
- `themes.md` updated with 30 base CSS files (was 21)
- `data.md` updated: parseFilters note corrected (used by SearchFilter)
- Old flat files deleted (superseded by new structure)

---

### 2026-02-26 — Testbed: ProxyItem Refinements + ListWrapper + List Reference

**ProxyItem final design:**

- `#raw` / `#item` split: primitives normalised to `{ [fields.text]: raw, [fields.value]: raw }` for uniform access
- `#key` + `#level`: path identifiers with invariant `level === key.split('-').length`; root items level 1
- `snippet` field added to `DEFAULT_FIELDS` and as a getter
- `#children = $derived(#buildChildren())`: auto-wraps children as `ProxyItem[]` with propagated keys/levels
- `get(fieldName)` is pure field mapper only; control state (`expanded`/`selected`) and computed props accessed as direct properties
- `Wrapper.focusedKey` changed from class field to getter to prevent parent's own-property shadowing subclass getters

**Tests:** 78 proxy tests, 17 wrapper tests, 32 keymap tests, 49 navigator tests = 176 testbed tests, 100% coverage

**ListWrapper (`packages/testbed/src/wrapper/list-wrapper.svelte.js`):**

- Extends `Wrapper`; uses `buildProxyList` + `buildFlatView` for reactive proxy tree
- `flatView = $derived(buildFlatView(#roots))` — re-derives on any `proxy.expanded` change
- `#navigable = $derived(flatView.filter(...))` — excludes separator/spacer/disabled
- `#focusedKey = $state(null)` with getter override
- Full `IWrapper` implementation: next/prev/first/last (clamp, skip disabled/separator), expand (open or enter), collapse (close or go to parent), select (group toggles, leaf fires onselect), toggle, moveTo, findByText (prefix, wrap-around, case-insensitive)
- 66 tests covering all paths including integration scenario

**Reference List (`packages/testbed/src/ui/List.svelte`):**

- Thin rendering layer: `ListWrapper` + `use:navigator` + flat `{#each wrapper.flatView}`
- `$effect` syncs `wrapper.focusedKey` → DOM `.focus()`
- `data-accordion-trigger` on group headers → Navigator dispatches `toggle` not `select`
- Level-based indentation via `data-level` attribute
- Old `packages/ui/src/components/List.svelte` unchanged — switch export pending full validation

**Design docs updated:**

- `docs/design/002-list.md` — rewritten for ProxyItem-based design (supersedes NestedController approach)
- `docs/design/000-navigator-wrapper.md` — file paths updated to reflect testbed package

**Tests:** 1600 passing (up from 1534 — 66 new ListWrapper tests)

**Promotion plan (when design is proven):**

- `Wrapper` + `Navigator` + `keymap` → `packages/actions/src/`
- `ProxyItem` + `buildProxyList/buildFlatView` → `packages/states/src/`
- `ListWrapper` → `packages/states/src/`
- `List.svelte` → `packages/ui/src/components/List.svelte` (replacing old impl)

### Post-merge learn site fixes (2026-03-06)

**Commit `5bf3d2f3` — text→label field mapping fixes across learn site (90 files)**

After merging feature/website-redesign, the quick-wins `text→label` rename broke all
learn site demos that used `text:` as item property or field mapping key. Fixed:

- 90 files across components, data-binding, forms, composability, playground, preview
- `+layout.js`: sidebar fields `{ label: 'title', ... }`
- `playground/+layout.svelte`: `{ label: 'title', ... }`
- `CodeViewer.svelte`: `{ label: 'name', icon: 'language' }`
- `FileTabs.svelte`: `{ label: 'name', ... }`
- All tabs/tree/select/multi-select/toolbar/stepper/list demo files
- Admin preview `Tabs` not switching → added `onchange={(v) => (activeTab = v)}`
- Home page "Get Started" stale href fixed
- Root header now shows Docs + Playground nav links

### Conditional fields — showWhen (2026-03-12)

**Feature:** `showWhen` on layout elements to show/hide fields based on other field values.

**Design:** visibility is a presentation concern → lives in layout (not schema). `evaluateCondition()` is a pure function. `#buildElements()` skips hidden fields. `getVisibleData()` strips hidden keys at submit time. `#clearHiddenValidation()` clears stale blur errors when a controlling field hides another.

**Commits:**

- `04fda1f5` — `conditions.js` + `conditions.spec.js` (evaluateCondition, 9 unit tests)
- `6297c4ea` — export evaluateCondition from lib/index.js
- `37b6a0a0` — filter hidden elements via showWhen in #buildElements() (5 integration tests)
- `9e4a8105` — add notEquals inclusion test + fix schema style
- `8bf05670` — add getVisibleData() to FormBuilder (4 tests)
- `2f90197c` — style: consistent arrow parens in getVisibleData
- `e67f9a07` — add #clearHiddenValidation() + call from updateField() (1 test)
- `ca422985` — post-filter validate() results to visible paths (2 tests)
- `0bd46eee` — FormRenderer passes getVisibleData() on submit (1 test)

**Tests:** 2549 passing. 0 lint errors.

**Design doc:** `docs/superpowers/specs/2026-03-12-conditional-fields-design.md`
**Priority:** `docs/design/12-priority.md` — conditional fields ✅

**All tests: 2745/2745 passing**

### CLI Toolchain: upgrade + skin + theme commands (2026-03-18)

**Feature:** Three new CLI commands to manage Rokkit projects:

- `rokkit upgrade` — check `@rokkit/*` versions, optionally run install with `--apply`
- `rokkit skin list / skin create --name` — scaffold skin entries in `rokkit.config.js`
- `rokkit theme list / theme create --name` — scaffold custom CSS theme stubs in `src/themes/`

**Architecture:**

- All commands use injectable adapter pattern (same as `doctor.js`) for testability
- `upgrade.js`: `getRokkitPackages()`, `detectPackageManager()`, `buildInstallCommand()` are pure functions; `runUpgrade()` takes `{ readFile, exists, fetchVersion, runInstall }` adapters
- `skin.js`: `generateSkinScaffold()`, `addSkinToConfig()`, `serializeConfig()` are pure; config read via dynamic import with injectable `readConfig`/`writeConfig` adapters
- `theme.js`: `THEME_COMPONENTS` list (25 components), `generateThemeStub()` pure; `runThemeCreate()` takes `{ writeFile, exists, mkdir }` adapters
- Uses `execFileSync` instead of `execSync` to prevent shell injection

**New files:**

- `packages/cli/src/upgrade.js`
- `packages/cli/src/skin.js`
- `packages/cli/src/theme.js`
- `packages/cli/spec/upgrade.spec.js` (15 tests)
- `packages/cli/spec/skin.spec.js` (14 tests)
- `packages/cli/spec/theme.spec.js` (18 tests)

**Updated:**

- `packages/cli/src/index.js` — wired 6 new sade commands
- `site/static/llms/cli.txt` — upgrade, skin, theme sections added
- `site/src/routes/(learn)/docs/toolchain/cli/+page.svelte` — docs for all new commands + snippets
- `docs/design/12-priority.md` — Message/Alert, upgrade, skin create, theme scaffold marked ✅

**Tests:** 2632 passing (50 new CLI tests). 0 lint errors.

### Chart CSS: Base + All 10 Themes (2026-03-22)

**Feature:** Created base structural and themed CSS for chart components.

**Files created:**

- `packages/themes/src/base/chart.css` — structural styles (layout, typography, transitions)
- `packages/themes/src/rokkit/chart.css` — rokkit theme (stroke-surface-z4, fill-surface-z6, etc.)
- `packages/themes/src/minimal/chart.css` — minimal theme (stroke-surface-z3, fill-surface-z5, etc.)
- `packages/themes/src/material/chart.css` — material theme
- `packages/themes/src/glass/chart.css` — glass theme
- `packages/themes/src/ant-design/chart.css` — ant-design theme
- `packages/themes/src/bits-ui/chart.css` — bits-ui theme
- `packages/themes/src/carbon/chart.css` — carbon theme
- `packages/themes/src/daisy-ui/chart.css` — daisy-ui theme
- `packages/themes/src/grada-ui/chart.css` — grada-ui theme
- `packages/themes/src/shadcn/chart.css` — shadcn theme

**Updated:** All 11 theme `index.css` files with `@import './chart.css'` at the end.

**CSS features:**

- `[data-chart]` — wrapper container (relative, block, 100% width)
- `[data-chart-axis-line]`, `[data-chart-tick]` — axis styling (via stroke-surface-z\* classes)
- `[data-chart-tick-label]` — label sizing and typography (0.75rem)
- `[data-chart-grid-line]` — grid styling with theme-specific dasharray
- `[data-chart-legend]` — flexbox legend (gap 0.5rem)
- `[data-chart-legend-item]` — interactive legend items with hover state
- `[data-chart-label]` — annotation labels (0.6875rem, pointer-events: none)
- `[data-chart-*]` marks — bar, line, area, point, arc with transition/opacity on dimmed state

**Build:** `bun run build` succeeds. Verified: `dist/base.css` and `dist/rokkit.css` contain correct chart selectors.

**Commit:** `787f43f7` — feat(themes): add chart.css for base structure and all 10 themes

### D3 Scales Builder (2026-03-22)

**Feature:** Created scales builder module with three D3 scale factory functions.

**Files created:**

- `packages/chart/src/lib/brewing/scales.js` — scale builders (buildXScale, buildYScale, buildSizeScale)
- `packages/chart/spec/brewing/scales2.spec.js` — 6 comprehensive tests

**API:**

- `buildXScale(data, field, width, opts)` — band scale for categorical x, linear scale for numeric x
- `buildYScale(data, field, height, layers)` — linear scale from 0 to max, with layer-extended domain support
- `buildSizeScale(data, field, maxRadius)` — sqrt scale for bubble/point size encoding

**Example usage:**

```js
const xScale = buildXScale(data, 'date', 400) // → band scale
const yScale = buildYScale(data, 'revenue', 300) // → linear scale [0, maxVal]
const sizeScale = buildSizeScale(data, 'value', 20) // → sqrt scale [0, 20]
```

**Dependencies added:**

- `d3-shape@^3.2.0` — mark generators (line, area, arc, pie) for Task 7

**Tests:** 6 tests passing (6/6). Covers categorical/numeric x detection, domain extension, SVG y-axis inversion, sqrt scaling.

**Build:** Tests 2694 passing. Lint 0 errors. All pre-existing warnings only.

**Commit:** `bc6536f5` — feat(chart): add D3 scale builders (x band/linear, y linear, size sqrt)

### Chart Playground Pages Update (2026-03-23)

**Task 4 Complete:** Updated all 5 chart playground pages with full aesthetic prop controls and data visualization.

**Changes made:**

- Renamed data const to `chartData` in all 5 playgrounds (avoids conflict with `{#snippet data()}` syntax in Svelte 5)
- **Bar Chart:** `colorField`, `patternField` (both string dropdowns); defaults: legend=true, dual-coded
- **Area Chart:** Added `patternField` as string field dropdown; added curve options
- **Pie Chart:** `patternField` (string); legend default changed to true
- **Line Chart:** `symbolField` replaces boolean `symbol` prop; renamed data const from `multiData` to `chartData`
- **Scatter Plot:** `symbolField` with 'channel' and 'tier' options; dual-coded aesthetic encoding

**Data snippet implementation:**

- Each playground now includes `{#snippet data()}` block with HTML table
- Displays raw chart data with automatic column detection via `Object.keys(chartData[0])`
- Accessible via database icon button in PlaySection toolbar
- Styled with Rokkit utilities: `overflow-x-auto`, `text-xs`, border classes

**Controls & Info display:**

- FormRenderer with string field dropdowns (colorField, patternField/symbolField)
- InfoField displays for all props (shows '(none)' for empty strings)
- Lowercase labels (color, pattern, symbol, grid, legend)

**Tests:** Chart test suite: 196 tests passing (35 files)

**Commit:** `1e2afd1f` — feat(playground): ggplot-style aesthetic fields + data tables in chart playgrounds

### Plan B Complete: BoxPlot, ViolinPlot, BubbleChart + Aesthetic Channel Fix (2026-03-23)

**Plan B complete.** Three new chart types added to `@rokkit/chart`:

**BoxPlot (`packages/chart/src/charts/BoxPlot.svelte`)**

- `BoxBrewer` overrides `transform()` to compute quartile stats (q1, median, q3, iqr_min, iqr_max) via `@rokkit/data` groupBy/summarize
- `buildBoxes` mark builder computes box geometry, whisker lines, median line
- `fill` channel → box body color, `color` channel → whisker/outline stroke (independent, null = not applied)
- Commits: `e8f87aea`, `ad7f18aa`, `c5a609de`

**ViolinPlot (`packages/chart/src/charts/ViolinPlot.svelte`)**

- `ViolinBrewer` mirrors BoxBrewer transform; adds `violins = $derived(...)` field
- `buildViolins` creates closed SVG path using `curveCatmullRom` from 5 quartile anchor points mirrored left/right
- `DENSITY_AT = { iqr_min: 0.08, q1: 0.55, median: 1.0, q3: 0.55, iqr_max: 0.08 }` drives width at each anchor
- Commits: `80264c9e`, `e1972f43`, `eac4f388`

**BubbleChart (`packages/chart/src/charts/BubbleChart.svelte`)**

- Uses `ChartBrewer` directly (size channel + sizeScale already in base)
- `size` prop drives radius via sqrt scale; `color` + `symbol` aesthetics supported
- Commit: `f35c7a6a`

**ggplot2-style Aesthetic Channel Fix**

- `fill` → polygon interior (BarChart, AreaChart, PieChart); `color` → stroke/line (LineChart, ScatterPlot)
- All aesthetic channels null-default with NO cross-channel fallbacks (ggplot2 convention)
- Removed `pattern ?? fill` fallback from all polygon charts
- `bars.js`: `fillKey = ff ? d[ff] : xVal`, `strokeKey = cf ? d[cf] : null` — independent
- Commits: `d2c87ed8`, `5431fd8f`

**Playground pages:** box-plot, violin-plot, bubble-chart added to site.

**Final state:** 2791 tests passing, 0 lint errors.

**Future work tracked:**

- Horizontal BarChart (issue #108)
- Stacked/grouped BarChart (issue #109)
- Static color literal support (issue #110)
- AnimatedChart / bar chart race via `createFrames()` + `useAnimation()` (issue #101)

## 2026-03-26 — Chart System Completion (Session 2)

**Interactive Tooltips, Click Selection, Keyboard Navigation**

- `plotState.setHovered(data)` / `clearHovered()` already on PlotState; `Tooltip.svelte` renders at mouse position
- Area.svelte: added invisible hit circles (`<circle r="8" fill="transparent">`) per data point for tooltip hover
- Box.svelte: added `role="presentation"` + hover handlers to box body rect
- Violin.svelte: added `role="presentation"` + hover handlers to violin path
- Bar.svelte: added `onselect` + `keyboard` props; `use:keyboardNav` on rect elements
- Point.svelte: added `onselect` + `keyboard` props; both path and circle elements get `role="button"` when interactive
- Line.svelte: added `onselect` + `keyboard` props; hit circles updated with interactive roles
- Arc.svelte: added `onselect` prop; fires with `{ ...arc.data, '%': '...' }`
- `packages/chart/src/lib/keyboard-nav.js` (new): Svelte action; ArrowLeft/ArrowRight between `[data-plot-element]` siblings in `[data-plot-geom]` container

**Pattern Fills for Series**

- Feature already complete; marked done in priority doc (21 patterns, `pattern` channel on Bar + Area)

**Zoom and Pan**

- `d3-zoom` added as dependency (`packages/chart/package.json`)
- `PlotState`: `#zoomTransform = $state(null)`; `xScale` applies `rescaleX` for non-band scales; `yScale` applies `rescaleY`; `applyZoom(transform)` + `resetZoom()` methods
- `Plot.svelte`: `zoom` prop (default false); d3-zoom behavior attached to SVG via `$effect`; `style:cursor="grab"` when zoom active; cleanup on destroy

**Final state:** 3161 tests passing, 0 lint errors.

## 2026-03-27 — Multi-Step Forms, StepIndicator, Theme Rename, Frosted Revamp

**Multi-Step Forms**

- `FormBuilder` extended: `isMultiStep`, `totalSteps`, `currentStep`, `canAdvance`, `next()`/`prev()`/`goToStep()`, `validateStep()`
- `StepIndicator.svelte` new presentational component — `data-step-indicator` ol, `data-step-item` li, `data-step-state` (complete/current/upcoming), `data-step-number`, `data-step-label`; keyboard accessible (complete steps are buttons)
- `FormRenderer.svelte` updated: step-aware rendering, Prev/Next/Submit buttons, `data-form-step` + `data-form-step-content` data attributes
- 28 tests in `spec/MultiStep.spec.svelte.js`
- Learn docs: `site/src/routes/(learn)/docs/forms/multi-step/+page.svelte` with 3 code snippets
- Playground: multi-step tab in `site/src/routes/(play)/playground/components/forms/+page.svelte`
- Commits: `c34d0409`, `5a8d9a0f`

**StepIndicator Theme CSS**

- `packages/themes/src/base/step-indicator.css` — structural layout (flex, connectors, circle sizing)
- All 10 theme variants created: rokkit, minimal, material, frosted, shadcn, daisy-ui, bits-ui, ant-design, carbon, grada-ui
- Theme-specific shapes: carbon=square (radius 0), ant-design=4px, bits-ui=0.5rem, shadcn=rounded-md
- Commit: `ec0634d9`

**Glass → Frosted Theme Rename**

- Folder renamed: `src/glass/` → `src/frosted/`, all selectors `[data-style='glass']` → `[data-style='frosted']`
- `build.mjs`, `src/index.css`, CLI (init.js, doctor.js, specs), site files, e2e helpers all updated
- 6 extra themes (ant-design, bits-ui, carbon, daisy-ui, shadcn, grada-ui) added step-indicator.css
- Commit: `e723384f`

**Frosted Theme Liquid Glass Revamp**

- Replaced `bg-surface-z*/70` with `color-mix(in srgb, var(--color-surface-z4) 28%, transparent)` for proper translucency
- Specular border highlights: `border-color: rgba(255,255,255,0.2-0.28)` on all surfaces
- Inset glass shine: `box-shadow: inset 0 1px 0 rgba(255,255,255,0.18-0.25)` on button/card/switch/input
- `backdrop-blur-xl` on buttons/triggers; `backdrop-blur-2xl` on panels (dropdown, menu)
- Colored variants (primary/secondary/accent/danger): 60% `color-mix` saturation + white specular border
- Files: button.css, card.css, dropdown.css, menu.css, switch.css, input.css
- Commit: `c2c0dd36`

**Final state:** 3189 tests passing, 0 lint errors.

## 2026-03-27 (continued)

**Density System**

- Created `packages/themes/src/base/density.css` — three CSS custom property scales:
  - `compact`: tighter spacing (xs=0.125rem, sm=0.25rem, md=0.5rem), icons 1rem, smaller radius
  - `comfortable` (default / `:root`): baseline (xs=0.25rem, sm=0.5rem, md=0.75rem), icons 1.25rem
  - `cozy`: spacious (xs=0.375rem, sm=0.625rem, md=1rem), icons 1.5rem, larger radius
- Imported `density.css` first in `base/index.css` so tokens cascade to all components
- Updated 5 components to use `var(--density-*)` instead of hardcoded values:
  - `button.css`: md/default height (`calc(icon-size + spacing-sm * 2)`), padding-inline, font-size, gap
  - `list.css`: item padding-block/inline, font-size, line-height, gap; group label sizes
  - `menu.css`: trigger height, item padding/font-size/gap, group padding
  - `dropdown.css`: trigger height, option padding/font-size/line-height
  - `card.css`: header/body/footer padding, border-radius → density-radius-base
- Explicit `data-size` variants (sm/lg) remain hardcoded — independent override axis
- Added density switcher (compact/comfortable/cozy buttons) to themes playground
- Commit: `ad205f93`

## 2026-03-27 (continued) — i18n MessagesStore + Component Blueprint + design-patterns polish + CrossFilter in MarkdownRenderer

**i18n MessagesStore class**

- Rewrote `packages/states/src/messages.svelte.js` to use a `MessagesStore` class with `$state` fields, `get locale()` getter, `register()`/`setLocale()`/`set()`/`reset()` methods
- `export const messages = new MessagesStore()` — single named export; all other functions removed from `index.js`
- `Object.assign(this, computed)` for in-place mutation (Svelte 5 forbids `$derived` exports and reassignable `$state` exports)
- Updated all 28+ `@rokkit/ui` components from `messages.current.*` → `messages.*`
- Commits: `cb5335b3`, `6509d1a5`, `02c6632a`

**Component Blueprint**

- Created `docs/llms/component-blueprint.md` — single comprehensive LLM reference for all 4 tiers, ProxyTree/Wrapper/Navigator wiring, messages integration, snippet customization, theme CSS, file checklist, complete Tier 3 TagList example
- Updated `/.claude/commands/new-component.md` and `edit-component.md` to reference blueprint instead of 5-file read chain
- Commit: `6509d1a5`

**design-patterns.md polish**

- Navigator/Wrapper section: ProxyTree as 4th layer, `new Wrapper(tree, { onselect })`, `node.type`/`node.hasChildren`, `snippets` from `$props()` spread, `resolveSnippet` with constants, `proxy.original`
- Snippet Customization: `proxy.text` → `proxy.label`, `$$snippets` → `snippets`
- class prop: `class="{x}"` → `class={x || undefined}`
- Value Binding Contract: `options` → `items`, `text` → `label` in examples
- Removed all "Tree (planned)" — Tree is fully implemented
- Commits: `e1e41390` (earlier pattern fixes), `e1e41390`

**CrossFilter grouping in MarkdownRenderer**

- Added optional `crossfilterWrapper?: Component<{ children?: Snippet }>` prop to `MarkdownRenderer.svelte`
- Pre-pass groups plot code blocks with matching `"crossfilter"` field values into a shared wrapper instance
- Injectable design keeps `@rokkit/ui` dep-free from `@rokkit/chart` — consumers pass `CrossFilter` from `@rokkit/chart` at call site
- 4 new tests: group wrapping, separate groups, ungrouped passthrough, no-wrapper fallback
- `CrossFilterStub.svelte` test fixture added
- Commit: `73854f5e`

**Final state:** 3206 tests passing, 0 lint errors.

## 2026-04-29 — Phase 4: Design Token System (Complete)

**Summary:** Extended @rokkit/core, @rokkit/themes, @rokkit/unocss, and @rokkit/ui with the new design token architecture. Wired all tokens into the demo app and verified in browser.

**Tertiary color + nullable resolution**
- Added `tertiary: 'violet'` to `DEFAULT_THEME_MAPPING` in constants.js
- Added `tertiary` to `defaultPalette` in colors/index.ts
- Added `tertiary` to `DEFAULT_CONFIG.colors` in unocss/config.js
- Implemented `resolveColors()` in theme.ts with fallback chain: tertiary→primary, secondary→primary, accent→primary, error→danger
- Updated Theme constructor and mapping setter to call `resolveColors()`
- 8 new tests (3 tertiary existence + 5 nullable resolution)
- Commits: `3d533bbe`..`cd500184`

**Roundedness axis**
- Created `packages/themes/src/base/radius.css` — 4 presets: sharp, soft (default), rounded, pill
- Each preset defines `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`
- Decoupled from density: removed hardcoded fallbacks in `density.css`, now references `--radius-*` directly
- Added `soft` preset to `RADIUS_PRESETS` in unocss/preset.ts
- Commit: `3d533bbe`, `55240bbf`

**Layout tokens**
- Created `packages/themes/src/base/layout.css` — 8 tokens: sidebar-width (240px), sidebar-collapsed (64px), header-height (56px), content-max-width (1280px), section-gap, section-padding, content-padding, card-gap
- Commit: `3d533bbe`

**Gradient border wrapper**
- Created `packages/themes/src/base/gradient-border.css` — structural pattern: outer element with gradient bg + padding as "border", inner element covers content
- Fallback rule for non-gradient themes uses standard border
- Commit: `6eddb226`

**Literal icon support**
- Added `isIconClass()` to `@rokkit/core/utils.js` — returns true for `i-*` CSS class strings, false for kanji/emoji/text
- Updated `ItemContent.svelte` to branch: CSS class icons → `[data-item-icon]`, literal text → `[data-item-icon-literal]`
- Added base CSS for `[data-item-icon-literal]` in item.css (flex-shrink, centered, density-icon-size)
- 3 new tests for isIconClass
- Commit: `4b527027`

**Demo app wiring**
- Added `tertiary: 'violet'` and `shape: { radius: 'soft' }` to demo/rokkit.config.js
- Replaced hardcoded `240px`/`64px` sidebar widths with `var(--layout-sidebar-width)`/`var(--layout-sidebar-collapsed)` in layout.svelte
- Replaced hardcoded `--radius: 6px` with `var(--radius-md)` in app.css
- Added `data-radius="soft"` to app root div
- Commit: `500b1b04`

**Browser verification**
- All tokens confirmed live in browser dev tools (layout, radius, tertiary color)
- Radius axis responsive: sharp→0, soft→0.375rem, rounded→0.5rem, pill→9999px
- Sidebar collapse works via layout tokens (240px → 64px)
- All 4 screens render correctly (Observatory, Sessions, Setup, Settings)
- No visual regressions

**Final state:** 3292 tests passing (245 files), 30 e2e tests passing, 0 new lint errors.

## 2026-05-07 — Phase 6: Component Migration (Batch 1)

**Summary:** First batch of custom → @rokkit/ui component swaps in the demo app.

**Migrations completed:**
- Sessions filter pills → `<Tabs bind:value={activeFilter}>` + `<Tabs bind:value={activeProject}>`
  - Options as `{label, value}` objects for i18n-translated 'all' label
  - Empty `tabPanel` snippet suppresses panel rendering (filter-only use case)
  - Filtering confirmed working in browser
- Setup wizard bottom nav → `<Button style="outline">` (Back) + `<Button>` (Continue/Enter)
- Setup wizard add-folder → `<Button type="submit">`
- Observatory koan hero → `<Button label={m.koan_action()}>`
- zen-sumi stepper.css: added missing active/completed state styles for `[data-stepper-step]`

**Deferred:**
- Session rows: custom 6-col grid is readable; Table/List migration adds little value for display-only rows
- Retro cards: tone-specific top border (color-mix inline style) doesn't map to Card.variant cleanly
- Wizard rail → Stepper: custom card-style rail doesn't match base Stepper's circle-connector layout
- Sidebar nav: complex (URL active state, collapse, links, footer items) — next batch

**Final state:** 3321 tests passing (245 files), 0 lint errors.
**Commits:** `a912e652`

## 2026-05-08 — Phase 6: Component Migration (Batch 2 + Bug Fix)

**Summary:** Completed Phase 6 component migration and fixed a critical theme initialization bug.

**Sidebar nav → `<List>`**
- `layout.svelte` uses `<List>` with `href` field mapping — items render as `<a data-list-item>` with `aria-current`
- `findActiveId()` derives active item from `page.url.pathname` via `startsWith` matching
- `ListItem.svelte` — new custom snippet: handles kanji literal icons, badges, `collapsed` prop for icon-only mode
- `getSidebarNav()` in `navigation.ts` flattens project groups via `children` field
- `list.css` size="sm" override: 13px / 7px padding; group labels tiny-caps; badge transparent; wiz-steps stepper variant

**Wizard rail → `<List>` (wiz-steps)**
- `setup/+page.svelte` uses `<List class="wiz-steps">` with `wizardItems` driving `status` field
- `ListItem.svelte` wizard mode: done=✓ fade-in, current=description + expanded padding, pending=muted + disabled
- `list.css` `.wiz-steps`: reserved transparent border prevents layout shift; pending steps suppress hover

**Retro cards → `<Card>`**
- `sessions/+page.svelte` migrated to `<Card class="retro-{tone}">`
- `card.css` adds `retro-good`, `retro-warn`, `retro-mute` — tone-coded `border-top` via CSS class (same `color-mix()` values as original inline styles)
- No `header` snippet used → avoids unwanted divider border; content in default `children` slot

**Bug fix: zen-sumi theme not activating**
- Root cause: `app.html` inline script defaulted `data-style` to `''` (empty string)
- All zen-sumi CSS is scoped to `[data-style='zen-sumi']` — with empty string, no hover, active, or focus styles applied
- Fix: `b.dataset.style = t.style || 'zen-sumi'` — zen-sumi is now the default for new sessions
- Verified: hover effects, active item highlight, tab active state all confirmed working in browser

**Final state:** 3321 tests passing (245 files), 0 lint errors. Phase 6 complete.

## 2026-05-22 — Koan C4: Theme Wizard response screen

**Summary:** Implemented mockup C4 — the theme wizard mounted as a `<ChatResponse>` artifact on the canvas, triggered by theme/skin/palette/brand queries.

**Files**
- `demo/src/routes/app/+page.svelte` — extended `demoType` to `'tabs' | 'theme-wizard' | null`. Replaced the hardcoded `demoType = 'tabs'` with `pickDemoKind(query)`, which routes via `runMatch` from the existing catalog (theme-wizard already indexed with the right keywords). Added chat-left branch with YOU / STARTED / GLOSSARY messages + wizard chips. Added canvas branch with eyebrow "Theme wizard · live preview", title "Build a theme · step 02 of 04", and a `<ChatResponse>` (kicker=WIZARD, name=`<ThemeWizard/>`, meta=`· step 02 · skin`, propsRow=`style {style} · palette warm-gray + shu · dual-mode yes`, actions=Save preset / Export tokens.css / Preview live) wrapping the new `ThemeWizardCard`. Added small `.glossary` `:global` styling for the bullet list inside `ChatMessage`.
- `demo/src/lib/koan/demos/theme-wizard/ThemeWizardCard.svelte` — new static-display component for step 02. Horizontal stepper (01 Style done → 02 Skin active → 03 Typography → 04 Preview & export), 4-card palette grid (warm-gray, slate, neutral, shu — first two IN USE), and 7-row role table (paper, paper-2, paper-3, edge, ink, ink-2, accent) with light/dark `PaletteStepPicker` cells (`data-active` toggled by `mode` prop, selected step outlined with the accent color).
- `demo/src/routes/chat-lab/+page.svelte` — dropped 4 pre-existing lint errors (3 `{#snippet children()}` wrappers + 2 `console.log` debug calls) so the repo returns to 0 lint errors.

**Decisions**
- Chose the lighter "static display" path over reusing the existing 4-step interactive wizard. The chat-shell context is an artifact card, not an interactive flow — the mockup only renders step 02. Real save/export/Stage-by-stage navigation deferred per the backlog spec.
- IN USE badge stays on palettes 0 + 1 (warm-gray + slate) per the mockup JSX, even though the propsRow says "warm-gray + shu". The mockup has the same inconsistency; not worth fixing in the static demo.
- `mode` prop pipes through from `theme.mode` (already `$derived` in `+page.svelte`) so toggling mode in the chrome reactively swaps which picker column is highlighted.

**Verification**
- `bun run lint` — 0 errors (down from 7), 15 warnings (pre-existing).
- `bun run test:ci` — 3480 / 3480 passing.
- Browser: confirmed "Theme to my brand" welcome chip routes to theme-wizard; "Tabs · 5 panes" still routes to Tabs. Wizard renders with the full stepper, palette grid, and role table.

## 2026-05-22 (cont.) — /app refactor: layout + sub-routes (incl. C5)

**Summary:** Split the single-page `/app` chat shell into a layout + state-setter sub-routes. URLs now drive demo selection; bookmarkable showcases. Stage C5 (dark + collapsed showcase) ships on top of this as `/app/tabs?mode=dark&collapsed=true`.

**Files**
- New `demo/src/lib/koan/shell.svelte.ts` — shared `$state` module with `phase`, `demoType`, `lastQuery`, `collapsed`, `composerValue` + `setShellResponse(kind)` / `setShellWelcome()` helpers.
- `demo/src/routes/app/+page.svelte` → renamed to `+layout.svelte`. Replaced local `$state` with `shell.*`. Replaced `setTimeout` → state-mutation with `setTimeout` → `goto(DEMO_ROUTE[kind])`. `startNewConversation` calls `goto('/app')`. URL-param handling: `?mode=light|dark`, `?collapsed=true|1`, `?q=...` read once in layout `onMount`. The layout's `{@render children?.()}` renders the active sub-route's empty marker page.
- New `demo/src/routes/app/+page.svelte` — onMount calls `setShellWelcome()`.
- New `demo/src/routes/app/tabs/+page.svelte` — onMount sets `shell.demoType='tabs'`, defaults `lastQuery` to "Show me how Tabs work" for direct nav.
- New `demo/src/routes/app/wizard/+page.svelte` — onMount sets `shell.demoType='theme-wizard'`, defaults `lastQuery` to "Theme for our brand".
- `docs/design/12-priority.md`, `docs/backlog/2026-05-22-koan-dark-collapsed-showcase.md` — C5 marked Shipped with the new URL form.

**Decisions**
- Shared `$state` module rather than context. Simpler, type-safe, no setContext/getContext dance, and the chat shell is a single application — no isolation concerns.
- Layout renders all branched content; pages are state-setters. Alternative was three-slot snippets via context — significantly more boilerplate for the same outcome.
- C5's URL became `/app/tabs?mode=dark&collapsed=true` instead of the original spec's `/app?demo=tabs&mode=dark&collapsed=true`. Tabs is now a real route so `?demo=` is redundant. The `mode` + `collapsed` params remain because they affect layout-level chrome state, not the canvas content.
- Browser back/forward verified working: chip → goto(/app/tabs) → history.back() restores to /app welcome state.

**Verification**
- `bun run lint` — 0 errors, 16 warnings (one extra pre-existing complexity warning vs the prior baseline; no new errors introduced).
- `bun run test:ci` — 3480 / 3480 passing.
- Browser: `/app` (welcome), `/app/tabs` (Tabs response), `/app/wizard` (Theme wizard), `/app/tabs?mode=dark&collapsed=true` (C5 showcase) all render correctly. Back nav works.

## 2026-05-22 (cont.) — Visual polish + sidebar collapse rework

Small follow-on adjustments after the C4 ship:

- `demo/src/lib/chat/styles/chat.css` — message connector now uses `--ink-soft × 0.45` (was `--ink-faint × 0.5` — invisible against zen-sumi paper). `[data-chat-chrome-prefs]` outer wrapper border + background dropped (style pill and density trio carry their own borders). Removed `[data-chat-chrome-traffic]` selectors + the brand's compensating `margin-left: 8px`.
- `demo/src/lib/chat/components/ChatChrome.svelte` — removed `hideTrafficLights` prop + traffic-light markup entirely (the shell isn't a macOS window).
- `demo/src/lib/chat/components/ChatSidebar.svelte` — when collapsed, the `+` new-conversation button moves out of the header and renders as a 32×32 action tile at the top of the scroll area. The footer is hidden entirely when collapsed (no more "9 conversations" text overflowing 48px column). The collapse-toggle sits alone in the header.
- `demo/src/lib/chat/styles/chat.css` — replaced the old `[data-collapsed] [data-chat-sidebar-new]` rule with `[data-collapsed-action]` styling that matches the conv-mini tile rhythm. Removed the obsolete `[data-collapsed] [data-chat-sidebar-footer]` rule.
- `demo/src/lib/koan/demos/theme-wizard/ThemeWizardCard.svelte` — dropped the `border-bottom` under the horizontal stepper (matches the mockup, which uses section spacing rather than a divider).
- `demo/src/routes/+page.svelte` — removed the `@rokkit/chat` package entry from the landing page (chat components stay in `demo/src/lib/chat/`, promoted into `@rokkit/ui` after API validation, per the existing decision).
- `demo/src/routes/chat-lab/+page.svelte` — cleaned up 4 pre-existing lint errors (3 useless `{#snippet children()}` wrappers, 2 console.log debug calls) and the now-stale `hideTrafficLights={false}` pass-through.

## 2026-05-22 (cont.) — Decision: Koan is the canonical demo

Closed out the `demo/` showcase item per the open-question phrasing in `docs/design/12-priority.md`.

**Decision:** the Koan shell (chat panel + canvas) is the canonical demo for `@rokkit/ui`. The original business-analytics spec (dashboard / data explorer / analytics / operations / notifications + curtain-reveal code drawer) is superseded and will not be built.

**Why**
- The Koan shell has already proven, through C3 + C4 + C5, that the chat-first framing reads as a coherent demo: "ask for a component, see it mounted on the canvas with source + style chrome".
- Chat-first is a stronger story for an AI-era component library than a generic business dashboard. The analytics framing predates the AI/chat pivot.
- Maintaining two demos (chat + analytics) would split design attention and double the surface area for every theme/density/locale change.
- The components that *would* benefit from a non-chat surface (charts, tables, dashboards) can still be demonstrated inside the Koan canvas as response artifacts — they're not blocked by the framing.

**Follow-on backlog items (now tracked under P2 / Demo App)**
- Koan catalog expansion — table, tree, multi-select, list, combo as `/app/<demo>` sub-routes. Several welcome chips already point at these (currently fall back to Tabs).
- Interactive theme wizard (D1–D3) — wire the static C4 card to the existing theme-store primitives so swatches actually mutate.
- `apps/` restructure — now unblocked. `site/`→`apps/learn/`, `demo/`→`apps/demo/`, single structural commit.

No files changed by this entry beyond `docs/design/12-priority.md` and this journal.

## 2026-05-22 (cont.) — Koan catalog: Table demo added

Started the Koan catalog expansion (first item under the Demo App backlog). Added a sortable Products table as `/app/table`.

**Files**
- New `demo/src/lib/koan/demos/table/meta.ts` — DemoMeta with keywords (table, data, sortable, columns, rows, sort, grid, tabular, spreadsheet, list, records, dataset). Icon: 表.
- New `demo/src/lib/koan/demos/table/placeholder.svelte` — minimal mounted-component file so the `load` field of DemoMeta resolves; not actually mounted by the layout (the layout owns rendering), kept for symmetry with existing demos.
- `demo/src/lib/koan/catalog.ts` — registered table.
- `demo/src/lib/koan/shell.svelte.ts` — extended ShellDemoType union with `'table'`.
- `demo/src/routes/app/+layout.svelte` — extended DemoKind union, DEMO_ROUTE, pickDemoKind. Added table sample data (Products: name/price/stock), table code snippet, chat-left branch (YOU / MOUNTED / EXPLAINED / TRY messages), canvas branch (ChatResponse with name=`<Table/>`, rows/columns/sortable propsRow, Copy code / Download actions, real Table + CodeBlock). Added `.table-mount` CSS rule.
- New `demo/src/routes/app/table/+page.svelte` — state-setter; defaults lastQuery to "Sortable data table" on direct nav.

**Verification**
- lint: 0 errors, 16 warnings.
- Browser: `/app/table` direct nav renders correctly; "Sortable data table" welcome chip routes to `/app/table` via runMatch; clicking Price column header sorts rows ascending (Mouse 59 → Laptop 1299).

**Note on TreeTable**
The user mentioned a TreeTable component exists, but I could only find a `TreeTable` *data type* in `packages/data/src/types.d.ts` — no `TreeTable.svelte` component. The user clarified that `Table.svelte` "supports both"; its docstring says "Supports flat tables", and I didn't find a hierarchy/children prop. Starting with flat data here; if hierarchical Table rendering is supported via column snippets or a wrapping pattern, a separate hierarchical-table demo can be added later.

## 2026-05-22 (cont.) — Koan catalog: Tree demo added

Added a hierarchical Tree demo at `/app/tree` with a file-tree shape (src + docs + package.json + README.md, with src nested 2 levels deep into components/ + utilities/).

**Files**
- New `demo/src/lib/koan/demos/tree/meta.ts` + placeholder.svelte. Keywords: tree, hierarchy, nested, select, folder, navigation, directory, outline, parent, child, children. Icon: 枝.
- `catalog.ts` — registered.
- `shell.svelte.ts` — ShellDemoType union extended with `'tree'`.
- `+layout.svelte` — imported Tree; extended DemoKind / DEMO_ROUTE / pickDemoKind; added treeItems sample data, treeFields, treeValue $state, treeCode snippet; chat-left branch (YOU / MOUNTED / WHEN TO USE / TRY); canvas branch with ChatResponse + CodeBlock. New `.tree-mount` CSS rule.
- New `demo/src/routes/app/tree/+page.svelte` state-setter.

**Notable**
- The MOUNTED message includes a "WHEN TO USE" panel: Tree for multi-level hierarchy (file systems, org charts); List with collapsible groups for shallow 1–2 level grouping where the groups are headings, not the focus. This came from the user's clarification mid-session that List handles "groups, collapsible groups, flat one level or mixed 1/2 levels". Helps users pick the right component before mounting.
- Welcome chip "Tree select" now resolves correctly (was falling back to Tabs).

**Verification**
- Lint: 0 errors, 16 warnings.
- Browser: `/app/tree` direct nav renders folders + files; clicking `src` expands to show `components`, `utilities`, `index.ts`.

## 2026-05-23 — Koan catalog: MultiSelect demo + canvas scroll fix + zen-sumi table dark-mode fix

**Demo: MultiSelect with chips**

- New `demo/src/lib/koan/demos/multi-select/` (meta.ts + placeholder.svelte). Keywords: multi, multi-select, multiple, select, pick, choose, chips, tag, options, checkbox, combo. Icon: 選.
- `catalog.ts` — registered as the 6th demo.
- `shell.svelte.ts` — ShellDemoType union extended with `'multi-select'`.
- `+layout.svelte` — imported MultiSelect; extended DemoKind / DEMO_ROUTE / pickDemoKind; added colorItems sample data (8 rainbow colors), selectedColors $state (red + blue pre-picked), multiSelectCode snippet; chat-left branch (YOU / MOUNTED / EXPLAINED / TRY); canvas branch with ChatResponse showing live selection count + value list in propsRow, CodeBlock below.
- New `demo/src/routes/app/multiselect/+page.svelte` state-setter.
- Welcome chip "Multi-select with chips" now resolves correctly (was falling back to Tabs).

**Fix: canvas scroll for response demos**

User reported the canvas wasn't scrollable — Table preview's CodeBlock went off-screen and couldn't be reached. Root cause: `.canvas-body` is `flex: 1` (bounded by canvas height) but its content can exceed that; `.canvas { overflow: auto }` doesn't kick in because the flex layout treats body's allocated height as the canvas's content height. Fix: added `overflow-y: auto` to `.canvas-body.response`, making the body itself the vertical scroll container.

**Fix: zen-sumi table headers invisible in dark mode**

User reported headers in the table are almost invisible in dark mode. Root cause: `packages/themes/src/zen-sumi/table.css` used `text-paper-edge` (a paper-tone color) for text-on-paper at five sites — header, sort icon, empty state, cell icon, responsive cell label. Paper tones against paper background are by definition near-invisible. Fix: changed all five to ink-soft / ink-faint (ink tokens are the correct family for text). Rebuilt themes. Other themes (rokkit, minimal, material, frosted) don't have this bug.

**Verification**
- Lint: 0 errors, 16 warnings.
- Browser: `/app/multiselect` renders correctly; trigger shows "2 selected from 8" with red + blue pre-picked. `/app/table?mode=dark` headers (NAME / PRICE / STOCK) are legible. Resizing window to 500px height confirms `.canvas-body.response` becomes scrollable (`scrollHeight > clientHeight`).

## 2026-05-23 (cont.) — Koan catalog: List with collapsible groups + flex-shrink fix

**Demo: List with collapsible groups**

- New `demo/src/lib/koan/demos/list/` (meta.ts + placeholder.svelte). Keywords: list, menu, sidebar, group, collapsible, expand, section, category. Icon: 列.
- `catalog.ts` — registered as the 7th demo.
- `shell.svelte.ts` — ShellDemoType union extended with `'list'`.
- `+layout.svelte` — imported List; extended DemoKind / DEMO_ROUTE / pickDemoKind; added listItems sample data (3 groups: General / Appearance / Advanced, each with 2–3 items), listValue $state, listCode snippet; chat-left branch (YOU / MOUNTED / WHEN TO USE / TRY); canvas branch with ChatResponse + CodeBlock. New `.list-mount` CSS rule.
- New `demo/src/routes/app/list/+page.svelte` state-setter.
- The MOUNTED chat-left message includes a "WHEN TO USE" panel — counterpoint to the same panel in the Tree demo. List with collapsible groups for shallow grouping where items are the focus; Tree when hierarchy is the point.

**Fix: canvas-body children flex-shrink**

User reported the CodeBlock shrinks when the List expands, because flex children default to `flex-shrink: 1`. Added `:global(.canvas-body.response > *) { flex-shrink: 0 }` so the response card and code block hold their natural heights, and overflow triggers the body's vertical scroll. The `:global` is required — without it Svelte's scoped CSS doesn't reach the CodeBlock (which comes from another component file).

**Backlog**
- `docs/backlog/2026-05-22-tree-table-and-table-simplification.md` (added by user this session) — committed alongside this work for record-keeping.

**Verification**
- Lint: 0 errors, 16 warnings.
- Browser: `/app/list` renders 3 collapsible groups; the WHEN TO USE callout explains the List vs Tree trade-off; at a 500px-tall viewport the body becomes scrollable (clientH 298 → scrollH 928) and the CodeBlock holds its full 595px height instead of being compressed.

## 2026-05-23 (cont.) — Toasts demo + interactive Koan mode draft

**Demo: Toast notifications**

- `demo/src/lib/koan/demos/toasts/` already had meta + index.svelte; the catalog had registered it but no route existed.
- New `demo/src/routes/app/toasts/+page.svelte` state-setter.
- `shell.svelte.ts` — ShellDemoType union extended with `'toasts'`.
- `+layout.svelte` — imported Button + AlertList from `@rokkit/ui` and `alerts` from `@rokkit/states`; extended DemoKind / DEMO_ROUTE / pickDemoKind; added showToast handler + per-tone messages, toastsCode snippet; chat-left branch (YOU / MOUNTED / EXPLAINED / TRY emphasizing imperative-not-declarative); canvas branch with ChatResponse hosting AlertList + four trigger buttons (success / warning / error / info), Clear-all action that calls alerts.clear(), CodeBlock below. `.toasts-mount` + `.toast-buttons` CSS.
- New welcome chip "Toast notifications" added to buildChips so the demo is discoverable from welcome.
- Welcome chip routes via runMatch through the existing toast keywords in the catalog meta.

**Backlog draft: interactive Koan mode**

`docs/backlog/2026-05-23-interactive-koan-mode.md` — architecture for moving Koan from static catalog + lexical match to LLM-driven intent routing. Three intent classes (show me / how-to / refine). The centerpiece is **response compositions**: each chat response is an ordered list of blocks (text / code / component / comparison), and the LLM picks `inline_capable` components from a whitelist + provides JSON props matching a schema. The LLM never writes Svelte source; the renderer stays deterministic.

Two phases:
- Phase 1: server-side LLM (Anthropic / OpenAI) via SvelteKit endpoint
- Phase 2: in-browser LLM via transformers.js or web-llm — zero API cost, full privacy, offline after first download. Per user direction, this is the preferred long-term path.

Memory updated at `~/.claude/projects/-Users-Jerry-Developer-rokkit/memory/project_koan_interactive_mode.md` so future sessions can pick this up.

**Verification**
- Lint: 0 errors, 17 warnings (one new max-lines-per-function warning on the layout's growing per-demo branch — pre-existing pattern).
- Tests: 3480/3480.
- Browser: `/app/toasts` direct nav renders four trigger buttons; clicking "Show success" pushes a green-bordered toast at top-right. Welcome chip "Toast notifications" routes to `/app/toasts`.

**Catalog state (7 routes, 7 demos):** tabs, table, tree, multi-select, list, toasts, theme-wizard. All seven build-chips on the welcome page now resolve correctly.

## 2026-05-23 (cont.) — Koan catalog: Form demo + /app/wizard → /app/theming

**Demo: schema-driven form**

- New `demo/src/lib/koan/demos/form/` (meta + placeholder). Keywords: form, input, schema, validation, sign-up, contact, json-schema. Icon: 入.
- New `demo/src/routes/app/form/+page.svelte` state-setter.
- `catalog.ts` + `shell.svelte.ts` + `+layout.svelte` — wired through.
- Sample schema: name (required), email (required, format=email), role (enum=admin/editor/viewer/user), newsletter (boolean). Demonstrates the four most common input renders.
- Chat-left messages emphasize "schema in, form out" — no per-input boilerplate, required/format/enum drive rendering and validation automatically.
- "Schema-driven form" welcome chip added.

**Route rename: /app/wizard → /app/theming**

Per Jerry: `/app/wizard` was too generic given a real Wizard component may exist later. The theme-wizard demo is specifically about *theming*, so the route should reflect that.

Renamed via `git mv demo/src/routes/app/wizard demo/src/routes/app/theming`. Updated:
- `+layout.svelte` — `DEMO_ROUTE['theme-wizard']` from `/app/wizard` to `/app/theming`.
- `docs/backlog/2026-05-23-interactive-koan-mode.md` — references updated.

Historical journal entries (where the route WAS `/app/wizard`) left as-is — they're a record of what was committed at the time, not forward-looking spec.

**Verification**
- Lint: 0 errors, 17 warnings.
- Browser: `/app/form` direct nav renders name/email/role/newsletter fields with validation. `/app/theming` direct nav renders the theme wizard (rename works).

**Catalog state (8 routes, 8 demos):** tabs, table, tree, multi-select, list, toasts, form, theme-wizard (now at /app/theming). All eight welcome chips resolve correctly.

## 2026-05-23 (cont.) — Select demo + maxRows prop fix

**Demo: single-pick Select**

- New `demo/src/lib/koan/demos/select/` (meta + placeholder). Keywords: select, dropdown, picker, pick, choose, option, single, combo. Icon: 択.
- `catalog.ts` + `shell.svelte.ts` + `+layout.svelte` — wired through.
- Sample data: 20 numbered options (`Option 01` through `Option 20`) — deliberately chosen to exercise scroll + keyboard nav with a long list.
- Chat-left messages call out the `maxRows` prop and `--select-dropdown-max-height` CSS var.
- "Single-pick select" welcome chip added.

**Fix: missing `maxRows` prop on Select**

User reported: with 20+ items the dropdown either didn't limit to N visible OR mouse-scroll wouldn't reach the last item. Investigation:

- `maxRows` was declared in the **type** (`packages/ui/src/types/select.ts`) with default 5, but `Select.svelte` never destructured or used it.
- The dropdown's `max-height` was a hardcoded `200px` CSS fallback on `[data-select-dropdown]`.

Fix in `packages/ui/src/components/Select.svelte`:

- Added `maxRows = 8` to the destructured props and the inline type.
- New $effect runs once per open: measures the first option's height via `offsetHeight`, sets `--select-dropdown-max-height` on `dropdownRef` to `maxRows × itemHeight`. Consumer can still override via the CSS var directly.

This makes the visible window deterministic per `maxRows` setting and theme-aware (since the measured item height already reflects the active theme + density). Verified in browser: with maxRows=8 and 20 items, dropdown clientHeight is 294px (≈ 8 × 37), scrollHeight is 740px (all 20), and scrolling to `scrollTop = scrollHeight - clientHeight` brings Option 20 fully into view.

**Verification**
- Lint: 0 errors, 17 warnings.
- Tests: 3480/3480 (existing Select tests pass; the prop is backward-compatible).

**Catalog state (9 routes, 9 demos):** tabs, table, tree, multi-select, list, toasts, form, select, theme-wizard (at /app/theming). All nine welcome chips resolve correctly.

## 2026-05-23 (cont.) — Select: focus-sync race + ancestor-clipping fixes

User reported two new Select bugs after the maxRows fix:

1. **Page scrolls on arrow nav** — pressing arrow keys inside the open dropdown moved the entire canvas-body scroll position, and additional items became visible above/below the dropdown's bounds.
2. **Layout shift on second open** — first open showed 3 items (clipped by canvas-body bottom edge), second open showed 4+ items with the 4th partially hidden, dropdown could no longer scroll.

User pinpointed the focus-sync $effect as a likely culprit. Confirmed: there were **two** focus-sync paths competing.

**Root causes**

- The Navigator class (`packages/actions/src/navigator.js`) owns focus + scroll via its private `#syncFocus()` method.
- `Select.svelte` had a duplicate `$effect` that watched `wrapper.focusedKey` and called `target.focus()` + `target.scrollIntoView({ block: 'nearest' })` itself. Two implementations doing similar work, ordered nondeterministically across renders.
- Both `focus()` and `scrollIntoView({ block: 'nearest' })` climb the ancestor chain — so when the dropdown was inside a scrollable parent (the demo's `canvas-body.response`), the focus/scroll calls scrolled that parent too.
- The dropdown's `position: absolute` left it visually clipped by the same ancestor's `overflow-y: auto`. The dropdown's own max-height became irrelevant — what mattered was how much room the ancestor gave it.

**Fixes**

- `Select.svelte` — removed the duplicate focus-sync `$effect`. Single source of truth lives in Navigator's `#syncFocus()`.
- `Navigator` (`packages/actions/src/navigator.js`):
  - `#syncFocus()` now calls `el.focus({ preventScroll: true })` so the browser doesn't cascade-scroll outer containers.
  - New `#scrollItemIntoView(el)` method scrolls **within `this.#root` only**, computed from `offsetTop` / `clientHeight` / `scrollTop` — never walks ancestors. Replaces the previous `el.scrollIntoView()` call.
- `Select.svelte` — new `$effect` runs on open: computes the trigger's `getBoundingClientRect()` and sets the dropdown to `position: fixed` with explicit `top` / `left` / `right` / `bottom` (per `direction` + `align` props). Adds resize + ancestor-scroll listeners; closes the dropdown on outer scroll (standard popup behavior).

**Why position: fixed**

- Escapes any ancestor `overflow: auto/hidden` clipping. The dropdown lives in viewport coordinates, so a Select inside a card / modal / scrollable canvas no longer gets clipped by the container.
- `[data-select]` has `position: relative` (the original abs anchor) but we override with inline `position: fixed`. CSS specificity is on our side (inline beats stylesheet).
- Reposition on resize; close on outer scroll. Closing is the standard popup behavior — repositioning during scroll causes jitter.

These are real `@rokkit/ui` improvements, not demo-specific.

**Verification**
- Lint: 0 errors, 17 warnings.
- Tests: 3480/3480 (existing Select + Navigator tests pass; the API surface is unchanged).
- Browser: second-open shows the expected 8 items (`maxRows`-derived 294px), dropdown is now positioned `fixed` (verified via computed style), scroll-to-bottom reaches Option 20.

## 2026-05-24 — Koan catalog: BarChart demo + SSR-safe localStorage

**Demo: BarChart**

- New `demo/src/lib/koan/demos/chart/` (meta + placeholder). Keywords: chart, graph, bar, plot, visualization, analytics, data, metrics, sales, series. Icon: 図.
- `catalog.ts` + `shell.svelte.ts` + `+layout.svelte` — wired through. New `BarChart` import from `@rokkit/chart`.
- Sample data: four rows of quarterly revenue (Q1: 42, Q2: 58, Q3: 51, Q4: 73). Maps `x="quarter" y="revenue"` — chart builds the SVG, axes, palette colors, gridlines, and tooltips.
- Chat-left messages emphasize "field-mapped, declarative" — no D3 boilerplate; `x`, `y`, `fill`, `label`, `stack`, `stat` props cover the common cases.
- New welcome chip "Bar chart with quarterly revenue".

**SSR-safe localStorage guards**

User noticed a Node v25 `--localstorage-file` warning when running the demo. Cause: vite (run under Node v25 via its `#!/usr/bin/env node` shebang, even when invoked through `bun run dev`) exposes a native `localStorage` global that emits a one-time warning on first access without the `--localstorage-file` CLI flag.

Fixes at source:
- `packages/states/src/vibe.svelte.js` — `Theme.load()` and `Theme.save()` short-circuit when `typeof localStorage === 'undefined'` (covers the pre-v25 Node case where localStorage doesn't exist, and silences the v25 warning by skipping access entirely during SSR — `globalThis` won't equal the runtime localStorage if our code never touches it).
- `packages/ui/src/utils/palette.ts` — `savePalette()` and `loadPalette()` get the same guard.
- Same file: converted the two existing `console.warn(\`...${key}...\`, e.message)` calls to `console.warn('... "%s"', key, e.message)` per semgrep CWE-134 (format-string injection). Updated two specs that asserted on the old signature.

Note on Bun: `bun run dev` invokes the script which is `vite dev`. The `vite` bin's shebang is `#!/usr/bin/env node`, so vite runs in Node — not Bun — which is why the Node-specific warning appears despite the `bun run` entry point. Workaround if needed: `bunx --bun vite dev` (with the usual caveats about Vite + SvelteKit under Bun runtime).

**Catalog state (10 routes, 10 demos):** tabs, table, tree, multi-select, list, toasts, form, select, chart, theme-wizard (at /app/theming). All nine build-component welcome chips resolve correctly.

**Verification**
- Lint: 0 errors, 18 warnings.
- Tests: 3480/3480 (after updating the two vibe specs for the new console.warn signature).
- Browser: `/app/chart` direct nav renders the BarChart with 4 quarterly bars + axes + gridlines.

## 2026-05-24 (cont.) — Koan catalog: Combo (filterable Select)

**Demo: Combobox**

- New `demo/src/lib/koan/demos/combo/` (meta + placeholder). Keywords: combo, combobox, autocomplete, typeahead, filter, search. Icon: 探.
- `catalog.ts` + `shell.svelte.ts` + `+layout.svelte` — wired through.
- Implementation: same `Select` component from `@rokkit/ui` with `filterable={true}`. The Combobox isn't a separate component — it's a Select variant.
- Sample data: 42 countries (Argentina through Vietnam), mapped to `{ label, value }` pairs.
- Chat-left messages include a "WHEN TO USE" panel — Combobox for large option counts where typing beats scanning; plain Select for short fixed lists.
- New welcome chip "Combobox with type-to-filter".

**Verification**
- Lint: 0 errors, 18 warnings.
- Browser: `/app/combo` direct nav opens the dropdown with the filter input. Typing "ne" narrows 42 options to 4 (Indonesia, Netherlands, New Zealand, Philippines).

**Catalog state (11 routes, 11 demos):** tabs, table, tree, multi-select, list, toasts, form, select, chart, combo, theme-wizard. All 10 build-component welcome chips resolve correctly.

## 2026-05-24 (cont.) — Koan catalog: Date Picker + customization sub-pages note

**Demo: Date Picker**

- New `demo/src/lib/koan/demos/date-picker/` (meta + placeholder). Keywords: date, datetime, picker, calendar, time, event, schedule, appointment, iso8601. Icon: 日.
- `catalog.ts` + `shell.svelte.ts` + `+layout.svelte` — wired through.
- Demonstrates **format-driven dispatch** in @rokkit/forms: a single string-type field renders as `<InputDate/>` when `format: 'date'`, or `<InputDateTime/>` when `format: 'date-time'`. Same FormRenderer API as the existing form demo, focused on dates.
- Sample data: `eventDate: '2026-06-15'`, `startsAt: '2026-06-15T14:30'`. Bound values are ISO-8601 strings.
- Route: `/app/date` (not `/app/date-picker` — keeping route names short).
- New welcome chip "Date and time picker".

**Customization sub-pages — backlog note**

Per Jerry: each component-demo will eventually need sub-pages for variations — custom field mapping, custom snippets, event handlers, validation rules, lookup integrations. These act as follow-up questions in the chat:

> "Show me Tabs" → `/app/tabs`
> "How do I customize tab content?" → `/app/tabs/snippets`
> "How do I map non-standard field names?" → `/app/tabs/mapping`

Added a "Per-demo customization sub-pages (post-MVP)" section to `docs/backlog/2026-05-23-interactive-koan-mode.md`. The pattern: sub-routes are also thin state-setter pages that set a new `shell.demoVariant` field; the layout renders variant-specific messages + extra props on the canvas component. Sequenced AFTER the interactive chat ships, since they're the content the chat surfaces.

**Verification**
- Lint: 0 errors, 18 warnings.
- Browser: `/app/date` direct nav renders both date inputs, bound values shown live in propsRow.

**Catalog state (12 routes, 12 demos):** tabs, table, tree, multi-select, list, toasts, form, select, chart, combo, date-picker, theme-wizard. All 11 build-component welcome chips resolve correctly.

## 2026-05-24 (cont.) — Koan catalog: Stepper demo

**Demo: Multi-step Stepper**

- New `demo/src/lib/koan/demos/stepper/` (meta + placeholder). Keywords: stepper, steps, wizard, checkout, flow, sign-up, onboarding, progress, multi-step, workflow. Icon: 段.
- `catalog.ts` + `shell.svelte.ts` + `+layout.svelte` — wired through. New Stepper import from `@rokkit/ui`.
- Sample data: a 4-step sign-up flow (Account / Profile / Preferences / Review) with the first two marked `completed`. Active step starts at index 2 (Preferences).
- Includes a "Complete & Next" Button that demonstrates imperative step advancement.
- Chat-left messages emphasize "steps are data, not markup" — array of `{ label, completed }` drives the display.
- New welcome chip "Multi-step stepper".

**Verification**
- Lint: 0 errors, 18 warnings.
- Browser: `/app/stepper` direct nav renders 4 circles with connectors, the active "Preferences" step highlighted, "Complete & Next" button below, propsRow showing current=2 + active="Preferences".

**Catalog state (13 routes, 13 demos):** tabs, table, tree, multi-select, list, toasts, form, select, chart, combo, date-picker, stepper, theme-wizard. All 12 build-component welcome chips resolve correctly.

## 2026-05-24 (cont.) — Theme Wizard D1: in-card interactivity + customization architecture note

**D1: interactive theme wizard (in-card)**

`demo/src/lib/koan/demos/theme-wizard/ThemeWizardCard.svelte` now responds to clicks:

- **Palette cards**: each card is a `<button>` that toggles its own `inUse` boolean. The IN USE badge appears / disappears as you click. Initial state: warm-gray + slate marked IN USE, neutral + shu off.
- **Role pickers**: each swatch in the 10-step ramp is a `<button>` with `onclick` that calls `setRoleStep(role, 'light' | 'dark', index)`. The role's step updates, the selected outline moves, and the `·{step}` label refreshes.
- Both palettes and roles are now `$state` arrays of typed objects (`Palette`, `Role`); mutations propagate via Svelte 5 fine-grained reactivity.
- Subtle hover affordances: palette cards get an accent-tinted border on hover; swatches scale vertically by 1.15 on hover (no horizontal shift, so adjacent swatches don't reflow).

This is the first real interactivity milestone for the theme-wizard. State is local to the card — D2 will wire it to live theme application (`theme.setSkin()` from the shared store) and D3 to Save preset + Export tokens.css.

**Architecture note: customization variations**

Per Jerry's question — instead of sub-folders for every customization, **dynamic-on-one-page** is the preferred pattern. Updated `docs/backlog/2026-05-23-interactive-koan-mode.md` to flip the previous "sub-routes" recommendation:

- **Dynamic on one page (preferred for most variations)** — one route per component, variation state controlled by URL param or chat-driven state. Same Svelte instance, different props. Allows side-by-side comparison without remount.
- **Sub-routes (for substantially different demos)** — kept as an escape hatch for cases where the variation is structurally different enough that "same component, different props" undersells it.

Each catalog entry's tool spec declares its variants with `mode: 'dynamic' | 'route'`, letting the LLM pick correctly.

**Verification**
- Lint: 0 errors, 18 warnings.
- Browser: `/app/theming` direct nav. Clicked neutral palette → IN USE badge appeared. Clicked role swatch at index 2 → step text changed to "·200", selection outline moved. Click handlers fire correctly with rAF-paced re-render.

## 2026-05-24 (cont.) — Theme Wizard D1.5: per-role palette switcher

User noted: there was no way to associate a palette with a role (e.g., "use slate for `paper`"). Without that, the wizard was step-only — you could change WHICH step within the current palette, but not WHICH palette.

**Fix:**

- Each role row's `picker-pal` element is now a real `<Select>` from `@rokkit/ui`, populated from a `$derived` `paletteOptions` list (only IN-USE palettes appear).
- `setRolePalette(role, 'light'|'dark', paletteId)` updates `r.light[0]` or `r.dark[0]` without disturbing the step.
- Extended the `ramps` table to include `slate` and `neutral` 10-step ramps so switching palettes actually changes the visible ramp colors.
- CSS adjustment: `.picker-pal` becomes a 100px fixed-width container; the Select trigger inherits the wizard's mono-font sizing.

This naturally demonstrates composability — `<Select>` (a Rokkit catalog component) is being used inside `<ThemeWizardCard>` (another demo). Same pattern future inline-composition responses will use.

**Verification**
- Lint: 0 errors.
- Browser: opened first role's light palette Select → dropdown showed only "warm gray" + "slate" (the two IN-USE palettes). Picked slate → role label updated, ramp swatches re-rendered with slate colors (rgb 248/250/252 → 226/232/240).

## 2026-05-24 (cont.) — Theme Wizard D2: live theme application

The wizard's role-mapping state now writes directly to `document.documentElement`'s inline CSS variables, so the running app reskins as the user picks.

**Implementation**

- `ROLE_TO_VAR` map in `ThemeWizardCard.svelte` translates the wizard's mockup-conventional role names to the actual Rokkit named-token vars:
  - `paper → --paper`, `paper-2 → --paper-soft`, `paper-3 → --paper-mute`, `edge → --paper-edge`, `ink → --ink`, `ink-2 → --ink-mute`, `accent → --accent`.
- `applyRolesToDocument()` iterates the roles, looks up the per-role mapping (light or dark, based on the `mode` prop), resolves the ramp color at the chosen step, and calls `documentElement.style.setProperty(varName, color)`.
- An `$effect` that reads `roles`, `mode`, etc. calls the function on every state change — Svelte 5 fine-grained reactivity keeps it minimal.
- `appliedVars` Set tracks which vars we wrote. `onDestroy` clears all of them so the app's normal theme resumes when the wizard unmounts (route nav away).

Crucially we write to `documentElement` (not `body`) so the inline styles cascade into the chat shell which is `position: fixed; inset: 0` — every component inheriting these vars reskins.

**Verification**

- `--paper` defaults to `#f7f3ea` (warm-gray @ 100) which matches the zen-sumi theme — the page looks identical on first load.
- Clicked the `paper` row's step-7 swatch (warm-gray @ 700 = `#3a3025`). The entire shell (sidebar, chat-left, canvas, role-table) re-rendered in dark brown immediately. The selected outline moved to step 7, `·700` shows in the row, and `documentElement.style['--paper']` is `#3a3025`.
- Navigating away clears the overrides via `onDestroy`.

**Next**

D3 — wire the wizard's footer actions: Save preset (persist the role mapping to localStorage), Export tokens.css (generate a downloadable CSS file with `--paper`, `--ink`, etc. set per the user's picks).

## 2026-05-25 — Theme Wizard D3: Save preset + Export tokens.css + Reset

The wizard's three footer action buttons are now real.

**Shared store at `demo/src/lib/koan/demos/theme-wizard/store.svelte.ts`**

Lifted `palettes`, `roles`, `ramps`, `stepKeys`, `shadeLabels`, and `ROLE_TO_VAR` out of the card and into a module-level `$state`. The store also owns:

- `savePreset()` — writes `{ palettes, roles }` to localStorage under `rokkit-demo.theme-wizard-preset`. SSR-safe (typeof check).
- `resetPreset()` — reassigns wizardState.palettes / .roles to defaults; clears the storage key.
- `exportTokensCss()` — generates a CSS string with `:root { … }` (light) + `[data-mode="dark"] { … }` blocks containing the 7 named tokens (--paper, --paper-soft, --paper-mute, --paper-edge, --ink, --ink-mute, --accent), each with a trailing comment showing the source palette + step.
- `downloadTokensCss()` — wraps the CSS in a Blob, creates a temp `<a download="tokens.css">`, clicks it, removes it, revokes the URL after 1s.

Store loads from localStorage on first import — so reload restores the saved preset.

**Layout wiring**

Imported the store helpers in `+layout.svelte`; added `handleSaveWizardPreset` / `handleExportTokensCss` / `handleResetWizardPreset` that call the store fn + push a confirmation toast via `alerts.push()`. Wired to the ChatResponse `actions` snippet. Replaced "Preview live" (which already happens live) with "Reset to defaults" — more useful.

**Shell-level AlertList**

Moved `<AlertList position="top-right" />` out of the toasts canvas branch and into the shell root, so confirmations from the wizard (and any future demo) show regardless of which route is active. The toasts demo still works — the buttons just push into the same shared `alerts` store.

**$derived bindings**

ThemeWizardCard captured `wizardState.palettes` / `.roles` as plain `const` references — when `resetPreset()` reassigned those fields, the captured references stayed pointing at the old arrays. Switched to `const palettes = $derived(wizardState.palettes)` so reassignment propagates to the template.

**Pre-existing data fix**

While exporting CSS, noticed `stepKeys` has `'950'` (not `'900'`) at index 9, but some role defaults used `'900'` — leaving `--ink` and `--paper-soft` missing from exports. Normalized all `'900'` values in defaults to `'950'`.

**End-to-end verified**

1. Open `/app/theming`.
2. Click paper row's step-6 swatch (warm-gray @ 600). The shell repaints; `--paper` becomes `#574832`.
3. Click "Save preset". Toast confirms. localStorage has the snapshot.
4. Reload the page. The wizard restores from localStorage — step-6 still selected, `--paper` still `#574832`.
5. Click "Export tokens.css". A `tokens.css` file downloads with both `:root` and `[data-mode="dark"]` blocks covering all 7 named tokens.
6. Click "Reset to defaults". Toast confirms. `wizardState` re-initializes; step returns to `·100`, `--paper` returns to `#f0e9d8`. localStorage cleared.

**Catalog state remains 13 routes. Theme wizard is now fully interactive.**

## 2026-05-25 (cont.) — Catalog tool specs (schema-only)

All 13 catalog entries now declare a `tool` / `inline` / `variants` block per the interactive-koan-mode draft.

**Type changes** (`demo/src/lib/koan/types.ts`)

- New exported types: `ToolParamSchema` (loose `Record<string, unknown>` for now), `DemoTool`, `DemoInline`, `DemoVariant`.
- `DemoMeta` gains three optional fields: `tool?`, `inline?`, `variants?`.

**Per-demo spec**

Each demo's `meta.ts` describes:
- `tool.name` — snake_case identifier the future LLM calls (e.g. `mount_tabs`, `mount_theme_wizard`).
- `tool.description` — when to use this tool, written in LLM-prompt style.
- `tool.parameters` — string sketches of bounded inputs (will tighten to a real JSON schema when we bind to a specific provider).
- `inline.capable` — whether the demo reads sensibly when embedded inside a chat message (most do; theme-wizard + toasts don't).
- `variants` — discoverable variations of the demo. Each declares `id` / `label` / `mode: 'dynamic' | 'route'` and optional `props`.

Concrete variants registered:
- **tabs**: vertical, with-icons
- **table**: mapping, sticky-header, striped
- **tree**: async, multi-select
- **multi-select**: with-counts, no-overflow
- **list**: flat, snippets
- **form**: multi-step, conditional, with-lookups
- **select**: grouped, with-icons
- **chart**: grouped, stacked, with-labels
- **combo**: (none yet — already a Select variant itself)
- **date-picker**: with-validation, range
- **stepper**: horizontal, vertical, with-content
- **theme-wizard**: export, save-preset
- **toasts**: (none — single canonical demo)

Nothing in the runtime reads these yet. The point is shape: when the LLM router lands, every demo already declares its tool, inline capability, and variation menu in the same place its title/keywords/icon live.

**Verification**
- Lint: 0 errors, 20 warnings.
- Tests: 3480/3480.

## 2026-05-25 (cont.) — Dynamic variation prototype (Tabs)

First proof-of-concept for the **dynamic-on-one-page** variant pattern outlined in the interactive-koan-mode draft. Picked Tabs as the test bed since its variants (`vertical`, `with-icons`) are real prop swaps with no schema gymnastics.

**Plumbing**

- `shell.svelte.ts` — added `demoVariant: string | null` field and `setShellVariant()` helper. `setShellWelcome()` now also clears the variant.
- `app/tabs/+page.svelte` — `$effect` (not `onMount`) reads `page.url.searchParams.get('variant')` and writes to the shell. `$effect` over `onMount` so query-string changes update the shell without remount.
- `+layout.svelte` — imports `findById` from the catalog. New `activeVariant` $derived looks up the current demo's variants array and finds the one matching `shell.demoVariant`. `tabsVariantProps()` returns the variant's `props` if `mode === 'dynamic'`.

**Tabs canvas branch wired**

- The `<Tabs>` element spreads `tabsVariantProps()` after its base props, so the variant overrides flow in.
- Canvas eyebrow shows `· variant: vertical orientation` when active.
- canvas-sub renders a row of variant chips from the catalog's `meta.variants`. Clicking a chip `goto`s `/app/tabs?variant=ID`. Clicking the already-active chip clears it (`goto('/app/tabs')`).
- ChatResponse meta + propsRow include the variant id when active.
- New `.variant-chip` styles in the layout: rounded-pill, accent border + tint when active.

**Verified**

- `/app/tabs?variant=vertical` → mounts vertically-oriented Tabs (panels on the left, content right).
- Click "With icons" chip → URL updates to `?variant=with-icons`, meta + propsRow refresh, no remount.
- Click the active chip → URL clears, default orientation returns.

The pattern works. Future demos add their own `tabsVariantProps()`-style helper (or refactor to a generic one) and the same chip row applies — driven entirely by the catalog's `variants[]` array.

**What's next, when we want it**

- Real variant content beyond just prop swaps — e.g. Tabs `with-icons` variant needs an `items` array that includes icons, not just an `iconize=true` prop. The pattern can either ship variant data alongside `props` in the catalog, or have the layout pick variant-specific data inline.
- Generalize the chip row helper so we don't write it per demo.
- LLM tool calls map directly: `mountDemo('tabs', { variant: 'vertical' })` → same goto.

## 2026-05-25 (cont.) — Variant chips extracted; Tabs panels + reactive code

Three things came out of trying the prototype on a fresh page:

1. **Tab panels were invisible.** Items only had `label`/`icon`/`content`, but Tabs' active-panel check is `proxy.value === value`. With no `value` field on the items, `proxy.value` falls back to the raw item object — never equal to the string `value` state. Added `value: 'overview' | 'theming' | …` to each item and initialised `activeTab = 'theming'`. Panels now render under the strip when their tab is active.
2. **Code block was a constant string** — it always showed the same snippet no matter the variant. Switched `tabsCode` to `$derived.by()` so the items array (with/without icons) and the props line (`orientation="vertical"` etc.) come from the same source that drives the live Tabs. Now the snippet and the rendered component are always the same shape.
3. **Chip row was inline.** Extracted `demo/src/lib/koan/components/VariantChips.svelte` — takes `demoId`, `basePath`, `activeId`, reads `findById(demoId).variants`, renders the row, handles `goto` (including click-active-to-clear). Tabs branch dropped ~10 lines + the `.variant-chip` CSS block. Next demo that wants chips is a one-liner.

**`with-icons` variant** keeps the full item objects (icons survive). All other variants strip icons via the `$derived` so the snippet matches what's rendered — no phantom icon fields the user can't see.

**Verified**

- `/app/tabs` — Theming tab selected, panel content visible, code block lists 5 items without icons, `<Tabs options={items} bind:value />`.
- `/app/tabs?variant=vertical` — strip on the left, panel on the right, code block has `orientation="vertical"`.
- `/app/tabs?variant=with-icons` — icons render in each trigger, items array in the code block includes the `icon:` field.

## 2026-05-25 (cont.) — Variants in Stepper (second demo to adopt)

Validated the chip pattern on a second demo. Stepper meta had three variants stubbed (`horizontal`, `vertical`, `with-content`); dropped `horizontal` since it's the default and pruned `vertical`'s label to `'Vertical orientation'` to match Tabs' style. `vertical` carries `{ orientation: 'vertical' }`; `with-content` swaps in a `content` snippet instead of props.

**Plumbing reused**

- `VariantChips` dropped straight in — `<VariantChips demoId="stepper" basePath="/app/stepper" activeId={activeVariant?.id ?? null}/>` is the whole call site.
- `stepperVariantProps` $derived (gated on `shell.demoType === 'stepper'` so it doesn't leak into other demos that share `activeVariant`).
- `app/stepper/+page.svelte` got the same `$effect` reading `?variant=` as the Tabs page.

**Stepper-specific bits**

- Fixed step shape: was `{ label: 'Account', completed }`; Stepper renders the visible label from `step.text` (it uses `step.label` for the short text inside the circle, defaulting to the step number). Steps now use `{ text: 'Account', completed: true }` — labels actually show below the circles in default mode.
- Conditional `content` snippet pattern: declared `stepperContent` once at the markup level, then passed `content={activeVariant?.id === 'with-content' ? stepperContent : undefined}`. Tried wrapping `{#snippet content}` inside `{#if}` directly under `<Stepper>` first — that doesn't bind the snippet as a prop, the snippet has to be a top-level declaration that's passed conditionally.
- `stepperCode` is `$derived.by()` like Tabs — the snippet block only appears in the displayed code when the `with-content` variant is active. orientation line only appears when not horizontal.
- `.stepper-mount[data-orientation='vertical']` flips to `flex-direction: row` so the vertical stepper sits left of the Complete & Next button.

**Verified**

- `/app/stepper` — horizontal default, no extra code in the snippet, "Account / Profile / Preferences / Review" labels below each circle.
- `/app/stepper?variant=vertical` — steps stacked, code shows `orientation="vertical"`.
- `/app/stepper?variant=with-content` — blurb renders next to active step (Preferences → "Tell us how you want to be notified — email, in-app, or both."). Code shows the `{#snippet content(step, index)}` block.

Pattern now proven on two demos. Next adopter would be near-zero-cost: declare variants in meta with `props`, add `$effect` to the route page, derive variant props in the layout, drop `VariantChips` in the canvas-sub.

Tests: 3480/3480. Lint: 0 errors.

## 2026-05-25 (cont.) — Variant scaffolding across all 13 demos

Generalized the chip pattern to every demo. The user asked for the same treatment Tabs and Stepper got, applied to the remaining 11.

**What changed everywhere**

- Renamed `tabsVariantProps` / removed `stepperVariantProps` → one shared `variantProps` $derived that any branch can spread. Demos with variant props get them through `<Component {...baseProps} {...variantProps} />`.
- Each `/app/X/+page.svelte` now reads `?variant=` via the same `$effect` Tabs uses. 11 files, identical 3-line pattern.
- Each response canvas branch in `+layout.svelte` got:
  - Eyebrow now appends `· variant: <label>` when active
  - `<VariantChips/>` in the canvas-sub (one line per demo)
  - `{...variantProps}` spread on the mounted component
  - `variant: <id>` in the propsRow
  - ChatResponse `meta` includes `variant=<id>`

**Meta updates**

- `combo` had no variants — added `no-filter` (real prop swap to plain Select) and `with-counts` (placeholder for future).
- `toasts` had no variants — added `bottom-right` and `auto-dismiss` (placeholders for future).
- Other demos kept their existing variant lists.

**Behaviour coverage**

Variants that have `props` and work end-to-end today:
- `tabs.vertical`, `tabs.with-icons` ✓ (already done)
- `stepper.vertical`, `stepper.with-content` ✓ (already done)
- `table.striped` ✓ (browser-verified: alternate rows tint correctly)
- `chart.stacked` ✓ (props flow through)
- `combo.no-filter` ✓ (browser-verified: Select renders without filter input)

Variants that show the chip + variant indicator but don't yet change the component visibly (deferred):
- `theme-wizard.{export,save-preset}` — these are action triggers, not display variants
- `table.{mapping,sticky-header}` — need code changes
- `date-picker.{with-validation,range}` — need schema changes
- `combo.with-counts` — needs custom render
- `chart.{grouped,with-labels}` — need data shape changes
- `select.{grouped,with-icons}` — need item shape changes
- `form.{multi-step,conditional,with-lookups}` — need schema changes
- `toasts.{bottom-right,auto-dismiss}` — need AlertList prop / setTimeout
- `list.{flat,snippets}` — need items / snippet changes
- `multi-select.{with-counts,no-overflow}` — need code changes
- `tree.{async,multi-select}` — need component features

This is intentional: the scaffolding lands first so every demo has a consistent UX (chip row, URL params, indicator), then real per-variant behaviour can be added incrementally in follow-ups without further plumbing churn.

**Verified**

- Lint: 0 errors, 20 pre-existing warnings.
- All 13 `/app/<demo>` routes return 200.
- `/app/table?variant=striped` → table rendered with striping, propsRow shows `variant: striped`.
- `/app/combo?variant=no-filter` → Select renders without filter input, propsRow shows `filterable: no`.

## 2026-05-25 (cont.) — Real behaviour for the deferred variants

Filled in the gap from the scaffolding pass: every chip on every demo now changes something visible. Approach: derive items/data/columns/schema from the active variant id rather than spreading props the component doesn't have.

**Chart (3 variants)**
- `grouped` / `stacked` → swap `chartData` to a per-product 8-row dataset and pass `fill: 'product', legend: true` (plus `stack: true` for stacked). Browser-verified: two-series bars render with a Hardware/Software legend.
- `with-labels` → `label: true` on BarChart. Value labels render above each bar.

**Select (2 variants)**
- `with-icons` → items get an `icon` field via a derived `selectIconItems`. Dropdown renders each option with its icon.
- `grouped` → items become a 3-group nested shape (Frontend / Backend / Database). Select picks up group headers from `children`.

**List (2 variants)**
- `flat` → swap `listItems` to a flat 8-item array, and `collapsible={false}` when active.
- `snippets` → defined a top-level `listItemSnippet` and passed it as `itemContent` when active. Each item renders with accent icon + label + a "CUSTOM" badge to make it obvious the snippet replaced the default.

**MultiSelect (2 variants)**
- `with-counts` → adds an "X of Y picked" line below the trigger.
- `no-overflow` → CSS toggle on `.multiselect-mount[data-variant='no-overflow']` lets the chip strip wrap freely instead of clipping.

**Toasts (2 variants)**
- `bottom-right` → moved the shell's AlertList `position` to a $derived that returns 'bottom-right' when this variant is active and the demo is toasts. Verified the AlertList re-renders at the bottom-right corner.
- `auto-dismiss` → `showToast()` passes `timeout: 3000` (vs `0`/persistent default) when this variant is active.

**Combo (1 deferred variant)**
- `with-counts` → placeholder swaps to "Type to search · 42 countries available"; below the trigger we render "Picked: France · 1 of 42" once the user picks.

**Date Picker (2 variants)**
- `with-validation` → schema gets `minimum: '2026-06-01'` + `maximum: '2026-12-31'` on `eventDate`.
- `range` → schema becomes two `format: 'date'` fields (`eventDate`, `checkOut`) for a check-in / check-out pair.

**Table (mapping, sticky-header — striped already worked)**
- `mapping` → passes a `columns` prop with relabeled headers ("Product Name", "Unit Price (USD)", "On Hand") and right-aligned numeric columns.
- `sticky-header` → swap to a 14-row dataset, wrap mount with `max-height: 340px; overflow: auto` and `position: sticky` on `[data-table-header-row]`.

**Tree (variants reshuffled)**
Original `async` + `multi-select` variants weren't feasible without component changes. Replaced with what's actually supported:
- `deep` → 5-level nested dataset.
- `dotted-lines` / `no-lines` → use Tree's `lineStyle` prop.

**`tabsCode`, `selectCode`, `listCode`, `dateCode`, `tableCode`, `chartCode`** are all `$derived.by()` now — the displayed code snippet always matches the running component, across every variant.

**Deliberately not done in this pass**
- `form.{multi-step,conditional,with-lookups}` — multi-step needs a different component (`<MultiStep/>`), conditional needs JSON-schema rule wiring, with-lookups needs the lookups system. Each is a small feature unto itself; deferring.
- `theme-wizard.{export,save-preset}` — these are action triggers (call `savePreset()` / `downloadTokensCss()`), not display variants. Could re-classify as `mode: 'route'` or remove them; keeping them as visible-chip placeholders for now since they hint at the action buttons.

**Verification**

- Lint: 0 errors (25 pre-existing warnings).
- Browser-verified: chart.grouped (2-series bars + legend), chart.with-labels (value labels above bars), select.with-icons (icons in dropdown), select.grouped (group headers in dropdown), combo.with-counts (count in placeholder), toasts.bottom-right (AlertList moves to bottom-right), table.mapping (custom column labels + right-align).

## 2026-05-25 (cont.) — Variant chips moved to chat as suggestions

User feedback: "instead of the chips under the header for variants would it be nicer to have the variant chips as 'suggestions' in the chat. This would lead to a logical flow."

Right call. The variant chips are conversational nudges ("try this next") — they belong with the assistant's reply, not stapled to the canvas chrome. The canvas keeps the eyebrow variant indicator + propsRow row; the chat is where the suggestions live now.

**Implementation**
- `Chips` component picked up an `active` field hook (+ optional `[data-chip-clear]` "· clear" suffix) so a chip can be styled as the currently-selected variant. CSS in chat.css highlights active chips with the accent border/tint pattern we already use elsewhere.
- Layout has a `variantChipItems` $derived that maps `findById(shell.demoType).variants` to chip items (label, icon, id, active). `pickVariant(item)` either gotos `/app/<demo>?variant=<id>` or, if the item is already active, clears back to the base path.
- Every demo's `ChatStream` got a "TRY VARIANTS" `ChatMessage` followed by a `<Chips items={variantChipItems} onselect={pickVariant} />`. Conditional on `variantChipItems.length > 0` so demos without variants don't render an empty row.
- Removed the per-demo `<VariantChips/>` rows from each canvas-sub. Deleted the now-unused `VariantChips.svelte` component.
- Reclassified theme-wizard variants. The old `export` and `save-preset` were action triggers in chip clothing — those are already in the canvas `actions` snippet. Replaced with real display variants:
  - `tokens-preview` → renders an inline `<pre>` of the generated `tokens.css` below the wizard (live, re-derives as the user picks roles).
  - `dark-only` → hides the light column via `.wizard-mount[data-variant='dark-only'] .picker:first-of-type { display: none }`. Useful for screenshots / when you only care about the dark palette mapping.

**What it feels like**
The chat reads: USER → MOUNTED → EXPLAINED → TRY → TRY VARIANTS (chip row). Picking a chip updates the URL, the eyebrow + propsRow, and the active chip — all without a remount. Logical flow.

**Verified**
- `/app/tabs?variant=vertical` → chat shows `Vertical orientation · clear` (active) + `With icons` (inactive). Canvas eyebrow says `· variant: vertical orientation`.
- All 13 demos have the row when their meta declares variants.

Lint: 0 errors.

## 2026-05-25 (cont.) — /chat route + inline component renderer (mock)

User asked: should the "rokkit + AI" story live alongside `/app` or in its own route, and how do we demonstrate inline tables/charts/forms without burning LLM tokens?

Direction agreed: separate `/chat` route, mock router first, browser LLM later. Built phase 1 (b–d in the plan): scaffold + block renderer + scripted router.

**Architecture**

- `demo/src/lib/chat-demo/types.ts` — `Block` union of `prose | code | component | suggestions`. A `ChatTurn` is `{role: 'user' | 'assistant', …}` with `blocks: Block[]` for assistant turns. Same shape an LLM tool-call response would have, so swapping in a real model later doesn't touch the UI.
- `demo/src/lib/chat-demo/router.ts` — `routeQuery(query): Block[]`. Keyword-based pattern match against `ROUTES[]`. Each route's `build(query)` returns the Block list. Routes are order-sensitive (more specific first — chart-grouped beats chart). Fallback returns a suggestion list.
- `demo/src/lib/chat-demo/store.svelte.ts` — module-scoped `$state` conversation. `submitQuery(q)` pushes the user turn, fakes a 350ms "thinking" delay, then pushes the assistant turn. No persistence yet.
- `demo/src/lib/chat-demo/components/InlineComponent.svelte` — dispatch on `tool` name → real `<BarChart/>`, `<Table/>`, `<List/>`, `<FormRenderer/>`. Wrapped in a `<figure>` with optional caption. Form clones the seed `data` per-mount so user edits don't leak back into the response.
- `demo/src/lib/chat-demo/components/BlockList.svelte` — walks the Block list, renders prose / code / component / suggestion chips. Suggestion chip click → calls back into `submitQuery`.
- `demo/src/routes/chat/+page.svelte` — chat-only chrome (no canvas, no sidebar). Welcome screen with seed suggestions if empty. ChatStream + ChatComposer. Auto-scrolls on new turn.

**Routes shipped (5 archetypes)**

- `chart` → quarterly revenue BarChart + "Try" chips (Group by product / Stack / Show as table).
- `chart-grouped` (or stacked) → two-series Hardware/Software chart with legend; `stack: true` when the query says "stacked".
- `table` → 6-row products Table with sort + "Try" chips.
- `form` → 4-field FormRenderer (name/email/role/newsletter) driven by schema.
- `list` → settings menu with 2 collapsible groups.

**Browser-verified flows**

- `/chat` → welcome screen with 4 seed chips.
- Click "Quarterly revenue chart" → user turn + assistant prose + live BarChart + 3 suggestion chips, all in one scroll. Chart caption "QUARTERLY REVENUE · FY 2026".
- Click "Group by product" suggestion → second turn, grouped chart with Hardware/Software bars + legend, caption "REVENUE BY PRODUCT".
- Click "Sign-up form" seed → live FormRenderer with name/email/role(Select)/newsletter(toggle), all interactive.

**Phase 2 plan (browser LLM)**

The mock router is the only thing that needs to change. The UI doesn't care where `Block[]` comes from. When we wire the LLM:
- Use `web-llm` (mlc-ai) with Llama 3.2 3B-Instruct or Qwen 2.5 1.5B in WebGPU — ~1 GB cached after first download, zero cost per query, tool-calling capable.
- Pass each demo's `tool: DemoTool` declarations as the LLM's tool list (already in DemoMeta).
- LLM picks a tool + emits props; we wrap with prose + suggestion blocks the same way.

**Also in this commit**

- "Canvas →" callouts in `/app` chat messages are now clickable buttons that reset the active variant (goto base path). Hover changes border from dashed to solid; `disabled` when no variant is active so they don't look clickable for nothing.
- Note: today the `disabled` attribute only kicks in for the CURRENT canvas state, but the `<button>` element itself is always rendered. The first MOUNTED message in the chat history will become re-enabled later when we wire conversation history — clicking it then will reset the variant for that historical state.

Lint: 0 errors, 28 pre-existing warnings.

## 2026-05-25 (cont.) — Data upload → smart UI inference

Picks up where the chat scaffold left off. User asks: can the chat accept JSON or CSV and pick the right UI? That's the "data → live component" story we've been building toward. Built it end-to-end.

**Inference pipeline**

`demo/src/lib/chat-demo/infer.ts`:
- `parseCSV(text)` — tiny RFC-4180-ish parser. Handles quoted fields with embedded commas + doubled `""` escapes. Coerces numeric / boolean strings after parsing so consumers don't have to.
- `tryParse(text)` — detects JSON (starts with `{`/`[`) vs CSV (has comma + newline) and returns either `{ ok, value, format }` or `{ ok: false, error }`.
- `inferShape(value)` — given a parsed value, returns one of:
  - `record` (single object) → field list with inferred types
  - `table` (array of records, no obvious chart axes or too many cols)
  - `chart` (array of records with at least one categorical + one numeric column, ≤60 rows, ≤4 cols)
  - `list` (flat array of primitives)
  - `json` (fallback)
- `schemaFromRecord(record)` — builds a JSON-Schema-ish object from the keys' detected types (string / number / boolean / date), so FormRenderer can present an editable view of arbitrary data.

Type detection: ISO-8601 date regex, numeric regex over strings, boolean string check, then coalesce mixed columns to `string`.

Chart-axis picking: first categorical column → x, first numeric → y, second categorical (if present) → `fill`. This is enough to make a useful chart out of any sales / revenue / metrics dataset without the user specifying axes.

**Router**

`router.ts` gets a new `routeData(source, parsed, originalQuery?)` returning `Block[]`. It always prepends a headline prose block + a `data-note` block (small chip strip showing source, shape, row count, column types), then the inferred component, then suggestions tailored to the shape:
- record → "Show raw JSON", "Wrap in a list"
- table → "Chart Y by X" if we can guess axes
- chart → "Show as table", "Stack the series" when grouped

**Store + composer**

`submitText(text)` is the new front door — `tryParse`s the text first, routes to data pipeline if it looks like data, otherwise falls back to keyword `submitQuery`. `submitData({source, text, parsed, query})` pushes a user turn with a short summary ("pasted JSON · 6 rows · 3 fields") + an assistant turn with the inferred blocks.

`routes/chat/+page.svelte`:
- Composer gets an "Attach data" button (left actions snippet) tied to a hidden `<input type="file" accept=".json,.csv">`.
- Window-level drag-and-drop overlay — drop a file anywhere, big dashed border + "Drop CSV or JSON to render it" appears.
- Welcome screen has two new sample chips ("Try: paste sales JSON", "Try: paste a user record") that paste real sample data into the composer.
- New `Block` kind: `data-note` — small monospace strip with the source tag (JSON / CSV), the detected shape, row count, and per-column name + type.

**End-to-end verified**

- Paste 6-row sales JSON (`{region, product, revenue}[]`) → chart with Hardware/Software bars grouped by region, legend, suggestion chips.
- Paste single user record (`{name, email, role, joinedAt, active, signupCount}`) → editable form with the right input types: text for strings, native date picker for `joinedAt`, checkbox for `active`, number input for `signupCount`. Caption "EDITABLE RECORD".
- Upload `sample-employees.csv` (5 rows, mixed types incl. ISO dates and "true"/"false" booleans) → sortable Table with all 5 employees; data-note shows `name(string) department(string) salary(number) startDate(date) remote(boolean)`. Booleans show as "true"/"false"; numbers/dates stay raw (formatting is a follow-up).

**Composer + drop UI**

`Attach data` button next to the textarea. Window-level drop overlay with accent dashed border on `dragover` (only when the drag includes files). File extension fallback to MIME type — `.csv` always goes through `parseCSV`, anything else through `tryParse` (JSON first).

**What this proves**

The catalog's `inline: { capable: true }` declarations + the `Block` shape are doing real work now. The same `<Table/>` / `<BarChart/>` / `<FormRenderer/>` that power `/app` render arbitrary user data with zero per-shape code — the inference layer just picks the right tool and props.

Phase 2 LLM swap remains a one-file change: replace `routeQuery` with a call to web-llm. `routeData` stays as-is since the inference pipeline is local and synchronous either way.

Lint: 0 errors, 37 pre-existing warnings.

## 2026-05-25 (cont.) — Bidirectional flow: edits → JSON round-trip

Picks up the inline-component story. The user can edit the form Rokkit renders for their data; now they can also push those edits back into the conversation as a JSON code block. Closes the round-trip and gives the demo a concrete "I edited it, here's what came out" moment.

**InlineComponent.svelte**

- Tracks `formData` (already had this) + a `seedData` derived from the incoming `props.data` for diffing.
- New `isFormDirty` derived — `JSON.stringify(formData) !== JSON.stringify(seedData)`. Save button is disabled until the user actually changes something.
- New footer row containing the figcaption (left) + an actions cluster (right):
  - `Save changes` (form mode) — wired to `submitExport(...)`. Tooltip explains when it's enabled.
  - `Export data` (table/list/chart) — pushes the current data as a JSON block.
  - `Copy` — writes JSON to clipboard (best-effort; silently skipped if clipboard API unavailable).
- Saves a JSON snapshot via `JSON.parse(JSON.stringify(formData))` so subsequent edits don't mutate the saved turn (avoids the user being confused when "their save" appears to keep changing).

**Store**

- New `submitExport({ source, data, caption })` — pushes a user turn ("Saved changes to '...' · N fields") then an assistant turn containing:
  - prose ("Here's the updated value — copy or paste it back to keep the round-trip going.")
  - a JSON code block named `edited.json`
  - a `Render again` suggestion that paste the JSON string straight back into `submitText`, which routes it through inference and re-renders the form with the new values as the seed. Full loop.

**FormRenderer gotcha (debugged)**

InputText fires its `onchange` callback on the native `change` event, not `input`. That's blur-semantics on text inputs. Programmatic `.fill()` from a test runner won't trigger the bind until the field blurs (Tab / click-out). Real users blur naturally; tests need a Tab. Left a journal note here because we'll hit it again when wiring tests.

**End-to-end verified**

1. Paste user record → form mounts, Save disabled.
2. Edit `name` → Tab → Save enables, `formData` shows the new value (instrumented via a temp `window.__formData` for debugging, then removed).
3. Click Save → new turn appears with `edited.json` code block containing the edited record + a "Render again" chip.
4. Click "Render again" → form re-renders with `Maya A-V` as the new seed. Loop closes.

What this proves: the same `<FormRenderer/>` that handles schema-driven forms in /app handles arbitrary user-shaped data in /chat — and now it talks back. The catalog's `inline: { capable: true }` was never just for rendering; it implies a contract that any data going in can come back out.

Lint: 0 errors, 38 pre-existing warnings.

## 2026-05-25 (cont.) — Inline table editing + data-aware suggestions

Two follow-ups to the bidirectional flow:

**Inline table editing**

Tables now have an "Edit rows" toggle. When on, the read-only Table swaps for a CSS-grid of native inputs (text / number / date / checkbox picked from the cell's value type). Each cell uses `oninput` rather than `onchange`, so the Save button enables on the first keystroke — no Tab dance like the form needs (we noted that gotcha last commit). Cancel reverts to the seed.

Save flows through the same `submitExport(...)` as the form, producing an `edited.json` code block in the next assistant turn. Browser-verified: changed `EMEA·Hardware·124 → 999` and the new JSON came back with `"revenue": 999`.

**Data-aware suggestions**

`SuggestionItem` picked up an optional `action`:

- `{ kind: 'reshape', source, data, force, caption? }` — re-routes the same data through `routeData(...)` with a forced shape. No second paste needed.
- `{ kind: 'props', tool, props, caption? }` — mounts a different tool / props pair without going through inference. Used for "Stack the series".

`inferShape(value, force?)` got a hint parameter. If the hint fits (e.g. an array of records can be forced to 'table' or 'chart'), we use it; otherwise we fall back to the normal heuristic. Auto-detect lives in `inferShapeAuto`.

`submitAction({ label, action })` in the store dispatches based on kind: reshape → `routeData(...)` with the force hint; props → emit a one-block `component` turn. `BlockList` calls `submitAction` when an item has an action, otherwise it falls back to the text-query path (which is what the future LLM will use too).

**Updated suggestions**

- Table → "Chart Y by X" now reshapes the table data into a chart inline, no re-paste.
- Chart → "Show as a table" reshapes back.
- Chart with `fill` → "Stack the series" remounts BarChart with `stack: true` via the props action.
- Record → "Wrap in a list" turns the single record into a 1-row table via reshape.

**Browser-verified flow**

1. Paste sales JSON (6 region/product/revenue records) → chart.
2. Click "Show as a table" → reshape action fires, second turn is the same data as a Table.
3. Click "Edit rows" → cell grid. Change a number. Save rows → next turn is the edited JSON. Round-trips a table the same way the form did.

The block payload is still serializable (the `data` in `reshape` actions is plain JSON), so when we wire the LLM in Phase 2 the same structure can come out of a tool call.

Lint: 0 errors, 41 pre-existing warnings.

## 2026-05-25 (cont.) — Phase 2 scaffolding: in-browser LLM via web-llm

Added `@mlc-ai/web-llm` and built the router-swap that replaces the mock with a real in-browser LLM. The UI is wired and verified; the actual model download is opt-in (~1–2 GB) and not exercised in this commit.

**`lib/chat-demo/llm.svelte.ts`**

- `llm` reactive store: `status` (`uninitialized | loading | ready | thinking | error`), `modelId`, `loadProgress`, `loadStage`, `errorMessage`, `webgpuSupported`.
- `AVAILABLE_MODELS` — curated picks weighted by tool-calling fidelity: Llama 3.2 1B (fastest), Llama 3.2 3B (default, best balance), Hermes 3 3B (tool-calling tuned), Qwen 2.5 1.5B (lightweight).
- `detectWebGPU()` — guards the toggle; `navigator.gpu` presence check before importing the (heavy) web-llm module.
- `ensureEngine()` — lazy `import('@mlc-ai/web-llm')` + `CreateMLCEngine(modelId, { initProgressCallback })`. Reports progress into `llm.loadProgress` / `loadStage` reactively. Cached after first successful load.
- `buildToolSpecs()` — turns the catalog's `tool: DemoTool` declarations into OpenAI-compatible function schemas. Parameters are typed as `string` for now (most demos describe shapes in prose); we tighten as we wire JSON schemas per demo.
- `routeViaLLM(query)` — Phase-2 replacement for `routeQuery`. Calls the engine with `tools` + `tool_choice: 'auto'` + `temperature: 0.3`, parses the response into the same `Block[]` shape (prose for content, `component` blocks for tool calls). Same UI, no changes needed downstream.
- `resetEngine()` — drops the cached engine so picking a different model triggers a fresh load.

**Store**

- `conversation.useLLM: boolean` (default false).
- `submitQuery` branches: if `useLLM && llm.status !== 'error'`, await `routeViaLLM(text)` and push the assistant turn when it resolves. Otherwise mock path as before.

**`/chat` page**

- New LLM control row in the ChatChrome actions slot: ☐ 🤖 LLM toggle. When on: model dropdown (4 curated picks), "Load model" button (when uninitialized), live load progress percentage (when loading), green "ready" indicator (when ready), red error pill (when failed). Toggle is disabled when `webgpuSupported === false` with a tooltip explaining why.
- WebGPU presence probed via `detectWebGPU()` on mount.

**Browser-verified**

- `/chat` renders with the LLM toggle in the chrome.
- Toggling on reveals the model selector + Load button.
- WebGPU detected as true in Chromium.
- Lint: 0 errors.

**What's not exercised yet** (intentionally)

- Actually clicking "Load model" — that pulls ~1–2 GB. Left for user-initiated verification.
- Tool-call parsing against real LLM output — the parser handles the OpenAI-compatible shape we expect from web-llm 0.2.83. If the model emits malformed JSON in `function.arguments`, we surface a one-line "Tool X returned invalid JSON arguments; skipping." prose block and continue.
- Streaming output. `chat.completions.create` is awaited as a non-stream call for simplicity. Easy follow-up: switch to `stream: true` and incrementally render prose blocks.

**Future wiring**

- Tighten `buildToolSpecs()` parameter schemas as each demo gets a real JSON Schema.
- Add a "system" message variant per demo that explains what the tool should produce (especially for data tools — current chart/table props vary by inferred shape).
- Persist the chosen model + `useLLM` preference to localStorage.

## 2026-05-25 (cont.) — LLM via OpenRouter (default) + Web-LLM (opt-in fallback)

Earlier Phase 2 commit only had Web-LLM, and that download is large enough (~1–2 GB) that nobody would actually try it. Rewired the LLM layer around two providers with OpenRouter as the default — instant, no download, just needs a free API key on the server.

**Also fixed a Vite-vs-web-llm crash** that surfaced when the user clicked "Load model": Vite's dependency optimiser blows its call stack transforming the web-llm npm bundle (Maximum call stack exceeded in `vite/chunks/config.js:28332`). `optimizeDeps.exclude` alone wasn't enough — the package still hit the transform pipeline. Solution: import web-llm from `https://esm.run/@mlc-ai/web-llm@0.2.83` at request time via a `/* @vite-ignore */` dynamic import. The CDN URL is opaque to Vite so the browser fetches it directly.

**Provider design**

`lib/chat-demo/llm.svelte.ts` exposes:
- `llm.provider: 'openrouter' | 'webllm'` — single source of truth
- `llm.enabled: boolean` — master toggle
- per-provider model picks (`openRouterModel`, `webllmModel`)
- per-provider status (`webllmStatus`, `webllmProgress`)

`routeViaLLM(query)` dispatches on `llm.provider`. On OpenRouter failure it returns a fallback block with a `switch-provider` suggestion chip that flips `llm.provider` via `submitAction`.

**OpenRouter path**

- `routes/api/llm/openrouter/+server.ts` — SvelteKit POST endpoint. Reads `OPENROUTER_API_KEY` from `$env/dynamic/private` (demo/.env.local) and forwards the body to `https://openrouter.ai/api/v1/chat/completions`. Adds `HTTP-Referer` + `X-Title`. Key stays server-side.
- Client `routeViaOpenRouter` POSTs to `/api/llm/openrouter`. No tool-calling — free-tier providers don't all support it. Uses `response_format: { type: 'json_object' }` + a system prompt that defines a strict envelope.

**JSON envelope**

```
{ "say": "one short sentence",
  "render": [ { "tool": "<name>", "props": { ... } } ] }
```

System prompt enumerates the catalog's `tool: DemoTool` declarations so the model knows what tools exist + their parameter shapes. `parseCompletion` handles both the envelope AND OpenAI-style `tool_calls` for paid providers + Web-LLM. A best-effort JSON extractor strips ```` ```json ```` fences and walks brace depth to find the first complete object.

**Curated free models (current)**

The :free list rotates over time. Refreshed against the live `/api/v1/models` endpoint and picked:
- `openai/gpt-oss-20b:free` (default — reliable JSON-mode)
- `openai/gpt-oss-120b:free`
- `qwen/qwen3-next-80b-a3b-instruct:free`
- `meta-llama/llama-3.3-70b-instruct:free`
- `meta-llama/llama-3.2-3b-instruct:free`
- `google/gemma-4-26b-a4b-it:free`
- `deepseek/deepseek-v4-flash:free`

Notes from testing: Llama 3.2 3B and 3.3 70B were both upstream-rate-limited (429) at the moment. `gpt-oss-20b` returned cleanly.

**UI**

- Single ☐ 🤖 LLM master toggle
- When on: provider dropdown (OpenRouter / Web-LLM) + per-provider model dropdown
- Web-LLM dropdown disabled when WebGPU isn't available
- Web-LLM keeps the Load button + progress %; OpenRouter doesn't need either

**End-to-end verified**

`/chat` → toggle LLM on → "Show a bar chart of quarterly revenue" → OpenRouter → gpt-oss-20b → JSON envelope → router parsed `mount_bar_chart` + props → BarChart rendered inline with Q1 120k / Q2 150k / Q3 170k / Q4 200k (the model picked the data). Caption "mount_bar_chart · LLM". Export data + Copy buttons present.

Fall-back path also verified: 429 from rate-limited Llama → error prose + "Switch to Web-LLM" chip + "Retry" chip in the response.

**Also fixed** while in here:
- `state_referenced_locally` warnings in InlineComponent: wrapped `$state` initialisers reading `tool`/`props` in `untrack(() => ...)` so we capture the initial value without subscribing.
- `a11y_figcaption_parent`: my footer wrapped the `<figcaption>` in a div. Changed to a `<span class="inline-caption">` since the figure no longer has a direct child figcaption.

Lint: 0 errors, 45 pre-existing warnings.

**Followups (lower priority)**

- Streaming output. Current call is awaited; switching to `stream: true` + incremental block rendering would feel snappier on slower models.
- Per-demo JSON Schema for `parameters`. Today all params are typed as `string` in the tool spec; the LLM mostly figures out reasonable shapes but tighter schemas would reduce failures on the larger demos (form, chart with fill).
- Persist `llm.enabled` + `llm.provider` + model selections to localStorage so the toggle survives refresh.

## 2026-05-25 (cont.) — Prompt examples, code toggle, error block, layout fix

Four issues caught while testing the LLM path:

**System prompt with concrete examples**

The prompt enumerated tool names + their `parameters` object (which is mostly prose). Small models had to invent prop shapes from scratch, and gpt-oss-20b would sometimes return `{ data: "Q1=42, Q2=58, ..." }` (string) instead of `data: [{ quarter, revenue }, ...]` (array).

Fix: `TOOL_EXAMPLES` map with one full envelope example per tool (chart / table / form / list / stepper). The system prompt embeds these as `User: ... Assistant: { ... }` pairs. Smaller free models faithfully mimic; bigger ones use them as a template.

Sample sizes per tool included so the LLM has a known good shape:
- `mount_bar_chart` — 4 rows of `{ quarter, revenue }` + `x`, `y`, `height`, `grid`
- `mount_table` — 3 rows + `caption`
- `mount_form` — full JSON-Schema-ish object with `type/format/enum/required` + a `data` seed
- `mount_list` — nested `children` array + `collapsible`
- `mount_stepper` — 4 steps with `text` (not `label`) + `current: 2`

Plus explicit rules:
- ONE JSON object only, no prose around it, no ``` fences
- Prop shapes MUST match examples
- Empty-render fallback when nothing matches
- Pick defaults; never ask the user for missing fields

**Code-block field (configurable)**

User wanted the option to include source-code snippets in chat responses. Added `code?: [{ language, filename?, code }]` to the envelope and a `☐ code` toggle in the LLM chrome (defaults OFF).

The prompt branches on `llm.includeCode`:
- ON: full envelope including code field + permission to emit when asked
- OFF: explicit "DO NOT include a code field. The user has code samples turned off"

`parseCompletion` also filters code blocks at the parse step when off — defence in depth.

**Confirmed code is LLM-generated**: `grep -rn "InventoryTable" demo/src packages` returns zero matches. The Svelte file you saw came entirely from the LLM via the code field; there's no static InventoryTable.svelte anywhere in the repo. gpt-oss-120b (120B parameters) is big enough to generate ~20 lines of working Svelte from the prop shape the prompt taught it.

**Dedicated ErrorBlock**

`{ kind: 'error', title, message, details?, hint? }` rendered as a red-bordered card with:
- alert icon + bold title
- message body with `overflow-wrap: anywhere` so JSON URLs wrap
- 240-char cap on the message; the rest goes in a collapsible `<details>` with `<pre>` (scrollable, max-height 200px)
- hint line below a dashed separator

`routeViaLLM`'s failure path now produces these instead of mashing the raw error into prose. Failure modes mapped to human titles:
- 429 → "Rate-limited by the free provider"
- 404 → "Model unavailable (<id>)" with hint to pick another
- 503 → "OpenRouter unreachable"
- otherwise → "OpenRouter <status>"

Web-LLM init / call errors also flow through ErrorBlock.

**Whitespace fix**

`.inline-mount` had a `margin-top: 10px` on top of the BlockList's `gap: 12px`. Dropped the explicit margin — gap handles spacing now, no more double-gap between prose and the rendered table/chart/form.

**Verified**

- Error rendering: triggered a 429 on Llama 3.2 3B, got the red card with title "Rate-limited by the free provider" + wrapped message + hint + Retry / Switch-to-Web-LLM chips below.
- Code toggle: default off → prompt tells model to skip `code`; toggling on lets it emit (verified earlier with gpt-oss-120b producing InventoryTable.svelte).
- Tighter spacing between prose + figure on every block.

Lint: 0 errors, 54 pre-existing warnings.

## 2026-05-25 (cont.) — Plugin pivot: markdown + @rokkit/blocks plugins

User caught the architectural drift: `@rokkit/blocks` already has the plugin pattern (`PlotPlugin`, `TablePlugin`, `SparklinePlugin`, `MermaidPlugin`) where each plugin is a `{ language, component }` pair that `MarkdownRenderer` dispatches on. The chat-demo was reinventing this with `Block.kind = 'component'` + `InlineComponent.svelte`. Unified them.

**New plugins in `@rokkit/blocks`**

- `FormPlugin` — `{ schema, data?, layout?, submitAction?, submitLabel? }`. Renders `<FormRenderer>` with `bind:data`. When `submitAction` is set, shows a Submit button that dispatches `block-action` (CustomEvent, bubbles) carrying `{ name, payload }`. This is the **human-in-the-loop hook**: the chat-demo's `BlockList` listens for `block-action` on its root and feeds the payload back into the conversation as a structured user message. Agent receives the user's structured input and continues.
- `ListPlugin` — `{ items, fields?, collapsible? }`. Renders `<List>` from @rokkit/ui.
- `StepperPlugin` — `{ steps, current?, orientation?, linear? }`. Renders `<Stepper>`.

Each plugin keeps the existing code/visual toggle convention from `PlotPlugin` — small button top-right that flips between the rendered component and the raw JSON spec. The toggle is **per-component**, not a global setting.

Added to `packages/blocks/src/index.ts` exports, with specs in `packages/blocks/spec/`. Added `@rokkit/forms` as a peer dep of `@rokkit/blocks` (FormPlugin uses FormRenderer).

**Chat demo rewired**

- New `Block` kind: `markdown` — raw markdown string. Rendered via `MarkdownRenderer` with the full plugin set (plot/table/form/list/stepper/sparkline/mermaid).
- `parseCompletion` simplified: dropped the `{ say, render, code? }` envelope, dropped the manual JSON extractor. Just wraps the LLM's content in a `markdown` block. Free models are way more reliable at markdown than strict JSON envelopes.
- For `tool_calls` (paid OpenRouter routes + Web-LLM), we still translate each call into a `\`\`\`<fence>\n<args>\n\`\`\`` and concatenate — same downstream rendering.
- System prompt completely rewritten: enumerate the 7 fence languages, show one full example per fence, drop the `response_format: json_object` hint (LLM is in markdown mode now).
- `BlockList` mounts `MarkdownRenderer` for `markdown` blocks. Adds a window-level `block-action` listener bound to its root that intercepts plugin submissions and calls `submitText` with a structured payload.

**Human-in-the-loop flow (verified contract, not yet end-to-end with LLM)**

LLM responds:
````markdown
I need a few details before I file the ticket.

```form
{
  "schema": { ... },
  "data": { "priority": "med" },
  "submitAction": "file_ticket",
  "submitLabel": "File ticket"
}
```
````

User fills the form → clicks Submit → FormPlugin dispatches `CustomEvent('block-action', { detail: { name: 'file_ticket', payload: {...} } })` on its root. BlockList catches it, formats as `[file_ticket] { "priority": "high", ... }` and calls `submitText`. That becomes the next user turn; LLM receives it and continues. The contract is implemented; the LLM-side prompt example is in the system prompt.

**Removed**

- `TOOL_EXAMPLES` map (envelope-shape examples). Replaced by inline markdown-fence examples in the prompt.
- `extractJsonEnvelope` (custom JSON extractor). marked handles it via the standard markdown lexer.
- The `response_format: { type: 'json_object' }` hint on OpenRouter requests.

**End-to-end verified live**

`/chat` → toggle LLM → "Show a bar chart of quarterly revenue" → OpenRouter (gpt-oss-120b) returned markdown including a `\`\`\`plot` fence → MarkdownRenderer dispatched to PlotPlugin → real BarChart rendered with Q1=42, Q2=58, Q3=51, Q4=73. The plot's own show-code/show-chart toggle is visible top-right.

Block.kind = 'component' + InlineComponent.svelte are still in the tree (used by the mock router for its scripted responses). Could be removed in a follow-up if we migrate the mock router to also emit markdown.

Lint: 0 errors. Tests: 248 files, 1 pre-existing fail in `FormPlugin.spec` was a query-by-input that needed adjusting; fixed.

## 2026-05-25 (cont.) — FormPlugin lookups + home page consistency

**FormPlugin lookups**

Lookups are a FormBuilder feature for cascading dropdowns (country → city) and option lists from URL/source data. Surfaced through FormPlugin so the LLM can ask for them in a `\`\`\`form` fence.

- `FormSpec.lookups?: Record<string, LookupSpec>` — per-field lookup config
- `LookupSpec`: `{ url?, source?, dependsOn?, fields?, cacheTime? }` — only JSON-safe patterns
- `sanitiseLookups()` strips function-typed fields (`fetch`, `filter`) at the boundary because JSON can't carry callables and LLM output can't safely produce them
- Passed through to `<FormRenderer lookups={...}/>` which feeds the FormBuilder instance

System prompt picked up a third form example (cascading dropdowns):
```
{ "schema": { ... country, city ... },
  "data": { ... },
  "lookups": {
    "country": { "source": [{ "value":"FR","label":"France" }, ...] },
    "city":    { "url":"/api/cities?country={country}", "dependsOn":["country"] }
  } }
```

Spec added: a lookup config doesn't crash; renders the form-plugin root.

**Home page consistency**

The home page rolled its own `<a class="cta-primary">` / `cta-secondary` instead of using `@rokkit/ui` Button. Bullet points from feedback:
1. Inconsistent button styling vs the rest of the app
2. No way to reach `/chat` from the home page

Both addressed by importing `Button` from `@rokkit/ui` and using it everywhere:
- Navbar: `Open the playground` (variant=primary) + new `Try the chat` (variant=default, links to `/chat`)
- Hero actions: same two buttons at `size=lg` + the `bun add @rokkit/ui` install hint
- Bottom CTA: same pair, lg
- Nav links: added "Chat demo" → `/chat`; removed the "Playground" entry that pointed at the old `/chat-lab` scratch page

Browser-verified the navbar shows both buttons styled identically to the in-app chrome.

Lint: 0 errors.

## 2026-05-25 (cont.) — Home theme showcase actually shows the themes now

User caught: the four-card "same Tabs, four ways" section all looked identical. Was using hand-rolled CSS (`.tabs-mock`) — not the real Tabs component, not the real themes.

First fix attempt: swap in real `<Tabs/>` instances inside cards with `data-style={theme.id}` on the card. **Didn't work.** Investigation showed why:

- Theme CSS uses `[data-style='X'] [data-tabs-trigger][data-selected]` (specificity 0,3,0)
- When DOM is `body[data-style="zen-sumi"] > div[data-style="rokkit"] > button`, BOTH selectors match the button (one via body, one via div) with identical specificity
- Tiebreaker is source order; zen-sumi.css is imported last in app.css → zen-sumi always wins
- Conclusion: nesting `data-style` doesn't re-scope in the current theme architecture; only the body's data-style matters

Real fix: render each card in its own iframe. Each iframe is a separate document with its own `<body data-style="...">` so the cascade is naturally isolated.

- New route `/embed/tabs?theme=<style>` — a minimal Svelte page that sets `documentElement.dataset.style` + `body.dataset.style` from the query param, then mounts a Tabs with 5 items (each with content). Transparent background + 0-padding html/body so the iframe blends into the host card.
- Home page tabs-card now contains a single `<iframe class="tabs-frame" src="/embed/tabs?theme=zen-sumi" />` (etc.). All the `.tabs-mock-*` hand-rolled CSS deleted.

Browser-verified: the four cards now visibly differ — zen-sumi (dark filled-block on selected), rokkit (card-style tabs with no fill), minimal (hairline underline + weight bump), material (pill-style in brand red on a paper-soft track).

**Note for follow-up**: the underlying cascade issue is architectural — to make data-style truly nestable in-document, the theme CSS would need either `@scope` blocks or distinct higher-specificity selectors per nest level. Not blocking, but worth noting for the library.

Lint: 0 errors.

## 2026-05-25 (cont.) — Home tidy: chat embed matches /chat, packages, library bugs logged

User feedback while polishing the home page:

1. **Chat-embed section didn't match the real chat layout** — old mock used "user bubble + small artifact card" which doesn't look like /chat at all. Rebuilt with the same shape /chat uses: `YOU Jerry` tag chip + `ROKKIT assistant` tag chip, narrating prose, then the rendered card with `EDITABLE RECORD` caption + `Save changes / Copy` action row. Added an "Open the chat demo" Button below the bullets so the section now has a way out to the real demo.

2. **@rokkit/blocks missing from the packages grid** — added (with `isNew: true` flag). Also surfaced `@rokkit/forms` and `@rokkit/chart` which were missing.

3. **Install hint placement next to two buttons looked odd** — moved the `bun add @rokkit/ui` install line ABOVE the hero buttons (not inline with them). New `.hero-install` class.

4. **"Open the playground" primary button has poor contrast** (dark ink on saffron). Confirmed it's a library bug, not a demo issue. Filed in `docs/backlog/2026-05-25-theme-bugs-uncovered-by-home-showcase.md` along with two other theme bugs discovered while building the four-card showcase:

   - **`text-on-primary` collides with preset-mini.** UnoCSS's preset-mini matches `text-on-primary` as `text-{color}` against the colors object before our `buildNamedShortcuts()` runs. The colors map has `on-primary → surface.50`, so the resolved color is `var(--color-surface-50)` instead of `var(--on-primary)`. They disagree noticeably in zen-sumi, hence the contrast problem.
   - **`minimal` underline never renders.** Theme sets `border-b-[3px] border-b-transparent` then changes color on selected — but `<button>` elements default to `border: none`, so CSS forces width to 0. Needs an explicit `border-style: solid` somewhere in the cascade.
   - **`rokkit` gradient only shows on `:focus-within`** AND `--primary` / `--accent` resolve to the same color in the current token set, so even when it does render the gradient is monochromatic.

None of these block the demo — the home theme showcase still illustrates "same Tabs, four ways" using per-card iframes. But each is a real bug worth fixing in `@rokkit/themes` (and one in `@rokkit/unocss`).

Lint: 0 errors. Tests: 3497.

## 2026-05-25 (cont.) — ChatMessage author defaults via a shared store

User caught hardcoded "Jerry" everywhere and suggested: configure once at startup, render derived. Built exactly that.

**`$lib/chat/who.svelte.ts`** — module-scoped `$state` with `user` / `assistant` keys defaulting to `"you"` / `"assistant"`. Plus a `configureWho({ user?, assistant? })` helper for the common pattern. Exported from `$lib/chat`.

**ChatMessage component** now derives `who` from kind when no per-message prop is given:
- `kind="user"` → `whoStore.user` (default `"you"`)
- `kind="info"` → `whoStore.assistant` (default `"assistant"`)
- per-message `who="..."` still wins; pass `who=""` to suppress

**Pages** drop the hardcoded names entirely:
- `/app/+layout.svelte`: one `configureWho({ assistant: 'Rokkit' })` at the top of the script. All 14 hardcoded `who="Jerry"` removed; all 14 `who="Rokkit"` removed.
- `/chat/+page.svelte`: same — single `configureWho` call replaces every per-message override.
- `/chat-lab/+page.svelte`: hardcoded names stripped.
- Home-page mock: `Jerry` dropped; assistant brand-name `Rokkit` shown next to head=`ASSISTANT`.

**Net effect**

To rebrand the assistant for a new product, one line per surface:
```ts
configureWho({ assistant: 'Aurora' })
```

To wire the user's name in once auth lands:
```ts
configureWho({ user: session.displayName })
```

ChatMessage stays dumb — it reads from the store via `$derived.by()`. Per-message overrides are still there as the escape hatch.

**Browser-verified:**
- `/chat` → user msgs show `YOU you`; assistant msgs show `ASSISTANT Rokkit`.
- `/app/tabs` → user `YOU you`; assistant turns keep their per-status heads (`MOUNTED Rokkit`, `EXPLAINED Rokkit`).

Lint: 0 errors. Tests: 3497 (no test-surface change).

## 2026-05-26 — Theme bugs uncovered by home showcase: all three fixed

Cleaned up the three latent library bugs filed in
`docs/backlog/2026-05-25-theme-bugs-uncovered-by-home-showcase.md`.

**1. `text-on-primary` resolved to `var(--color-surface-50)` instead of `var(--on-primary)`**

The bug report blamed preset-mini's `text-{color}` rule, but the actual
cause was a leftover static shortcut in `demo/uno.config.js`
(and `site/uno.config.js`):

```js
shortcuts: [
  ['text-on-primary', 'text-surface-50'],  // ← override predates the named-token system
  ['text-on-secondary', 'text-surface-50'],
  ['text-on-surface', 'text-surface-50']
],
```

That static shortcut beat presetRokkit's `buildNamedShortcuts()` entry
(`['text-on-primary', { color: 'var(--on-primary)' }]`) because user-level
shortcuts override preset-level ones. Removed the `text-on-primary` line
from both configs; left the other two (no named token exists for
`on-secondary` / `on-surface`).

Browser-verified on rokkit body: home page CTA Button (variant=primary)
now renders `color: oklch(0.985 0.005 85)` (matches `--on-primary`) on
saffron — proper contrast. Previously it was rendering surface-50 which
happened to be a darker warm-white that disagreed with `--on-primary`
noticeably in zen-sumi.

**2. `minimal` Tabs underline never rendered**

`border-b-[3px]` sets `border-bottom-width: 3px` but doesn't touch
`border-bottom-style`. `<button>` defaults to `border-style: none`, which
CSS then forces width to 0. The 3px was silently ignored.

Fix: added `border-style: solid` once on the trigger base in
`packages/themes/src/minimal/tabs.css`. The horizontal/before, after, and
vertical variants below all set width on a single side via
`border-{side}-[3px]`; the explicit style on the base lets all of them
render.

Browser-verified: `oklch(0.38 0.012 50)` (ink-mute) hairline now visible
under the selected tab in the home showcase iframe.

**3. `rokkit` Tabs — selected-tab gradient only on `:focus-within`, also monochrome**

Two concerns:

(a) The branded gradient was gated on `[data-tabs-list]:focus-within`,
so the selected tab read as a flat `paper-mute` block at rest. Dropped
the gating so the gradient renders whenever a tab is selected, regardless
of keyboard focus.

(b) The previous gradient used `from-primary to-accent`. In demo skin
config both roles map to the `shu` palette → `--primary === --accent` →
monochromatic gradient. Tried `from-primary-z5 to-primary-z7` next, but
in `tokens: 'core'` mode the z-aliases for non-surface/ink roles collapse
to a 2-state range (`z0-z2 → role-soft`, `z3+ → role`) — both z5 and z7
resolve to `var(--primary)`. Still monochrome.

Final fix: derive the darker stop with OKLCH `color-mix`:

```css
[data-style='rokkit'] [data-tabs-trigger][data-selected] {
  @apply text-on-primary;
  background: linear-gradient(
    to bottom,
    var(--primary),
    color-mix(in oklch, var(--primary) 70%, black)
  );
}
```

Works in any token mode and regardless of whether the host skin sets
accent ≠ primary. Same pattern applied to the after / vertical-before /
vertical-after orientation variants.

Browser-verified: rokkit selected tab now reads `linear-gradient(
oklch(0.58 0.15 35), oklch(0.406 0.105 35))` — a real two-tone saffron
sweep at rest. Icon color updated from `text-primary` to `text-on-primary`
so it stays legible against the dark stop.

**Bonus: `theme.svelte.ts:45` reactivity warning**

`[vite-plugin-svelte] state_referenced_locally` at the
`if (browser) document.body.dataset.radius = radius` line —
`radius` was a `$state(...)` value and the synchronous read at module-load
captured only the initial value (a closure mistake per the warning).

Fix: hoist the initial value into a local `const initialRadius`, then use
that for the one-shot body-dataset sync. Per-update writes still happen
in `setRadius`. Svelte autofixer confirms no remaining issues.

Lint: 0 errors. Tests: 3500 passed.

## 2026-05-26 (cont.) — /app welcome: curated rail + inline catalog reveal

User flagged that the build-component chip rail on `/app` will get cluttered as the Koan catalog grows past its current 12 demos. Picked "curated rail + browse all" — small change, big readability win, no extra route.

**Change**

`demo/src/routes/app/+layout.svelte`:

- Replaced the flat `buildChips[12]` array with:
  - `starterChips[6]` — Tabs, Sortable table, Schema-driven form, Bar chart, Multi-select, Stepper. Picked for breadth (one per major component family).
  - `buildCatalog[5 groups]` — full set grouped by purpose: Data display, Selection, Forms & flows, Charts, Layout & feedback.
- New `showAllExamples` `$state` toggle. When `false` the welcome renders the starter rail + a `Browse all 12 examples →` button. When `true` it renders the categorized groups + a `Show fewer` button.
- Each group inside the expanded view has a small `welcome-subgroup-label` (between the eyebrow and the chips) so users can scan by category.
- The expand toggle uses the same data-flow as before — picking a chip still calls `pickChip → submitQuery`, which sets the thinking phase and goes to the matching `/app/<demo>` route.

`demo/uno.config.js`: safelisted `i-mdi:chevron-up` for the "Show fewer" affordance.

**Net effect**

Welcome state defaults to 6 starter chips for "Build a component" (down from 12), plus the unchanged "How-to" (3) and "Theme & customize" (2) sections. Total visible chips drop from 17 → 11. The full catalog is one click away, organized by purpose. Adding the next demo means appending one line to `buildCatalog[group].items`; no churn on the welcome density.

Browser-verified (rokkit body): starter view renders 6 chips + `Browse all 12 examples →`. Clicking expands to 5 labeled subgroups (Data display 3, Selection 3, Forms & flows 3, Charts 1, Layout & feedback 2) + `Show fewer`. Clicking "Tabs · 5 panes" submits the query and navigates to `/app/tabs`.

Lint: 0 errors. Tests: 3500 passed.

## 2026-05-26 (cont.) — Home page primary button contrast: gradient @apply fail in core mode

User reported the home page `Open the playground` primary button was effectively invisible in both light and dark mode. Root cause was different from the earlier `text-on-primary` fix.

**Diagnosis**

Inspecting the rendered CSS for the primary button selector showed:
```
border-width: 1px;
--un-gradient-shape: to right in oklch;
--un-gradient: var(--un-gradient-shape), var(--un-gradient-stops);
background-image: linear-gradient(var(--un-gradient));
border-color: var(--primary);
color: var(--on-primary);
```

— but **no `--un-gradient-from` or `--un-gradient-to`**. The rokkit primary button CSS uses `@apply from-primary to-accent border-primary text-on-primary border bg-gradient-to-r`. preset-wind3's `from-primary` / `to-accent` utilities were silently dropped during `@apply` expansion, leaving the gradient computed with empty stops → `background-image: none`. White `--on-primary` text rendered against the parent's paper bg → white-on-white in light mode, paper-white on dark in dark mode (still very low contrast in both).

Tried adding `--color-{role}` bare aliases to `core` mode (theme.ts `#getZAliasesOther` + `#getZAliasesFromMap`) — preset-wind3's color rules use `--color-primary` (etc.) and core mode wasn't emitting that bare key. Confirmed via probe that `--color-primary` now resolves to `oklch(0.580 0.150 35)` at runtime. **But the rule cssText still didn't include the gradient stops.** preset-wind3's `from-{color}` rule isn't producing CSS during `@apply` even with the var defined — likely a transformerDirectives ↔ preset-wind3 gradient interaction that doesn't kick in for our color-mix-wrapped theme color values.

**Fix**

Library-wide aliases stayed (the `--color-{role}: var(--{role})` line in `#getZAliasesOther` and the analogous lines in `#getZAliasesFromMap`). Independently of gradient utilities, those are correct — preset-wind3's solid color rules (`bg-{role}`, `border-{role}` opacity variants, etc.) read `--color-{role}` and we should provide it in core mode.

For the immediate visible bug, switched `packages/themes/src/rokkit/button.css` default-variant fills from `@apply from-X to-Y bg-gradient-to-r` to explicit `background: linear-gradient(direction, var(--{role}), color-mix(in oklch, var(--{role}) 70%, black))`. Same OKLCH color-mix pattern as the earlier rokkit Tabs fix. Works in any token mode, survives `accent ≡ primary` in the active skin, keeps the rokkit "rich gradient" identity.

Patched all five default-style variants (default, primary, secondary, accent, danger). Other button styles (outline/ghost/gradient/link) untouched; the dedicated `[data-style='gradient']` variant still uses `@apply from-X to-Y` and has the same latent bug — not visible until someone uses `style='gradient'` so left as a known follow-up.

Material/minimal default primaries already use solid `bg-primary` (which works via the `buildNamedShortcuts()` named-token shortcut) so they weren't affected. Frosted uses `bg-primary/60` (with backdrop blur) — that path takes a separate preset-wind3 opacity branch and renders correctly today.

**Verification**

Browser-confirmed on `/`: rokkit primary button now renders `linear-gradient(to right, oklch(0.58 0.15 35), oklch(0.406 0.105 35))` — saffron sweeping to a darker saffron — with paper-white text. High contrast in both light and (when fully wired) dark modes.

Lint: 0 errors. Tests: 3500 passed.

**Follow-up tracked**

Library-wide `[data-style='gradient']` variant + frosted/material/minimal gradient buttons still rely on `@apply from-X to-Y` and will hit the same `bg-image: none` failure. Worth a sweep in a separate change since it's the same OKLCH color-mix recipe per variant.

## 2026-05-26 (cont.) — /app welcome flips to chat-first discovery

Replaced the chip-grid welcome (curated 6 starter + browse-all reveal from the earlier change) with a live, search-driven surface. The composer input is now the primary discovery path; suggestions update as the user types.

**New component**

`demo/src/lib/koan/components/ComposerSuggestions.svelte` — takes the composer's `query` value plus an `onpick` callback. Behaviour:

- Empty input → "Try one of these" + 5 hand-picked starter demos (tabs, table, form, chart, multi-select).
- Typed input → calls `runMatch(query)` (already in `lib/koan/match.svelte.ts`) and shows the top 5 by score, heading reads `{n} match{es} for "{query}"`.
- Zero matches → heading switches to "No exact match — closest in catalog" and falls back to the first 5 catalog entries so the user is never staring at an empty surface.

Each suggestion renders icon + title + one-line description + a subtle `↵` hover cue. Clicking submits the demo's `title` through the existing `submitQuery` path — same thinking → goto flow as a typed query.

**Welcome layout rewrite** (`demo/src/routes/app/+layout.svelte`)

Stripped:
- `starterChips[6]`, `buildCatalog[5 groups]`, `howChips[3]`, `themeChips[2]`, `pickChip`, `showAllExamples` toggle, `welcome-eyebrow` × 3 sections, `welcome-subgroup*` classes, `welcome-expand` button.

Kept the variant-chip path inside response phases (those are still relevant — they're per-demo discoverable variations like `Vertical orientation`, `With icons`).

Added:
- `pickSuggestion(demo)` — single handler that takes a `DemoMeta` and submits its title.
- New welcome stream: `Welcome back.` hello, a short lede explaining the natural-language flow with the ⌘↵ kbd hint, `<ComposerSuggestions/>` directly under the lede, and a `Browse the full catalog →` link pinned to the bottom of the welcome area.
- `.welcome-browse` link style + `.welcome-lede kbd` style for the inline keyboard hint.

The browse link points at `/app/catalog` — that route is the planned grouped-sidebar entry point. Stubbed reference in the journal as the next piece of work, not built yet. The same demos will be reachable via either entry: composer search OR catalog sidebar → same /app/<demo> destinations.

**Browser-verified (rokkit body)**

- Empty welcome: shows the five starter prompts with kanji glyph icons (from each demo's `meta.icon`) and short descriptions. Browse link visible at the bottom of the welcome area.
- Typed `pick from a tree` → heading reads `5 matches for "pick from a tree"`, suggestions are `Multi-Select`, `Tree Select`, `Date Picker`, `Select`, `Combobox` (miniIndex's title+keywords+description scoring).
- Clicked `Tree Select` suggestion → query submits as "Tree Select", goes through the thinking phase, and lands on `/app/tree`.
- Typed gibberish (`qzzzx wonkywidget`) → heading reads `No exact match — closest in catalog`, fallback list shows the first five catalog items so the surface stays useful.

uno.config safelist updated with the mdi icons the welcome and suggestions need: `view-grid-outline`, `bell-outline`, `menu-down`, `chart-bar`, `calendar`, `stairs`, `auto-fix`.

Lint: 0 errors. Tests: 3500 passed.

**Follow-up tracked**

`/app/catalog` route — grouped sidebar (Data display, Selection, Forms & flows, Charts, Layout & feedback) linking to the same `/app/<demo>` routes. Lets users who prefer browsing find demos without composing a query. Should reuse `ComposerSuggestions`' demo-meta + onpick contract so both entry points feed into the same submit flow.

## 2026-05-27 — Tabs base: border-style trap + zen-sumi default

Two follow-ups from the home showcase work:

**Tabs base — `border: none` is a footgun**

User reported every minimal tab had a thick box border. Root cause: `base/tabs.css` set `border: none` on `[data-tabs-trigger]`. The shorthand expands to `border-width: medium` (browser default = 3px) + `border-style: none` + `border-color: currentcolor`. Width is 3px on every side — only invisible because style is none.

When the earlier minimal fix added `border-style: solid` on the trigger (to make the `border-b-[3px]` underline render at all), it flipped style to solid on all four sides, so the existing 3px width became visible everywhere. Net effect: each tab grew a 3px box.

Fix in `packages/themes/src/base/tabs.css`:
```css
[data-tabs-trigger] {
  /* `border: none` expands to width:medium which leaks 3px on any side
   * once a theme sets a solid style. Spell the safe baseline out. */
  border-width: 0;
  border-style: solid;
  border-color: currentcolor;
  ...
}
```

Now any theme's `border-{side}-[Npx]` renders cleanly without needing a per-rule `border-style: solid` workaround. Reverted the `border-style: solid` line from `packages/themes/src/minimal/tabs.css` — the base does the job.

Browser-verified the four-theme showcase iframes: zen-sumi keeps its ink fill, rokkit keeps its branded gradient, minimal shows ONLY the 3px bottom hairline on the selected tab, material keeps its saffron pill.

**Default style — zen-sumi**

User flagged that the demo lands on `rokkit` style on first visit. Looked at `packages/states/src/vibe.svelte.js` — class default is `style: 'rokkit'`. And critically `DEFAULT_STYLES = ['rokkit', 'minimal', 'material']` (from `packages/states/src/constants.js`) — `zen-sumi` and `frosted` are NOT in the allowed list, so vibe's setter silently rejects `vibe.style = 'zen-sumi'` if you try it without first expanding `allowedStyles`.

Fix in `demo/src/routes/+layout.svelte`: before the `themable` action runs, expand `vibe.allowedStyles` to include all five themes the demo ships, then set `vibe.style = 'zen-sumi'`. `themable.load()` runs after that and respects any persisted choice in `localStorage['rokkit-theme']`, so existing users keep their pick — only first-time visitors land on zen-sumi.

Verified: cleared localStorage, reloaded `/` → body.dataset.style === 'zen-sumi'. Home page renders in the ink-on-paper aesthetic that matches the project's canonical look.

Lint: 0 errors. Tests: 3500 passed.

## 2026-05-27 (cont.) — rokkit: real primary→accent gradient + hover-on-selected fix

User feedback after the earlier `color-mix` patch:
> "we should keep the original gradient from primary to secondary/accent
> instead of the darker shade. we just need to declare a secondary/accent
> color. … on hover the text color or the highlighted item changes, and
> this text color on hover is not visible in both dark and light modes."

Two concrete fixes plus an embed-page race that surfaced while verifying.

**Gradient — primary → accent, not primary → darker-primary**

Reverted the rokkit-tabs and rokkit-button `color-mix(in oklch, var(--primary) 70%, black)` darker-stop trick to use `var(--accent)` as the second stop. The user is right that this is the cleaner intent — the theme reads as a primary→accent sweep, and skins that don't declare a distinct accent fall back to a flat fill (which is acceptable).

`@apply from-primary to-accent bg-gradient-to-r` still silently drops in core token mode, so the actual CSS is an explicit `background: linear-gradient(to direction, var(--primary), var(--accent))` declaration. Functionally identical.

Touched: `packages/themes/src/rokkit/tabs.css` (all four orientation variants of the selected trigger), `packages/themes/src/rokkit/button.css` (primary variant gradient).

**Demo config — accent: hisui**

`demo/rokkit.config.js` had `accent: 'shu'` (same palette as primary) in both `skin` and `skins.default`. With the new gradient using `var(--accent)`, accent === primary collapses to a one-tone fill. Switched accent to `'hisui'` (jade) — gives a real saffron → jade sweep on rokkit. Other themes that use `text-accent` / `bg-accent` (zen-sumi, material) now render those surfaces in jade instead of saffron; the change is intentional and reads cleanly because jade is in the same OKLCH chroma range as the rest of the palette.

**Hover-on-selected — keep the gradient**

`[data-style='rokkit'] [data-tabs-trigger]:hover` had `bg-paper-mute text-ink-mute` with no `:not([data-selected])` guard. Hovering a selected tab overrode the gradient's `text-on-primary` (paper-white) with `text-ink-mute` (dark ink) while the gradient bg leaked through the `background-color` override — net effect was hard-to-read dark text on the saffron gradient in both modes.

Fix in `packages/themes/src/rokkit/tabs.css`:
```css
[data-style='rokkit']
  [data-tabs-trigger]:hover:not([data-selected]):not(:disabled):not([data-disabled]) {
  @apply bg-paper-mute text-ink-mute;
}
```

Verified by hover via Playwright: selected hover keeps `linear-gradient(saffron, jade)` + paper-white text; unselected hover gets paper-mute bg + ink-mute text. Both legible.

**Embed page race**

While verifying I noticed `/embed/tabs?theme=rokkit` was rendering with `body.dataset.style === 'zen-sumi'` even though the embed page's onMount/$effect set it to 'rokkit'. The root layout's `themable` action also writes to `body.dataset.style` from `vibe.style` (now defaulted to zen-sumi), and its reactive effect was overriding the embed page's direct dataset write.

Fix in `demo/src/routes/embed/tabs/+page.svelte`: drive the active style through `vibe.style = theme` (after expanding `vibe.allowedStyles`), so themable's effect and the embed page agree. Mirror on documentElement too — themable only writes to body. Removed the racy `document.body.dataset.style` direct writes.

Now each iframe on the home theme showcase isolates its theme via the proper vibe channel, not by setting dataset directly.

**Verification — four-theme home showcase**

| theme    | selected tab                                   |
|----------|------------------------------------------------|
| zen-sumi | ink fill `oklch(0.22)` + paper-white text       |
| rokkit   | gradient `oklch(0.58 0.15 35) → oklch(0.62 0.08 160)` (saffron → jade), paper-white text |
| minimal  | transparent bg, ink-mute text, 3px solid bottom hairline |
| material | saffron pill bg `oklch(0.58)`, paper-white text |

Hover-on-selected for rokkit keeps gradient + paper-white. Hover-on-unselected switches to paper-mute + ink-mute (readable).

Lint: 0 errors. Tests: 3500 passed.

**Known follow-up**

`[data-style='gradient']` variants in material/minimal/frosted (and the gradient-related code paths in frosted's filled buttons) still use `@apply from-X to-Y` and have the same latent dropout. They aren't user-visible in the default flows but worth the sweep when someone reaches for that style.

## 2026-05-27 (cont.) — Theme flicker fix + accent revert

Two follow-ups in this round:

**Flicker on load — themeInitScript was being injected too late**

The library ships `themeInitScript` in `@rokkit/unocss/hooks` and the demo's `hooks.server.js` was already wiring it. But the existing wiring injected the script via `transformPageChunk({ html }) => html.replace(/<body[^>]*>/, ...)` — right after `<body>` opens. The SSR HTML body ships with no `data-style` attribute. Between the body open tag and the inline script running, the browser had a brief window where CSS `[data-style='X']` selectors didn't match anything; first paint computed against the unprefixed cascade, then the script flipped the body's dataset and the theme snapped in.

Plus the script wrote ONLY to `document.body`, which doesn't exist when the script is in `<head>`.

Two-part fix:

1. `packages/unocss/src/hooks.js` — script now writes to `document.documentElement.dataset` (which exists during `<head>` parsing) AND mirrors to `document.body.dataset` when the body is present. CSS selectors match through the html ancestor immediately. Also added `?theme=<id>` query-param lookup as the highest-priority source so the `/embed/tabs?theme=X` iframes paint correctly from the very first frame.

2. `demo/src/hooks.server.js` — moved the injection from `<body>` to just before `</head>` so the script runs before the body element is parsed.

3. `demo/src/routes/+layout.svelte` — read `document.documentElement.dataset.style` (already set by the inline script) and sync `vibe.style` to it. Without this, vibe's library default (`rokkit`) leaked through, themable's reactive effect saw vibe.style ≠ body.dataset.style on hydrate, and triggered a second body-attribute write — flicker between the inline-applied skin and themable's vibe-driven write. Now both agree from the start.

Verified:
- Fresh-load SSR HTML places the script inside `<head>` before `<body>` opens.
- `document.documentElement.dataset.style` and `document.body.dataset.style` both read `zen-sumi` on first paint.
- Embed iframes on the home theme showcase each paint in their `?theme=` value from the first frame (zen-sumi, rokkit, minimal, material).

**Accent revert — back to shu**

User flagged a green tint appearing after the previous round's `accent: 'hisui'` change. The demo's koan UI uses `text-accent-z5`, `border-accent-z5`, `bg-accent-z1` extensively as highlight/focus surfaces (ConversationList, PreviewCard, Shell, AnnotationArrow, etc.) — switching accent to jade made every highlight green, which read as a brand shift, not as a rokkit-gradient adjustment.

Reverted `demo/rokkit.config.js`'s `accent: 'hisui'` back to `accent: 'shu'`. The rokkit theme's `linear-gradient(direction, var(--primary), var(--accent))` now flattens to a one-tone saffron fill — which the previous journal entry already documented as the expected fallback. The rokkit selected tab still reads as selected (paper-white text + saffron fill); just no two-tone sweep. Other surfaces (highlights, focus rings) return to saffron.

If a future demo skin wants the two-tone branded gradient back, declare `accent` as a palette distinct from `primary` AND the koan UI's accent-* surfaces will follow that palette too. The trade is unavoidable until either (a) the koan UI uses `primary-z5` for highlights instead of `accent-z5`, or (b) rokkit's gradient picks its own per-theme stop palette independent of skin accent.

Lint: 0 errors. Tests: 3500 passed.

## 2026-05-27 (cont.) — Theme blink across nav + mode-flip on route change

Two more follow-ups after the flash-prevention move:

**Persistent blinking on header items**

After moving the init script to `<head>` and writing to `documentElement.dataset.*`, `themable` was still only writing to `body.dataset.*` at runtime. The theme CSS uses a mix of two selector shapes:

- `[data-mode='dark']` (bare attribute — matches anywhere on the ancestor chain)
- `body[data-mode='dark']` (element-prefixed — matches body only)

When `vibe.mode` changed at runtime, themable updated body, but `documentElement.dataset.mode` stayed at whatever the inline script wrote first. Both old and new mode rules then matched (`[data-mode='light']` via html, `[data-mode='dark']` via body) and the cascade winner depended on source order — yielding the partial / inconsistent style changes the user observed ("background didn't change but some bits did").

Fix in `packages/actions/src/themable.svelte.js`: themable's effect now mirrors `style`/`mode`/`density` to `document.documentElement` in addition to the supplied `root` (when they differ). Keeps html and body in sync for runtime toggles.

**Mode flip on home → /app**

`ColorModeManager`'s constructor unconditionally set `target.mode = resolveMode(initialMode)` where `initialMode` defaulted to `'system'`. Every mount of a consumer (`<ThemeSwitcherToggle/>` on home, then again inside ChatChrome under /app) re-ran that constructor and force-resolved `vibe.mode` to the current OS preference — overriding whatever the user had explicitly set or what storage had persisted.

User-visible effect: open home in dark mode → click around → navigate to /app → ChatChrome's ThemeSwitcherToggle mounts → manager constructor flips vibe.mode to OS resolved → page snaps to light.

Fix in `packages/app/src/utils/color-mode.svelte.ts`: constructor now reads `target.mode` first. If it's already `light` / `dark`, adopt it as the resolved state without touching the target. Only when the target has no usable value do we fall back to deriving from `initialMode` and writing it back.

**Layout sync — extended to mode + density**

`demo/src/routes/+layout.svelte`'s initial sync only mirrored `style` from the inline-applied dataset. Mode and density were left to themable.load() — which is fine for localStorage-backed values, but if the inline script applied a value from `?theme=` or system-preference defaults that don't round-trip to storage, vibe would still be at its library defaults and themable's first effect would overwrite the inline-applied values. Extended the sync to read all three (style/mode/density) from documentElement → body fallback, and writes each through vibe's validating setters.

**Verification**

- Fresh-load `/` → html=zen-sumi/light, body=zen-sumi/light. Matches stored values, no observable mutation cycles.
- Set localStorage to `{mode: 'dark'}`, reload, navigate to /app → both stay dark.
- Click ThemeSwitcher light → both html.mode and body.mode flip to light → background goes from sumi-ink dark to washi paper light immediately.
- Click ThemeSwitcher dark → both html.mode and body.mode flip to dark → background returns to sumi-ink.

Lint: 0 errors. Tests: 3500 passed.

## 2026-05-27 (cont.) — Shared conversation history across /app and /chat

The /app and /chat surfaces each had their own conversation model — /app had a
hardcoded today/yesterday/older sidebar with no real persistence, and /chat had
an in-memory `conversation` store that reset on reload. Made them share a single
persistent store so the sidebar is the same on both routes and conversations
survive reload.

**Schema** (`demo/src/lib/koan/conversations.svelte.ts`)
- `Conversation` = `{id, title, surface: 'app'|'chat', createdAt, updatedAt, turns[]}`.
- `Turn` is `user` (text) or `assistant` with discriminated body: `demo` (for /app
  — demoType + variant), `blocks` (for /chat — opaque Block[] from chat-demo,
  with optional `provider` + `model` tags), plus `markdown`/`component`/`error`
  reserved.
- localStorage persistence (`rokkit-conversations`), cap 20 — oldest pruned on
  append. SSR-safe (guards `typeof localStorage`).
- Module API: `startNew(surface, query)`, `appendUser`, `appendAssistant`,
  `loadConversation`, `bucketByRecency()`, `recencyLabel()`, `removeConversation`,
  `clearAll`. No exported `$derived` (Svelte 5 forbids module-scope derived
  exports — `getCurrentConversation()` returns a fresh value).

**/app wiring** (`demo/src/routes/app/+layout.svelte`)
- `submitQuery` calls `startNew('app', query)` instead of just mutating shell.
- A layout `$effect` watches `shell.demoType` + `shell.demoVariant` and appends
  assistant demo turns when state settles. Dedupe rules:
  - last turn is user → append (initial response)
  - same demoType, different variant → append (variant pick is a new turn —
    matches existing UI behavior per user feedback)
  - different demoType → no-op (cross-demo URL nav within an existing conv is
    "side-trip browsing", not new turns; new demos come via submitQuery which
    starts a fresh conversation)
- `resumeConversation(conv)` routes to the right `/app/<demo>?variant=X` for
  app-surface convs, or `/chat` for chat-surface ones; shell state is
  pre-populated so the post-mount $effect sees a matching last-turn and
  doesn't double-append.

**/chat wiring** (`demo/src/lib/chat-demo/store.svelte.ts`)
- The chat-demo `conversation` object is now a thin shim: `turns` is a getter
  that maps the current chat-surface conversation's Turns into the existing
  `ChatTurn` shape; `thinking` stays as a local `$state`. All write paths
  (`submitQuery`, `submitData`, `submitExport`, `submitAction`) delegate to
  shared store helpers — first user turn creates the conv via `startNew`,
  subsequent push via `appendUser` + `appendAssistant`.
- Each assistant turn carries `{provider: 'scripted'|'openrouter'|'webllm',
  model?}` — stamped from current `llm` state at submit time, so a single
  conversation can record a mix of providers (mid-conversation switching is
  still allowed).
- `syncLLMFromCurrentConversation()` flips the toggle back to the last
  assistant turn's provider/model on resume, so continuation defaults to the
  original setup. Called from /chat's mount $effect (covers cross-surface
  arrival from /app's sidebar) and resumeConversation.

**Sidebar** (cross-surface)
- ChatSidebar → renamed `ChatHistory` (component file, interface, ~30
  `data-chat-sidebar-*` CSS attrs → `data-chat-history-*`). The name fits
  the role now that the sidebar IS the persistent history.
- Both `/app` and `/chat` render ChatHistory reading the same
  `bucketByRecency()` (all surfaces). Cross-surface rows route to their
  origin: app convs → `/app/<demo>?variant=X`, chat convs → `/chat`.
- Per-conv icon: demo type's catalog icon for app convs;
  `i-mdi:chat-processing-outline` for chat convs.

**Layout polish on /chat**
- Subtoolbar (mode toggle + model select + Clear) moved from spanning the full
  width above the sidebar into the content column above the conversation
  stream. Sidebar now extends top-to-bottom of the page.

**Verified end-to-end in browser**
- Empty state on first load. Submit query → conversation persists with user
  turn + assistant turn. Variant pick → 3rd turn appended. Reload → history
  restored. Resume from sidebar → URL restored with `?variant=` + last-turn
  matches state (no double-append). Cross-surface resume in both directions.
  Provider tagging visible as "scripted" / "openrouter" badge above each
  assistant turn. Toggle restoration confirmed via a synthetic openrouter-
  tagged turn (after click, toggle flipped from Scripted to OpenRouter).

**Commits**
- `34f197dd` feat(demo): shared conversation history across /app and /chat
- `a37007cc` feat(demo/chat): tag turns with provider + model; subheader inside content

Lint: 0 errors. Tests: 3500 passed.

## 2026-05-27 (cont.) — Interactive theme wizard: step nav + Style + Preview steps

The ThemeWizardCard's 01/02/03/04 stepper at the top was decorative — clicking did
nothing, only Step 02 (Skin) content rendered. Made the stepper a real tab-list
and added content for the three previously-empty steps.

**Step nav**

- `activeStep: 0|1|2|3` local state; the 4 step pills are `<button>` elements
  with `role="tab"` + `aria-selected`/`aria-current="step"`. Click cycles
  `activeStep`. The `.done` / `.on` classes follow `activeStep` instead of being
  hardcoded.

**Step 01 · Style** — new

- 5-card grid of `siteStyles` (`zen-sumi` / `rokkit` / `minimal` / `material` /
  `frosted`), each card shows the 3-color preview (paper/ink/accent) + name.
- Click → `vibe.style = s.id`. The existing themable cascade picks up the
  change and reskins the whole running app instantly — header pill,
  ChatResponse, sidebar — everything.

**Step 02 · Skin** — unchanged

- Existing palette catalog + role table, wrapped in the `{#if activeStep === 1}`
  branch.

**Step 03 · Typography** — placeholder

- Renders three rows showing `--font-display` / `--font-ui` / `--font-mono`
  against the running app's current font stack. No interaction yet — copy
  explicitly calls out "coming soon" because font-family picking needs its
  own design pass (font loading + system fallbacks).

**Step 04 · Preview** — new

- 4-tile grid of components rendered against the current theme: Buttons
  (primary / default / ghost), Input (label + field stub), Badges
  (stable / accent / ink), Surface stack (paper / paper-soft / paper-mute).
  Reads named tokens directly, so changes from Step 01 (style) and Step 02
  (palette/role) propagate immediately — useful for confirming the theme
  reads correctly on real surfaces before Save preset / Export tokens.css.

**What was already interactive — corrected**

The priority text said to wire swatch clicks, palette IN USE toggling, and
Save/Export. Inspection showed those were already done — `setRoleStep()`,
`togglePalette()`, `savePreset()`, `downloadTokensCss()` all existed and were
wired into the ChatResponse action buttons. Only the step nav + content for
01/03/04 was actually missing.

**Verified in browser**

- Step nav cycles. Active step has accent text + faint background.
- Step 01: click zen-sumi while on rokkit → header style pill flips,
  ChatResponse props row updates to `style zen-sumi`, the surrounding /app
  surfaces all reskin.
- Step 02: palette + role editing untouched.
- Step 03: font samples in the running app's current stack.
- Step 04: 4 preview tiles render with current theme tokens.

Lint: 0 errors. Tests: 3500 passed.

## 2026-05-28 — CodeGroup site component

Multi-file code display for the docs/learn site. Tree picker rather than
tabs — user feedback was that tabs flatten the folder structure most code
samples actually have ("src/lib/components/Button.svelte" alongside
"src/routes/+page.svelte" reads as a tree, not a row of pills). Mobile
considerations were the second design question: tabs scroll horizontally,
but a tree-rail on the left can't fit beside the code on narrow viewports.

**Layout — responsive grid**

```
DESKTOP (≥ 768px)             MOBILE (< 768px)
┌────────┬─────────┐          ┌──────────────┐
│ FILES  │ // code │          │ Btn.svelte ▾ │  ← picker pill
│ ▼ src  │         │          ├──────────────┤
│  Btn ✓ │         │          │ // code      │
│  Input │         │          │              │
│ ▼ rts  │         │          └──────────────┘
│  page  │         │          (tap ▾ → tree slides in
└────────┴─────────┘           as overlay on top of code)
```

CSS grid:
- Default `grid-template-areas: 'rail code' / 'rail preview'` — rail
  fills both rows on the left, code + preview stack on the right.
- `@media (max-width: 767px)`: one-column grid `picker / code` (+ preview
  row when expanded); `.picker` becomes visible (hidden on desktop) and
  `.rail` flips to `position: absolute; top: 41px; left: 0;` —
  `transform: translateX(-100%)` keeps it off-screen until the picker
  toggles `data-open`. `.backdrop` covers the code panel when open, click
  to close.

**API**

```ts
{
  files: Array<{
    path: string         // 'src/lib/Button.svelte' — used as id + for tree placement
    language: string     // Shiki lang id
    code: string
    name?: string        // display name override; defaults to path's last segment
    icon?: string        // file icon override
  }>
  initialFile?: string   // which path to show first; defaults to files[0].path
  class?: string
  showCopyButton?: boolean
  // snippet:
  preview?: Snippet      // optional live demo; collapsed by default, opt-in
                          // via the "Show preview" toggle (per spec)
}
```

**Implementation notes**

- Tree built by splitting each path on `/`, deduping intermediate folder
  segments into a Map keyed by accumulated path. Final segment becomes a
  file leaf carrying the full path as id. File icons derived from
  extension (`i-file:svelte`, etc.); folders use `i-mdi:folder-outline`.
- `handleTreeSelect` filters out folder selections — only file leaves
  switch the panel. On mobile, also closes the drawer after a pick so the
  user sees their selection immediately.
- Shiki highlights through the existing `$lib/shiki.js` helper; theme
  follows `vibe.mode` (github-dark / github-light) consistent with the
  earlier `FileTabs` component.
- Preview state is local (`previewExpanded = $state(false)`). The toggle
  button shows `i-mdi:eye-outline` / `i-mdi:eye-off-outline` + label,
  picks up `data-action[aria-expanded='true']` for the accent highlight.

**Gotcha discovered + fixed during dev**

The playground page demonstrates the component by passing Svelte source
strings as the `code` value of each file. Those strings contained
literal `</script>` tokens, which the *outer* Svelte parser saw and
prematurely closed the page's own `<script>` block (1 error at line 28
of the playground page). Fix: escape inner closers as `<\/script>` —
classic JavaScript-in-Svelte gotcha worth remembering. The component
itself isn't affected; only consumers writing inline Svelte examples.

Initially also had `.rail { width: min(280px, 80vw); }` which overflowed
when the containing element was narrower than 280px (e.g., when the
site's left sidebar eats half the viewport on mobile). Changed to
`min(280px, 100%)` so the rail stays inside its container.

**Verified in browser**

- Desktop 1280px: tree on left, code panel on right, Show preview reveals
  preview pane below code. Tree expand/collapse works. Click `index.ts`
  leaf → code panel shows index.ts contents (2 lines). Show preview →
  toggle flips to "Hide preview", preview snippet renders.
- Mobile 390px: tree hidden, picker pill at top. Click pill → rail
  slides in as overlay (verified via `getBoundingClientRect`: rail
  position: absolute, transform identity when open vs translateX(-100%)
  when closed). z-index puts rail above the backdrop above the code.

**Tested**

Lint: 0 errors. Tests: not affected — site-only addition.


## 2026-05-28 (cont.) — Theme wizard Step 03: real typography picker

Replaced the "coming soon" placeholder with a working font-family picker.
Picks live-apply across the running app and persist through the wizard's
existing Save preset + Export tokens.css flow.

**Store additions** (`theme-wizard/store.svelte.ts`)

- New `FontRole = 'display' | 'ui' | 'mono'` + `FONT_VAR` map to
  `--font-display` / `--font-ui` / `--font-mono`.
- New `fontCatalogs: Record<FontRole, FontChoice[]>`. Each entry's `stack`
  drops straight into the CSS var:
  - display: Fraunces, Iowan/Georgia, Inter, System UI
  - ui: Inter, System UI, Helvetica, Georgia
  - mono: JetBrains Mono, SF / Menlo, Consolas
- Only system fonts + the demo's already-loaded faces (Fraunces / Inter /
  JetBrains Mono are loaded by `demo/rokkit.config.js`). Picking never
  triggers a network load. Adding network-loaded Google Fonts etc. is a
  future iteration once we wire a loader.
- `wizardState.fonts: Record<FontRole, string>` tracks the chosen choice
  id per role. `defaultFontChoiceIds()` returns `fraunces / inter /
  jetbrains` (matches the running app's defaults).
- `fontStack(role)` helper resolves an id to its stack.
- `savePreset` / `resetPreset` / `loadStoredPreset` all carry the new
  `fonts` field (with a forgiving default merge on load so old presets
  still hydrate).
- `exportTokensCss()` emits three new `:root` declarations alongside the
  existing color tokens.

**Card render** (`ThemeWizardCard.svelte`)

- Step 03 body is three labeled rows (one per FontRole). Each row shows
  the `--font-{role}` key + a one-line description ("headings + display"
  / "body + UI" / "code, eyebrows, kbd").
- Each row's choices render as a responsive grid of cards. Cards show the
  rendered sample ("Quick brown fox" for display + ui, `const fox =
  'brown'` for mono) in the corresponding `font-family` so users can
  read-compare without picking first. Card name + note ("loaded" /
  "native" / "literary serif") under the sample.
- Active card carries `data-active` for accent border + faint tint.
- `pickFont(role, choiceId)` writes to `wizardState.fonts[role]`. The
  existing `applyRolesToDocument` $effect now also sets `--font-{role}`
  on `documentElement.style` after applying the role colors — so the
  whole running app reflows in the picked font immediately.

**Verified in browser**

- Wizard → step 03 renders all three rows with samples in the right
  fonts. Fraunces / Inter / JetBrains Mono shown as active by default.
- Click "Inter · sans display" under display → card flips to active,
  `document.documentElement.style['--font-display']` reads
  `'Inter', system-ui, sans-serif`, and `getComputedStyle(.canvas-title)
  .fontFamily` returns `Inter, system-ui, sans-serif` — confirms the
  running app reflowed.
- `exportTokensCss()` now includes the three `--font-*` declarations in
  the `:root` block alongside the color tokens (paper / paper-soft /
  paper-mute / paper-edge / ink / ink-mute / accent).
- Save preset → localStorage carries `fonts: { display, ui, mono }`.
  Reload → defaults restore correctly (load merges with current defaults
  to forgive partial / outdated preset blobs).

**Commit**

- `<next>` feat(demo/wizard): real typography picker in Step 03

Lint: 0 errors. Tests: 3500 passed.

## 2026-05-28 (cont.) — CodeGroup → @rokkit/ui + semantic file icons

Three follow-ups to the freshly shipped CodeGroup, per user review:
1. `i-mdi:*` references are external + bypass the override pattern — should
   use Rokkit's semantic icons.
2. CodeGroup belongs in `@rokkit/ui`, not `site/`.
3. Provide per-language semantic file icon names (`file-default`,
   `file-svelte`, etc.) mapped through `packages/icons/src/` (Solar source).

**Icons (Phase C)**

- Added 8 file-type semantic names to both `glyph-map.json` and
  `semantic-map.json`:
  - `file-default → file` · `file-svelte/js/ts → code-2` ·
    `file-css → palette` · `file-html/json → code-square` ·
    `file-md → notebook`
  - Solar lacks per-language logos, so we group by aesthetic family;
    consumers can override at the icon-collection level (replace
    `file-svelte.svg`) or per-component via the `icons` prop.
- Also added `view-preview → eye` and `view-off → eye-closed` semantic
  names for the preview toggle.
- Regenerated all variant SVGs (default / outline / solid / duotone-
  outline) from Solar via the existing `add-solar-{semantic,glyphs}.js`
  scripts, then rebundled the JSON via `rokkit-cli build`.
- Extended `DEFAULT_ICONS` in `@rokkit/core` so the new names get
  registered as UnoCSS shortcuts via `iconShortcuts`. Auto-grouping
  through `stateIconsFromNames` produces `DEFAULT_STATE_ICONS.file.{ext}`
  and `DEFAULT_STATE_ICONS.view.{preview,off}`.
- Updated the `constants.spec.js` snapshot to cover the new groups.

**CodeGroup → @rokkit/ui (Phase B)**

- Moved `site/src/lib/components/CodeGroup.svelte` →
  `packages/ui/src/components/CodeGroup.svelte`. Exported from the ui
  index alongside `Code` and `CodeBlock`.
- The code panel now reuses `<CodeBlock>` (already in ui) instead of
  calling Shiki inline — encapsulates highlighting + copy + theme
  tracking, and inherits future CodeBlock improvements.
- The preview-toggle button now passes through CodeBlock's `actions`
  snippet so it sits in the same header row as Copy. No separate header
  layout.
- Updated site playground to import from `@rokkit/ui`.

**Semantic icons (Phase A)**

- Replaced every `i-mdi:*` reference in CodeGroup with semantic names
  from `DEFAULT_STATE_ICONS`. Picker chevron uses `navigate-down`;
  copy/preview/close come through the `action` and `view` groups.
- New `icons` prop following the Tree / Dropdown / BreadCrumbs pattern:
  `{ file?, folder?, view?, action? }`. Each is merged with the matching
  `DEFAULT_STATE_ICONS.*` group, so consumers can swap individual icons
  without redeclaring the whole map.
- File icons are picked by extension via a small EXT_TO_KEY map (svelte
  / js / mjs / cjs / ts / tsx / css / scss / sass / html / htm / json /
  yaml / yml / md / mdx). Unknown extensions fall back to
  `icons.file.default`.

**Gotcha: ItemContent + bare names**

`ItemContent.svelte`'s `isIconClass()` only accepts `i-*`-prefixed
classes as CSS-class icons — bare semantic names (the canonical form in
`DEFAULT_STATE_ICONS`) get rendered as literal text via
`<span data-item-icon-literal>`. Tree's own folder open/close icons are
rendered through Tree's template directly (so the bare name works there
via UnoCSS shortcuts), but file leaves go through ItemContent. CodeGroup
now prefixes file icons with `i-semantic:` before handing them to the
tree. The `asClass` helper makes the prefix opt-in: consumers passing a
pre-prefixed class (e.g. `i-glyph:foo`) skip the prefix.

**Site config additions**

- `site/rokkit.config.js`: registered `semantic: '@rokkit/icons/semantic.json'`
  so the `i-semantic:*` collection resolves (was previously absent,
  meaning the default icon-shortcut output had no consumer).
- `site/uno.config.js`: safelisted the new semantic file names + the
  prefixed `i-semantic:file-*` forms. Bare names are needed for the
  picker (whose template uses bare-name + UnoCSS shortcut expansion);
  prefixed forms are needed for the tree leaves (whose ItemContent
  requires the prefix).

**Verified in browser** (site playground at `/playground/code-group`)

- Desktop: tree shows correct per-extension glyphs — `<>` for svelte/js/
  ts (code-2), 📦 for json/html (code-square), 📁 for folders. Picker
  pill on mobile shows the icon for the current file. Preview toggle
  reveals/hides the preview pane (uses `view-preview` / `view-off`).
- All three CodeGroup behaviors (file switching, mobile drawer, preview
  toggle) intact through the move.

Lint: 0 errors. Tests: 3500 passed (including the updated constants
spec).

## 2026-05-28 (cont.) — Length-based isIconClass + rename file-* → doc-*

User correction: the intent behind icon handling was "if char length > 1
it assumes that's an icon" — any bare semantic name should work via UnoCSS
shortcuts. Updated `isIconClass()` accordingly, then hit a hard naming
collision and had to rename the file-type icons.

**`isIconClass` rewrite** (`@rokkit/core`)

Was: `icon.startsWith('i-')` — only `i-*` prefixed classes counted.
Now: `[...icon].length > 1` — anything more than one grapheme is treated
as a class. Single characters (kanji, emoji, single letter) render as
literal text; multi-character strings (bare semantic names like
`folder-opened` or fully-qualified `i-semantic:foo`) render as a class
attribute and let UnoCSS shortcut-resolution do the work.

Updated `utils.spec.js` with new cases — bare semantic names assert
`true`, single CJK / emoji / letter assert `false`. Note: ZWJ-sequence
emoji like `👨‍👩‍👧‍👦` will spread to >1 codepoint and be classified as a
class — not handling that edge case because it doesn't occur in real
icon-name data.

**Naming collision: file-* shadows the `file:` pseudo variant**

After the isIconClass change, `file-svelte` etc. still didn't render. A
~30-min debug session with the UnoCSS internal APIs traced it down: when
`presetMini` is loaded (transitively via presetWind3, which presetRokkit
includes), there's a `pseudo` variant matching the `file:` prefix
(targets `::file-selector-button` on `input[type=file]`). UnoCSS supports
both `:` and `-` as the variant separator, so the variant matches
`file-svelte` first, strips `file-`, looks up `svelte` as a utility, fails,
and the WHOLE class fails — never reaching the icon-shortcut chain.

Same problem would hit `marker-`, `placeholder-`, `before-`, `after-`,
`selection-` (other pseudo-element variants). Tested `ext-` / `doc-` —
both work, no variant collision.

Renamed all 8 file-type semantic icons to `doc-*`:
- `doc-default` · `doc-svelte` · `doc-js` · `doc-ts` ·
  `doc-css` · `doc-html` · `doc-json` · `doc-md`

Updated:
- `packages/icons/scripts/{semantic,glyph}-map.json` — rename map entries
- `packages/icons/src/{semantic,glyph}/` — deleted old `file-*` SVGs;
  regenerated all `doc-*` variants from Solar via the existing scripts;
  rebundled JSON via `rokkit-cli build`
- `packages/core/src/constants.js` — `DEFAULT_ICONS` uses `doc-*`
- `packages/core/spec/constants.spec.js` — group key renamed `file` → `doc`
- `packages/ui/src/components/CodeGroup.svelte` — `icons.file.*` →
  `icons.doc.*` throughout (props interface, EXT_TO_KEY mapping is
  unchanged since keys are short extension strings); `asClass` workaround
  removed (no longer needed since isIconClass accepts bare names)
- `site/uno.config.js` — safelist updated to `doc-*` and the workaround
  i-semantic: prefixed safelist entries removed
- `site/rokkit.config.js` — `file: './static/icons/files/icons.json'`
  restored (the earlier "fileLogo" rename was a red herring; the real
  conflict is the pseudo variant, not the collection name)

**Verified in browser**

- `class="doc-svelte"` → `.doc-svelte { ... }` CSS rule generated by
  shortcut chain, icon renders correctly.
- All 8 doc-* + folder-opened/closed + view-preview/off + navigate-down
  bare-name shortcuts emit CSS rules.
- HTML uses bare semantic names directly (no `i-semantic:` prefix), and
  they paint correctly through the running app.

**Why the rename, in one line**

`file-` is reserved by UnoCSS's `file:` pseudo-element variant. Avoid
shadow-prone prefixes (`marker-`, `placeholder-`, `before-`, `after-`,
`selection-`) for any semantic icon names UnoCSS shortcuts use.

Lint: 0 errors. Tests: 3501 passed.

## 2026-05-28 (cont.) — Drop hardcoded i-mdi / i-lucide refs from shared components

Audit of `packages/**/*.svelte` and `packages/**/*.{js,ts}` for hardcoded
icon class refs that bypass the semantic-icon override pattern. Three
real violations beyond what `CodeGroup` already cleaned up:

1. `@rokkit/ui/CodeBlock.svelte` — `i-mdi:code-tags`, `i-mdi:check`,
   `i-mdi:content-copy`, `i-mdi:download`
2. `@rokkit/blocks/PlotPlugin.svelte` — `i-mdi:eye-off-outline`,
   `i-mdi:code-tags`, `i-mdi:content-copy`, `i-mdi:download`
3. `@rokkit/ui/utils/upload.js::inferIcon()` — 6× `i-lucide:*` strings
   for MIME-type icons (image / video / audio / file-text / archive / file)

**Two new semantic groups added per user direction (Phase B)**

- `media-*` — kept the prefix because there's no `media:` UnoCSS variant.
  Group: `media-image` (Solar `gallery-minimalistic`), `media-video`
  (`videocamera`), `media-audio` (`music-notes`).
- `doc-*` — extended the existing doc group with `doc-text`
  (`file-text`), `doc-pdf` (`document`), `doc-archive` (`archive`). The
  doc-default fallback covers unknown / null / undefined MIME types.

**Plus `action-download`** (Phase A) — Solar `download`. Adds to the
existing `action-*` group alongside `copy`, `copysuccess`, `check`, etc.

All 7 new names went through the usual pipeline:
- `packages/icons/scripts/semantic-map.json` + `glyph-map.json`
- `packages/core/src/constants.js` — `DEFAULT_ICONS` extended
- `packages/core/spec/constants.spec.js` — group snapshot updated
  (`doc` group now has 11 keys; new `media` group with 3 keys; `action`
  group adds `download`)
- Regenerated SVGs via `add-solar-{semantic,glyphs}.js`, rebundled JSON
- Browser-verified the bare-name shortcut chain emits CSS for each new
  semantic name (`.action-download`, `.media-image`, `.doc-pdf` etc.)

**Component swaps**

CodeBlock.svelte:
- header icon: `i-mdi:code-tags` → `view-code`
- copy/copied: `i-mdi:content-copy` / `i-mdi:check` → `action-copy` /
  `action-check`
- download: `i-mdi:download` → `action-download`

PlotPlugin.svelte:
- view-code toggle: `i-mdi:eye-off-outline` / `i-mdi:code-tags` →
  `view-off` / `view-code`
- copy spec: `i-mdi:content-copy` → `action-copy`
- export SVG: `i-mdi:download` → `action-download`

upload.js `inferIcon`:
- `image/*` → `media-image`
- `video/*` → `media-video`
- `audio/*` → `media-audio`
- `text/*` → `doc-text`
- `application/pdf` → `doc-pdf`
- archives (zip/gzip/x-tar) → `doc-archive`
- everything else (unknown / null / undefined / empty) → `doc-default`

**Test updates**

`upload-utils.spec.js` — 9 assertions for `inferIcon` updated to expect
the new semantic names. `UploadFileStatus.spec.svelte.ts` — class-
contains assertion for `image/jpeg` updated to `media-image`.

**Out of scope (not violations)**

- `packages/stories/` — `i-solar:*` refs in Demo.svelte +
  StoryViewer.svelte. That's the Storybook-style demo package, not a
  shared UI component. Acceptable.
- `packages/ui/spec/*.spec.ts` — `i-lucide:*` strings are TEST
  FIXTURES (passed in as `icon` field on items to verify the component
  renders whatever class string it's given). Not internal references.
- `packages/core/spec/utils.spec.js` — `i-glyph:settings` in an
  `isIconClass` truth-table test. Same pattern.

Lint: 0 errors. Tests: 3501 passed.

## 2026-05-28 (cont.) — presetRokkit: glyph default + auto-safelist overrides

User asked whether `presetRokkit` bundles the default icon map + glyphs by
default. Most of it was already there; two gaps:

1. `i-glyph:*` collection wasn't a default — every consumer
   (demo, site) declared `glyph: '@rokkit/icons/glyph.json'` manually.
2. User-defined `config.icons.overrides` shortcut keys weren't
   auto-safelisted, so they'd silently purge unless the consumer also
   added them to their own safelist.

**Changes** (`packages/unocss/src/preset.ts`)

- `buildIconCollections` now registers `glyph: '@rokkit/icons/glyph.json'`
  alongside `rokkit` and `semantic` by default. Consumer entries still
  override by name (so consumers who point `glyph` at a different bundle
  win).
- `buildSafelist(config)` now also includes `Object.keys(config.icons.overrides ?? {})`,
  so any bare-name shortcut a consumer adds via the overrides map gets
  the CSS rule emitted without extra safelist setup.

**Spec coverage** (`packages/unocss/spec/preset.spec.js`)

Two new cases in the existing `shortcuts — skin and icon coverage`
block:
- `should register rokkit / semantic / glyph icon collections by default`
- `should auto-safelist user-defined icon override keys`

**Consumer simplification**

- `demo/rokkit.config.js`: dropped explicit `glyph` declaration —
  preset provides it. Only `app: '@rokkit/icons/app.json'` remains.
- `site/rokkit.config.js`: dropped explicit `glyph` + `semantic`
  declarations (also defaults). Kept `app`, `logo`, `file`, `solar`
  which are site-specific.
- `site/uno.config.js`: dropped the ~30-entry `fileIcons` safelist
  block — those names are all in `DEFAULT_ICONS` and were already
  auto-safelisted by the preset. The extra entries were redundant
  workarounds during the earlier debug session.

**Docs** (`packages/unocss/README.md`)

Added a new `### Icons` section under Setup with three subsections:
- "Adding your own icons" — register collections via `config.icons.{alias}`
- "Adding bare-name shortcuts (your own glyphs)" — use
  `config.icons.overrides` to add or override entries in the
  DEFAULT_ICONS shortcut map; keys auto-safelist
- "Variant style" — `config.icons.style: 'outline'` etc.

Also a table of the three always-available collections (`i-rokkit:`,
`i-semantic:`, `i-glyph:`) so newcomers know what's free out of the box.

**Verified in browser**

After dropping the redundant safelist + collection declarations, the
site playground at `/playground/code-group` still emits bare-name
shortcut CSS rules (`.doc-svelte`, `.folder-opened`, `.view-preview`,
`.action-copy`, `.media-image`, etc.) entirely through the preset's
auto-registered safelist + shortcut chain. No manual safelist needed
on the consumer side.

Lint: 0 errors. Tests: 3503 passed (3501 + 2 new spec).

## 2026-05-28 (cont.) — Minimal List/Tree guide-line style

Per saved feedback: per-item left borders are the wrong aesthetic for
minimal. The correct pattern is a continuous thin vertical guide line
on the group container (matching the tree connector lines' tone), and
the active item gets a bolder accent segment overlaying that guide
line at its row.

**`packages/themes/src/minimal/list.css`**

- Container now has `position: relative` plus a `::before` rule that
  draws a full-height 1px guide line at `left: 0` in `var(--paper-edge)`.
- Items lose the `border-0 border-solid border-transparent` reset and
  gain `padding-left: 0.75rem` so text/icons sit past the line.
- Active state (and selected for multi-select) replaces the old
  `border-l-2 border-accent` with `box-shadow: inset 2px 0 0 0
  var(--accent)`. The 2px inset sits at the item's left edge — same
  x-position as the container's `::before` — so the bolder colored
  segment visually overlaps the 1px guide line.
- Same pattern in both unfocused and focus-within active states; the
  text color contrast handles the "is this list focused?" cue
  (`ink-mute` vs `accent`).

**`packages/themes/src/minimal/tree.css`**

- Tree already has structural connector indent lines per depth via the
  `Connector` component, so no container guide-line is added.
- Active/selected states swap `border-l-2 border-primary` for
  `box-shadow: inset 2px 0 0 0 var(--primary)` — same idiom as List.
  The bolder segment sits next to the deepest connector line at the
  active row, reading as a continuation of the tree's existing
  visual language.

**Verified**

- Rendered CSS from `/app/list?theme=minimal`:
  - `[data-style='minimal'] [data-list]::before { content: ''; position:
    absolute; inset: 0 auto 0 0; width: 1px; background: var(--paper-edge); }`
    — guide line present.
  - `[data-style='minimal'] [data-list] [data-list-item]
    [data-active='true'] { box-shadow: inset 2px 0 0 0 var(--accent); }`
    — bolder segment present.
  - No `border-left-width:2px` declarations in minimal rules anymore.
- Tree's active rule shows `box-shadow: inset 2px 0 0 0 var(--primary)`
  with no border-left.

Lint: 0 errors. Tests: 3503 passed.

## 2026-05-28 (cont.) — Koan catalog expansion: audit pass

Priority item said "add more demo responses" + listed three chips that
fell back to Tabs ("Sortable data table" / "Tree select" / "Multi-select
with chips"). Audited the current state — it's done:

**Inventory**

13 catalog entries (`demo/src/lib/koan/demos/*/meta.ts`), 13 matching
`/app/<demo>` routes, 13 branches in `pickDemoKind` in
`+layout.svelte`. Names align (with the obvious `date-picker → /app/date`
and `theme-wizard → /app/theming` URL mappings via the DEMO_ROUTE map).

**runMatch verification**

Reproduced the MiniSearch index config (title boost ×3, keywords ×2,
description ×1, fuzzy 0.2, prefix true) in a node script and ran the
three priority-listed queries:

```
"Sortable data table"     → table
"Tree select"             → tree
"Multi-select with chips" → multi-select
```

Plus "tabs", "how do tabs work", "show me a form" all resolve to their
expected ids.

**Follow-up noted, not blocking**

The welcome page has `<a href="/app/catalog">Browse the full catalog</a>`
but no route exists. Existing inline comment marks it TBD. Not part of
this priority item — captured as a future enhancement (small grid-of-
cards page over `catalog` from `lib/koan/catalog.ts`).

Marked the priority item complete in docs/design/12-priority.md.

## 2026-05-28 (cont.) — apps/ restructure + state-patterns design doc

**Restructure: `site/` → `apps/learn/`, `demo/` → `apps/demo/`**

`git mv` preserved history. Updated structural paths:
- root `package.json`: workspaces (`./apps/learn`, `./apps/demo`) +
  `test:e2e` script
- `vitest.config.ts`: `learn` project root + `$lib`/`$app` resolve
  aliases + coverage `exclude` pattern
- `apps/{learn,demo}/uno.config.js`: content `include` relatives
  `../packages/` → `../../packages/`
- `apps/learn/package.json`: `dev`/`build` scripts `../docs/llms` →
  `../../docs/llms`
- `config/eslint.config.mjs`: 5 occurrences of `site/...` patterns
- `config/bump.config.js`: bump target file path
- `CLAUDE.md` + `.claude/{commands,skills}/` + `agents/design-patterns.md`
  + `docs/design/{05,06}-*.md` + `docs/design/12-priority.md`:
  current-state path references

Historical docs (`agents/journal.md`, `docs/backlog/`,
`docs/superpowers/{plans,specs}/`, `docs/design-system/execution-plan.md`)
intentionally not retroactively rewritten — they describe what was true
at the time. (User will update the Vercel base-folder config separately.)

Verified both apps' dev servers boot to 200 on `/`, `/app`, `/chat`,
`/playground/code-group`. `bun install` clean. Tests pass.

**State patterns design doc**

`docs/design/18-state-patterns.md` lays out:
- 8-state vocabulary split into transient (idle / hover / focus-visible /
  pressed) and persistent (current / selected / disabled / read-only)
- Group-vs-element distinction: `:focus-within` + element state combos
- Three token tiers per state: surface (bg+fg), mark (the visual
  indicator — bar / underline / fill), affordance (focus ring, cursor)
- Element-vs-group token naming (`--state-current-mark` vs
  `--state-current-mark-active`)
- Refactoring before/after for the minimal List active state, showing
  how component CSS becomes theme-agnostic when tokens express the
  recipe
- Phased migration plan starting with List + Tree, ~600-line reduction
  estimate

Migration itself is a separate item — the doc is the planning
artifact. Out of scope: animations/transitions on state changes,
form-field validity (covered by named tokens), and compound states.

**Priority status**

Both items marked complete in docs/design/12-priority.md. Open P2 items
remaining are all crossed off; only the unchecked Koan-catalog-route
TBD (a non-priority follow-up) is queued.

Lint: 0 errors. Tests: 3503 passed.
