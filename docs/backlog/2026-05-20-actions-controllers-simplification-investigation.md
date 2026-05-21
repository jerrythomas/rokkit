# Actions / Controllers — Simplification Investigation

**Date:** 2026-05-20
**Status:** Backlog — investigation only, do not implement yet

## Summary

Investigate whether the current `navigator` action + `ListController` / `NestedController` / `TabsController` stack is doing more than the browser already does. Now that selectable list items are real `<button>` elements, native Tab handles focus traversal. The actions/controllers may be doing only a thin layer of work on top — that work might be expressible more simply.

## What native gives us for free (with `<button>` items)

- Tab into the list, Tab out
- Visible focus state
- Click / Enter / Space activation
- Disabled-state focus skipping

## What the actions stack actually adds (and we'd lose if we strip it)

| Behavior | Native | Stack | ARIA reference |
| --- | --- | --- | --- |
| Roving tabindex (one tab stop per list, not one per item) | ✗ | ✓ | listbox / menu / tree pattern |
| Arrow-key navigation within list | ✗ | ✓ | listbox |
| Home / End / PageUp / PageDown | ✗ | ✓ | listbox |
| Type-ahead | ✗ | ✓ | listbox / menu |
| Right/Left = expand/collapse (tree) | ✗ | ✓ | tree |
| Orientation-aware arrows (horizontal vs vertical) | ✗ | ✓ | tablist / toolbar |
| Group-level focus management | ✗ | ✓ | tree / menu |

Stripping the stack loses roving tabindex and arrow navigation — both ARIA-standard for the listbox/menu/tree roles. So the stack stays as a concept. The question is whether the **code** has accumulated complexity that doesn't pull weight.

## Investigation goals

1. **Inventory current responsibilities** of `navigator.svelte.js`, `ListController.svelte.js`, `NestedController.svelte.js`, `TabsController.svelte.js`. Identify code paths that handle cases that no longer apply (e.g., logic for items that are NOT buttons — pre-ADR-003 leftovers).
2. **Quantify the simplification** — what lines / branches could be deleted if we assume items are always buttons?
3. **Audit dependencies** — what consumers rely on the controller API beyond items + value + onchange?
4. **Spike alternatives** — could a single `useListNavigation(items)` hook replace the controller hierarchy? Or is the multi-class structure carrying real weight?

## What stays regardless

- `ProxyItem` / `ProxyTree` / `Wrapper` field-mapping layer. That abstraction is doing real work for data-driven components and is unrelated to keyboard handling.

## Out of scope for this investigation

- Implementing the simplification — that's a follow-up plan after the audit lands.
- Touching the public component API.

## Deliverable

A short audit document (`docs/design/components/actions-audit.md`) with:
- Current responsibilities per file (lines of code, branches)
- Lines / branches that could be removed under the "items are buttons" assumption
- Risk assessment for each candidate removal
- Recommendation: leave as-is, refactor in place, or write a replacement
