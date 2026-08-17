# Chart aesthetics unification — ggplot-aligned fill / color / alpha + position / group

**Date:** 2026-08-17
**Status:** Design approved (brainstorm) — ready for implementation plan
**Context:** A previous session collapsed the geom aesthetic surface onto a single `color`
channel (and hoisted `data` to `Plot.Root`). This removed the original intent of separate
field-mapping aesthetics. This spec restores and unifies them along ggplot conventions:
`color` (outline) and `fill` (interior) as independent channels, a consistent fixed `alpha`,
and first-class `position`/`group` for stacking and grouping — all with a root-default +
geom-override merge model.

Relates to `2026-08-16-chart-geom-gaps.md` (the pattern-fill consistency note there is
resolved in passing by the per-geom channel sweep).

---

## Goal

Make the geom aesthetic API map 1:1 to ggplot and behave consistently across every geom.
A consumer should be able to write declaratively:

```svelte
<Plot.Root {data} x="year" y="value" color="region">   <!-- root defaults -->
  <Plot.Area fill="region" alpha={0.6} position="stack" />
  <Plot.Point color="cluster" size="pop" />            <!-- geom overrides root color -->
</Plot.Root>
```

## Non-goals (explicit follow-ups)

- **Independent dual color scales** for `fill` vs `color` (each with its own legend). This spec
  uses ONE shared categorical palette/legend; dual-scale is a later change.
- **`alpha` as a mapped aesthetic** (field → opacity scale). This spec makes `alpha` a consistent
  fixed value only; mapping is a later change.

## Decisions (resolved in brainstorm)

1. **fill vs color** → separate channels, **shared** categorical scale/legend, staged. Dual-scale later.
2. **alpha** → **fixed** value (number), made consistent on every geom. Mappable later.
3. **stack/group** → **in scope**. `position` supports all four ggplot values: `stack | dodge | fill | identity`.

---

## 1. Aesthetic vocabulary

One consistent channel set; each geom supports the meaningful subset. Names map 1:1 to ggplot.

| Channel    | ggplot   | Meaning                                   | Level                       |
| ---------- | -------- | ----------------------------------------- | --------------------------- |
| `x`, `y`   | `x`,`y`  | position (field)                          | Root primary, geom override |
| `color`    | `colour` | outline / line / point-stroke (field)     | Root default + geom         |
| `fill`     | `fill`   | interior (field)                          | Root default + geom         |
| `alpha`    | `alpha`  | opacity 0–1 (number, fixed)               | Root default + geom         |
| `size`     | `size`   | mark size (field)                         | geom (Point)                |
| `symbol`   | `shape`  | symbol (field)                            | geom (Point / Line markers) |
| `pattern`  | —        | fill pattern (field)                      | geom                        |
| `group`    | `group`  | sub-series (field); default `fill ?? color` | Root default + geom       |
| `position` | position | `stack｜dodge｜fill｜identity`             | Root default + geom         |

## 2. fill ↔ color resolution (shared scale)

One shared categorical palette + one legend. `colors.get(key)` keeps returning the
`{ fill, stroke }` shade pair (light `300`/`700`, dark `500`/`200`). Per-mark rules:

- **both `fill` & `color` set (different fields)** → interior from `fill` value's fill-shade;
  outline from `color` value's stroke-shade.
