# CHECKPOINT

**Slice:** post-v1.4.2 backlog burn-down. Three items closed (2026-09-14).
Working tree clean; `134d09b9` on develop.

## Done

- **Flaky learn e2e CLOSED** (`3ee1bd5f`). Pre-hydration dead click: SSR ships
  every control visible, enabled and hit-testable but inert, so Playwright's
  actionability checks pass and the click is swallowed. `/app` hydrates 330
  tiles, hence ~1 run in three. Wouldn't reproduce on demand, so the window is
  now held open deliberately (stall the bundle 3 s) — `hydration.e2e.ts` makes it
  deterministic. `body[data-hydrated]` in a layout `$effect`; 13 goto sites
  across 8 specs wait on it. Found a *second* racy test, and one that could pass
  vacuously. Suite ×3: 210/210, 2.2 m → 1.7 m.
- **`apps/learn` typecheck gate CLOSED** (`a21e5278`, `76a88837`). Booked as
  large; measured as 6 errors in 3 files — the fix cost less than the deferral.
- **`apps/learn` svelte-check gate CLOSED** (`134d09b9`). 14 errors in 4 files.
  All six gated dirs now 0 errors / 0 warnings.

Both gates found the same library defect: `@rokkit/ui` exports a component
**and** an interface named `ChatMessage`, the component's generated type
shadowing the interface — so `ChatMessage<T>` was unreachable for every
consumer. Fixed additively as `ChatMessageData<T>`. The package-internal gates
structurally cannot see it; only a consumer can.

## Remains

Booked in `docs/backlog/`:

- **yaml** (moderate) — two majors, bun ignores nested overrides; only lever is
  a full re-resolve (blast radius measured: 40 packages).
- **TypeScript 7** — path verified, deferred by choice.
- **Untyped snippet props** (new) — `List` and siblings collect snippets behind
  `[key: string]: unknown`, so consumers' snippet params are implicitly `any`.
  Two interim annotations in learn to delete when fixed.

Open question: whether to narrow published `peerDependencies` (`svelte: ^5.0.0`)
to exclude vulnerable svelte. Consumer-facing break, not a sweep call.

## Known-broken

Nothing. lint 0/0 · check:types + check:build + check:svelte 0/0 · build:apps 0 ·
test:ci 6181/404 · learn e2e 70/70. (Sensei daemon down — this file is the record.)
