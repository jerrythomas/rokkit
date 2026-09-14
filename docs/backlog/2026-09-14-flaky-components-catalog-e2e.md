# Flaky e2e: components-catalog tile click

**Raised:** 2026-09-14, during the .svelte coverage slice.
**Status:** open — intermittent, ~1 failure in 3 full runs.

## What happens

`apps/learn/e2e/components-catalog.e2e.ts:63` —
*"clicking a tile mounts the demo, and Browse reaches the browse grid"* — failed
once, then passed on the next three full runs of the suite with no change in
between.

It is not a regression from the coverage work: nothing in that slice touched the
learn app or the catalog route, and the surrounding 66 tests passed on every run.

## Why it is worth fixing rather than retrying

This is the same class of defect the coverage work spent its time on: a test whose
result depends on timing rather than on the property it names. A retry would hide
it; the useful move is to find the unawaited boundary.

Likely candidates, in order:

1. The tile click navigates and the assertion races the route transition — needs
   an explicit wait on the demo's own mount marker rather than on a generic
   selector.
2. `Browse` re-navigates before the first navigation settles.

## How to reproduce

    bun run test:e2e            # repeat; roughly 1 in 3

When it next fails, capture the trace — `playwright test --trace on` — rather than
re-running, since the failure carries the timing evidence.
