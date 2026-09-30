# Graph drill-down / drill-up events (#165)

**Status:** IMPLEMENT (2026-09-30). The user said to pick up the open issues from #165.
**Package:** `@rokkit/graph` · **Design:** `docs/design/24-world-view.md` Decision 3 (drill state), build step 4.

## The gap

`focusPath` scopes the containment layouts (`world`, `sunburst`, `structure`). But:

- nothing lets a reader change it;
- nothing tells the host they did;
- nothing shows that a level is still loading.

So drilling only works over one pre-loaded payload.

## Decisions

These fill the gaps the design and the issue leave open.

- **`drillPath` is `focusPath`.** Drilling moves it inside the state, the way `setDensity`
  moves density, then fires the event. A component that owns a bindable `focusPath` prop syncs
  it from the event. Otherwise its next `update()` would put the prop value back.
- **Events.** `ondrill(path, node)` and `ondrillup(path)`. `node` is the DECLARED node at the
  new path, or `null` for a synthesised container nothing declared; one is not invented.
- **Pending.** A returned promise sets `pending` until it settles. A newer drill supersedes an
  older one, and only the latest settlement counts. A rejection restores the previous path and
  sets `drillError`, because an empty canvas would read as a broken level.
- **Selection is untouched by drilling.** `onselect` keeps meaning selection only.
- **Drillable box.** Only in a layout that reads `focusPath`. A container can be drilled into
  directly. A leaf can be drilled into only when the host handles `ondrill`; with no loader
  there is nothing below it to show.
- **Gestures.** Double-click any drillable box. From the keyboard, Enter / Space on a drillable
  container. A leaf's Enter still selects; the new `DrillBar` then offers "Open" for it.
  `DrillBar` also shows the breadcrumbs and an "up" control, and says "Loading…" while pending.

## Shape

| Where | What |
|---|---|
| `layout/types.ts`, `world` / `sunburst` / `structure` | `Cluster.path` (the box's full tree path) and `Cluster.leaf` |
| `state/GraphDrill.svelte.ts` | `drillPath`, `breadcrumbs`, `canDrill(cluster)`, `drillInto(path)`, `drillOut(levels)`, `drillTo(path)`, `pending`, `drillError`; fires the events |
| `GraphStateConfig` | `ondrill`, `ondrillup` |
| `Graph.svelte` | the gestures; `data-graph-pending` and `aria-busy` |
| `controls/DrillBar.svelte` | breadcrumbs, up, Open selected, Loading… |
| `Treemap` / `Sunburst` / `StructureDiagram` | `ondrill` / `ondrillup` props, bindable `focusPath` kept in sync, `DrillBar` in the overlay |

## Slices (test first)

1. `Cluster.path` / `leaf` in the three layouts.
2. `GraphDrill` and the config events: state-level tests for every acceptance item, including
   the race and the rejection.
3. `Graph.svelte` gestures and pending attributes; `DrillBar`; the three diagrams.
4. Learn demo with an async loader (level-by-level data, as in the issue's sample); graph e2e
   for drilling in, drilling up, pending, and a rejection; docs (23, 24, llms graph); journal.

## Acceptance (from #165)

- `ondrill` / `ondrillup` fire with the new path and the opened node.
- The host can replace `nodes` / `edges`, and the canvas renders the new level.
- A pending state exists for a branch whose data has not arrived.
- Drilling up restores the previous level without a refetch if the host still has it (the
  host decides; the event carries the path).
- `onselect` keeps meaning selection, distinct from drilling.
