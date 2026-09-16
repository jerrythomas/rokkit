# CHECKPOINT

**Slice:** post-v1.4.2 backlog burn-down — **RELEASED v1.6.0** (2026-09-16).
Backlog empty of open items. Working tree clean; develop and main both at the
release commit; all 14 packages live on npm.

## Released in v1.6.0

Three breaking changes, held until they could ship together:

- **`snippets` prop** (`12563bdd`) — replaces the open `[key: string]: unknown`
  index signature. Named snippets move from children to a declared prop, so
  misspelled prop names are now type errors instead of silently ignored.
- **svelte as a peer** (`a5103514`) — `states` and `data` shipped it as a *hard*
  dependency, putting a second svelte runtime in consumers' trees.
- **unocss as a peer** (`2da23978`) — same shape in `@rokkit/unocss`, plus a
  guard (`packages/core/spec/workspace-peers.spec.js`) so the class can't return.

Also: Table's per-column named snippets (`6632295a`), which its docs had
promised for a long time while the component never read `column.snippet`.

## Verified on the shipped artifacts

Not "CI is green" — the exact repros that failed on 1.5.0, re-run against npm:

| Repro | 1.5.0 | 1.6.0 |
| --- | --- | --- |
| consumer on svelte 5.40.0 + `@rokkit/ui` | 3 svelte copies | **1** |
| consumer on unocss 66.0.0 + `@rokkit/unocss` | 2 engines | **1** |
| `{ itemcontnt: … }` against `ListProps` | compiled | **type error** |

## Earlier, in v1.5.0

Flaky learn e2e (pre-hydration dead click), the learn typecheck + svelte-check
gates, yaml (`bun audit` 2 → 0), and the props-type correction that made all 62
components annotate `$props()` with their own type.

## Remains

- **TypeScript 7** — path verified, deferred by choice. Only open item.

## Known-broken

Nothing. lint 0/0 · check:types + check:build + check:svelte 0/0 · build:apps 0 ·
test:ci 6465/407 · learn e2e 70/70 · bun audit 0. (Sensei daemon down — this is the record.)
