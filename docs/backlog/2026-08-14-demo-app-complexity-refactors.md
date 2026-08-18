# Demo-app high-complexity refactors (qlty smells)

**Date:** 2026-08-14
**Status:** Partially done — `llm.svelte.ts` + `packages/cli/src/doctor.js` resolved (2026-08-14); `routeData` and the contrast-collector functions remain backlogged.
**Site Applicability:** `apps/learn` demo/tooling + `@rokkit/cli` only.

## Problem

qlty `smells` flags several high-complexity functions. `infer.ts` was already refactored
(`parseCSV` 38→21, behind 44 characterization tests). The remaining big offenders are in
demo-app / e2e tooling and had **no direct unit tests**, so refactoring them safely requires
characterization tests first:

| Function | File | Complexity | Status |
| --- | --- | --- | --- |
| `routeViaLLM` | `apps/learn/src/lib/chat-demo/llm.svelte.ts` | ~53 | ✅ resolved 2026-08-14 |
| `wrapBareJSON` | `apps/learn/src/lib/chat-demo/llm.svelte.ts` | ~21 | ✅ resolved 2026-08-14 |
| `findBalancedBraceEnd` | `apps/learn/src/lib/chat-demo/llm.svelte.ts` | ~18 | ✅ resolved 2026-08-14 |
| `inferFenceLanguage` + `toolNameToFence` | `apps/learn/src/lib/chat-demo/llm.svelte.ts` | 9 / 6 returns | ✅ resolved 2026-08-14 |
| `llm.svelte.ts` file-complexity | — | 154 | ✅ resolved 2026-08-14 |
| `packages/cli/src/doctor.js` file-complexity | — | 81 | ✅ resolved 2026-08-14 |
| `routeData` | `apps/learn/src/lib/chat-demo/router.ts` | ~19 | ⏳ backlogged |
| `collectContrast` | `apps/learn/e2e/contrast-collector.mjs` | ~53 | ⏳ backlogged |
| `auditGallery` | `apps/learn/e2e/contrast-collector.mjs` | ~29 | ⏳ backlogged |

> Note: the original table pointed at `router.ts`, but the LLM-block hotspots actually live in
> `llm.svelte.ts` (the parser functions moved there when the demo switched from scripted routing
> to LLM routing). Corrected above.

## Resolved (2026-08-14) — how

1. **Characterization tests first** (`apps/learn/spec/chat-demo/parse.spec.ts`, 42 tests):
   locked in the actual pre-refactor behavior of `toolNameToFence`, `inferFenceLanguage`,
   `findBalancedBraceEnd`, `wrapBareJSON`, `splitSuggestions`, `parseCompletion`,
   `buildSystemPrompt`, and `routeViaLLM` error/status mapping (fetch stubbed). Four
   characterization mismatches corrected expectations to the real behavior (e.g. the
   `splitSuggestions` multi-fence output keeps the leftover blank lines; the 240-char message
   truncation has no `…` on the body path because `routeViaOpenRouter` already caps at 200).
2. **`llm.svelte.ts` split into three modules** (all pure parsing, no runes/state):
   - `parse.ts` — block pipeline: `parseCompletion`, `splitSuggestions` + façade re-exports.
   - `scan.ts` — low-level scanning: `copyFence`, `wrapBareJSON`, `skipString`, `findBalancedBraceEnd`.
   - `prompt.ts` — system prompt + fence vocabulary: `buildSystemPrompt`, `inferFenceLanguage`
     (matcher table), `toolNameToFence` (lookup map).
   `llm.svelte.ts` now holds only state/engine/routing. `routeViaLLM`'s 5-level ternary chain
   replaced with a `OPENROUTER_STATUS_META` lookup table (`title(model)` factory + `hint`) and a
   `formatErrorDetail` helper shared with the web-llm path.
3. **`doctor.js` split into four modules** (`@rokkit/cli`):
   - `checks.js` — the six check definitions + `runChecks`.
   - `fix.js` — fs adapter + auto-fix handlers + `defaultStarterSource` + `autoFix`.
   - `report.js` — `printChecks`, `handleResults` + print helpers.
   - `validate.js` — `validateConfigShape`, `checkTextTokenUsage`.
   `doctor.js` is now command orchestration + re-exports, so `doctor.spec.js` imports are
   unchanged and per-file coverage stays 100% (statements + lines).

Verification: all 9 touched files are qlty-smell-free; `test:ci` 5313 green; `lint` 0 errors
(106 warnings, down from the 110 baseline); `check:types` clean; cli coverage 100% per-file.


## Why deferred (not done in the original qlty pass)

- None are shipped in the published npm packages — zero release impact (though `@rokkit/cli`'s
  `doctor.js` *is* shipped, it only carried a file-complexity report and is fully tested).
- None had direct unit tests. Refactoring 50+-complexity untested code (LLM intent routing,
  WCAG-contrast e2e collection) risks silently breaking the demo / the contrast gate.
- Per "the right thing beats more things": refactoring for a metric on untested code, right
  before a release, isn't clearly the right thing.

## Approach (when picked up)

1. **`llm.svelte.ts`** ✅ — added characterization tests for `routeViaLLM`/`wrapBareJSON`/
   `findBalancedBraceEnd`/`inferFenceLanguage`/`toolNameToFence`/`splitSuggestions` (capture
   current outputs across representative + malformed fenced blocks), then split the pure parsing
   into `parse.ts` / `scan.ts` / `prompt.ts` and replaced the error-mapping ternary chains with a
   lookup table, keeping tests green. Mirrored the `infer.ts` approach (`42742044`).
2. **`router.ts` `routeData`** (~19) — still backlogged; add characterization tests for the
   data-route branches, then extract per-branch helpers.
3. **`contrast-collector.mjs`** — still backlogged; this is an e2e helper (runs in the browser
   via Playwright). Extract the per-element contrast-collection and the audit-loop into named
   helpers; verify by running the `theme-contrast` e2e before/after and diffing the collected
   report.

## Out of scope

- Shipped-package complexity beyond `@rokkit/cli` `doctor.js` (resolved).
- Behavior changes — these are pure readability refactors.

## Deliverable

The listed functions below qlty's complexity threshold, each behind characterization tests, with
the demo + contrast e2e verified unchanged. **Done:** `llm.svelte.ts` (all hotspots + file 154) and
`packages/cli/src/doctor.js` (file 81). **Remaining:** `routeData`, `collectContrast`, `auditGallery`.
