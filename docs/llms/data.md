# @rokkit/data

> DataFrame-like dataset operations, joins, filtering, type detection, and data transformation.

## Position in Dependency Hierarchy
**Depends on**: @rokkit/core, d3-array, d3-collection, @lukeed/uuid, ramda, svelte
**Depended on by**: @rokkit/forms, @rokkit/chart, application data processing

## Exports

### DataSet

Fluent API for data manipulation. Created via `dataset()` factory.

```javascript
import { dataset } from '@rokkit/data'

const ds = dataset(data)
  .where(row => row.age > 25)
  .sortBy('name')
  .select('id', 'name')          // Returns filtered + sorted array
```

| Method | Signature | Description |
|--------|-----------|-------------|
| `where(condition)` | `(Function) => DataSet` | Set filter condition |
| `select(...cols)` | `(...string) => Array` | Return filtered data with columns |
| `sortBy(...fields)` | `(...string) => DataSet` | Sort data |
| `groupBy(...fields)` | `(...string) => DataSet` | Set grouping columns |
| `summarize(from, using)` | `(string, Object) => DataSet` | Add aggregators |
| `rollup()` | `() => DataSet` | Execute group + summarize |
| `rename(how)` | `(Object\|Function) => DataSet` | Rename keys |
| `drop(...fields)` | `(...string) => DataSet` | Remove columns |
| `remove()` | `() => DataSet` | Delete matching rows |
| `update(value)` | `(Object\|Function) => DataSet` | Update matching rows |
| `fillNA(value)` | `(Object) => DataSet` | Fill null/undefined |
| `apply(callback)` | `(Function) => DataSet` | Map over rows |
| `union(other)` | `(DataSet\|Array) => DataSet` | Combine rows |
| `minus(other)` | `(DataSet) => DataSet` | Exclude rows |
| `intersect(other)` | `(DataSet) => DataSet` | Only matching rows |

### Joins

| Export | Signature | Description |
|--------|-----------|-------------|
| `innerJoin(first, second, condition)` | Matching rows from both |
| `leftJoin(first, second, condition)` | All from first + matching from second |
| `rightJoin(first, second, condition)` | All from second + matching from first |
| `fullJoin(first, second, condition)` | All rows from both |
| `crossJoin(first, second)` | Cartesian product |
| `semiJoin(first, second, condition)` | First rows that match second |
| `antiJoin(first, second, condition)` | First rows that don't match second |

### DataView

Reactive view with metadata, hierarchy, sorting, selection.

```javascript
import { dataview } from '@rokkit/data'

const view = dataview(data, options)
view.columns        // Readable: ColumnMetadata[]
view.hierarchy      // Readable: flattened hierarchy with state
view.sortBy(field)  // Sort and update metadata
view.select(index)  // Toggle selection
view.toggle(index)  // Toggle expansion
```

### Utilities

| Export | Signature | Description |
|--------|-----------|-------------|
| `typeOf(value)` | `(*) => string` | Infers type: 'string', 'number', 'date', 'integer', 'array', 'object', 'boolean' |
| `renamer(options)` | `(Object) => Renamer` | Key renaming with prefix/suffix |
| `model()` | `() => Model` | Derives data type models from datasets |

### Constants

| Export | Description |
|--------|-------------|
| `filterOperations` | Operator → comparison function map ('=', '<', '>', '~*', etc.) |
| `typeConverters` | Type name → conversion function map |
| `defaultConfig` | Default DataSet configuration |

## Internal (not exported but notable)

| Module | What | Notes |
|--------|------|-------|
| `parser.js` | `parseFilters(text)` | Parses structured search: `name:John age>30`. **Not exported** — see backlog #15 |
| `filter.js` | `filterData(data, filters)` | Applies parsed filters. **Not exported** |
| `hierarchy.js` | Tree flattening/expansion | Manages hierarchical state |
| `aggregators.js` | sum, count, average, min, max | Predefined aggregation functions |
| `formatter.js` | Currency, date, percentage | Value formatting utilities |
