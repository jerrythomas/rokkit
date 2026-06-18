# apps/learn svelte-check Type-Health + Gate

**Date:** 2026-06-16
**Status:** ✅ Done (2026-06-17) — all `@rokkit/ui`, `@rokkit/app`, and `apps/learn`
svelte-check errors cleared (Task 1: commits `6a25c443`, `f8f54b1e`, `42138a29`), and
svelte-check is now wired into the `bun run check` release gate via a new `check:svelte`
step over ui/app/chart/forms (commit `9a397aae`). No type suppressions introduced.
Remaining `apps/learn` errors are third-party `node_modules` type-def conflicts
(bun-types↔vite, mermaid, unconfig) + stale local dependency `dist` + one `@rokkit/ui`
Button anchor-variant cast that only the SvelteKit config flags — none in `apps/learn/src`.
**Site Applicability:** `apps/learn` (consumer) + `@rokkit/ui` / `@rokkit/states` Props/types.

## Summary

`svelte-check` is **not** part of the project gate today (`bun run check` = lint + `tsc`
on packages-with-tsconfig + tests; `apps/learn` is not in `check:types`, and there is no
`svelte-check` script). Running it on `apps/learn` surfaces ~62 src type errors + 98
`@apply` warnings. **All are pre-existing** — none are in recently-touched files. This item
captures them so they can be burned down and svelte-check added to the gate.

How to run (workspace svelte-check 4.4.3 — do NOT use `bunx svelte-check`, which fetches
`@latest` and floods the output with duplicate-`svelte/types` errors):

```
cd apps/learn
/Users/Jerry/Developer/rokkit/packages/app/node_modules/.bin/svelte-check \
  --tsconfig ./.svelte-kit/tsconfig.json
```

## What is NOT a real problem (false positives / noise)

- **98 `@apply` warnings** — svelte-check's CSS service doesn't know UnoCSS's `@apply`
  at-rule. Harmless. (Could be silenced with a CSS custom-data / lint config.)
- **Stale `dist/*.d.ts`** across workspace packages (chart "Cannot find module './Plot'",
  core/actions/states "Namespace conflict", and `states/dist` missing `skin` → the
  `vibe.skin` "does not exist" error). The packages export `types: ./dist/*.d.ts` (stale)
  but `import: ./src` (fresh), so the app runs fine. **Fix: `bun run build:all`** refreshes
  the dist types locally (dist is gitignored; rebuilt on publish via `prepublishOnly`).
  Done once during investigation — cleared the whole stale-dist class.
- **`embed/tabs/+page.svelte` "`<script>` was left open"** — file is well-formed and
  compiles; svelte-check parser artifact.

## Real, systematic root causes (~62 src errors)

1. **`value` not advertised as `$bindable` (7)** — `bind:value` on List / Tree / Select /
   MultiSelect / Swatch errors "non-bindable". Several of those components carry
   `// @ts-nocheck`, so their generated Props type doesn't surface `value = $bindable()`.
   Fix in `@rokkit/ui`: type `value` as bindable in the Props (and start removing
   `@ts-nocheck`). Clears gallery + /app + koan tree/list/lazy-tree.
2. **`ButtonProps` rejects `aria-label` (9)** — koan button/badge/Welcome/button-group pass
   `aria-label`. `ButtonProps` should extend `HTMLButtonAttributes` (allow `aria-*` / native
   button attrs).
3. **Strict option types (9)** — `ToggleItem` (`Record<string,unknown>`) and Swatch/Tabs
   options reject `string[]` and `interface` shapes (TS interfaces don't satisfy index
   signatures — use `type` aliases, or loosen the Props to `unknown[]`). koan toggle/swatch/tabs.
4. **/app chat-shell demo loose typing (11)** — toast `{ text }` not in the toast type,
   `ChatResponseProps` missing `stepperContent`/`listItemSnippet`, `'api'` not in `Props`,
   `TableColumn.align` widened to `string`, `'tree-table'` not in `ShellDemoType`. Mix of
   demo-app looseness + a few library Props gaps (ChatResponse, TableColumn).
5. **chat-demo store (7)** — `.body` accessed on `TweakTurn | AssistantTurn` union without
   narrowing.
6. **Misc** — theme-wizard `$state` use-before-decl + shade union; `chat/+page` `.error` on
   a result union; `web-llm` dynamic `https://esm.run/...` import has no types.

## Deliverable

- Library Props hardening in `@rokkit/ui` (bindable `value`; `ButtonProps` ← HTML button
  attrs; looser option types) + small `@rokkit/states`/ChatResponse/TableColumn type fixes.
- Demo-app type cleanup (/app chat-shell, koan demos, chat-demo store).
- Add a `check` script to `apps/learn` (`svelte-kit sync && svelte-check`) and fold it into
  the repo `check` gate once green.

Burn down by category; each library fix clears a batch of consumer errors at once.
