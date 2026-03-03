# Learn Site Coverage Gaps

**Created:** 2026-03-02
**Priority:** Low
**Context:** Post-playground consolidation — all playground functionality merged into learn site

---

## Components Missing Play Pages

These learn entries exist but have no interactive `play/` page:

| Component | Notes |
|-----------|-------|
| `accordion` | No playground equivalent existed either |
| `calendar` | No playground equivalent existed either |
| `drop-down` | Legacy component, may be superseded by Menu/Select |
| `icon` | Static demo — play page may not add value |
| `item` | Internal building block — play page may not add value |
| `message` | No playground equivalent existed either |
| `toolbar` | Has play page at elements/toolbar level but not components/toolbar |

## Components Missing E2E Tests

These components have play pages but no dedicated e2e spec:

| Component | Complexity | Priority |
|-----------|-----------|----------|
| `breadcrumbs` | Low (static rendering) | Low |
| `button` | Low | Low |
| `card` | Low (static) | Low |
| `carousel` | Medium (swipe, navigation) | Medium |
| `code` | Low (syntax highlight) | Low |
| `floating-action` | Medium (expand/collapse) | Medium |
| `floating-navigation` | Medium (scroll tracking) | Medium |
| `forms` | High (complex interactions) | High |
| `lazy-tree` | Medium (async loading) | Medium |
| `palette-manager` | Low (specialized) | Low |
| `pill` | Low (static) | Low |
| `progress` | Low (static) | Low |
| `range` | Medium (slider interaction) | Medium |
| `rating` | Medium (click/keyboard) | Medium |
| `reveal` | Low (visibility toggle) | Low |
| `shine` | Low (visual effect) | Low |
| `stepper` | Medium (multi-step flow) | Medium |
| `switch` | Medium (toggle + keyboard) | Medium |
| `table` | High (sort, filter, pagination) | High |
| `tilt` | Low (visual effect) | Low |
| `timeline` | Low (static) | Low |

## Suggested Approach

1. **High priority:** Forms, Table — complex interactions warrant e2e coverage
2. **Medium priority:** Carousel, FloatingAction, FloatingNavigation, Range, Rating, Stepper, Switch — keyboard/interaction behavior
3. **Low priority:** Static/visual components — visual snapshots only if needed
4. **Skip:** Icon, Item, Pill, Tilt, Shine — too simple or internal-only
