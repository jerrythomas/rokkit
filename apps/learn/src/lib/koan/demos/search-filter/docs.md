## Free-text search parsed into structured filter objects

SearchFilter is a single input that emits a structured array of
`FilterObject` values as the user types. Plain words become
full-text searches; `column:value` adds a column scope; operators
like `>` / `!=` / `~*` produce numeric and regex comparisons.

## Basic example

```svelte
<script>
  import { SearchFilter } from '@rokkit/ui'

  let filters = $state([])

  // Apply filters wherever you keep data
  const visible = $derived(rows.filter((row) => matches(row, filters)))
</script>

<SearchFilter bind:filters placeholder="Search..." />
```

## Query syntax

| Input            | Meaning                                         | Operator |
| ---------------- | ----------------------------------------------- | -------- |
| `apple`          | Full-text across all columns (case-insensitive) | `~*`     |
| `name:alice`     | Column `name` contains "alice"                  | `~*`     |
| `age>30`         | Column `age` greater than 30                    | `>`      |
| `status!=active` | Column `status` not equal to "active"           | `!=`     |
| `name~^a.*`      | Regex on `name` (case-sensitive)                | `~`      |
| `name~*alice`    | Regex on `name` (case-insensitive)              | `~*`     |

Multiple tokens combine in one query: `status:active age>30 name:alice`.

## Operators

`:` `=` `!=` `>` `<` `>=` `<=` `~` `~*` `!~` `!~*`

`:` is shorthand for `~*` (case-insensitive contains). Tilde
operators emit a `RegExp` value; others emit string or number.

## Filter shape

Each emitted filter is shaped:

```ts
{
  column?: string   // undefined → search all columns
  operator: string  // e.g. '~*', '>', '!='
  value: string | number | RegExp
}
```

## Debounce

Input is debounced via the `debounce` prop (default `300`ms) so
filtering only re-runs when the user pauses typing. Set to `0` for
synchronous behaviour.
