# Component Inventory

> Complete listing of all Rokkit UI components organized by package and category

## Summary

| Package | Components | Status |
|---------|------------|--------|
| @rokkit/ui | 57 | Active |
| @rokkit/composables | 7 | Renaming from bits-ui |
| @rokkit/forms | 8 | Active |
| **Total** | **72** | |

---

## @rokkit/ui Components (57)

### Selection Components (7)

| Component | File | Description | Priority |
|-----------|------|-------------|----------|
| List | `list/List.svelte` | Vertical list with selection | High |
| Select | `select/Select.svelte` | Dropdown selection | High |
| MultiSelect | `multi-select/MultiSelect.svelte` | Multiple item selection | Medium |
| Switch | `switch/Switch.svelte` | Toggle between options | Medium |
| Tabs | `tabs/Tabs.svelte` | Tabbed interface | High |
| RadioGroup | `radio-group/RadioGroup.svelte` | Radio button group | Medium |
| PickOne | `pick-one/PickOne.svelte` | Visual option picker | Low |

### Hierarchical Components (4)

| Component | File | Description | Priority |
|-----------|------|-------------|----------|
| Tree | `tree/` | Tree view with expand/collapse | High |
| NestedList | `nested-list/NestedList.svelte` | Recursive nested list | Medium |
| Accordion | `accordion/Accordion.svelte` | Collapsible sections | Medium |
| TreeTable | `tree-table/TreeTable.svelte` | Hierarchical table | Low |

### Form Input Components (7)

| Component | File | Description | Priority |
|-----------|------|-------------|----------|
| CheckBox | `check-box/CheckBox.svelte` | Checkbox input | Medium |
| Toggle | `toggle/Toggle.svelte` | Toggle switch | Medium |
| Range | `range/Range.svelte` | Range slider | Medium |
| RangeSlider | `range-slider/RangeSlider.svelte` | Advanced range slider | Low |
| RangeMinMax | `range-min-max/RangeMinMax.svelte` | Min/max range | Low |
| Rating | `rating/Rating.svelte` | Star rating input | Low |
| Slider | `slider/Slider.svelte` | Single value slider | Low |

### Layout Components (6)

| Component | File | Description | Priority |
|-----------|------|-------------|----------|
| Card | `card/Card.svelte` | Content card container | Medium |
| ResponsiveGrid | `responsive-grid/ResponsiveGrid.svelte` | Responsive grid layout | Medium |
| SlidingColumns | `sliding-columns/SlidingColumns.svelte` | Animated column layout | Low |
| Carousel | `carousel/Carousel.svelte` | Image/content carousel | Low |
| Stage | `stage/Stage.svelte` | Content stage | Low |
| GraphPaper | `graph-paper/GraphPaper.svelte` | Grid background | Low |

### Navigation Components (6)

| Component | File | Description | Priority |
|-----------|------|-------------|----------|
| BreadCrumbs | `bread-crumbs/BreadCrumbs.svelte` | Breadcrumb navigation | Medium |
| DropDown | `drop-down/DropDown.svelte` | Dropdown menu | Medium |
| DropSearch | `drop-search/DropSearch.svelte` | Searchable dropdown | Medium |
| PageNavigator | `page-navigator/PageNavigator.svelte` | Pagination | Medium |
| NestedPaginator | `nested-paginator/NestedPaginator.svelte` | Nested pagination | Low |
| Stepper | `stepper/Stepper.svelte` | Step indicator | Medium |

### Feedback Components (4)

| Component | File | Description | Priority |
|-----------|------|-------------|----------|
| ProgressBar | `progress-bar/ProgressBar.svelte` | Progress indicator | Medium |
| ProgressDots | `progress-dots/ProgressDots.svelte` | Step progress dots | Low |
| ValidationReport | `validation-report/ValidationReport.svelte` | Validation messages | Medium |
| Message | `message/Message.svelte` | User messages | Medium |

### Display Components (8)

| Component | File | Description | Priority |
|-----------|------|-------------|----------|
| Button | `button/Button.svelte` | Button element | High |
| Icon | `icon/Icon.svelte` | Icon display | High |
| Item | `item/Item.svelte` | List item display | Medium |
| Pill | `pill/Pill.svelte` | Tag/badge display | Low |
| Link | `link/Link.svelte` | Styled link | Low |
| Connector | `connector/Connector.svelte` | Visual connector | Low |
| Separator | `separator/Separator.svelte` | Content separator | Low |
| Summary | `summary/Summary.svelte` | Summary display | Low |