- **only `fill`** → interior = fill-shade; outline = same key's stroke-shade (auto-darker).
  *(today's Box/Violin behavior)*
- **only `color`** → outline = stroke-shade; interior = same key's fill-shade (auto-lighter).
  *(today's Bar/Area/Point behavior)*
- **neither** → default series color.

→ **Fully backward compatible:** every existing single-channel chart collapses to today's output.

**Builder strategy (corrected 2026-08-17 after topology audit):** the earlier draft had this
backwards. The **live** builders are `geoms/lib/{bars,areas}.js` (advanced: flip/`place`, bar-race
`continuousCategory`, stacking, sub-band/dodge) and `lib/brewing/marks/{points,lines,arcs,boxes,violins,swarm}.js`.
`lib/brewing/marks/{bars,areas}.js` are the *two-channel-but-simple* pair — imported only by the
legacy brewer and **runtime-dead**; they are removed in Phase 1, not adopted. Correct approach:

- Extend the **live** builders in place to a separate `fill` (interior) + `color` (stroke) split:
  `geoms/lib/{bars,areas}.js` and `lib/brewing/marks/{points,lines,arcs}.js` gain `fill`≠`color`.
- `boxes.js` / `violins.js` / `swarm.js` **already** read a distinct `fill` (defaulting to `x`) but
  derive stroke from that same entry — extend them to take a separate `color`→stroke channel.
- No new duplication; the dead two-channel pair is deleted during brewer consolidation (§9).

## 3. alpha (fixed, consistent)

- `alpha` prop (0–1) on every geom + Root default. Resolution: `alpha ?? preset.opacity[geom] ?? 1`.
- Extend `preset.opacity` to cover **every** geom key (fixes the Bar / Line / Arc / Heatmap /
  Candlestick gaps). Keep existing defaults (area `0.6`, box/violin `0.5`, point `0.8`); solid marks
  default `1`.
- Replace hardcoded opacity literals so `alpha` actually controls them: Ribbon `0.5`,
  Waterfall connector `0.5`, Hexbin's baked-in rgba alpha, Trend CSS var. (Arc's decorative
  label-pill opacity is exempt — it's chrome, not a mark.)

## 4. position / group

- **`position`** on Bar & Area: `stack | dodge | fill | identity` (all four now).
  - `stack` (default for Area; existing behavior), `identity` (overlap) — reuse current stacking.
  - `dodge` (side-by-side) and `fill` (100 % stacked) — **new builder work**.
  - Today's `options.stack: true` maps to `position: "stack"`; keep `options.stack` as a deprecated
    alias for one release, with a console warning in dev.
- **`group`** channel (field), defaults to `fill ?? color`. Determines the sub-series set that
  stack/dodge partition by.
- Root-level `position` / `group` defaults flow down; geom overrides.

## 5. Root ⇄ geom merge

- **Root** (`Plot.Root`) carries `data`, `x`, `y` + **defaults** for the broadly-shared aesthetics
  (`color`, `fill`, `alpha`, `group`, `position`). Geom-specific channels (`size`, `symbol`,
  `pattern`) stay geom-level per §1 — no root default.
- **Geom** overrides per-field. Semantics match ggplot: `ggplot(aes(...))` sets defaults,
  `geom_*(aes(...))` overrides.
- Extend `PlotState.#mergeGeomChannels`, `#effectiveChannels`, and `geomData` to merge the full
  channel set (currently only `x`/`y`/`color`/`pattern`/`symbol`). Add `fill`, `alpha`, `size`,
  `group`, `position`.
- **Latent fix:** `#effectiveChannels` currently builds scales from only the *first* geom. For
  multi-geom plots it should **union** channels across all geoms so the shared legend/domain is
  complete (otherwise a second geom mapping a different color field is dropped from the scale).

## 6. Consistency cleanups

- `fill` (interior) + `color` (outline) available and documented on every closed-shape geom.
- `Rule`'s literal `stroke` prop → aligned to `color` (keep `stroke` as an alias).
- Every geom honors `alpha`; no hardcoded opacity on marks.
- Builder duplication removed (§2).

## 7. Testing

- **Per-geom (vitest):** fill-only, color-only, fill + color on different fields, `alpha` override,
  root-default vs geom-override.
- **Integration:** one multi-geom `Plot.Root` with root defaults overridden per geom.
- **Regression:** snapshot proving single-channel charts render byte-identically (key resolutions
  unchanged) — guards backward compatibility.
- **position:** stacked / dodged / fill / identity render tests on Bar and Area.
- **Parity matrix:** a table test asserting each geom's supported channel set (the §1 table).

## 8. Documentation sweep (after implementation)

Update to reflect the unified API:

- **Rokkit skills:** the chart/geom-facing skills (`rokkit-components`, `semantic-styles-rokkit`,
  and any chart-specific skill) — the data-first aesthetic contract and the new channel names.
- **Agent docs:** `agents/design-patterns.md` (aesthetic-channel pattern), `agents/memory.md`
  (chart architecture note), `agents/journal.md` (session summary + commit hashes).
- **Design docs:** `docs/design/20-chart.md`, `21-charts.md`, `22-chart-preset.md` — channel table,
  fill/color resolution, alpha model, position/group.
- **llms / component docs:** chart `llms.txt` and per-geom doc pages under `apps/learn` — examples
  using `fill` / `color` / `alpha` / `position` / `group`.

## Backward compatibility

- Single-channel (`color`-only or `fill`-only) usage is unchanged by the §2 fallback rules.
- `options.stack: true` → `position: "stack"` alias retained one release.
- `Rule` `stroke` retained as alias for `color`.
- No change to `Plot.Root`'s ownership of `data` / `x` / `y`.

## Rough file map

- **Geoms:** `packages/chart/src/geoms/*.svelte` (props + registered channels + alpha line)
- **Builders:** `packages/chart/src/lib/brewing/marks/{bars,areas,points,lines,boxes,violins,arcs,swarm}.js`;
  delete `packages/chart/src/geoms/lib/{bars,areas}.js`
- **State:** `packages/chart/src/PlotState.svelte.js` (merge + effective channels)
- **Root + wrappers:** `packages/chart/src/Plot/Root.svelte`, `packages/chart/src/charts/*.svelte`
- **Preset:** `packages/chart/src/lib/preset.js` (opacity map)
- **Tests:** `packages/chart/spec/**`
- **Docs:** as in §8

## 9. Brewer consolidation (added to scope 2026-08-17)

The topology audit found **three** chart surfaces. Consolidate onto the geom/Plot path:

- **Reimplement `Chart.svelte`** as a thin wrapper over `Plot`/`PlotState` (keep the published
  `Chart` export; unify internals). Decision: keep the public surface, remove the machinery behind it.
- **Delete the reactive brewer classes:** `lib/brewing/brewer.svelte.js` (`ChartBrewer`) and
  `CartesianBrewer` / `PieBrewer` / `QuartileBrewer` / `BoxBrewer` / `ViolinBrewer`.
- **Delete the dead imperative brewing** (zero consumers): `lib/brewing/index.svelte.js` and
  `lib/brewing/{bars,axes,legends,dimensions,scales}.svelte.js`.
- **Delete the runtime-dead marks** `lib/brewing/marks/{bars,areas}.js` (only the brewer imported them).
- **Rewire `Plot/Arc.svelte`** (the only brewer-context consumer) to render via `geoms/Arc.svelte`
  / `PlotState`, so `Plot.Arc` no longer needs `chart-brewer` context.
- **Keep** the shared color engine (`lib/brewing/colors.js`, `palette.json`, `patterns.js`) and all
  live `lib/brewing/marks/{points,lines,arcs,boxes,violins,swarm}.js`.
- **Update `index.js` exports** and migrate/remove the brewer-only spec tests.
- Fold any genuinely-unique brewer capability (aggregation, quartile stats) into `PlotState` or a
  shared helper class so it stays reusable/extendable (per the "classes + state" preference).

## 10. Sequencing (phases)

1. **Phase 1 — Brewer consolidation (§9).** Clean the topology to one path first.
2. **Phase 2 — Foundation.** PlotState `fill` channel + shared-scale union + preset alpha (§2, §3, §5).
3. **Phase 3 — Builder + geom aesthetics sweep.** fill/color/alpha across live builders + geoms (§2, §3, §6).
4. **Phase 4 — position/group** (§4).
5. **Phase 5 — Root/wrapper defaults + full suite + lint** (§5, §7).
6. **Phase 6 — Playwright verification.**
7. **Docs sweep (§8).**

Each phase ends green (vitest + lint, zero errors) and is committed to `develop`.

## Open follow-ups (out of scope, tracked)

- Independent dual color scales + second legend for `fill` vs `color`.
- `alpha` as a mapped aesthetic (field → opacity scale).
- Wire `pattern` into the still-solid-only geoms (Waterfall/Heatmap/Ribbon/Candlestick/Point) —
  overlaps the `2026-08-16-chart-geom-gaps.md` note.
