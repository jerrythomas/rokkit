# Theme bugs uncovered by the home theme showcase

Building the four-theme `<Tabs/>` showcase on the demo home page surfaced
three real bugs in the original library themes. None block the demo (the
iframes work and look distinct) but they're worth fixing before anyone
relies on these themes in production.

Discovered: 2026-05-25 while iterating on `/`. Severity: cosmetic /
contrast.

**Status: all three fixed 2026-05-26.** See journal `2026-05-26 — Theme
bugs uncovered by home showcase: all three fixed`. Root causes were not
quite what the original investigation suspected — see fix notes inline.

## 1. `text-on-primary` not resolving to `var(--on-primary)`

Symptom: in `zen-sumi`, the primary `<Button/>` (used on the home page
nav + CTAs) renders dark ink on the saturated saffron primary background.
Contrast is very poor.

Investigation:

- `packages/themes/src/zen-sumi/button.css` says
  `@apply bg-primary text-on-primary border-transparent bg-none` for the
  primary variant — correct intent.
- `packages/themes/dist/zen-sumi.css` (the prebuilt file) shows
  `color: var(--on-primary)` — also correct.
- BUT the actual loaded stylesheet at runtime (Vite dev with
  `@import '@rokkit/themes/zen-sumi.css'` pointing at `src/zen-sumi/...`)
  resolves `text-on-primary` to
  `color: color-mix(in oklch, var(--color-surface-50) calc(var(--un-text-opacity) * 100%), transparent)`.
- UnoCSS's preset-mini is matching `text-on-primary` as
  `text-{color}` against the colors object before our
  `buildNamedShortcuts()` shortcut runs. The colors map has
  `on-primary → surface.50`, so the matched output is
  `var(--color-surface-50)` instead of `var(--on-primary)`.

The two paths produce different colors (`--color-surface-50` resolves to
the surface palette's lightest shade, `--on-primary` to the contrast pair
defined by `theme.ts`). In `zen-sumi` they happen to disagree noticeably.

Fix candidates:

1. Make our `buildNamedShortcuts()` register with higher priority than
   preset-mini's color rule so `text-on-primary` matches our shortcut
   first.
2. Rename `--on-primary` so it doesn't collide with the
   `text-{color}` rule's color name.
3. Reference `--on-primary` directly with `color: var(--on-primary)` in
   the theme CSS instead of going through `@apply text-on-primary`.

(1) is cleanest; (3) is the smallest immediate change.

## 2. `minimal` theme — selected-tab underline never renders

Symptom: `<Tabs/>` under `data-style="minimal"` selects the tab via
font-weight only; the 3px underline that should mark the selected tab is
missing.

Investigation:

- `packages/themes/src/minimal/tabs.css` defines
  `[data-style='minimal'] [data-tabs-trigger] {
    @apply ... border-b-[3px] border-b-transparent ...
  }` and selected gets `@apply ... border-b-ink-mute ...`.
- Computed style on the rendered selected trigger:
  `border-bottom-width: 0px; border-bottom-style: none;` — the width
  and style are zero/none.
- `border-b-[3px]` sets `border-bottom-width: 3px` but does NOT touch
  `border-bottom-style`. `<button>` elements default to `border: none`,
  which CSS then forces width to 0 — the 3px is silently ignored.

Fix: add `border-bottom-style: solid` (or `border-style: solid` once)
alongside the width / color in `minimal/tabs.css`. Same gotcha applies
anywhere the theme uses `border-{side}-[Npx]` on an element whose default
`border-style` is `none`.

## 3. `rokkit` theme — selected-tab gradient only shows on `:focus-within`

Symptom: at rest, `<Tabs/>` under `data-style="rokkit"` shows a flat
`paper-mute` background on the selected tab. The branded
`from-primary to-accent` gradient only appears when the tab list has
focus inside it.

Investigation:

- `packages/themes/src/rokkit/tabs.css`:
  ```
  [data-style='rokkit'] [data-tabs-trigger][data-selected] {
    @apply bg-paper-mute text-ink-mute;
  }
  [data-style='rokkit'] [data-tabs-list]:focus-within
    [data-tabs-trigger][data-selected] {
    @apply from-primary to-accent text-primary bg-gradient-to-b;
  }
  ```
- Resting selection is intentionally flat; the gradient is the "active"
  affordance.
- Additionally `--primary` and `--accent` resolve to the same color in
  the current `zen-sumi` token set, so even when the gradient does
  render the visible band is monochromatic.

Two separate concerns:

a. Whether the resting state should look this flat is a design
   decision — surface the active gradient at all times, or always show a
   subtle indicator (left border, brand-tinted bottom shadow) so the
   selected tab reads as selected without focus.
b. The token set being globally accessible across themes (rokkit
   inherits the host's `--primary` / `--accent`) is a side effect of how
   tokens are scoped. If rokkit defined its own contrasting
   primary/accent locally, the gradient would actually be a gradient.
   Probably wants its own `tokens.css` in `themes/src/rokkit/`.

## Not a theme bug, but adjacent

`data-style` is not nestable in-document — `[data-style='X']` selectors
across themes have identical specificity, so when two `data-style`
ancestors exist (e.g. body has zen-sumi, a card has rokkit), source
order wins. zen-sumi.css is imported last in `demo/app.css`, so the body
always wins for any in-doc nesting. The demo works around this by
rendering each themed card in its own iframe (`/embed/tabs?theme=...`),
but if "preview a theme inside another" is a use case people want, the
theme CSS would need `@scope` blocks or distinct higher-specificity
selectors per nest level.
