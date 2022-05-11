<script>
	import { getContext } from 'svelte'
	import { repeatAcross } from '../lib/utils'

	let chart = getContext('chart')
	let points = $chart.data
	let colors = [
		'#FFDE6B',
		'#EF89EE',
		'#F79F1E',
		'#02B8FF',
		'#9F84EC',
		'#15CBC4',
		'#0092FD',
		'#F63A57',
		'#A2CB39',
		'#FF6E2F',
		'#FEB8B9',
		'#af7aa1',
		'#7EFFF5'
	]

	let colorLookup = repeatAcross(colors, [
		...new Set(points.map((d) => d.fill))
	])
</script>

{#each points as point}
	<circle
		cx={$chart.scale.x(point.x)}
		cy={$chart.scale.y(point.y)}
		r="2"
		fill={colorLookup[point.fill]}
		fill-opacity="0.5"
	/>
{/each}
