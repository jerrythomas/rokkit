# Graph: text through `messages`, interactions through actions

**Status:** DONE (2026-10-01). Requested after an audit of the #165–#169 visuals. See journal 2026-10-01 (1).
**Package:** `@rokkit/graph` (plus a `graph` namespace in `@rokkit/states` messages)

## What the audit found

- **Text is hardcoded.** rokkit's convention is the `messages` store (`@rokkit/states`), which a
  locale can override. Graph has never used it. Text is spread across ten controls, `DrillBar`,
  the legend, the entity views, and even state and layouts (`moreLabel`, the default aria
  label, "Unassigned" / "Layer N").
- **A domain default in the library.** `ArcDiagram.sideLabels` defaults to "Imports" / "Shared
  commits", which is sensei's case and not a generic one.
- **Interactions are inline.** `Graph.svelte` has 21 handlers, and each element's branch
  decides what its click means. Enter/Space handling is copied four times, and the three
  toggle controls repeat the same flip.
- **Logic in components.** The legend builds its channel rows itself, and `MeasureControl`
  holds its own labels.

## Decisions

- **`messages.graph`.** One namespace in the store holds every string graph shows. Templates
  use `{token}` placeholders, filled by `fill()` in graph. Graph depends on `@rokkit/states`;
  `@rokkit/ui`, already a graph peer, depends on it, so a consumer installs nothing new.
- **Text from state reads the store**, through pure functions in `state/text.ts`. `layers`
  reads its fallback band names ("Layer {n}", "Unassigned") the same way. That stays
  deterministic for a given locale, and needs no new layout option.
- **Intent from state, meaning in one action.**
  - `boxAttrs` / `cardAttrs` emit `data-graph-press` / `data-graph-open` (the intent) and
    `data-graph-key`.
  - `GraphState.act(intent, key)` performs it: `select`, `drill`, `group`, `expand`, `crumb`.
  - The `interactions` action delegates `click`, `dblclick`, Enter/Space on non-button
    elements, and Escape to `act`. A background click clears the selection.
  - The template no longer wires any handler; it chooses only the element, `button` or `div`.
- **Canvas navigation is its own action.** `canvasNavigation` covers drag-to-pan (skipping
  anything that owns its press) and pinch/ctrl-wheel zoom, reported through `onzoom`. It sets
  `data-graph-panning` itself.
- **One toggle control.** `ToggleControl` (internal) backs the violations, hidden, bundle and
  edge-style toggles; each keeps its public props.
- **Arc sides from the data.** `GraphState.sideNames` gives, per side, the relations drawn
  there, or else `messages.graph.sides` (Declared / Observed). `sideLabels` overrides.
- **Legend rows from state.** `GraphState.channelRows`.

## Slices (test first)

1. `messages.graph` defaults (states spec) and `fill()`.
2. State text through messages (`state/text.ts`): `moreLabel`, `label`, layer names,
   `sideNames`, `channelRows`.
3. Intents and `act()` in state; the `interactions` and `canvasNavigation` actions (jsdom
   specs on bare elements); `Graph.svelte` and `DrillBar` moved onto them.
4. Components' text through messages; `ToggleControl`; `sideLabels` from data.
5. Gate, e2e (unchanged behaviour), docs, journal.

## Acceptance

- No user-visible English literal remains in a graph component, state or layout. A spec
  registers a locale and checks the text changes.
- No `on*=` handler remains in `Graph.svelte` or `DrillBar.svelte`.
- The existing unit and e2e suites pass unchanged in behaviour.
