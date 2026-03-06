# @rokkit/data

The data manipulation layer for Rokkit. This package provides collection-level operations — grouping, aggregation, filtering, joining, formatting, and schema inference — used by charts, tables, and forms. It sits between raw application data and the components that render it.

---

## 1. Architecture Overview

`@rokkit/data` occupies a specific position in the package hierarchy:

```
@rokkit/core          ← field mapping types, utilities
      │
@rokkit/states        ← ProxyItem, controllers
      │
@rokkit/actions       ← navigator, interaction actions
      │
@rokkit/data          ← THIS PACKAGE: collection operations
      │
@rokkit/ui            ← UI components (List, Tree, Table, Select…)
      │
@rokkit/forms         ← schema-driven forms
@rokkit/chart         ← animated charts
```

### What this package does vs what ProxyItem does

These are complementary, not overlapping:

| Concern | Where it lives |
|---------|---------------|
| Per-item field access — resolve `profile.name`, apply a function `(item) => …` | `ProxyItem` in `@rokkit/states` |
| Collection operations — group 1000 rows by `region`, aggregate by `sum`, join two arrays | `@rokkit/data` |
| Schema inference — detect column types from a data array | `@rokkit/data` |
| Formatting — format a number as `$1,234.56` | `@rokkit/data` (`createFormatter`) |

`ProxyItem` is a read-only view lens onto a single object. `@rokkit/data` transforms arrays of objects — it produces new collections, summaries, and metadata.

### Primary consumers

- **`@rokkit/chart`** — uses `dataset().groupBy().rollup()` to produce keyframe data for `AnimatedChart`
- **`@rokkit/ui`** — the `Table` component uses `dataview()` for sortable, expandable hierarchical table state; `parseFilters` / `filterData` power `SearchFilter`
- **`@rokkit/forms`** — `createFormatter` drives formatted display in form fields and table cells

---

## 2. Module Map

```
@rokkit/data
├── dataset.js     ← DataSet class + dataset() factory (fluent collection pipeline)
├── rollup.js      ← groupDataByKeys, aggregateData, fillAlignedData, getAlignGenerator
├── view.js        ← dataview() store (hierarchical table view with sort/select/toggle)
├── hierarchy.js   ← deriveHierarchy, toggleExpansion, hierarchicalFilter
├── filter.js      ← filterData, filterObjectArray
├── parser.js      ← parseFilters (search string → filter descriptors)
├── formatter.js   ← createFormatter (locale-aware number/date/currency formatters)
├── infer.js       ← deriveColumns, deriveMetadata, addFormatters, deriveSortableColumn
├── metadata.js    ← deriveColumnProperties, mergeCurrencyAttributes, addPathModifier
├── model.js       ← model() (lightweight schema object — name+type per field)
├── join.js        ← innerJoin, leftJoin, rightJoin, fullJoin, crossJoin, semiJoin, antiJoin, nestedJoin
├── renamer.js     ← renamer() (fluent key-rename builder)
├── aggregators.js ← counter, violin (statistical summary functions)
├── utils.js       ← typeOf (extended typeof: detects date, integer, array)
├── constants.js   ← filterOperations, defaultConfig, typeConverters
└── types.js       ← JSDoc typedefs (ColumnMetadata, DataFrame, DataView, SummaryConfig…)
```

Exports from `index.js`:
```js
export { typeOf }                            // utils
export { renamer }                           // renamer
export { model }                             // model
export { innerJoin, leftJoin, rightJoin,
         fullJoin, crossJoin, antiJoin,
         semiJoin }                          // join
export { dataset }                           // dataset (DataSet factory)
export { dataview }                          // view
export { deriveColumns, deriveMetadata,
         deriveSortableColumn }              // infer
export { parseFilters }                      // parser
export { filterData, filterObjectArray }     // filter
```

Note: `rollup.js` internals (`groupDataByKeys`, `aggregateData`, etc.) are not re-exported from `index.js` — they are used by `dataset.js` internally.

---

## 3. The `dataset` Pipeline

`dataset()` returns a `DataSet` — a fluent, chainable wrapper around an array of objects. It is the primary API for transforming collections.

```
dataset(rawArray)
   .where(condition)        ← set row filter
   .groupBy(...fields)      ← define group keys
   .alignBy(...fields)      ← define alignment keys (for keyframe fill)
   .usingTemplate(template) ← provide fill-in row template
   .summarize(from, using)  ← add an aggregator
   .sortBy(...fields)       ← sort the data
   .rename(how)             ← rename keys (object map or function)
   .drop(...fields)         ← remove columns
   .fillNA(value)           ← fill null/undefined values
   .apply(callback)         ← map rows
   .rollup()                ← execute group + aggregate → new DataSet
   .select(...cols)         ← materialize as plain array
```

### Rollup internals

