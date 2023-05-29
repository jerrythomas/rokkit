<script>
	import SwatchButton from './SwatchButton.svelte'

	export let columns
	export let rows
	export let items
	let grid

	function toGrid(columns, rows, patterns) {
		const count = patterns.length
		if (columns > 0) {
			rows = Math.ceil(count / columns)
		} else if (rows > 0) {
			columns = Math.ceil(count / rows)
		} else {
			columns = Math.ceil(Math.sqrt(count))
			rows = Math.ceil(count / columns)
		}
		const grid = [...Array(rows).keys()].map((row) =>
			[...Array(columns).keys()]
				.filter((column) => row * columns + column < count)
				.map((column) => ({
					item: patterns[row * columns + column],
					isCurrent: false
				}))
		)
		return grid
	}
	let previous
	function handleClick(row, column) {
		console.log(row, column, grid)
		if (previous) {
			grid[previous.row][previous.column].isCurrent = false
		}
		grid[row][column].isCurrent = true
		previous = { row, column }
	}
	$: grid = toGrid(columns, rows, items)
	$: console.log(grid)
</script>

<row class="flex flex-col gap-2">
	{#each grid as items, row}
		<div class="flex flex-row gap-2">
			{#each items as { item, isCurrent }, column}
				<SwatchButton
					shape="shurikan"
					pattern={item}
					on:click={() => handleClick(row, column)}
					{isCurrent}
				/>
			{/each}
		</div>
	{/each}
</row>
