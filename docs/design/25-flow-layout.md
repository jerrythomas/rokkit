# 25 — The `flow` layout: readable direction, traceable links

Status: **built** (slice 1 — ranks, ordering, fixed ports). Raised from the ER diagram: *"incoming connection is always on
left and outgoing starts from right side of the table entity … arrange the boxes so that there
are minimum number of overlaps and we can clearly see the path of the links. with current
layout the links get buried behind entities."*

Measured on the demo's ER diagram before any change: **5 of 9 edges pass over a card that is
not one of their endpoints.**

## The two asks are one feature

They arrived as two sentences and cannot be built separately.

`edges.ts` picks a connector's side by **relative position**, not by direction:

```js
if (a.x + a.w + 50 <= b.x) return { s1: 1, s2: -1 }   // b is to the right
if (b.x + b.w + 50 <= a.x) return { s1: -1, s2: 1 }   // b is to the left
return { s1: 1, s2: 1 }                                // stacked: bow around the right
```

So an edge's exit side tells a reader where the other box **happens to sit**, not which way the
reference points. Fixing the ports — out right, in left, always — makes direction readable from
geometry with no arrowhead to follow.

But fixed ports on the *current* arrangement make burial worse, not better. `cluster` is
schema-grouped masonry: a target is as likely to be left of its source as right, and a
right-exit connector reaching a left-hand table has to sweep out and back across everything in
between. **Fixed ports are only honest once x-position encodes direction**, which is what
ranking does. That is why this is one layout and not two patches.

## Decisions

### 1. A new layout, not a change to `cluster`

`cluster` groups by schema, and schema grouping is wanted in the ER view — it was confirmed as
correct earlier in this issue. Ranking and schema-clustering compete for the same axis: a box
cannot be both "in the `public` box" and "in column 3". So `flow` is a fourth layout the reader
chooses, and `cluster` keeps its clusters. `flow` emits **no clusters**, exactly as
`neighborhood` does.

### 2. Rank by reference direction; the referenced table sits right

An edge `A → B` leaves A's right and enters B's left, so `rank(B) ≥ rank(A) + 1`. For a foreign
key that puts the **referencing** table left of the table it **references** — dependencies flow
rightwards, and a leaf table with no outgoing references ends up on the right margin where the
eye stops.

Longest-path ranking, so an edge never spans backwards except across a broken cycle.

### 3. Cycles are broken, marked, and drawn

ER schemas have mutual references, and a real one must not crash or silently drop an edge. A
DFS marks back-edges; ranking ignores them; rendering keeps them with `back: true` so a theme
can distinguish one. They still leave right and enter left — a back edge is the one case where
that costs a visible sweep, and paying it for the minority is the point of breaking cycles
rather than letting them dictate the whole arrangement.

### 4. Crossing reduction is barycentre sweeps, not exhaustive search

Minimising edge crossings is NP-hard; the standard answer is iterated barycentre ordering, and
it is what the existing `barycenterPasses` already does for a different arrangement. Down-sweep
then up-sweep, a fixed number of passes, keeping the best order seen. Fixed pass count keeps
the layout deterministic — a property `LayoutFn` promises and every layout spec relies on.

### 5. No dummy nodes in the first slice

Textbook Sugiyama routes a long edge through dummy nodes on each intervening rank, so the edge
bends around boxes instead of over them. That is the complete answer to burial and it is a
larger change: it needs the ordering pass to treat dummies as orderable, and the router to
follow a polyline. The first slice ships ranks, ordering and fixed ports — which removes the
crossings that come from arbitrary placement — and measures what remains. Dummy-node routing
is its own slice if the measurement says it is still needed.

**This is stated as a limit, not a claim of completeness**: a rank-2 edge over a rank-1 box is
still possible after this slice.

## Verification

Unit, through `GraphState` as every other layout is:

- every forward edge has `rank(target) > rank(source)`
- ports are fixed: `s1 === 1` and `s2 === -1` for a forward edge, whatever the geometry
- a cycle ranks, renders every edge, and marks exactly the back-edges
- ordering is deterministic across runs
- crossing count on a known fixture is no worse than the unordered arrangement
- a disconnected node still gets a box

End-to-end, on the demo's ER diagram: the count of edges passing over a foreign card must drop
from the measured baseline of 5 of 9. **Measured after: 2 of 9.**

## Related

- `docs/design/23-graph.md` — what is locked about the package
- `docs/design/24-world-view.md` — the containment view, and why it is boxes not circles
