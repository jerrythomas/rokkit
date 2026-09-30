# CHECKPOINT

**Slice: PlotState decomposition — DONE** (`7d2ae2a3..HEAD` on `develop`, not pushed).
Plan: `docs/plans/2026-09-30-plotstate-decomposition.md`. Previous slice (architecture-analysis
primitives + follow-ups, `7cb774e7..cc6c5f7b`) also unpushed.

**Done — every increment of the agreed plan:**

1. Characterisation spec for `update()` keep/reset (23 fields) + row identity.
2. `PlotConfig` + declarative `CONFIG_FIELDS`.
3. `GeomRegistry`, shared by `PlotState` and `SparkState`.
4. `PlotFrame` + `ChannelState`.  5. `OrientationState`.  6. `InteractionState`.
7. `ScaleState` + pure `lib/plot/domains.js`; rules shared via `stacking.js` / `running.js`
   (fixed: stacked domain ignored `group` / stacked by x; waterfall negative total + NaN).
8. `AestheticState` + `AxisState`; `PlotState` is a pure composition root (241 lines, cx 2).
9. Re-measured (out of the hotspot corner); design doc 20, llms chart.txt, charts skill, journal.

**Gates (2026-09-30):** `bun run coverage` 7727 / 484 files, all thresholds; lint 0/0;
check:svelte 0/0; e2e 129/129. Differential old-vs-new over 1,937 configs: identical except the
intended stacked-domain fix.

**Next command:** `git push origin develop` — once reviewed.

**Open questions:**

- Job members `channelState` / `orientationState` / `interactionState` are suffixed because
  `channels` / `orientation` are contract getters; option B (consumers read jobs from context)
  would let the names align.
- Degenerate case changed: channels naming fields absent from the data + a stack whose fill is x
  now yields an empty band y scale where it used to be linear [0, 0]. Garbage in either way.

**Known broken:** nothing. `sensei:checkpoint` unavailable — the sensei MCP server is disconnected.
