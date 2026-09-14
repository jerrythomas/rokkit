# CHECKPOINT

**Slice:** rokkit#156 sweep + coverage debt (2026-09-14). Working tree CLEAN,
`develop` and `main` both pushed; Check + Coverage green on each.

## Done

`bun audit` **28 vulnerable packages -> 1**; merged to main at `f8d55f9c`
(Dependabot open alerts now **0**).

- `cc335be6`…`ae26e415` dompurify/vitest/svelte/kit/wrangler/cookie bumps,
  `check:types` off `bunx`. Details in `agents/journal.md`.
- `e07aaa5f`…`c4313dd9` three racy specs pinned. CI and local now match exactly
  on all four metrics across all 23 directories.
- `bb9a5408`…`53b12d41` **all 13 js/ts packages back to 100%** (was 2). Found a
  real bug — `themable` leaked a `storage` listener via a discarded
  `$effect.root` disposer.
- `61d21f07` … `26d48401` **`.svelte` debt CLOSED** — 0 files below the 90% bar
  (was 29 files / 493 statements). forms 66→90, chart 35→91, ui 50→90. Found two
  more real bugs: the documented `override: true` → `child` snippet never worked,
  and DefinePatterns' spec had been asserting the error branch for its whole life.

## Remains

Booked in `docs/backlog/2026-09-12-*`: **yaml** (moderate; two majors, bun ignores
nested overrides), **TypeScript 7** (deferred, path verified), **coverage debt** —
**coverage debt is CLOSED** (js/ts 100%, `.svelte` all ≥90, aggregate 97.85%).
New: a flaky learn e2e, booked in `docs/backlog/2026-09-14-flaky-*`.

## Next command

    git checkout main && git merge develop   # main is behind again

## Open questions

Whether to narrow published `peerDependencies` (`svelte: ^5.0.0`) to exclude
vulnerable svelte. A consumer-facing break, not a sweep call.

## Known-broken

Nothing. lint 0/0 · check:types + check:svelte 0/0 · test:ci 6181/404 ·
coverage exit 0 · build:apps exit 0 · learn e2e 67 · frozen-lockfile clean.
