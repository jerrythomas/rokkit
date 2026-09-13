# TypeScript 7 migration

**Raised:** 2026-09-12, from rokkit#156 §4.
**Status:** open — deliberately deferred. The path below is **verified working**, not proposed.

## The trap, and why it is not urgent here

`bun run upgrade:all` runs `bun update --latest` per package. `--latest` ignores
the caret, so it will move `typescript` from `^5.9.3` to 7.x. svelte-check then
refuses to run at all:

> TypeScript 7 support currently requires both TypeScript 7 and TypeScript 6
> installed in your project, and requires using the `--tsgo` or
> `--tsgo-experimental-api` flag.

Confirmed in `svelte-check@4.7.6`'s `bin/ts-version-check.js`, which reads
`typescript/package.json` and throws when major >= 7.

The issue's concern was that dbd hit this and nobody noticed because CI never ran
`check`. **That does not apply here.** `.github/workflows/check.yml` runs
`bun run check`, which runs `check:svelte`, so the trap fails the build loudly —
and svelte-check's error text names the exact fix. Deferring is therefore safe.

Note the trap is broader than TypeScript: `--latest` would equally take vitest to
5, vite to 8 and eslint to 10 in one sweep. Anyone running `upgrade:all` should
expect to review every major, not just this one.

## What was measured

All of this was run against the real repo, then reverted.

| Combination | Result |
| --- | --- |
| `typescript@5.9.3` + `svelte-check@4.7.6` | works — current state |
| `typescript@6.0.3`, `tsc --noEmit` only | **0 errors** across app, blocks, chart, forms, ui |
| `typescript@6.0.3` + `svelte-check@4.7.6`, no `--tsgo` | **breaks**: `FAILURE "forEachResolvedModule is not a function"` |
| `typescript@~6.0.3` + `@typescript/native` + `svelte-check@4.7.6 --tsgo` | **works** — 0 errors across all five packages |

The third row is the important one: svelte-check's own gate advertises
`>= 5.0 and <= 6.0`, but 4.7.6 does **not** actually work on a bare TypeScript 6 —
it calls a compiler internal that TS 6 removed. So TS 6 is not a safe intermediate
step on its own. It is `--tsgo` or nothing.

## The verified path

```jsonc
// each of packages/{app,blocks,chart,forms,ui}
{
  "devDependencies": {
    "typescript": "~6.0.3",                       // svelte-check's gate reads THIS, must be < 7
    "@typescript/native": "npm:typescript@^7.0.2" // and reaches tsgo through THIS
  },
  "scripts": {
    "check": "svelte-check --tsconfig ./tsconfig.json --tsgo"
  }
}
```

Already done in this sweep, as prerequisites:

- `svelte-check` raised `^4.4.3` → `^4.7.6` in all five packages. They declared
  `^4.4.3` and the lockfile had pinned exactly 4.4.3, which predates `--tsgo` and
  fails with a sade parse error on the unknown flag.
- `check:types` rewired from `bunx tsc --noEmit` to a per-package
  `check:types` script invoked via `bun run`, mirroring how `check:svelte` already
  delegates. No bunx, and `tsc` resolves from the workspace bin — verified working
  for chart and forms, which do not declare `typescript` themselves.

## Two things to resolve before adopting

**`--tsgo` pulls `dist/` into the check.** Running it against `packages/forms`
reports 2 warnings in `dist/FieldLayout.svelte` — a build artifact, not source
(`state_referenced_locally`). tsgo resolves the project differently from the
current path, so the tsconfig `include`/`exclude` needs tightening first or the
gate will flag generated output forever.

**The check surface changes size.** `packages/ui` goes from `COMPLETED 989 FILES`
to `COMPLETED 158 FILES`. The larger number counts dependency `.d.ts` files that
tsgo does not report. That is probably fine — arguably better — but it means the
gate stops measuring the same thing, so the first `--tsgo` run is not comparable
to the last non-tsgo one. Worth stating in whatever commit adopts it, so a future
reader does not read the drop as lost coverage.
