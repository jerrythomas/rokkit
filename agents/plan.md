# Active Plan: Forms Phase 2 — Playground Conversion + Cleanup

## Context

Forms phase 1 (Steps 1–8) is complete. The forms package now supports schema-driven rendering with `@rokkit/ui` Select, custom icon checkbox, InfoField, separators, and theme CSS. The toggle page was converted as a pilot.

Phase 2: Convert remaining 9 playground pages to FormRenderer, then clean up dead code.

## Steps

### Part A: Convert Playground Pages

Each page: replace individual `$state()` + Prop* controls with `props = $state({...})` + schema + layout + `<FormRenderer>`.

- [ ] 1. List page — 3 props (size select, collapsible checkbox, disabled checkbox)
- [ ] 2. Tree page — 3 props (size select, showLines checkbox, expandAll checkbox)
- [ ] 3. Toolbar page — 4 props (size select, compact checkbox, showDividers checkbox, disabled checkbox)
- [ ] 4. FloatingAction page — 5 props (size/expand/position/itemAlign selects, backdrop checkbox)
- [ ] 5. Menu page — 6 props (label text, size/align/direction selects, showArrow/disabled checkboxes)
- [ ] 6. Select page — 5 props (placeholder text, size/align/direction selects, disabled checkbox)
- [ ] 7. MultiSelect page — 3 props (placeholder text, size select, disabled checkbox)
- [ ] 8. Button page — 8 props (variant/style/size/icon selects, label text, disabled/loading/asLink checkboxes)
- [ ] 9. Code page — 4 props (language/codeTheme selects, showLineNumbers/showCopyButton checkboxes)
- [ ] 10. (Skip PaletteManager — uses custom List+Select with item snippets, can't be expressed as schema)

### Part B: Delete Old Controls

- [ ] 11. Delete `sites/playground/src/lib/controls/` (PropSelect, PropCheckbox, PropText, PropInfo, index.ts)

### Part C: Delete Archive and Deprecated

- [ ] 12. Delete `archive/forms/` (all superseded by current forms package)
- [ ] 13. ~~Delete `archive/themes/`~~ — **KEEP**: old minimal/material CSS needed as reference for theme migration
- [ ] 14. Delete rebuilt components from `archive/ui/` (Button, List, Select, MultiSelect, Toggle, Tree, NestedList, FloatingAction(s), Connector, Node, Item + their specs/snapshots). Keep un-rebuilt components (Accordion, Tabs, Calendar, etc.)
- [ ] 15. Delete `packages/states/deprecated/` (hierarchy.js — active version in packages/data)
- [ ] 16. Delete `packages/forms/dist/src/lib/deprecated/` and `packages/states/dist/deprecated/` (stale .d.ts)

## Verification

```bash
bun run test:ci                                    # all tests pass
grep -r "from.*\$lib/controls" sites/playground/   # no results
grep -r "from.*archive" packages/ sites/            # no results
```