### Table Components (3)

| Component | File | Description | Priority |
|-----------|------|-------------|----------|
| TableCell | `table/TableCell.svelte` | Table cell | Low |
| TableHeaderCell | `table/TableHeaderCell.svelte` | Table header cell | Low |
| ListBody | `list/ListBody.svelte` | List body container | Low |

### Advanced Components (9)

| Component | File | Description | Priority |
|-----------|------|-------------|----------|
| Calendar | `calendar/Calendar.svelte` | Calendar view | Low |
| Shine | `shine/Shine.svelte` | Shine effect | Low |
| Tilt | `tilt/Tilt.svelte` | Tilt effect | Low |
| Fillable | `fillable/Fillable.svelte` | Fillable container | Low |
| Scrollable | `scrollable/Scrollable.svelte` | Scrollable container | Low |
| Overlay | `overlay/Overlay.svelte` | Overlay container | Low |
| ToggleThemeMode | `toggle-theme-mode/ToggleThemeMode.svelte` | Theme toggle | Medium |
| Node | `tree/Node.svelte` | Tree node (internal) | Low |

### Internal/Utility Components (3)

| Component | File | Description | Priority |
|-----------|------|-------------|----------|
| Input | `input/Input.svelte` | Base input wrapper | High |
| Scrollable | `scrollable/Scrollable.svelte` | Scroll container | Low |
| Overlay | `overlay/Overlay.svelte` | Overlay layer | Low |

---

## @rokkit/composables Components (7)

> **Note**: This package is being renamed from `@rokkit/bits-ui` per [ADR-002](../decisions/002-package-rename.md)

Composable primitives for building custom UIs. These provide maximum flexibility with compound component patterns.

| Component | File | Description | Action |
|-----------|------|-------------|--------|
| List | `List.svelte` | Composable list primitive | Keep |
| NestedList | `NestedList.svelte` | Composable nested primitive | Keep |
| Tree | `Tree.svelte` | Composable tree parts | Keep |
| Switch | `Switch.svelte` | Toggle switch | Move to @rokkit/ui |
| TabGroup | `TabGroup.svelte` | Tab group | Deprecate (use ui/Tabs) |
| GroupedList | `GroupedList.svelte` | Grouped list primitive | Keep |
| FloatingNav | `FloatingNav.svelte` | Floating navigation | Keep |

---

## @rokkit/forms Components (8)

Form generation and input handling.

| Component | File | Description | Priority |
|-----------|------|-------------|----------|
| FormRenderer | `FormRenderer.svelte` | Schema-driven form rendering | High |
| FieldLayout | `FieldLayout.svelte` | Field layout wrapper | Medium |
| InputField | `InputField.svelte` | Labeled input with validation | High |
| Input | `Input.svelte` | Universal input component | High |
| ListEditor | `ListEditor.svelte` | List/array editor | Medium |
| DataEditor | `DataEditor.svelte` | Generic data editor | Medium |
| NestedEditor | `NestedEditor.svelte` | Nested data editor | Low |

---

## Component Dependencies

### Core Dependencies

```
@rokkit/core
├── field-mapper.js (all data-driven components)
├── mapping.js (field mapping utilities)
└── types.js (shared types)

@rokkit/states
├── proxy.svelte.js (Proxy class - all components)
├── list-controller.svelte.js (selection components)
├── nested-controller.svelte.js (hierarchical components)
└── vibe.svelte.js (theme state)
```

### Component Relationships

```
List
├── uses: Proxy, list-controller
├── renders: Item
└── supports: child snippet

Tree
├── uses: Proxy, nested-controller
├── renders: Node, Item
└── supports: stub, header, footer snippets

Form
├── uses: FormBuilder, FormRenderer
├── renders: InputField, Input
└── supports: schema, layout
```

---

## Priority Legend

| Priority | Description |
|----------|-------------|
| **High** | Core components, frequently used, document first |
| **Medium** | Important but not blocking |
| **Low** | Nice to have, can defer |
