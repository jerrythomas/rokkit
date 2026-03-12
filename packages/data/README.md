# @rokkit/data

Data manipulation utilities for the Rokkit design system — filtering, joining, schema inference, and dataset views.

## Install

```sh
npm install @rokkit/data
# or
bun add @rokkit/data
```

## Overview

`@rokkit/data` provides general-purpose data utilities for working with arrays of objects. It is used internally by `@rokkit/ui` table and grid components and can also be used standalone.

- **Type inference** — detect column types from data samples
- **Filtering** — apply single or multiple filters with standard operators
- **Joins** — relational join operations across two datasets
- **Dataset / Dataview** — composable dataset abstraction with filter, sort, and pagination
- **Metadata** — derive column definitions and types from raw data
- **Renaming** — remap object keys with a rename spec

## Usage

### Type inference

```js
import { typeOf } from '@rokkit/data'

typeOf('hello')     // 'string'
typeOf(42)          // 'number'
typeOf(new Date())  // 'date'
typeOf([1, 2])      // 'array'
typeOf({ a: 1 })    // 'object'
typeOf(true)        // 'boolean'
```

### Filtering

```js
import { filterObjectArray, filterData } from '@rokkit/data'

// Single filter
const adults = filterObjectArray(users, {
  column: 'age',
  value: 18,
  operator: 'gte'
})

// Multiple filters combined
const results = filterData(users, [
  { column: 'status', value: 'active', operator: 'eq' },
  { column: 'age', value: 18, operator: 'gte' }
])
```

Supported operators: `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `contains`, `startsWith`, `endsWith`, `in`, `notIn`.

### Joins

```js
import { leftJoin, innerJoin } from '@rokkit/data'

const result = leftJoin(orders, customers, 'customerId', 'id')
// Each order row merged with its matching customer row (nulls if unmatched)
```

Available joins: `innerJoin`, `leftJoin`, `rightJoin`, `fullJoin`, `crossJoin`, `antiJoin`, `semiJoin`.

### Schema inference

```js
import { deriveMetadata, deriveColumns } from '@rokkit/data'

const metadata = deriveMetadata(data)
// [{ column: 'name', type: 'string' }, { column: 'age', type: 'number' }, ...]

const columns = deriveColumns(data)
// Column definitions ready for use in a table component
```

### Dataset and dataview

```js
import { dataset, dataview } from '@rokkit/data'

const ds = dataset(rawData)
const view = dataview(ds, {
  filters: [{ column: 'active', value: true, operator: 'eq' }],
  sort: [{ column: 'name', direction: 'asc' }],
  page: { size: 20, index: 0 }
})
```

### Key renaming

```js
import { renamer } from '@rokkit/data'

const rename = renamer({ firstName: 'first_name', lastName: 'last_name' })
const remapped = data.map(rename)
```

### Filter string parsing

```js
import { parseFilters } from '@rokkit/data'

const filters = parseFilters('age >= 18 AND status = "active"')
```

## API

| Export | Description |
|--------|-------------|
| `typeOf(value)` | Infer type string from a value |
| `filterObjectArray(data, filter)` | Apply a single filter object to an array |
| `filterData(data, filters)` | Apply an array of filters to a dataset |
| `parseFilters(string)` | Parse a filter expression string into filter objects |
| `innerJoin(a, b, keyA, keyB)` | Inner join two arrays on matching keys |
| `leftJoin(a, b, keyA, keyB)` | Left join — all rows from `a`, matched rows from `b` |
| `rightJoin(a, b, keyA, keyB)` | Right join — all rows from `b`, matched rows from `a` |
| `fullJoin(a, b, keyA, keyB)` | Full outer join |
| `crossJoin(a, b)` | Cartesian product of two arrays |
| `antiJoin(a, b, keyA, keyB)` | Rows in `a` with no match in `b` |
| `semiJoin(a, b, keyA, keyB)` | Rows in `a` that have a match in `b` |
| `deriveMetadata(data)` | Infer column names and types from a data sample |
| `deriveColumns(data)` | Derive column definitions from data |
| `deriveSortableColumn(col)` | Mark a column as sortable |
| `dataset(data, options?)` | Create a dataset abstraction |
| `dataview(dataset, options?)` | Create a filtered/sorted/paged view over a dataset |
| `renamer(mapping)` | Create a function that renames object keys |
| `model(data)` | Create a reactive data model |

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