```
groupDataByKeys(data, groupByKeys, summaries)
        │  partition rows into buckets keyed by JSON.stringify(pick(groupByKeys))
        │  for each bucket, collect values into summary arrays
        ▼
[optional] fillAlignedData + getAlignGenerator
        │  fill missing group combinations using align_by dimensions
        │  tag real rows with actual_flag=1, fill rows with actual_flag=0
        │  sort filled rows by align_by fields
        ▼
aggregateData(groupedData, summaries)
        │  apply reducer formula (e.g. sum, mean) over each collected array
        ▼
new DataSet(result)
```

### Summarize shape

```js
dataset(sales)
  .groupBy('region', 'quarter')
  .summarize('revenue', { total: (values) => values.reduce((a, b) => a + b, 0) })
  .rollup()
  .select()
// → [{ region: 'North', quarter: 'Q1', total: 42000 }, …]
```

`summarize(from, using)` accepts:
- `from`: field name string, array of field names, or mapper function `(row) => value`
- `using`: target field name string (identity pass-through) or `{ fieldName: reducerFn }` object

### Set operations and joins

`DataSet` also exposes relational set operations directly:

```js
const merged = ds1.innerJoin(ds2, (a, b) => a.id === b.id)
const combined = ds1.union(ds2)
const diff = ds1.minus(otherArray)
```

---

## 4. The `dataview` Store

`dataview(data, options)` wraps a data array in a Svelte writable-compatible store designed for tabular display. It derives two reactive values: `columns` (metadata with formatters) and `hierarchy` (flat list of nodes with depth, expansion, and selection state).

```
dataview(data, options)
   → { subscribe, sortBy, clearSort, select, toggle }
```

Internal state shape:
```js
{
  columns: ColumnMetadata[],   // inferred or provided column defs with formatter functions
  hierarchy: TreeTableNode[]   // flat list with depth, parent refs, isExpanded, isHidden, selected
}
```

`dataview` is used by the `Table` component to provide a sortable, expandable tree-table over hierarchical data where the hierarchy is expressed as a path string (e.g. `"North/Sales/Alice"`).

```js
const view = dataview(rows, { path: 'category', separator: '/' })
view.sortBy('revenue', true)   // ascending
view.toggle(3)                 // expand/collapse node at index 3
view.select(3)                 // toggle selection at index 3
```

---

## 5. Filtering and Search

### `filterObjectArray` and `filterData`

```js
filterObjectArray(data, { column, value, operator })
filterData(data, [{ column, value, operator }, …])
```

Supported operators (from `filterOperations` in `constants.js`):

| Operator | Meaning |
|----------|---------|
| `=` | strict equality |
| `!=` | strict inequality |
| `<`, `>`, `<=`, `>=` | numeric comparison |
| `~` | regex match (case-sensitive) |
| `~*` | regex match (case-insensitive) |
| `!~`, `!~*` | negated regex |

When `column` is omitted, the operator is tested against all fields in each row.

### `parseFilters`

Parses a freeform search string into an array of filter descriptors:

```js
parseFilters('status=active revenue>5000 "product manager"')
// → [
//     { column: 'status',  operator: '=',  value: 'active' },
//     { column: 'revenue', operator: '>',  value: 5000 },
//     { operator: '~*',    value: /product manager/i }
//   ]
```

The shorthand `:` maps to `~*` (case-insensitive contains). Quoted values preserve spaces. Unmatched text becomes a global fuzzy search term. The result array feeds directly into `filterData`.

---

## 6. Formatting

`createFormatter(type, language?, decimalPlaces?)` returns a locale-aware formatter function.

```js
const fmt = createFormatter('currency', 'en-US', 2)
fmt(1234.5, 'USD')  // → '$1,234.50'

const dateFmt = createFormatter('date', 'de-DE')
dateFmt(new Date('2025-01-15'))  // → '15.1.2025'
```

Supported types:

| Type | Output example |
|------|---------------|
| `currency` | `$1,234.50` (currency code as second arg) |
| `number` | `1,234.50` |
| `integer` | `1,234` |
| `date` | locale date string |
| `time` | locale time string |
| `object` | `JSON.stringify` |
| `array` | `JSON.stringify` |
| `ellipsis` | always `'...'` |
| anything else | identity (pass-through) |

`deriveMetadata` and `addFormatters` use `createFormatter` to attach a `formatter` function to each `ColumnMetadata` entry, keyed by the inferred column type. This is how `Table` cells get locale-formatted values without any per-column formatter configuration.

---

## 7. Schema Inference

`typeOf(value)` extends `typeof` with data-aware distinctions:

```js
typeOf(42)           // 'integer'
typeOf(3.14)         // 'number'
typeOf('2025-01-01') // 'date'
typeOf(new Date())   // 'date'
typeOf([1, 2, 3])    // 'array'
typeOf({ a: 1 })     // 'object'
typeOf(null)         // 'string'
```

`deriveColumns(data, options)` scans the data array and returns `ColumnMetadata[]` — one entry per field with inferred `type`, `sortable`, `filterable`, and a default `fields: { label: key }` mapping.

`deriveMetadata(data, options)` extends this with formatter attachment and optional action column injection. The `scanMode` option controls whether only the first row is sampled (`'fast'`) or a union sample of all rows is built (`'deep'`), which matters for sparse datasets.

