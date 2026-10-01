# CHECKPOINT

**Done 2026-10-01:** graph messages + actions (`3bf82cc2c`..`5afcbdc64`); #156 closed (`fc2bc36b1`,
`94280a734`, `77d8a8906`: bun audit 7 -> 0, the TS 7 hold, a frozen-lockfile CI gate); #163
closed. CI is green on `77d8a8906`. Journal 2026-10-01 (1).

**Open issues, each checked against its acceptance (none resolved):**
- #164: the `shade` preset channel, `shadeBy` on world/treemap/sunburst, and the label-contrast
  flip. This is step 5 of `24-world-view.md`, not built.
- #159: rokkit's side is complete; the remaining work is adoption in dbd (sensei-hq/dbd#25) and
  sensei. A progress comment is posted.
- #155: `sensei.library.json` needs `documents`, a tag `ref` and `packages`. The repo homepage
  field still points at rokkit.vercel.app, a setting that is the user's.
- #153: state-pattern migration. Phase 0 only; Phases 1–5 have not started.
- #152: font picking is built. Open are the heading-levels/styles scope (blocked on a product
  decision: which heading set adopts the type scale) and two test gaps (a vacuous preview e2e,
  and no layout-shift check).

**Next command:** the user's pick. #155 is the smallest; #164 is the next graph feature.

**Open questions:**
- MultiSelect still lacks Select's fixed positioning and `maxRows`.
- Polymetric: a container's leaves are one row, so a big package is a wide strip at fit.
- `fill()` could move into `@rokkit/states` for all components; ui's Carousel hardcodes text today.
- `stash@{0}` (an old develop WIP) is intact.

**Known broken:** nothing. The sensei MCP server is disconnected, so this file is the only record.
