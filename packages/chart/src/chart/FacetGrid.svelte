<script>
	import Chart from './Chart.svelte'
	import AxisGrid from './AxisGrid.svelte'
	import Axis from './Axis.svelte'
	// import AxisTicks from './AxisTicks.svelte'
	// import AxisLabels from './AxisLabels.svelte'

	export let data
	export let row
	export let col
	export let plot
	export let x
	export let y
	export let labels = { x: true, y: true }

	$: rowValues = [...new Set(data.map((d) => d[row]))]
	$: colValues = [...new Set(data.map((d) => d[col]))]
</script>

<div class="flex flex-col">
	{#each rowValues as rowItem}
		{@const dataFilteredByRow = data.filter((d) => d[row] === rowItem)}

		<div class="flex flex-row">
			{#each colValues as colItem}
				{@const dataFilteredByCol = dataFilteredByRow.filter(
					(d) => d[col] === colItem
				)}

				<Chart data={dataFilteredByCol} {x} {y}>
					<Axis name="x" count={7} gap={10}>
						<!-- <AxisTicks side="bottom">
							{#if labels.x}
								<AxisLabels angle={-60} />
							{/if}
						</AxisTicks> -->
					</Axis>
					<Axis name="y" gap={10}>
						<!-- <AxisTicks side="left">
							{#if labels.y}
								<AxisLabels />
							{/if}
						</AxisTicks> -->
						<AxisGrid />
					</Axis>
					<svelte:component this={plot} />
				</Chart>
			{/each}
		</div>
	{/each}
</div>
