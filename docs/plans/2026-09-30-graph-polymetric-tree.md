# Polymetric tree (#168)

**Status:** DONE (2026-09-30): `1fc6363e`, `c014cc2d`, `4ebcadc7`, `59179611`, `03439c1f`. See journal 2026-09-30 (15).
The fourth of the open issues from #165.
**Package:** `@rokkit/graph`

## The picture

Lanza & Marinescu's System Complexity view. Each file is a box whose WIDTH, HEIGHT and SHADE
show three independent measures, and its position in a containment tree shows where it sits.
`Treemap` encodes one measure as area; this encodes three at once.

## Decisions

- **`parent` → `path`.** The sample, like many hosts, gives containment as `parent` ids, while
  the model uses `path`. When a node has no `path`, normalize derives one from its parent chain.
  Segments are node IDS (labels repeat). A dangling parent becomes a synthesised container (it
  references something not indexed), and a cycle is cut where it closes.
- **`polymetric` layout.**
  - A top-down tidy tree. Each node is placed under its parent, leaves spread left to right,
    and rows are aligned per depth, so heights compare at a glance.
  - Containers are label boxes. Leaves are boxes sized `widthBy` × `heightBy` and shaded by
    `colorBy`. Tree links run parent → child.
  - Option keys `widthBy` / `heightBy` / `colorBy` name a `measures` key, or `weight` / `degree`.
- **Degenerate values.**
  - Each channel scales to its 95th percentile across the leaves, so one dominating file does
    not flatten every other box. A value above it clamps at the maximum and is marked clamped.
  - A zero is a real value, drawn at the minimum size.
  - A missing measure is drawn at the minimum and marked missing (styled differently), never
    shown as a zero.
- **Shade.** A `--shade` 0..1 custom property on the box, which each style maps to a tint.
  Leaf labels sit below the box on paper, so they read whatever the fill.
- **Legend.** The layout reports which measure is on which channel, and each channel's cap.
  `GraphLegend` prints it: three encodings are unreadable without it.
- **`PolymetricTree`.** The named diagram, with three measure pickers built from the measures
  present in the data, and the legend shown by default.

## Slices (test first)

1. `parent` → `path` in normalize.
2. The `polymetric` layout (tidy tree, sizing, percentile scaling, missing / zero / clamp,
   shade, tree links, the channels summary), registered with its options.
3. Rendering (`--shade`, the missing / clamped hooks), the legend, theme CSS, `PolymetricTree`.
4. Demo (rokkit files: declarations × lines × churn), e2e, docs; close #168.
