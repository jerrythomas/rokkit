# `TableColumn.snippet` is documented but never read

**Raised:** 2026-09-14, while migrating per-item named snippets off the index signature.
**Status:** CLOSED 2026-09-15 — implemented, which is what the docs already promised.

## The defect

`types/table.ts` declared `snippet?: string` on `TableColumn` and
`docs/llms/components/table.txt` taught it, but **`Table.svelte` never read it**.
It destructured four explicit snippet props — `header`, `row`, `cell`, `empty` —
and contained no `getSnippet`, no `resolveSnippet`, and no reference to
`column.snippet` at all. The documented example silently rendered the default
cell.

## Resolution: implemented, not removed

Removing it was the other option, but the docs had promised this for long enough
that implementing was the smaller surprise — and it costs ~4 lines, because the
plumbing (`TableCellSnippet`, the cell loop) was already there:

```svelte
{@const namedCell = column.snippet ? snippets[column.snippet] : undefined}
{@const renderCell = namedCell ?? cellSnippet}
```

`TableProps` gains `snippets?: Record<string, TableCellSnippet>`, matching the
prop every other item-rendering component now takes.

**Precedence:** a column that names a snippet beats the blanket `cell`, mirroring
how a per-item named snippet beats `itemContent` everywhere else. Naming one
nobody passed falls through to the default renderer rather than blanking the
cell.

## Tests

`spec/Table-named-snippets.spec.svelte.ts` — five cases, written before the
implementation. Three were red (routing, column isolation, precedence over
`cell`); two were green from the start and stayed green, which is the point:

- routes a column with `column.snippet` to the named snippet
- applies it **only** to the column that names it
- leaves other columns on the default renderer
- wins over the blanket `cell` snippet
- falls back to the default when the named snippet is absent

`docs/llms/components/table.txt` now shows the `snippets` prop, matching the
other nine component docs.

## How it was found

Not by a checker — nothing connects a doc example to the component. It surfaced
because the named-snippet migration had to know which components actually consume
a snippet bag, and `Table` turned out not to consume one despite documenting that
it did. A doc-example checker would be the general fix, and is a bigger slice.

## Related

- `2026-09-14-stale-props-types.md` — same class (a published claim with nothing
  verifying it), closed.
