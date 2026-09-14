# CHECKPOINT

**Slice:** post-v1.4.2 backlog burn-down. Two items closed (2026-09-14).
Working tree clean; `76a88837` on develop.

## Done

- **Flaky learn e2e CLOSED** (`3ee1bd5f`). Pre-hydration dead click: SSR ships
  every control visible, enabled and hit-testable but inert, so Playwright's
  actionability checks pass and the click is swallowed. `/app` hydrates 330
  tiles, hence ~1 run in three. Wouldn't reproduce on demand, so the window is
  now held open deliberately (stall the bundle 3 s) — `hydration.e2e.ts` makes it
  deterministic. `body[data-hydrated]` set in a layout `$effect`; 13 goto sites
  across 8 specs wait on it. Found a *second* racy test, and one that could pass
  vacuously. Suite ×3: 210/210, 2.2 m → 1.7 m.
- **`apps/learn` typecheck gate CLOSED** (`a21e5278`, `76a88837`). The app was
  never typechecked by anything. Booked as large; measured as **6 errors in 3
  files** — the fix cost less than the deferral. All 6 real, including a
  `@rokkit/ui` API defect: a component and an interface both named
  `ChatMessage`, the component's generated type shadowing the interface, making
  `ChatMessage<T>` unreachable for every consumer. Fixed additively as
  `ChatMessageData<T>`.

## Remains

Booked in `docs/backlog/`:

- **yaml** (moderate) — two majors, bun ignores nested overrides; only lever is
  a full re-resolve (blast radius measured: 40 packages).
- **TypeScript 7** — path verified, deferred by choice.
- **learn `.svelte` files still unchecked** — `tsc` ignores them and learn is not
  in `check:svelte`'s list. Other half of the gate gap, unmeasured.

Open question: whether to narrow published `peerDependencies` (`svelte: ^5.0.0`)
to exclude vulnerable svelte. Consumer-facing break, not a sweep call.

## Known-broken

Nothing. lint 0/0 · check:types + check:build + check:svelte 0/0 · build:apps 0 ·
test:ci 6181/404 · learn e2e 70/70. (Sensei daemon down — this file is the record.)
