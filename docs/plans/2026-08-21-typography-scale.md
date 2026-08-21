# Typography scale — heading levels + font styles (#152, remainder)

**Decision (user, 2026-08-21):** no custom/runtime web-font loader. Font *loading* is
already solved at build time by self-hosted `@fontsource` packages. The remaining
typography work is **heading levels and font styles**, not more faces.

**Status:** NOT STARTED. The font-selection half of #152 is done and tested
(`f69308fa`).

---

## What already exists

| Piece | State |
| --- | --- |
| `--font-display` / `--font-ui` / `--font-mono` | ✅ `packages/themes/src/base/typography.css`, emitted by the UnoCSS preset's `buildTypographyVars` |
| Legacy aliases `--font-heading` / `--font-sans` | ✅ kept in sync |
| `--radius-*` scale | ✅ same file (`buildRadiusVars`) |
| Wizard step 03 font picking → live preview → export | ✅ shipped, 12 unit + 5 e2e (`f69308fa`) |

## What does not exist — verified, not assumed

**There is no type scale anywhere.** Checked `packages/themes/src/base/typography.css`
(font families + radius only) and `packages/unocss/src/preset.ts`
(`buildTypographyVars` emits exactly three family vars plus two aliases). There are no
`--text-*`, no per-heading-level size/weight/line-height tokens, and nothing in
`rokkit.config.js`'s `typography: {}` beyond `display` / `sans` / `mono`.

So this is **designing a new token set**, not surfacing existing ones in the wizard. That
is why it is planned rather than tacked onto the font work.

---

## Design questions to settle first

These are choices, not lookups — each changes the token surface:

1. **Scale shape.** A modular ratio (`--type-ratio: 1.25` and derive levels) or explicit
   per-level tokens (`--text-h1: 2.5rem` …)? A ratio is one knob and scales cleanly; explicit
   levels are what designers usually want to nudge individually. A ratio *plus* per-level
   overrides is the usual compromise and is probably right here, matching how
   `--radius-*` already offers named presets with per-key override.
2. **How many levels.** h1–h6, or h1–h4 plus body/small? The learn app's own headings are
   the evidence — audit what is actually used before inventing six.
3. **What varies per level.** Size alone, or size + weight + line-height + tracking?
   Display faces usually need tighter tracking at large sizes, which argues for at least
   size + line-height + tracking.
4. **Font styles per role.** Weight (`--font-weight-display`), and whether italic/optical
   size is in scope. Fraunces is a variable font with a `SOFT`/`WONK` axis — decide whether
   the wizard exposes variable axes or stays on weight.
5. **Density interaction.** `base/density.css` already scales spacing. Does the type scale
   respond to density, or stay fixed? (Precedent: the control-height memory note says
   heights are deliberately density-*independent*, so fixed is the likely answer.)

## ✅ Answers — approved by the user 2026-08-21

1. **Both** — a `--type-ratio` default with per-level token overrides. Mirrors the existing
   `--radius-*` shape (named preset + per-key override), so it is a house pattern, not a
   new idiom.
2. **h1–h3 + `body` + `small`, with h4 defined as headroom.** Measured, not assumed:
   `h1: 7`, `h2: 14`, `h3: 54`, `h4/h5/h6: 0` across `apps/learn/src`, `packages/ui/src`
   and `packages/blocks/src`, and no rendered guide markdown goes deeper than `###`.
   h5/h6 would be tokens with no consumer.
3. **size + line-height + weight.** Line-height has to scale with size or large headings
   read loose. Tracking is deferred — Fraunces already handles optical sizing, so there is
   nothing visibly asking for it yet.
4. **No variable-font axes — weight only.** Axes are per-face; exposing `SOFT`/`WONK` would
   make the wizard's controls depend on which font is selected, and the wizard is
   face-agnostic.
5. **Density-independent.** Precedent: control heights are deliberately fixed so controls
   align (see the control-height note). Type that resized with density would break that
   alignment and reflow every layout on a density toggle.

Guiding constraint behind (2) and (4): **do not ship tokens nothing reads.** A scale with
six levels and two axes looks thorough while half of it is unreachable and unverifiable.

---

## Phases

### Phase 1 — tokens
- [ ] Add the scale to `packages/themes/src/base/typography.css` (`:where(:root)` so
      preset emissions still win — see that file's own note on specificity).
- [ ] Emit from the UnoCSS preset: extend `buildTypographyVars` and the config's
      `typography: {}` shape. `buildTypographyVars` already carries a complexity lint
      warning at 9 — split it rather than growing it.
- [ ] Apply the tokens in `base/display.css` (or wherever headings are styled) so the
      tokens have a real consumer. Tokens nothing reads are dead output.
- [ ] Unit tests on the preset emit; contrast/e2e stay green.

### Phase 2 — wizard step 03
- [ ] Heading-level + font-style controls beside the existing font-role cards.
- [ ] Same three paths the fonts already use: live `--*` on the document root, persisted
      into the saved preset, emitted into `exportTokensCss()`.
- [ ] Extend `apps/learn/spec/koan/theme-wizard-fonts.spec.svelte.ts` (rename to
      `theme-wizard-typography`) and the e2e — the existing files already cover the
      selection → preview → export shape, so follow it.

### Phase 3 — docs
- [ ] `docs/design/` typography section; note the scale in the semantic-styles skill if it
      enumerates tokens.

---

## Note

The existing "graceful fallback" test (`every stack ends on a generic family`) is
family-specific. A scale needs its own invariant — e.g. levels are monotonically
decreasing h1 → small — so a mis-ordered scale fails loudly rather than looking odd.
