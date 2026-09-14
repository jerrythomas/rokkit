# Flaky e2e: components-catalog tile click

**Raised:** 2026-09-14, during the .svelte coverage slice.
**Status:** CLOSED 2026-09-14 — root-caused and fixed.

## What happened

`apps/learn/e2e/components-catalog.e2e.ts:63` —
*"clicking a tile mounts the demo, and Browse reaches the browse grid"* — failed
roughly one full run in three, with no change in between.

## Root cause: the pre-hydration dead click

SSR ships every control fully formed — visible, enabled, hit-testable — and
**inert**, because Svelte attaches handlers (the delegated root listener and the
per-element property alike) only when it hydrates. Every actionability check
Playwright runs before dispatching a click is already satisfied by that inert
markup, so a click issued inside the window is swallowed silently. The
`toHaveURL` that follows then times out against a page that looks entirely
correct — which is exactly why it read as "flaky" rather than "broken".

`/app` server-renders **330 catalog tiles**, so its hydration window is unusually
wide. That is why this test and not the other 66.

It was never a regression from the coverage work.

## How it was proven, not guessed

The flake would not reproduce on demand: 12/12 in isolation, then 201/201 across
three full suite runs. So the window was held open deliberately —
`page.route('**/_app/immutable/**/*.js')` stalling the client bundle for 3 s —
which turns the race deterministic. The first test in
`apps/learn/e2e/hydration.e2e.ts` is that proof: it asserts the tile is visible
**and** enabled, clicks it, and asserts the URL did not change.

## The fix

1. `apps/learn/src/routes/+layout.svelte` sets `document.body.dataset.hydrated`
   in an `$effect`. Effects run once the tree is mounted and handlers are
   attached, so the marker flips exactly when clicking becomes safe.
2. `e2e/helpers.ts` gained `waitForHydration(page)` and `gotoHydrated(page, path)`.
3. Every `goto` followed by an interaction now uses them — 13 call sites across
   8 specs, plus `screens-smoke`'s shared `interact` hook. Pure-assertion
   navigations were deliberately left alone.

`hydration.e2e.ts` pins all of it: the trap, the marker contract (absent before
hydration, present after), and the helper itself under a stalled bundle.

## Two things found on the way

- **`components-catalog.e2e.ts` had a second racy test**, not one — *"a tile on
  /app/catalog navigates to its demo"* has the identical shape and was equally
  exposed.
- **The "restores the hero" test could pass vacuously.** Its comment insists the
  navigation MUST be client-side, because a full load re-initialises the shell
  module and hides the stale-state bug. But an un-hydrated anchor click *is* a
  full page load — so without the hydration wait, the test could silently
  degrade into the goto-based version its own comment warns against. That one is
  a correctness fix, not just a determinism fix.

## Verification

- `hydration.e2e.ts` red before the marker (2 of 3 failing), green after.
- Full suite ×3: **210/210**, down from 2.2 m to 1.7 m.

## Left open (separate concern)

`apps/learn` has no `tsconfig.json`, so the e2e TypeScript is transpile-only —
Playwright never typechecks it. Same family as the `check:build` publish gap.
Adding one would surface pre-existing errors across the app; booked, not done.
