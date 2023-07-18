<script>
	import { getContext } from 'svelte'
	import { compact } from '../components/lib/utils'
	import { funnel } from '../components/lib/funnel'

	const chart = getContext('chart')

	export let x
	export let y
	export let fill
	export let curve = 'bump'
	export let stat = 'count'

	$: aes = { ...$chart.aes, ...compact({ x, y, fill, stat, curve }) }
	$: data = funnel($chart.data, aes, $chart.width, $chart.height)

</script>

{#each data.stats as stat, i}
	<path d={data.path(stat.value)} fill={$chart.theme.colors[i]} />
{/each}
{#each data.labels as label, index}
	{#if index < data.labels.length - 1}
		<line
			x1={label.x1}
			x2={label.x2}
			y1={label.y1}
			y2={label.y2}
			stroke="currentColor"
		/>
	{/if}
	<text x={label.x} y={label.y} fill="currentColor">{label.label}</text>
{/each}
