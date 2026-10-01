# Layered DAG layout (#167)

**Status:** IMPLEMENT (2026-09-30), the third of the open issues from #165.
**Package:** `@rokkit/graph`

## The picture

Nodes are ranked into horizontal layers by a host-supplied `layer`. rokkit computes no depth.
Layer 0 is at the top and the foundations at the bottom, so arrows should point down. An edge
that climbs is a violation, and it is the output of the view.

## Decisions

- **Model.** Node `layer` and edge `conformance` (`down` | `skip` | `up`), read through
  `fields`, added only when present.
- **Conformance fallback.** When an edge carries none, the layout derives it from the two layers
  the host gave: one down is `down`, more is `skip`, upward is `up`, the same layer is `level`.
  It's a comparison, not a depth computation; host-supplied conformance wins.
- **`layers` layout.**
  - Each layer is a full-width, labelled band, drawn as a cluster box so it renders through the
    existing box path. `layerLabels` names them; the default is "Layer N".
  - A crowded layer wraps into rows, so uneven layers stay readable.
  - Nodes within a layer are ordered by one barycenter pass against the layer above, to cut
    crossings.
  - Edges run vertically: bottom of the source to top of the target, or the reverse for `up`.
- **Filter.** The option `showEdges: 'all' | 'violations'`. On a real codebase the conformant
  edges drown the signal.
- **Rendering.** `data-edge-conformance` on edges. Themes stroke `up` in the danger colour and
  dash `skip`.
- **`LayersDiagram`.** The named composition, with a violations toggle (`ViolationsControl`).
- **Demo.** "Layers" over rokkit's own components, with the INTENDED package layers. Any real
  upward import is a real violation.

## Slices (test first)

1. `layer` / `conformance` in the model.
2. The `layers` layout (bands, wrapping, ordering, vertical edges, derived conformance,
   `showEdges`), registered with its options.
3. Edges carry conformance; theme CSS; `LayersDiagram` and `ViolationsControl`.
4. Demo, e2e, docs; close #167.
