# Demo-app high-complexity refactors (qlty smells)

**Date:** 2026-08-14
**Status:** Backlog — deferred from the qlty cleanup (need tests before refactoring)
**Site Applicability:** `apps/learn` demo/tooling only (NOT shipped in any `@rokkit/*` package).

## Problem

qlty `smells` flags several high-complexity functions. `infer.ts` was already refactored
(`parseCSV` 38→21, behind 44 characterization tests). The remaining big offenders are in
demo-app / e2e tooling and have **no direct unit tests**, so refactoring them safely requires
characterization tests first:

| Function | File | Complexity |
| --- | --- | --- |
| `routeViaLLM` | `apps/learn/src/lib/chat-demo/router.ts` | ~53 |
| `routeData` | `apps/learn/src/lib/chat-demo/router.ts` | ~19 |
| `wrapBareJSON` | `apps/learn/src/lib/chat-demo/router.ts` (or markdown helper) | ~21 |
| `findBalancedBraceEnd` | (markdown/router helper) | ~18 |
| `collectContrast` | `apps/learn/e2e/contrast-collector.mjs` | ~53 |
| `auditGallery` | `apps/learn/e2e/contrast-collector.mjs` | ~29 |

## Why deferred (not done in the qlty pass)

- None are shipped in the published npm packages — zero release impact.
- None have direct unit tests. Refactoring 50+-complexity untested code (LLM intent routing,
  WCAG-contrast e2e collection) risks silently breaking the demo / the contrast gate.
- Per "the right thing beats more things": refactoring for a metric on untested code, right
  before a release, isn't clearly the right thing.

## Approach (when picked up)

1. **`router.ts`** — add characterization tests for `routeViaLLM`/`routeData`/`wrapBareJSON`/
   `findBalancedBraceEnd` (capture current outputs across representative queries + malformed
   fenced blocks), then extract per-intent / per-branch helpers, keeping tests green. Mirror the
   `infer.ts` approach (`42742044`): capture ground truth by running the unmodified code first.
2. **`contrast-collector.mjs`** — this is an e2e helper (runs in the browser via Playwright).
   Extract the per-element contrast-collection and the audit-loop into named helpers; verify by
   running the `theme-contrast` e2e before/after and diffing the collected report.

## Out of scope

- Shipped-package complexity (there is none flagged in `@rokkit/*`).
- Behavior changes — these are pure readability refactors.

## Deliverable

The listed functions below qlty's complexity threshold, each behind characterization tests, with
the demo + contrast e2e verified unchanged.
