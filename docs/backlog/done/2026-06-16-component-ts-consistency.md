# Component `lang="ts"` Consistency Audit

**Date:** 2026-06-16
**Status:** ✅ Done (2026-06-17) — every `.svelte` component in `packages/*/src` is now
`lang="ts"`. `@rokkit/chart` (61) + `@rokkit/forms` (35) migrated in commit `5c1a5b3b`
(both svelte-check 0 errors; chart/forms gained a svelte-check `tsconfig.json` + `@types/d3-*`
/ `@types/ramda` devDeps; forms declaration-emit path fixed in `261d4f31`). Final two strays —
`@rokkit/app` TableOfContents (also dropped a `@ts-nocheck`) + `@rokkit/helpers` MockItem —
migrated in `9a397aae`, which also added svelte-check to the gate. No type suppressions
introduced; several latent bugs fixed along the way.
**Site Applicability:** Library packages (`@rokkit/chart`, `@rokkit/forms`, `@rokkit/actions`,
`@rokkit/app`, `@rokkit/helpers`).

## Summary

Audit of all 163 `.svelte` components in `packages/*/src`: **97 are authored in plain
`<script>`** (no `lang="ts"`). `@rokkit/ui` was 100% TS except `CommandPalette.svelte` —
**now fixed** (commit on 2026-06-16; also typed the `dismissable` action's `ondismiss`
custom event, which the conversion surfaced). The remaining plain-JS components are
concentrated in two packages plus a couple strays:

- **`@rokkit/chart` — ~60 components** (Plot/*, charts/*, geoms/*, elements/*, crossfilter/*,
  symbols/*, …). Entirely plain-JS.
- **`@rokkit/forms` — ~35 components** (FormRenderer, all `input/*`, `display/*`, …). Entirely
  plain-JS.
- **Strays:** `@rokkit/app` `TableOfContents.svelte`, `@rokkit/helpers` `MockItem.svelte`.

## Why it matters

Converting to `lang="ts"` turns on real type-checking inside the component (plain `<script>`
is not type-checked by svelte-check). This is what surfaces — and lets us fix — latent gaps
like the `dismissable` `ondismiss` event that was invisible while `CommandPalette` was JS.

## Approach

Per package (start with `forms`, then `chart` — `app`/`helpers` strays are quick):

1. `<script>` → `<script lang="ts">`; convert JSDoc `@type`/`@param` to TS annotations;
   type untyped function params and `$props()` destructures.
2. Expect to surface **action/custom-event typing gaps** (like `dismissable`) — fix by adding
   the 3rd `Action<Node, Param, Attributes>` generic on the action so `on*` attributes type.
3. Many `chart` components are thin D3 wrappers — types may be loose; a local structural type
   or `unknown` + narrowing is fine. Don't over-engineer.
4. Run the package's `svelte-check` (`check` script) per package; land it clean before moving on.

## Relationship to other backlog

Overlaps with [svelte-check type-health](./2026-06-16-svelte-check-type-health.md) (bindable
Props, `ButtonProps` HTML attrs, strict option types). Sequence: do the library Props
hardening there first, then this `lang="ts"` migration will surface fewer consumer errors.

## Out of scope

- Rewriting D3/chart logic — this is a typing/consistency pass only.

## Deliverable

All `packages/*/src/**/*.svelte` authored with `lang="ts"`, each package's `svelte-check`
clean, action custom-events typed. Then `svelte-check` can join the repo `check` gate.
