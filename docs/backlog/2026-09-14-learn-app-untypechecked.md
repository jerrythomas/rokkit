# `apps/learn` TypeScript is never typechecked

**Raised:** 2026-09-14, while fixing the pre-hydration e2e flake.
**Status:** CLOSED 2026-09-14 — gate added, 0 errors.

## The gap

`apps/learn` had no `tsconfig.json` and no `check:types` script. The root gate
iterates `packages/*/ apps/*/` and runs `check:types` only where a
`tsconfig.json` exists, so the whole learn app — `src/` and `e2e/` alike — was
skipped. Nothing else covered it: Playwright transpiles specs without
typechecking, `vite build` strips types, and `check:svelte` enumerates five
library packages by name.

`bun run check` was green on code no type checker had read.

## The estimate was wrong, and measuring was cheap

This was booked expecting a large error count — a ~2,300-line
`routes/app/+layout.svelte` that had never been checked. The actual measurement:

| Scope | Errors |
| --- | --- |
| `e2e/**/*.ts` (the specs) | **0** |
| `src/**/*.ts` | **6** |
| `e2e/*.mjs` collectors | 143 — but only under `checkJs: true` |

The 143 were self-inflicted by the measuring config. With `checkJs: false` the
real number was **6**, in 3 files. Two minutes of measuring turned a deferred
slice into a same-session fix.

## The 6 were real defects, not typing noise

- **`@rokkit/ui` exports a component `ChatMessage` and an interface
  `ChatMessage`.** Svelte's generated component types contribute a type of that
  name, which shadows the interface — so `ChatMessage<T>` is *unreachable for any
  consumer*. Fixed additively with a `ChatMessageData<T>` alias; renaming either
  is breaking and waits for a major. This is a library API defect that the
  package-internal gates structurally cannot see, because they check `ui`
  against its own source, never through the package entry.
- **`adoptProvider(provider: string)`** forced an `as string` at the call site
  that laundered away `ChatProvider`. A missing provider then failed the
  `=== 'scripted'` guard and wrote `llm.provider = undefined` with `enabled`
  left true — a value outside the field's own union.
- **`spec.options`** reached through the `DemoPropSchema` union instead of
  narrowing on the discriminant.
- **`Boolean(conv) &&`** did not narrow for the `.turns` access that followed.

## Two things worth keeping

**The gate checks the consumer-facing surface, and which surface depends on the
machine.** `@rokkit/ui` resolves via `exports`: `types → ./dist/index.d.ts`, with
`default → ./src/index.ts` behind it. `dist` is gitignored and CI runs
`bun install --ignore-scripts`, so **locally the check runs against built
declarations and in CI against source.** Both were verified green here (by moving
`dist` aside). Worth remembering when a type error reproduces on only one of them.

**`lint --fix` and `tsc` actively disagree on one idiom.** The autofix rewrites
`!!x &&` into `Boolean(x) &&`, and `Boolean()` does not narrow — so lint passes,
then typecheck fails on the very line lint just rewrote. A ternary satisfies
both. Sibling of the existing warning in CLAUDE.md that `--fix` silently deletes
unused disable directives.

## What was done

1. `apps/learn/tsconfig.json` extending `./.svelte-kit/tsconfig.json`.
2. `check:types` = `svelte-kit sync && tsc --noEmit` — the sync is required,
   since `.svelte-kit/tsconfig.json` is generated and the root gate runs
   `check:types` long before `build:apps` would create it.
3. The root gate picked it up with no root change (the loop already looks for
   `apps/*/tsconfig.json`).
4. Break-it verified: mistyping `waitForHydration`'s parameter fails the gate
   with exit 1, and catches it transitively in the specs that import it.

## The other half — also closed

`.svelte` files were unchecked too (`tsc` ignores them, and learn was not in
`check:svelte`). Added in `134d09b9`: 14 errors in 4 files, 11 of them the same
`ChatMessage` collision. Wired with `--diagnostic-sources js,svelte` because the
CSS service does not understand UnoCSS's `@apply` (50 false warnings). All six
gated dirs are now 0 errors / 0 warnings.

One finding booked rather than fixed: snippet props are untyped across the
component surface — see `2026-09-14-untyped-snippet-props.md`.
