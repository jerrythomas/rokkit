# CHECKPOINT

**Slice #159** — extract dbd's ER-diagram viewer into **`@rokkit/graph`**. **Tasks 1–20 of 22
done**, tree clean, **not pushed** (63 ahead of origin/develop). **Plan:**
`docs/plans/2026-09-27-graph-package-extraction.md`, boxes ticked through Task 20.
**It ships, renders, and is gated.** Package + theme + learn demo (`2765ab8b`) + 13 e2e; six real
contrast findings fixed at the token, none accept-listed (`d5803925`); a11y fixes in `@rokkit/ui`
Table (`3c79c7df`) and the demo labels. **6835 unit + 83 e2e green**; lint/types/svelte 0/0.

## Remains

1. **Next: Task 21 — docs + close-out.** `design/23-graph.md`, `12-priority.md`,
   `agents/memory.md`, backlog, plus the surfaces that claim completeness today:
   **`docs/llms/index.txt`**, **`README.md`**, new `docs/llms/{components,packages}/graph.txt`.
2. **Task 22 — dbd consumes the package** (separate repo + PR). **The acceptance proof.** Linked
   workspace; publish only after it passes. Then slice 2 (force-directed), slice 3 (dbd#24).
3. **Open decision:** `graph.css` is `base` + `rokkit` only (locked for slice 1), but styles are
   self-contained — no graph colour under minimal/material/frosted/zen-sumi, the learn default.

## Decisions locked — do not relitigate

New package, **not** `@rokkit/chart`. Entry points `.` + `./schema`. **Mapped input, canonical
internals** via `GraphState` — a component may not compute. Viewer core only; app-shell and
`SchemaModel` stay in dbd. `data-node-kind` in CSS for the closed set, `createGraphPreset`
(`using: color|pattern`) for open groups. `@rokkit/ui` an **optional peer**. `base` + `rokkit`
themes only. No pan/zoom. `EntityDiagram`'s geometry becomes a `neighborhood` `LayoutFn`.

## Invariants the executor must not violate

1. **Never de-duplicate `buildAdjacency`** — duplicates are the barycenter weighting; a `Set`
   silently relayouts every multi-FK schema and the characterization suite cannot see it.
2. **A failing ported assertion means the port changed behaviour.** Fix the port, never rebaseline.
3. **A contrast failure on a graph selector is real** — fix the token, never accept-list it.
   **A brand colour is a fill or a border, never a foreground** (the 500 is ~2.4:1 on paper).
4. `base/*.css` = structure only. `update()` follows `SparkState`. Lint + journal + checkpoint
   after **every** commit; run `bun run coverage --project graph` too (100% stmts, `all: true`).
5. **Plan file lists and code are drafts** — every task so far has had a defect. Grep and test it.
   A local binding named `state` breaks the `$state` rune (`s.subscribe is not a function`).

**Known-broken:** nothing; every gate clean. Open: TS 7.
