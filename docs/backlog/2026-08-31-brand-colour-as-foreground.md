# Brand colour as foreground

**Raised:** 2026-08-31, from the interaction-state contrast audit.
**Status:** open — needs a design decision before any code.

## The problem

A palette's `500` stop is chosen as a **fill** colour. The recorded principle says
so explicitly:

> Keep the 500 as the literal fill (never darken it — that browns saturated
> hues); contrast comes from the auto near-black/white on-color picked by fill
> luminance. Palette authors pick contrasting 500s.

But the themes also use those same 500s as **foreground** colours — selected-item
text, active icons, status text on a soft tint. In that direction there is no
on-color to lean on, and a saturated mid-luminance 500 cannot clear 4.5:1
against paper. Every remaining contrast failure in the repo is this one class:

| Where | Pairing | Measured | Needs |
| --- | --- | --- | --- |
| `list` / `select` / `multiselect` selected label | `primary` on `paper` | 2.09–2.19 | 4.5 |
| `floating-navigation` active item | `primary` on `primary-soft` | 2.12 | 4.5 |
| `tabs` selected icon | `primary` on `primary-soft` | 1.64 | 3.0 |
| `floating-navigation` active icon (ocean) | `teal` on `paper` | 2.12–2.31 | 3.0 |
| `message` dismiss | `warning` on `warning-soft` | 2.17 | 3.0 |
| chart marks (bar / pie / box / scatter) | mark fill on `paper` | 1.10–1.39 | 3.0 |

Booked as debt in `apps/learn/e2e/interaction-contrast.baseline.json` (58 keys)
and `apps/learn/e2e/theme-contrast.baseline.json` (3 keys). The ratchet means
these cannot get *worse* without failing the build, but they are not fixed.

## Why it is not a mechanical fix

Changing it alters what "selected" and "active" LOOK like in all five themes.
Every option below is a visual-language decision, not a token swap:

1. **A darker foreground stop.** Introduce a foreground-safe variant (e.g. the
   700 stop) for text/icon use, keeping the 500 for fills. Cost: adds to a
   deliberately trimmed token vocabulary
   (`docs/superpowers/specs/2026-05-15-trimmed-token-vocabulary-design.md`), and
   every theme has to opt in per part.
2. **Drop brand colour from foregrounds.** Selected text becomes `ink`, and the
   selection signal moves entirely to a non-colour mark — the inset bar / left
   border already used by `minimal` and `zen-sumi`. Cheapest to implement, most
   consistent with the existing mark tier in `docs/design/18-state-patterns.md`,
   but the themes lose colour as a selection cue.
3. **Per-role on-light/on-dark pairs.** The full fix: each role carries a
   foreground colour computed for the surface it lands on, the mirror of the
   existing `on-primary`. Most correct, largest change, and it interacts with
   item 4 below.

## Related defect found in the same audit

`text-on-accent`, `text-on-danger` and friends compile to a **build-time-baked
hex**, not a CSS variable — only `on-primary` is in `NAMED_TOKENS`. They
therefore cannot react to a skin. It happens to be harmless today because every
non-primary role fill in every shipped skin is light, so the baked near-black is
correct; but a skin with a dark accent would silently get an unreadable label.
Proven while re-picking the violet skin: shifting its palette darker made
`text-on-accent` paint near-black on a dark fill at 2.67:1.

Fixing this means emitting `on-{role}` for every fill role, which is the same
decision as option 3 above and should be taken together with it.

## Chart marks are a separate sub-decision

The chart failures (1.10–1.39) are mark fills against the plot surface. Data-viz
palettes also have to keep *adjacent series* distinguishable from each other, not
just from the background, so this needs its own pass against
`docs/design/17-chart-preset.md` rather than being folded into the component
token work.
