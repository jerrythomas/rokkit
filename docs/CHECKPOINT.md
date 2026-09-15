# CHECKPOINT

**Slice:** post-v1.4.2 backlog burn-down. v1.5.0 shipped; develop has since
gained a **second breaking change, deliberately unreleased** — holding until
something else lands. Working tree clean; `ef6c600e` on develop.

## Released in v1.5.0 (2026-09-14)

- **Flaky learn e2e** (`3ee1bd5f`) — pre-hydration dead click; `hydration.e2e.ts`
  holds the window open so the race is deterministic. ×3: 210/210.
- **learn typecheck + svelte-check gates** (`a21e5278`…`134d09b9`, `c4744bb8`).
- **yaml** (`97cc8b64`) — bun audit 2 → 0 in a 2-line lockfile diff.
- **Snippet props + stale props types** (`1fc4e987`, `d735e56e`) — all 62
  components annotate `$props()` with their own type; drift is now a compile
  error. **Breaking**, hence the minor.
- **Three stale `@ts-nocheck`** + the Dropdown doc (`935fc868`).

## On develop, NOT released

`12563bdd` — **breaking**. The `[key: string]: unknown` index signature is gone;
per-item named snippets move from children to a declared prop:

    {#snippet pinned(proxy)}…{/snippet}
    <List {items} snippets={{ pinned }} />

Passing them as children no longer compiles, and silently renders the default at
runtime. Needs a migration note in the release body when it does ship — a minor,
not a patch. Also surfaced that Tabs' `empty`/`tabPanel` were undeclared.

## Remains

- **`TableColumn.snippet` is dead** (new) — documented and typed, never read by
  `Table.svelte`. Implement it or remove it; decide before shipping either.
- **TypeScript 7** — path verified, deferred by choice.
- Open question: narrow `peerDependencies` (`svelte: ^5.0.0`) to exclude vulnerable svelte?

## Known-broken

Nothing. lint 0/0 · check:types + check:build + check:svelte 0/0 · build:apps 0 ·
test:ci 6431/405 · e2e 70/70 · bun audit 0. (Sensei daemon down — this is the record.)
