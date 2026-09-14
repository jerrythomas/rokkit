# CHECKPOINT

**Slice:** rokkit#156 sweep + coverage debt — **RELEASED v1.4.2** (2026-09-14).
Working tree CLEAN; develop, main and the tag all pushed; all 14 packages live.

## Done

`bun audit` **28 vulnerable packages -> 1**; merged to main at `f8d55f9c`
(Dependabot open alerts now **0**).

- `cc335be6`…`ae26e415` dependency sweep: **bun audit 28 → 1**.
- `e07aaa5f`…`c4313dd9` three racy specs pinned; CI and local now agree exactly.
- `bb9a5408`…`26d48401` **coverage debt CLOSED** — js/ts 13/13 at 100%,
  `.svelte` 0 files below 90 (was 29 / 493). Aggregate 97.85%.
- Four production bugs found along the way, each dead code behind a coverage gap:
  the `themable` storage-listener leak, the `override:` → `child` snippet route,
  DefinePatterns asserting its own error branch, and the async races.

Full narrative in `agents/journal.md`.

## Remains

Booked in `docs/backlog/2026-09-12-*`: **yaml** (moderate; two majors, bun ignores
nested overrides), **TypeScript 7** (deferred, path verified), **coverage debt** —
**coverage debt is CLOSED** (js/ts 100%, `.svelte` all ≥90, aggregate 97.85%).
New: a flaky learn e2e, booked in `docs/backlog/2026-09-14-flaky-*`.

## Next command

    # nothing pending — v1.4.2 is out. Next: `yaml` or TypeScript 7, both booked.

## Open questions

Whether to narrow published `peerDependencies` (`svelte: ^5.0.0`) to exclude
vulnerable svelte. A consumer-facing break, not a sweep call.

## Release note

v1.4.2's first publish FAILED on @rokkit/helpers: `bun run check` was green but
the declaration build that runs at publish time is not the build the gate ran.
Nothing published, no GitHub release. Fixed by declaring `@vitest/spy` (an
undeclared transitive whose types the emitted .d.ts referenced), and the gate gap
is closed — `check:build` now runs each package's declaration build inside
`bun run check`. The inert tag was moved to the fixed commit rather than burning
a version.

## Known-broken

Nothing. lint 0/0 · check:types + check:svelte 0/0 · test:ci 6181/404 ·
coverage exit 0 · build:apps exit 0 · learn e2e 67 · frozen-lockfile clean.
