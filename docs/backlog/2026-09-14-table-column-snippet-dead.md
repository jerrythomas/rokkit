# `TableColumn.snippet` is documented but never read

**Raised:** 2026-09-14, while migrating per-item named snippets off the index signature.
**Status:** open.

## The defect

`types/table.ts` declares:

```ts
/** Named snippet for custom cell rendering */
snippet?: string
```

and `docs/llms/components/table.txt` teaches it:

```svelte
<Table {data} {columns}>
  {#snippet actions(value, column, row)}…{/snippet}
</Table>
```

**`Table.svelte` never reads it.** It destructures four explicit snippet props —
`header`, `row`, `cell`, `empty` — and contains no `getSnippet`, no
`resolveSnippet`, and no reference to `column.snippet` at all.

So the documented example silently renders the default cell. This predates the
named-snippet migration; the transform that moved every other component's
examples to the `snippets` prop was deliberately **not** applied to `table.txt`,
since migrating an example of a feature that does not exist would only make it
differently wrong.

## Two ways out

1. **Implement it.** Give `Table` the same `snippets?: Record<string, TableCellSnippet>`
   prop the other components now have, and route on `column.snippet` inside the
   cell renderer. That matches what the docs already promise.
2. **Remove it.** Drop `TableColumn.snippet`, delete the doc section, and point
   people at the `cell` snippet, which genuinely works and receives the column.

Option 1 is the smaller surprise for anyone who read the docs and expects it to
work; option 2 is honest about what the component does today. Worth deciding
before either gets released as "fixed".

## How it was found

Not by a checker — nothing connects a doc example to the component. It surfaced
because the named-snippet migration needed to know which components actually
consume a snippet bag, and `Table` turned out not to consume one at all despite
documenting that it does.

That is the same shape as the props-type drift: a published claim with nothing
verifying it. A doc-example checker would be the general fix, and is a bigger
slice than this.

## Related

- `2026-09-14-stale-props-types.md` — same class, closed.
