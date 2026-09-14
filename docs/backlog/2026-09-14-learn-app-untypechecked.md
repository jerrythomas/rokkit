# `apps/learn` TypeScript is never typechecked

**Raised:** 2026-09-14, while fixing the pre-hydration e2e flake.
**Status:** open.

## The gap

`apps/learn` has no `tsconfig.json` and no `check:types` / `check` script. The
root gate iterates `packages/*/ apps/*/` and runs `check:types` only where a
`tsconfig.json` exists, so the whole learn app — `src/` and `e2e/` alike — is
skipped:

    → tsc packages/app/      → tsc packages/blocks/   → tsc packages/chart/
    → tsc packages/forms/    → tsc packages/ui/
    (apps/learn absent)

Nothing else covers it. Playwright transpiles `.ts` specs without typechecking,
`vite build` strips types, and `check:svelte` enumerates five library packages
by name — learn is not one of them.

So `bun run check` is green on code no type checker has read.

## Why it matters

This is the same shape as the `check:build` publish hole found at v1.4.2: the
gate was green because the build that would have failed was not the build the
gate ran. Here the checker that would have failed is not run at all.

Concretely, `e2e/helpers.ts` gained `waitForHydration`/`gotoHydrated` in
`3ee1bd5f` and is imported by eight specs. A signature error in it would surface
as a runtime e2e failure, not a type error — and on the deployed site, `src/` is
in the same position.

## Why it is booked and not done

Adding a `tsconfig.json` turns on checking for an app that has never had it —
including a ~2,300-line `routes/app/+layout.svelte`. The error count is unknown
and probably not small. That is a slice of its own, not a rider on a flake fix.

## Suggested approach

1. Add `apps/learn/tsconfig.json` extending `./.svelte-kit/tsconfig.json`, and a
   `check:types` script. Measure the damage first — do not commit it red.
2. If the count is large, split: gate `e2e/` (small, new, and the reason this
   was noticed) ahead of `src/`.
3. Once green, the root gate picks it up automatically — the loop already looks
   for `apps/*/tsconfig.json`, so no root change is needed.
4. Consider adding learn to `check:svelte` for the `.svelte` half.

## Related

- `docs/backlog/2026-09-12-typescript-7-migration.md` — the check surface shrank
  under `--tsgo`; whatever is decided here should survive that move.
