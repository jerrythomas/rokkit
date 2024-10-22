<script>
	import { Symbol, brewer } from '@rokkit/chart'
	import ControlPanel from './ControlPanel.svelte'

	const size = 50
	const gap = 10
	const width = 800
	const columns = Math.floor((width - gap) / (size + gap))

	const shapes = brewer().shape().brew()

	const colors = [
		{ fill: '#D7F1FE', stroke: '#023047' },
		{ fill: '#EFF6FF', stroke: '#2563EB' },
		{ fill: '#FDF2F8', stroke: '#DB2777' },
		{ fill: '#ECFDF5', stroke: '#059669' },
		{ fill: '#F5F3FF', stroke: '#7C3AED' },
		{ fill: '#FEF2F2', stroke: '#DC2626' },
		{ fill: '#FFFBEB', stroke: '#D97706' }
	]

	function changeHandler(event) {
		console.log('change occurred', event.detail)
	}
	let height = $derived(Math.ceil(shapes.length / columns) * (size + gap) + 4 * gap)
</script>

<div class="h-full flex flex-row">
	<content class="flex-grow px-8">
		<h1>Symbols</h1>
		<svg viewBox="0 0 {width} {height}">
			{#each shapes as { shape }, index}
				<Symbol
					{shape}
					x={gap + ((index % columns) + 0.5) * (size + gap)}
					y={2 * gap + (0.5 + Math.floor(index / columns)) * (size + gap)}
					fill={index < colors.length ? colors[index].fill : '#E5E7EB'}
					stroke={index < colors.length ? colors[index].stroke : '#9CA3AF'}
					{size}
				/>
			{/each}
		</svg>
	</content>
	<ControlPanel on:change={changeHandler} />
</div>
