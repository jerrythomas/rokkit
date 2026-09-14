# CHECKPOINT

**Slice:** rokkit#156 sweep + coverage debt — **RELEASED v1.4.2** (2026-09-14).
Working tree CLEAN; develop, main and the tag pushed; all 14 packages live.

## Done

- `cc335be6`…`ae26e415` dependency sweep: **bun audit 28 → 1**. Dependabot open
  alerts now **0**.
- `e07aaa5f`…`c4313dd9` three racy specs pinned; CI and local now agree exactly
  on all four metrics across all 23 directories.
- `bb9a5408`…`26d48401` **coverage debt CLOSED** — js/ts 13/13 at 100%,
  `.svelte` 0 files below 90 (was 29 files / 493 statements). Aggregate 97.85%.
- `4d6bb0b2` publish-gate fix (below).
- Four production bugs found on the way, each dead code behind a coverage gap:
  the `themable` storage-listener leak, the `override:` → `child` snippet route,
  DefinePatterns asserting its own error branch, and the async races.

Verified as a consumer: a clean install of `@rokkit/ui@1.4.2` resolves
`dompurify@3.4.15` with no override — what #156 §3 asked for. Full narrative in
`agents/journal.md`.

## Remains

Booked in `docs/backlog/`: **yaml** (moderate; two majors, bun ignores nested
overrides), **TypeScript 7** (deferred, path verified), **flaky learn e2e**.

Open question: whether to narrow published `peerDependencies` (`svelte: ^5.0.0`)
to exclude vulnerable svelte. A consumer-facing break, not a sweep call.

## Release note

v1.4.2's first publish FAILED on @rokkit/helpers — `bun run check` was green, but
the declaration build that runs at publish time was not the build the gate ran.
Nothing published. Fixed by declaring `@vitest/spy`; the gap is closed by
`check:build`, now part of `bun run check`.

## Known-broken

Nothing. lint 0/0 · check:types + check:build + check:svelte 0/0 ·
test:ci 6181/404 · coverage exit 0 · build:apps exit 0 · learn e2e 67.
