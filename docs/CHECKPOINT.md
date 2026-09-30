# CHECKPOINT

**Slice: FormBuilder decomposition — DONE** (`7609ccce..HEAD` on `develop`).
Plan: `docs/plans/2026-09-30-formbuilder-decomposition.md`. Previous slices (architecture
primitives, PlotState decomposition) pushed as `ade409b3..af811b8b`, CI green.

**Done — every increment of the plan:**

1. Characterised schema ⇄ layout derivation (7 cases).
2. `FormValues` + pure `lib/values.js`.  3. `FormDefinition`.  4. `FormLookups`.
5. `FormSteps`.  6. `FormValidation` (visible paths injected — breaks the elements cycle).
7. Pure `lib/elements.js` (`buildElements`, `resolveInputType`).
8. `FormBuilder` is the composition root (247 lines, cx 5); differential over 588 cases
   identical; re-measured; design doc 03 + llms forms updated; journal, memory.

**Gates (2026-09-30):** `bun run coverage` 7777 / 492 files, all thresholds; lint 0/0;
check:svelte 0/0; e2e 129/129.

**Next command:** `git push origin develop`, then the next hotspot — `actions/src/navigator.js`
(cx 70) or `unocss/src/preset.ts` (cx 74).

**Open questions:**

- Fixed (`1a08549c`): nested JSON Schema fields are found (`schemaAt`, one walk for both callers,
  flat form still read). Still open, a decision: `validate()` does not visit a group's children,
  so nested required fields never error on submit. Enabling it surfaces new errors on existing
  forms — recommend enabling, behind a changelog note.
- Hotspot corner still holds 9 files; `ui/components/Select.svelte` newly crossed the churn line.

**Known broken:** nothing. `sensei:checkpoint` unavailable — the sensei MCP server is disconnected.
