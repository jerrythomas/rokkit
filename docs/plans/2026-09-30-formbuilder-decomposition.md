# FormBuilder decomposition

**Status:** DONE (2026-09-30) — see journal 2026-09-30 (4).
**Package:** `@rokkit/forms`

## Why

`lib/builder.svelte.js` is now rokkit's top hotspot: 1128 lines, ~175 decision points, 26
commits (`build-architecture-metrics.mjs`). One class does six jobs, and the pure work of
turning a layout into `FormElement`s lives inside it as ~20 private methods.

## Shape

Job classes composed inside `FormBuilder`, public API unchanged (FormRenderer, MultiStep and
consumers untouched), exactly as PlotState:

| Job | Owns |
|---|---|
| `FormValues` | data, the initial snapshot, `getValue`/`updateField`, dirty tracking, `reset`/`snapshot`; deep clone/equal as pure helpers |
| `FormDefinition` | schema + layout and the rules by which each derives the other; `combined`; field schema / label |
| `FormLookups` | the lookup manager, per-field lookup state, dependent-value clearing |
| `FormSteps` | multi-step: count, current step, next/prev/goTo, active layout elements |
| `FormValidation` | the message map, field / all / step validation, `isValid`/`errors`/`messages`, hidden-field cleanup |
| `lib/elements.js` | PURE: layout + definition + values + validation + dirty + lookups → `FormElement[]`, and input-type resolution |

## Slices (one commit each, test first)

1. Characterise the schema ⇄ layout derivation rules.
2. Pure value helpers + `FormValues`.
3. `FormDefinition`.
4. `FormLookups`.
5. `FormSteps`.
6. `FormValidation`.
7. Pure `lib/elements.js`; `FormBuilder` left as the composition root.
8. Differential old vs new; re-measure; docs; journal.

## Invariants at every slice

Existing forms specs unchanged and green; forms 100% statement gate; `check:svelte`; lint 0/0;
forms e2e.
