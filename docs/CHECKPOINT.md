# CHECKPOINT

**Slice:** post-v1.4.2 burn-down — **RELEASED v1.6.0** (2026-09-16). Backlog
empty; develop and main at the release commit; all 14 packages live on npm.

## Released in v1.6.0

Three breaking changes, held until they could ship together:

- **`snippets` prop** (`12563bdd`) — replaces the open `[key: string]: unknown`
  index signature, so misspelled prop names are type errors, not silent no-ops.
- **svelte as a peer** (`a5103514`) — `states`/`data` shipped it as a *hard* dep,
  putting a second svelte runtime in consumers' trees.
- **unocss as a peer** (`2da23978`) — same shape, plus a guard
  (`packages/core/spec/workspace-peers.spec.js`) so the class can't return.

Also Table's per-column named snippets (`6632295a`), which its docs had promised
while the component never read `column.snippet`.

## Verified on the shipped artifacts

Not "CI is green" — the exact repros that failed on 1.5.0, re-run against npm:

| Repro | 1.5.0 | 1.6.0 |
| --- | --- | --- |
| consumer on svelte 5.40.0 + `@rokkit/ui` | 3 svelte copies | **1** |
| consumer on unocss 66.0.0 + `@rokkit/unocss` | 2 engines | **1** |
| `{ itemcontnt: … }` against `ListProps` | compiled | **type error** |

## Earlier, in v1.5.0

Flaky learn e2e, the learn typecheck + svelte-check gates, yaml (`bun audit`
2 → 0), and the props-type correction wiring all 62 components to their own type.

## Remains

- **TypeScript 7** — path verified, deferred by choice. Only open item.

## Known-broken

Nothing. lint 0/0 · check:types + check:build + check:svelte 0/0 · build:apps 0 ·
test:ci 6465/407 · learn e2e 70/70 · bun audit 0. (Sensei daemon down — this is the record.)