`deriveSortableColumn(value)` normalises a sort spec into `{ name, sorter }`:

```js
deriveSortableColumn('revenue')              // → { name: 'revenue', sorter: ascending }
deriveSortableColumn(['revenue', false])     // → { name: 'revenue', sorter: descending }
deriveSortableColumn({ name: 'date', sorter: myCustomSorter })
```

---

## 8. Hierarchy

`deriveHierarchy(data, options)` converts a flat array with path strings into a `TreeTableNode[]` — a flat list that carries `depth`, `parent`, `children`, `isExpanded`, and `isHidden` for use in tree-table rendering.

```js
// Input: rows with a `category` field like "North/Sales/Alice"
const nodes = deriveHierarchy(rows, { path: 'category', separator: '/' })
// → [
//     { depth: 1, value: 'North',  isParent: true, isExpanded: false, … },
//     { depth: 2, value: 'Sales',  isParent: true, isHidden: true, … },
//     { depth: 3, value: 'Alice',  isParent: false, isHidden: true, … },
//   ]
```

The flat structure allows virtual scroll over large trees without recursion in render.

`hierarchicalFilter(nodes, filterFn)` applies a filter while preserving parent nodes of matching leaves — standard tree-filter behavior where a matching child keeps its ancestors visible.

---

## 9. Integration with Field Mapping

`createFormatter` plugs directly into the field mapping system as a computed field function:

```js
import { createFormatter } from '@rokkit/data'

const fmtUSD = createFormatter('currency', 'en-US', 2)

// Used as a computed field mapping function in ProxyItem
const fields = {
  label: (item) => fmtUSD(item.revenue, item.currency),
  value: 'id'
}
```

Because ProxyItem normalises both string paths and functions to the same resolver signature `(item) => any`, a formatter wrapped in an arrow function is indistinguishable from any other computed field. No special integration is required.

---

## 10. API Reference

### `dataset(data, options?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `Object[]` | Source data array |
| `options` | `{ children?, actual_flag? }` | Override defaults for rollup config |

Returns a `DataSet` with the fluent methods described in section 3.

---

### `dataview(data, options?)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | `Object[]` | Source data array |
| `options.path` | `string` | Field name whose value is a path string (for hierarchy) |
| `options.separator` | `string` | Path separator (default `/`) |
| `options.expanded` | `boolean` | Initial expanded state (default `false`) |
| `options.columns` | `ColumnMetadata[]` | Explicit column definitions (skip inference) |
| `options.actions` | `string[]` | Action column names to prepend |
| `options.language` | `string` | IETF locale for formatters (default `'en-US'`) |

Returns `{ subscribe, sortBy(name, ascending), clearSort(), select(index), toggle(index) }`.

---

### `createFormatter(type, language?, decimalPlaces?)`

```ts
createFormatter(type: string, language?: string, decimalPlaces?: number): (value: any, ...args) => string
```

See section 6 for type options.

---

### `filterData(data, filters)` / `filterObjectArray(data, options)`

```ts
filterObjectArray(data: Object[], { column?: string, value: any, operator: string }): Object[]
filterData(data: Object[], filters: FilterOption[]): Object[]
```

---

### `parseFilters(string)`

```ts
parseFilters(query: string): Array<{ column?: string, operator: string, value: string | number | RegExp }>
```

---

### `deriveMetadata(data, options?)`

```ts
deriveMetadata(data: Object[], options?: ViewOptions): ColumnMetadata[]
```

Returns column metadata with inferred types, formatters, sortability, and optional action columns.

---

### `deriveSortableColumn(value)`

```ts
deriveSortableColumn(value: string | [string, boolean] | { name: string, sorter?: Function }): { name: string, sorter: Function }
```

---

### `typeOf(value)`

```ts
typeOf(value: any): 'integer' | 'number' | 'string' | 'date' | 'array' | 'object' | 'boolean'
```

---

### `renamer(options?)`

```ts
renamer({ prefix?, suffix?, separator?, keys? }): RenamerBuilder
// RenamerBuilder: { get(), setPrefix(v), setSuffix(v), setSeparator(v), setKeys(v) }
```

```js
const r = renamer({ prefix: 'src', separator: '_' })
const { renameObject } = r.get()
renameObject({ id: 1, name: 'Alice' })  // → { src_id: 1, src_name: 'Alice' }
```

---

### Join functions

All joins take `(first: Object[], second: Object[], condition: (a, b) => boolean)` except `crossJoin` (no condition) and `nestedJoin` (adds `key` parameter).

| Function | Returns |
|----------|---------|
| `innerJoin` | Rows matched in both |
| `leftJoin` | All from first, matched from second |
| `rightJoin` | All from second, matched from first |
| `fullJoin` | All rows from both, matched where possible |
| `crossJoin` | All combinations |
| `semiJoin` | Rows from first that have a match in second |
| `antiJoin` | Rows from first that have no match in second |
| `nestedJoin(first, second, condition, key?)` | Rows from first with matching second rows nested under `key` (default `'children'`) |
