# CHECKPOINT

**Slice:** post-v1.4.2 backlog burn-down — **RELEASED v1.5.0** (2026-09-14).
All booked items closed. Working tree clean; develop and main both at the
release commit; all 14 packages live on npm.

## Done

- **Flaky learn e2e** (`3ee1bd5f`) — pre-hydration dead click. SSR ships controls
  hit-testable but inert; `hydration.e2e.ts` holds the window open so the race is
  deterministic. ×3: 210/210, 2.2→1.7 m.
- **learn typecheck + svelte-check gates** (`a21e5278`…`134d09b9`; regression
  fixed in `c4744bb8`). All six gated dirs 0 errors / 0 warnings.
- **yaml** (`97cc8b64`) — **bun audit 2 → 0** in a 2-line lockfile diff; a full
  re-resolve would have dragged 552 lines.
- **Snippet props** (`1fc4e987`) and **stale props types** (`d735e56e`) — four
  interfaces described components that no longer existed. Corrected to match the
  components and wired, so drift is now a compile error. All **62** components
  annotate `$props()` with their own type; `spec/props-types.spec.ts` guards it.
- **Three stale `@ts-nocheck`** (`935fc868`) — made the annotations on Dropdown
  and Menu decoration. Removing them cost 0 errors. Plus `dropdown.txt`, which
  documented Menu's old API, rewritten against the real component.

Released as a **minor**: the corrected interfaces are narrower, so code typed
against the old props no longer compiles (it could never have worked — the
components never read them — but it did type-check).

Verified as a consumer, not just as a green workflow: a scratch install of
`@rokkit/ui@1.5.0` type-checks against the **shipped** `.d.ts`, and the removals
are provable — `ListItemSnippet` is gone, `DropdownProps.options` is gone.

## Remains

- **TypeScript 7** — path verified, deferred by choice.
- Open question: narrow `peerDependencies` (`svelte: ^5.0.0`) to exclude vulnerable svelte?

## Known-broken

Nothing. lint 0/0 · check:types + check:build + check:svelte 0/0 · build:apps 0 ·
test:ci 6306/405 · e2e 70/70 · bun audit 0. (Sensei daemon down — this is the record.)
