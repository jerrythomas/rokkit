<script lang="ts">
	let { code }: { code: string } = $props()

	interface TableData {
		columns: string[]
		rows: Record<string, unknown>[]
	}

	function validateTableShape(parsed: unknown): parsed is TableData {
		return (
			Array.isArray((parsed as TableData)?.columns) && Array.isArray((parsed as TableData)?.rows)
		)
	}

	function parseTableData(
		raw: string
	): { data: TableData; error: null } | { data: null; error: string } {
		try {
			const parsed: unknown = JSON.parse(raw)
			if (!validateTableShape(parsed))
				throw new Error('Expected { columns: string[], rows: object[] }')
			return { data: parsed, error: null }
		} catch (e) {
			return { data: null, error: e instanceof Error ? e.message : 'Invalid JSON' }
		}
	}

	const result = $derived(parseTableData(code))
</script>

{#if result.error}
	<div data-block-error class="block-error">
		<span>Table error: {result.error}</span>
		<details>
			<summary>Raw</summary>
			<pre>{code}</pre>
		</details>
	</div>
{:else}
	{@const { columns, rows } = result.data!}
	<div class="table-block" data-table-block>
		<table>
			<thead
				><tr
					>{#each columns as col (col)}<th>{col}</th>{/each}</tr
				></thead
			>
			<tbody>
				{#each rows as row, i (i)}
					<tr
						>{#each columns as col (col)}<td>{row[col] ?? ''}</td>{/each}</tr
					>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
