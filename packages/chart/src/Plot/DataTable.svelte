<script lang="ts">
	type Row = Record<string, unknown>

	type Props = {
		/** The plotted rows. */
		rows: Row[]
		/** Column fields, in order (`tableColumns` in lib/plot/spec.js). */
		columns: string[]
		/** The chart's title — names the table and becomes its caption. */
		title?: string
	}

	let { rows, columns, title = '' }: Props = $props()
</script>

<!-- The chart's data as a table: in the DOM for screen readers, never visible. -->
{#if rows.length > 0 && columns.length > 0}
	<table class="plot-sr-table" aria-label={title || 'Chart data'}>
		{#if title}
			<caption>{title}</caption>
		{/if}
		<thead>
			<tr>
				{#each columns as col (col)}
					<th scope="col">{col}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as row, i (i)}
				<tr>
					{#each columns as col (col)}
						<td>{row[col] ?? ''}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
{/if}

<style>
	/* Visually hidden — in DOM for screen readers, not visible */
	.plot-sr-table {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
