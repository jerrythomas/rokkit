# CHECKPOINT

**Slice:** post-v1.4.2 backlog burn-down. Three items closed (2026-09-14).
Working tree clean; `c4744bb8` on develop — CI green (Check + Coverage).

## Done

- **Flaky learn e2e CLOSED** (`3ee1bd5f`). Pre-hydration dead click: SSR ships
  controls hit-testable but inert, so Playwright's actionability checks pass and
  the click is swallowed (`/app` hydrates 330 tiles). Wouldn't reproduce on
  demand, so `hydration.e2e.ts` holds the window open deliberately.
  `body[data-hydrated]` in a layout `$effect`; 13 goto sites wait on it. Found a
  *second* racy test, and one that could pass vacuously. ×3: 210/210, 2.2→1.7 m.
- **learn typecheck gate CLOSED** (`a21e5278`, `76a88837`) — booked as large,
  measured as 6 errors in 3 files. **svelte-check gate CLOSED** (`134d09b9`) —
  14 in 4. All six gated dirs now 0 errors / 0 warnings.
- **Coverage regression from that gate, fixed** (`c4744bb8`) — learn's tsconfig
  extends the *generated* `.svelte-kit/tsconfig.json` and standalone `coverage`
  had not synced. `test:ci`/`coverage` sync now.

Both gates found one library defect: `@rokkit/ui` exports a component **and** an
interface named `ChatMessage`, the component's type shadowing the interface — so
`ChatMessage<T>` was unreachable for every consumer. Fixed additively as
`ChatMessageData<T>`. Only a consumer-side gate can see this.

## Remains (booked in `docs/backlog/`)

- **yaml** (moderate) — two majors, bun ignores nested overrides; only lever is
  a full re-resolve (blast radius measured: 40 packages).
- **TypeScript 7** — path verified, deferred by choice.
- **Untyped snippet props** (new) — `List` and siblings collect snippets behind
  `[key: string]: unknown`, so consumers' params are implicitly `any`; two
  interim annotations in learn to delete when fixed.

Open question: narrow `peerDependencies` (`svelte: ^5.0.0`) to exclude vulnerable svelte? A consumer-facing break, not a sweep call.

## Known-broken

Nothing. lint 0/0 · check:types + check:build + check:svelte 0/0 · build:apps 0 ·
test:ci 6181/404 · e2e 70/70. (Sensei daemon down — this file is the record.)
