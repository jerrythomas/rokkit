# CHECKPOINT

**Slice:** post-v1.4.2 backlog burn-down — flaky learn e2e **CLOSED** (2026-09-14).
Working tree clean; `3ee1bd5f` on develop.

## Done

- v1.4.2 released and verified as a consumer (`dompurify@3.4.15`, no override).
- `3ee1bd5f` **pre-hydration dead-click window closed**. SSR ships every control
  visible, enabled and hit-testable but inert — Playwright's actionability
  checks can't tell it from a live one, so the click is swallowed and the next
  assertion times out on a page that looks correct. `/app` hydrates 330 tiles,
  hence ~1 full run in three.
  - Wouldn't reproduce on demand, so the window is now held open deliberately
    (stall the client bundle 3s) — `hydration.e2e.ts` makes the race
    deterministic and pins the marker contract.
  - `body[data-hydrated]` set in a layout `$effect`; 13 goto sites across 8
    specs wait on it.
  - Found a **second** racy test in the same file, and one that could pass
    vacuously — an un-hydrated anchor click is a full page load, exactly what
    its own comment warned against.
  - Full suite ×3: **210/210**, 2.2m → 1.7m.

## Remains

Booked in `docs/backlog/`:

- **yaml** (moderate) — two majors in the tree, bun ignores nested overrides;
  only lever is a full re-resolve (blast radius measured: 40 packages).
- **TypeScript 7** — path verified, deferred by choice.
- **`apps/learn` has no `tsconfig.json`** (new) — e2e TypeScript is
  transpile-only, never typechecked. Same family as the `check:build` gap.

Open question: whether to narrow published `peerDependencies` (`svelte: ^5.0.0`)
to exclude vulnerable svelte. Consumer-facing break, not a sweep call.

## Known-broken

Nothing. lint 0/0 · check:types 0/0 · learn e2e 70 tests, 210/210 across ×3.
(Sensei daemon down this session — no MCP checkpoint; this file is the record.)
