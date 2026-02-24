# Menu → ListController + use:navigator (ADR-003 Phase C)

**Date:** 2026-02-22
**Status:** Completed

## Steps

- [x] 1. Write plan
- [x] 2. Modify Menu.svelte — replaced inline keyboard/focus code with ListController + use:navigator
- [x] 3. Run unit tests — 457 UI tests pass, no changes needed
- [x] 4. Run full test suite — 1073 tests pass
- [x] 5. Update journal + ADR-003 checkboxes + archive plan

## Key Decisions

1. Used `ListController` (not `NestedController`) — Menu groups are presentation-only
2. Controller manages flat list of leaf items; groups are skipped
3. Navigator applied to dropdown container, not root
4. Trigger keyboard handling (ArrowDown/Up → open) remains manual
5. Escape + click-outside remain document-level listeners
6. Enter/Space on items uses `stopPropagation()` for backward compat
7. Dropped wrapping behavior (standard WAI-ARIA)

## Files Changed

- `packages/ui/src/components/Menu.svelte`
- `docs/decisions/003-mvc-separation.md`
