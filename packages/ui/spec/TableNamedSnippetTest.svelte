<script>
	import Table from '../src/components/Table.svelte'

	/** Wrapper for per-column named snippets (column.snippet -> snippets[name]). */
	let { withCell = false, ...rest } = $props()
</script>

{#snippet actions(value, column, row)}
	<span data-named-cell data-named-column={column.name}>Actions: {String(row.name ?? '')}</span>
{/snippet}
{#snippet cellSnippet(value)}
	<span data-default-cell>{String(value)}</span>
{/snippet}

<Table {...rest} snippets={{ actions }} cell={withCell ? cellSnippet : undefined} />
