# CHECKPOINT

**Slice:** rokkit#156 sweep + coverage debt (2026-09-14). Working tree CLEAN,
`develop` and `main` both pushed; Check + Coverage green on each.

## Done

`bun audit` **28 vulnerable packages -> 1**; merged to main at `f8d55f9c`
(Dependabot open alerts now **0**).

- `cc335be6`…`ae26e415` dompurify/vitest/svelte/kit/wrangler/cookie bumps,
  `check:types` off `bunx`. Details in `agents/journal.md`.
- `e07aaa5f` `690c132e` `c4313dd9` three racy specs pinned. CI and local now match
  **exactly** on all four metrics across all 23 directories.
- `bb9a5408` `85b5a0c6` `53b12d41` coverage debt: **all 13 js/ts packages back
  to 100%** (was 2), 0 uncovered statements. Found a real bug — `themable` leaked
  a `storage` listener via a discarded `$effect.root` disposer.
- `61d21f07` `.svelte` debt, forms: 66 → **90**. Found a second real bug — the
  documented `override: true` → `child` snippet never worked.

## Remains

Booked in `docs/backlog/2026-09-12-*`: **yaml** (moderate; two majors, bun ignores
nested overrides), **TypeScript 7** (deferred, path verified), **coverage debt** —
js/ts DONE; `.svelte` forms DONE (66 → 90). Remaining: chart (floor 35) and
ui (50), ~410 statements.

## Next command

    # next: .svelte debt in chart (floor 35) and ui (50)

## Open questions

Whether to narrow published `peerDependencies` (`svelte: ^5.0.0`) to exclude
vulnerable svelte. A consumer-facing break, not a sweep call.

## Known-broken

Nothing. lint 0/0 · check:types + check:svelte 0/0 · test:ci 6004/392 ·
coverage exit 0 · build:apps exit 0 · learn e2e 67 · frozen-lockfile clean.
