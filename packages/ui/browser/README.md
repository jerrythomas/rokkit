# Browser-mode component tests

Real Chromium, driven by Playwright through Vitest browser mode.

```bash
bun run test:browser
```

## When a test belongs here

Only for behaviour JSDOM **structurally cannot** express. JSDOM has no layout
engine, so it reports `0` for `clientWidth`, `offsetHeight`, `offsetTop`,
`scrollHeight` and every field of `getBoundingClientRect()`. Anything that
measures the page is therefore untestable there — the jsdom specs stub those
getters, which proves the arithmetic but not that the component measures the
right box.

Put a test here when it needs:

- **real geometry** — pixel↔value conversion, dropdown placement, overflow
  clipping, scroll offsets
- **real CSS** — behaviour that depends on a stylesheet actually applying
  (e.g. `max-height: var(--select-dropdown-max-height)` lives in
  `@rokkit/themes`, not in the component)
- **real focus / event semantics** — notably `focusout` on DOM removal, which
  JSDOM never fires

Everything else stays in `spec/` under jsdom: it's faster, needs no browser, and
runs in `bun run check`.

## Layout, not styling

These are **not** visual-regression tests. Theme appearance is covered by the
Playwright suite in `apps/learn/e2e` (see `theme-contrast.e2e.ts`). Here we
assert measurements and behaviour.

## Conventions

- Specs live in `packages/<pkg>/browser/` — deliberately outside the `spec/**`
  glob the jsdom projects use, so neither suite picks up the other's files.
- Rokkit components are headless; their geometry comes from theme CSS. Give each
  one a harness under `browser/fixtures/` that supplies the layout a real
  consumer would, and import the actual `@rokkit/themes` base stylesheet rather
  than reimplementing its rules.
- Disable animations in the harness. `base/*.css` animates panels open, and a
  mid-flight box gives both wrong measurements and Playwright "element is not
  stable" timeouts.
- Positioning often runs inside `requestAnimationFrame` — await a frame (or two)
  before measuring.

## Known limitation

Playwright's actionability check (`visible, enabled and stable`) can time out on
options inside a navigator-driven list: the panel re-renders on each navigator
update so the locator never settles, even though the element is demonstrably
visible and hit-testable. Where that happens, dispatch the click directly — the
click-plumbing path is already covered under jsdom; this suite exists for
geometry.

## Not in `bun run check`

`test:browser` is deliberately separate so the main gate stays hermetic and
browser-free. Run it before releasing anything that touches measurement,
positioning or focus handling.
