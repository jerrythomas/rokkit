# Dual arc diagram (#169)

**Status:** IMPLEMENT (2026-09-30), the fifth of the open issues from #165.
**Package:** `@rokkit/graph` (the issue is filed as `[chart]`; see the first decision)

## The picture

One shared, ordered axis of items, with two sets of arcs over it. Imports, the coupling the code
declares, go on one side. Shared commits, the coupling the history reveals, go on the other. The
finding is a pair with an arc on one side and none on the other: co-change with no import.

## Decisions

- **`@rokkit/graph`, not `@rokkit/chart`.** The issue leaves composition-or-primitive open.
  - Chart's `Arc` is a pie slice and `Ribbon` is a y-band. `Plot`'s grammar (rows, channels,
    scales) has no items-plus-relations, so it would be a standalone component built from scratch.
  - Graph already has the contract: nodes, edges, field mapping, two edge sets (structural edges
    and overlays), weight to thickness, selection that highlights a node's edges, the legend, theme
    CSS in five styles, and a "Hidden coupling" demo over this exact data.
  - sensei already consumes graph for #165–#168.
- **`arcs` layout.**
  - The axis is vertical: items top to bottom, one labelled box each, ordered by group (first
    appearance), then input order. Labels read horizontally at ~50 items.
  - Arcs bulge left from the box's left edge for the lower set, and right from its right edge for
    the upper set. Thickness comes from weight.
- **Which side.**
  - By default, structural edges go left and overlays right. This matches the existing meaning:
    an overlay is co-change, observed rather than declared.
  - `above: '<relation>'` names the relation drawn right instead. With it, #169's sample works
    verbatim (`fields.relation = 'set'`, `above = 'cochange'`).
  - The layout routes both sets itself, because there are no cards for the generic overlay router.
- **Per-set thickness.** Imports (counts of 1–68) and shared commits (up to 35) are different
  units. One shared max would make one side hairline, so each side normalises on its own, to
  its 95th percentile (the same cap as #168, now shared as `layout/percentile.ts`). Otherwise
  rokkit's one 68-count import pair flattened every other import to hairline. Past the cap the
  width clamps. `RoutedEdge.strength` (0..1) carries it, and `edgeWeight` prefers it.
- **`hidden`.** An edge flag (`fields.hidden`) that the host computes and the chart only styles:
  `data-edge-hidden`, in the danger colour.
- **Only hidden.** `showEdges: 'hidden'` keeps only the hidden edges. `ArcDiagram` offers a toggle.

## Slices (test first)

1. The model: edge `hidden`.
2. The `arcs` layout: ordering, boxes, both sides, `above`, per-side `strength`, the `hidden`
   filter, the size. Registered with its options.
3. Rendering: `data-edge-hidden` / `data-edge-side`, `edgeWeight` using `strength`, the
   `HiddenControl` toggle, `ArcDiagram`, theme CSS.
4. Demos (rokkit's components: imports vs co-change; #169's sample, verbatim), e2e, docs;
   close #169.

## Acceptance (from #169)

- Two relation sets over one shared, ordered axis.
- Arc thickness encodes weight.
- A relation flagged `hidden` is styleable independently.
- A filter for "only hidden".
- Readable at ~50 items.
