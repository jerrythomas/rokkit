# Graph: the shade channel (#164)

**Status:** IMPLEMENT (2026-10-01). Step 5 of `docs/design/24-world-view.md`, its Decision 4.
**Package:** `@rokkit/graph` (plus each style's `graph.css`)

## The gap

Both existing channels are nominal: a group gets a hue, or a pattern. A 0..1 share ("how much
of this subtree is tested", "how much reaches no target") is a gradient. Bucketing it into
eight hues says the opposite of what the data says.

## Decisions

- **`shadeBy` names a key in the measures bag**, as Decision 4 recommends. Switching what is
  shaded re-runs the layout over an unchanged model. Shading is on exactly when `shadeBy` is
  set. The sketch's `using: 'shade'` is NOT added to `GraphChannel`: it would be a second
  switch that does nothing without `shadeBy`, and `preset.ts`'s own rule is that config which
  looks live and does nothing is worse than none.
- **A container's share is the size-weighted mean of what it holds**
  (Σ share × size / Σ size) in a pure pass over the built tree (`model/share.ts`). A share is
  not summable the way a size is. A container that declares its own share keeps it, because
  the host may know better. A box with nothing measured beneath it has no share, and is
  marked `missing: ['color']` rather than drawn as a zero.
- **The ramp is on the preset:** `shade: { family, from, to }`, default `gray` 50 → 900 (the
  palette has no `slate`). The fill is the ramp step nearest the share. In dark mode the ramp
  runs the other way, so "more" is always "more ink".
- **The label is measured, not hardcoded.** Of the ramp's two ends, the label takes whichever
  contrasts more with the fill, by relative luminance (`@rokkit/core`). The flip point falls
  out of the ramp instead of being a guessed 34%.
- **Painting.** A shaded box or wedge carries `data-graph-shaded`. Each style paints its
  `--group-fill` at full strength (the generic cluster rule dilutes the fill to 20%, which a
  ramp cannot survive) and its label in `--group-label`. A missing share is hatched, as in
  polymetric.
- **Where.** `world` (`Treemap`) and `sunburst` (`Sunburst`), the containment views.
  `StructureDiagram`'s rim dots are not in scope.
- **Controls and key.** `Treemap` and `Sunburst` take a bindable `shadeBy`, with a
  `MeasureControl` ("none" allowed) and a legend row naming the measure, beside a ramp swatch.

## Slices (test first)

1. `model/share.ts`; `world` and `sunburst` set `Cluster.shade` / `missing` from `shadeBy`.
2. The preset ramp and `resolveShade` with the measured label.
3. State: `shadeBy` config, `boxStyleAttr`, `data-graph-shaded`, the legend row; the
   `Treemap` / `Sunburst` props and control.
4. Theme CSS in every style.
5. Demo: this repo's treemap shaded by its tested share; e2e; docs; close #164.

## Acceptance (from #164)

- A per-node quantity drives intensity, beside the categorical channel.
- Label contrast is right on every step of the ramp.
- The share is switchable at runtime without re-normalising the model.
