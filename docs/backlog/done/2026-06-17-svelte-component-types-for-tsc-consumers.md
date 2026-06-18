# `.svelte` Component Types for Pure-`tsc` Consumers

**Date:** 2026-06-17
**Status:** ✅ Done (2026-06-17) — `@sveltejs/package` now emits typed dist
(`dist/**/*.svelte.d.ts`) for `@rokkit/{app,ui,chart,forms}`; the `types` export
condition points at it while `svelte`/`default` stay → `src` (workspace + dev remain
zero-build; dist is gitignored, built at publish via `prepublishOnly`). Commits:
`ca1ad79b` (app pilot), `a6fdc577` (ui/chart/forms rollout). Verified a pure-`tsc`
consumer resolves `@rokkit/app`'s components end-to-end through the app→ui dist chain
with zero errors. Option 1 (svelte-package) from below was taken.
**Site Applicability:** External TS consumers of `@rokkit/{ui,app,chart,forms}` that do **not**
use the Svelte language tooling (svelte-check / `@sveltejs/vite-plugin-svelte`).

## Summary

Rokkit's component packages ship `.svelte` source as their type surface, in two shapes:

- **Source-only** (`@rokkit/ui`, `@rokkit/app`): `types`/`svelte`/`default` → `./src/index.ts`,
  which re-exports the `.svelte` components.
- **dist re-export** (`@rokkit/chart`, `@rokkit/forms`): `types` → `./dist/index.d.ts`, which
  `tsc` emits as `export { default as X } from './X.svelte'` — but `tsc` cannot emit a
  `.svelte.d.ts`, so those re-exports point at modules with no declarations.

A consumer that uses the Svelte tooling (svelte-check, or the Svelte Vite plugin in their
editor/build) resolves `.svelte` imports fine and now gets full types — every component is
`lang="ts"` as of 2026-06-17. But a **pure-`tsc` consumer** (a plain TS project with no
svelte plugin) cannot type `.svelte` imports at all: importing a component resolves to an
implicit `any`, or `tsc` reports "Cannot find module './X.svelte'".

This is why the sensei-hq site uses a local `ThemeToggle` instead of `@rokkit/app`'s, and it
is the general version of the (now-fixed) `@rokkit/unocss/hooks` gap — there the export was
plain `.js` with no `types` condition; fixed in `947f8efc` by adding `types: ./dist/hooks.d.ts`
+ an optional `@sveltejs/kit` peer dep so `themeHook` types as `Handle`. Plain-JS/TS subpaths
are easy to type; `.svelte` is the remaining hard case.

## Options

1. **`@sveltejs/package`** (recommended): add a `svelte-package` build step to ui/app/chart/forms
   that emits `dist/**/*.svelte.d.ts` (+ processed `.svelte`/`.js`), and point each package's
   `types`/`exports` at the generated `dist`. This is the canonical way to publish typed Svelte
   component libraries and serves both svelte-aware and pure-`tsc` consumers. Largest change —
   new build tooling per package, and `files`/`exports` rewiring.
2. **Document the requirement**: state in each package README that consumers must enable the
   Svelte language tooling (svelte-check / the Vite plugin) to get component types. Cheapest;
   leaves pure-`tsc` consumers unserved.

## Notes

- No behavior/runtime change is needed — this is purely about the published *type* surface.
- Keep `dist/` deleted in local dev for chart/forms: a locally-built `dist/index.d.ts` makes
  workspace consumers resolve the broken `types` path instead of the `svelte`/source condition.
- Related: `2026-06-16-component-ts-consistency` (done — all components now `lang="ts"`),
  `2026-06-16-svelte-check-type-health` (done — svelte-check in the gate). This item is the
  last mile: making those types reach non-svelte-aware consumers.
