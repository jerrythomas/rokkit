# CHECKPOINT

**Slice:** rokkit#156 sweep + coverage debt (2026-09-14). Working tree CLEAN,
`develop` and `main` both pushed; Check + Coverage green on each.

## Done

`bun audit` **28 vulnerable packages -> 1**, plus a coverage-determinism fix:

- `cc335be6` dompurify `^3.0.0` -> `^3.4.13` in ui AND blocks (issue missed
  blocks); dropped the `@types/dompurify` stub; +4 guard specs.
- `1bbb28d2` vitest -> `^4.1.11`, three criticals. Fixed 87 tests (vitest 4 mocks
  are not constructable) + re-baselined coverage per-package (forced AST remap).
- `bcc0430c` svelte -> `^5.55.7` + eslint/typescript-eslint/rimraf toolchain.
- `5bce7720` kit -> `^2.70.3`; wrangler declared `^4.131.1` (clears esbuild AND
  two high sharp advisories); @iconify/tools; 16 single-major overrides.
- `06942b2c` cookie `^0.7.2` — the issue's "no clean fix" resolves because youch
  only calls `cookie.parse`.
- `ae26e415` `check:types` off `bunx`; svelte-check aligned `^4.7.6`.
- `e07aaa5f` `690c132e` `c4313dd9` three racy specs pinned — MermaidPlugin,
  CodeBlock, Code all to **100%** statements. CI and local now match **exactly**
  on all four metrics across all 23 directories.
- `bb9a5408` `85b5a0c6` coverage debt: **9 of 13 js/ts packages back to 100%**
  (was 2). Found a real bug — `themable` leaked a `storage` listener via a
  discarded `$effect.root` disposer.

## Remains

Booked in `docs/backlog/2026-09-12-*`: **yaml** (moderate; two majors, bun ignores
nested overrides), **TypeScript 7** (deferred, path verified), **coverage debt**
— 56 js/ts statements left (chart 28, cli 14, forms 12, states 2) plus ~490 in
`.svelte` (chart, ui, forms).

## Next command

    # continue the debt: chart/cli/forms/states js/ts, then .svelte

## Open questions

Whether to narrow published `peerDependencies` (`svelte: ^5.0.0`) to exclude
vulnerable svelte. Left alone — a consumer-facing break, not a sweep call.

## Known-broken

Nothing. lint 0/0 · check:types + check:svelte 0/0 · test:ci 5856/386 ·
coverage exit 0 · build:apps exit 0 · learn e2e 67 · frozen-lockfile clean.
