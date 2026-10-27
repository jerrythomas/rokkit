# Checkpoint

**Slice:** Switch fixes (#173, #174). DONE, released as v1.9.1 (npm `latest`, all 15 packages).

**Done:**
- #173: the zen-sumi off track is `paper-edge` (was `paper-mute`). It stands 1.5:1 off the page
  and the thumb in light and dark. The on state is unchanged.
- #174: no style restates `--switch-thumb-travel`, so each size keeps its own (0.75, 1.25 and
  1.5rem). Bordered tracks (rokkit, frosted) declare `--switch-track-border`, and base insets
  the thumb by it.
- Tests: `packages/themes/spec/switch-css.spec.js` and
  `packages/themes/browser/switch.browser.spec.ts` (over the built css). The CI browser job
  builds the theme css.
- main 0da38cd24 is green; the live site is verified.

**Remaining:** none.

**Next command:** `bun run test:browser` after any switch css change. It needs
`cd packages/themes && bun run build` first.

**Open questions (user):**
- Zen-sumi's off track is 1.5:1, below WCAG 1.4.11's 3:1. Reaching 3:1 needs an ink-tone track
  (`ink-mute`), which reads heavier than the vermillion on state. This is a design call.
- Carried over: `OPENROUTER_API_KEY` on the live Worker; revoke `NPM_TOKEN`; the
  brand-colour-as-foreground design; `stash@{0}`.

**Known-broken:** none.
