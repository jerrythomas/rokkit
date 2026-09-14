# CHECKPOINT

**Slice:** rokkit#156 sweep + coverage debt (2026-09-14). Working tree CLEAN,
`develop` and `main` both pushed; Check + Coverage green on each.

## Done

`bun audit` **28 vulnerable packages -> 1**; merged to main at `f8d55f9c`
(Dependabot open alerts now **0**).

- `cc335be6` dompurify `^3.4.13` in ui AND blocks; dropped the `@types` stub.
- `1bbb28d2` vitest `^4.1.11`, three criticals; fixed 87 tests; coverage
  re-baselined per-package (vitest 4 forces AST remapping).
- `bcc0430c` svelte `^5.55.7` + eslint/typescript-eslint/rimraf.
- `5bce7720` kit `^2.70.3`; wrangler `^4.131.1` (clears esbuild + two high sharp);
  16 single-major overrides.
- `06942b2c` cookie `^0.7.2` — the issue's "no clean fix" resolves.
- `ae26e415` `check:types` off `bunx`; svelte-check `^4.7.6`.
- `e07aaa5f` `690c132e` `c4313dd9` three racy specs pinned. CI and local now match
  **exactly** on all four metrics across all 23 directories.
- `bb9a5408` `85b5a0c6` coverage debt: **9 of 13 js/ts packages back to 100%**
  (was 2). Found a real bug — `themable` leaked a `storage` listener via a
  discarded `$effect.root` disposer.

## Remains

Booked in `docs/backlog/2026-09-12-*`: **yaml** (moderate; two majors, bun ignores
nested overrides), **TypeScript 7** (deferred, path verified), **coverage debt** —
56 js/ts statements (chart 28, cli 14, forms 12, states 2) plus ~490 in `.svelte`
(chart, ui, forms).

## Next command

    # continue the debt: chart/cli/forms/states js/ts, then .svelte

## Open questions

Whether to narrow published `peerDependencies` (`svelte: ^5.0.0`) to exclude
vulnerable svelte. A consumer-facing break, not a sweep call.

## Known-broken

Nothing. lint 0/0 · check:types + check:svelte 0/0 · test:ci 5856/386 ·
coverage exit 0 · build:apps exit 0 · learn e2e 67 · frozen-lockfile clean.
