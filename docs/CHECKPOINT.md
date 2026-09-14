# CHECKPOINT

**Slice:** post-v1.4.2 backlog burn-down — **backlog now empty of open items
except one owner decision**. Working tree clean; `1fc4e987` on develop.

## Done

- **Flaky learn e2e CLOSED** (`3ee1bd5f`) — pre-hydration dead click. SSR ships
  controls hit-testable but inert; `hydration.e2e.ts` holds the window open so
  the race is deterministic. ×3: 210/210, 2.2→1.7 m.
- **learn typecheck + svelte-check gates CLOSED** (`a21e5278`, `76a88837`,
  `134d09b9`); regression fixed in `c4744bb8`. All six gated dirs 0/0.
- **yaml CLOSED** (`97cc8b64`) — **bun audit 2 → 0**. Advisory spans both majors
  (`<1.10.3` and `>=2.0.0 <2.8.3`), so no single override works, and bun ignores
  scoped keys (verified). No override needed: both ranges already admit a patched
  version, the lockfile just held stale pins. 2-line diff; a full re-resolve
  would have dragged 245/307 lines incl. `@antfu/install-pkg` 1→2.
- **Snippet props CLOSED** (`1fc4e987`) — `ItemSnippet`/`SelectableItemSnippet`
  applied across 9 components after surveying actual call shapes. Green proven
  non-vacuous.

Consumer-side gating found two library defects invisible to the package's own
checks: the `ChatMessage` component/interface collision, and the below.

## Remains

- **Stale `*Props` types** (new, needs your call) — `ListProps`, `MenuProps`,
  `SelectBaseProps`, `TreeProps` describe components that no longer exist.
  They're the only 4 of 48 their component doesn't import. Correcting them is a
  breaking type change, and `ListProps`'s `multiselect`/`expanded`/`selected`
  look like a designed API, not an accident — which side is the truth is yours.
- **TypeScript 7** — path verified, deferred by choice.
- Open question: narrow `peerDependencies` (`svelte: ^5.0.0`) to exclude vulnerable svelte?

## Known-broken

Nothing. lint 0/0 · check:types + check:build + check:svelte 0/0 · build:apps 0 ·
test:ci 6181/404 · e2e 70/70 · bun audit 0. (Sensei daemon down — this is the record.)
