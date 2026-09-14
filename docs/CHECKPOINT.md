# CHECKPOINT

**Slice:** post-v1.4.2 backlog burn-down — **all booked items closed**.
Working tree clean; `d735e56e` on develop.

## Done

- **Flaky learn e2e CLOSED** (`3ee1bd5f`) — pre-hydration dead click. SSR ships
  controls hit-testable but inert; `hydration.e2e.ts` holds the window open so
  the race is deterministic. ×3: 210/210, 2.2→1.7 m.
- **learn typecheck + svelte-check gates CLOSED** (`a21e5278`, `76a88837`,
  `134d09b9`; regression fixed in `c4744bb8`). All six gated dirs 0/0.
- **yaml CLOSED** (`97cc8b64`) — **bun audit 2 → 0**. Advisory spans both majors,
  bun ignores scoped override keys (verified), but no override was needed: the
  lockfile just held stale pins. 2-line diff vs 552 for a full re-resolve.
- **Snippet props CLOSED** (`1fc4e987`) — typed across 9 components; green proven
  non-vacuous.
- **Stale props types CLOSED** (`d735e56e`, **breaking**) — four interfaces
  described components that no longer existed, because nothing connected a
  declared type to the real `$props()`. Corrected to match the components and
  wired; 12 dead snippet/handler types removed. All **62** components now
  annotate `$props()` with their own type from `src/types/`.
  `spec/props-types.spec.ts` guards both halves — it caught `Swatch` declaring
  its type inline, which my manual survey had passed.

## Remains

- **TypeScript 7** — path verified, deferred by choice.
- Open question: narrow `peerDependencies` (`svelte: ^5.0.0`) to exclude vulnerable svelte?
- `d735e56e` is breaking for published types — worth a **minor**, not a patch.

## Known-broken

Nothing. lint 0/0 · check:types + check:build + check:svelte 0/0 · build:apps 0 ·
test:ci 6306/405 · e2e 70/70 · bun audit 0. (Sensei daemon down — this is the record.)
