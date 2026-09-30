# Navigator decomposition

**Status:** DONE (2026-09-30) — `9449887f`, `79a38106`, `657db32f`, `fb46dafb`. See journal 2026-09-30 (7).
The user asked for it: "then take up navigator", after v1.8.0.
**Package:** `@rokkit/actions`

## Why

`src/navigator.js` is the widest-reaching hotspot: 417 lines, ~70 decision points, 35 commits,
and every list-like component (List, Tree, Select, MultiSelect, Menu, Tabs, Toggle, Grid, Table,
Toolbar, CommandPalette, …) routes its keyboard, click and focus handling through it.

## Shape

`Navigator` keeps its public API — `new Navigator(root, wrapper, options)`, `destroy()` — and
becomes event wiring over three focused parts:

| Part | Owns |
|---|---|
| `navigator/dom.js` (pure) | `pathOf`, `clickAction`, `isNestedInteractive`, `isDisabledItem`, the interactive selector |
| `navigator/typeahead.js` | `Typeahead`: the buffer, its reset timer, the printable-key rule, the match |
| `navigator/focus.js` (pure) | focus the wrapper's item without scrolling ancestors; scroll it into view within the root; the entry item |
| `navigator/intent.js` (pure) | added in slice 4: which keys / clicks the Navigator claims, and when focus has left the root |

## Slices (one commit each, test first)

1. Pure DOM predicates → `navigator/dom.js`.
2. `Typeahead`.
3. Focus + in-root scroll.
4. `Navigator` as wiring; event-replay differential old vs new (every wrapper call and every
   preventDefault / stopPropagation); re-measure; docs; journal.

Characterisation: `spec/navigator.spec.js` already pins 51 behaviours (keys, clicks, links,
accordion triggers, focus redirect, deferred blur after destroy, wheel containment, typeahead
timing, scroll-within-root, nested interactives, disabled items). It must pass unchanged.

## Invariants at every slice

navigator spec unchanged and green; actions 100% statement gate; every consumer package's suite
(ui, app, forms, blocks, …); lint 0/0; ui browser specs and learn e2e at the end.
