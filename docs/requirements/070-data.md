# Data-Connected Component Requirements

> Requirements for SearchFilter and Calendar components.

## 1. Overview

| Component | Type | Package | Status |
|-----------|------|---------|--------|
| SearchFilter | Search/filter input | `archive/ui/` | Archived |
| Calendar | Date picker | `archive/ui/` | Archived |

These components connect UI to `@rokkit/data` utilities and `@rokkit/core` field mapping.

## 2. SearchFilter

### 2.1 Props

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `items` | `any[]` | `[]` | Yes | Input items to filter |
| `filtered` | `any[]` | `[]` | Yes | Filtered results |
| `fields` | `SearchFields` | defaults | No | Field mapping (text, keywords) |
| `searchText` | `string` | `''` | Yes | Search input value |
| `placeholder` | `string` | `'Search...'` | No | Input placeholder |
| `filterFn` | `(item, text) => boolean` | — | No | Custom filter function |
| `caseSensitive` | `boolean` | `false` | No | Case sensitivity |
| `children` | `Snippet` | — | No | Additional content below input |

### 2.2 Field Mapping

```
SearchFields {
  text: string      // Field to search in text content
  keywords: string   // Field to search in keyword array
}
```

### 2.3 Rendering

- Search input with clear button
- Clear button visible when searchText is non-empty
- Optional children slot for filter chips, advanced options

### 2.4 Filter Logic

Default filter checks `text` and `keywords` fields:
```javascript
function defaultFilter(item, searchText, fields) {
  const text = getText(item, fields)
  const keywords = getKeywords(item, fields)
  const term = caseSensitive ? searchText : searchText.toLowerCase()
  // Match against text field or any keyword
}
```

Custom `filterFn` replaces default when provided.

### 2.5 Reactive Flow

```
items (input)
  ↓
searchText changes → recompute filtered
  ↓
filtered (output, bindable)
```

Uses `$derived.by()` for computation, `$effect` to sync bindable prop.

### 2.6 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-search-filter` | root | Container |
| `data-search-input` | input | Search input |
| `data-search-clear` | button | Clear button |

### 2.7 Integration with @rokkit/data

The archived SearchFilter uses `@rokkit/core` FieldMapper for basic text/keyword matching. For advanced filtering, `@rokkit/data` provides:

- `parseFilters(text)` — Parse structured search strings: `name:John age>30 status=active`
- `filterData(data, filters)` — Apply parsed filters to data arrays
- Operators: `=`, `!=`, `<`, `>`, `<=`, `>=`, `~` (regex), `~*` (case-insensitive regex)

**Note**: `parseFilters` and `filterData` exist in `@rokkit/data` but are **not currently exported** from the package index (see backlog #15).

### 2.8 Composition Pattern

SearchFilter is designed for composition, not embedding:

```svelte
<Panel>
  {#snippet header()}
    <SearchFilter bind:filtered {items} />
  {/snippet}
  <List options={filtered} bind:value />
</Panel>
```

### 2.9 Priority

**High** — SearchFilter is needed by Table (column filtering), MasterDetail (list filtering), and general List/Tree usage.

## 3. Calendar

### 3.1 Props

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `value` | `Date` | `new Date()` | Yes | Selected date |
| `holidays` | `Date[]` | `[]` | No | Holiday dates (special styling) |
| `fixed` | `boolean` | `true` | No | Always show 6 rows |
| `min` | `Date` | — | No | Earliest selectable date |
| `max` | `Date` | — | No | Latest selectable date |
| `locale` | `string` | — | No | Locale for day/month names |

### 3.2 Rendering

- Month/year header with previous/next navigation
- Year input for quick year changes
- 7-column weekday grid (Sun–Sat or locale-dependent)
- Day cells with grid positioning based on first day offset
- Weekend columns styled differently
- Holiday dates marked with indicator

### 3.3 Calendar Logic

Uses `@rokkit/core` utilities:
- `getCalendarDays(date, options)` — generates day objects with offset, weekend, holiday flags
- `weekdays` — localized weekday abbreviations

### 3.4 Keyboard

| Key | Action |
|-----|--------|
| `ArrowLeft` | Previous day |
| `ArrowRight` | Next day |
| `ArrowUp` | Previous week |
| `ArrowDown` | Next week |
| `Home` | First day of month |
| `End` | Last day of month |
| `PageUp` | Previous month |
| `PageDown` | Next month |

### 3.5 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-calendar` | root | Container |
| `data-calendar-day` | button | Day cell |
| `data-selected` | button | Selected date |
| `data-today` | button | Today's date |
| `data-weekend` | button | Weekend day |
| `data-holiday` | button | Holiday date |
| `data-outside` | button | Day outside current month |

### 3.6 ARIA

- Grid: `role="grid"`, `aria-label` with month/year
- Day cells: `role="gridcell"`, `aria-selected`
- Navigation: `aria-label` on prev/next buttons

### 3.7 Dependencies

- `date-fns` — `format`, `isSameDay`, `addMonths`
- `@rokkit/core` — `weekdays`, `getCalendarDays`

## 4. Dependencies Summary

| Package | What | Used By |
|---------|------|---------|
| `@rokkit/core` | `FieldMapper`, `getText` | SearchFilter |
| `@rokkit/core` | `getCalendarDays`, `weekdays` | Calendar |
| `@rokkit/data` | `parseFilters`, `filterData` | SearchFilter (advanced mode) |
| `date-fns` | Date utilities | Calendar |

## 5. Gaps

1. SearchFilter not recreated from archive
2. Calendar not recreated from archive
3. `parseFilters` / `filterData` not exported from `@rokkit/data` (backlog #15)
4. No date range selection (Calendar selects single date only)
5. No time picker component
6. No DatePicker that combines Calendar with input field + dropdown
7. Calendar weekday start not configurable (always Sunday)
8. No integration between Calendar and forms (no InputCalendar/InputDate)
