# CHECKPOINT

**Slice:** Interaction-state contrast gate + fixes (2026-08-31). Working tree CLEAN,
4 commits on `develop`, NOT pushed.

## Done

- `interaction-contrast.e2e.ts` + `interaction-collector.mjs` — hover / focus /
  focus-visible / active / focus-hover over 5 styles x 2 modes x 5 skins; text 4.5,
  icons 3.0, SVG chart marks 3.0. States synthesised by rewriting pseudo-classes to
  equal-specificity attribute selectors (cascade-neutral). Break-it check passed.
- `/embed/gallery` 28 -> 37 cells: seeded List, opened dropdowns, icons on
  Toggle/Tabs, Carousel/ChatHistory/FloatingNavigation/CommandPalette, 5 chart types.
- 11 defect classes fixed across all five styles (worst: minimal filled buttons at
  1.13:1, CommandPalette labels at 1.05:1 in all ten style/mode combos).
- violet skin shifted one stop lighter, out of the on-color dead zone.
- Findings 173 -> 60. Resting baseline SHRANK 5 -> 3 keys.

## Remains

One class, booked not fixed: brand/status colour used as a **foreground** (58 keys
baselined + 3 resting). Needs a design decision — see
`docs/backlog/2026-08-31-brand-colour-as-foreground.md`.

## Next command

    git push origin develop

## Known-broken

Nothing. lint 0/0 · check:types + check:svelte 0/0 · test:ci 5798/384 · learn e2e 67.
