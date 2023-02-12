<script>
	// import { SwatchButton, brewer, SwatchGrid } from '@rokkit/chart'
	import { Timer, toNested, Chart, Axis, BarPlot, colors } from '@rokkit/chart'
	import data from './stackoverflow.json'

	// export let columns = 5
	let currentKeyframe = 0
	let fields = {
		x: 'value',
		y: 'rank',
		label: 'name'
	}
	let theme = {
		grid: {
			thickness: 0.2,
			stroke: 'currentColor',
			opacity: 1,
			dasharray: '1 3'
		},
		tick: {
			size: { inner: 6, outer: 6, padding: 3 },
			x: { orient: 'bottom' },
			y: { orient: 'left' }
		},
		background: 'bg-gray-50'
	}

	let params = {
		width: 600,
		height: 400,
		margin: {
			left: 50,
			top: 20,
			right: 30,
			bottom: 30
		},
		ticks: {
			y: { count: 5 }
		}
	}
	let languageColors = {}
	// let patterns = brewer().pattern().brew()
	// $: console.log(patterns)
	$: names = [...new Set(data.map((d) => d.name))]
	$: names.map((name, i) => (languageColors[name] = colors[i % colors.length]))
	$: keyframes = toNested(data, 'date', 'name')
	$: currentData = keyframes[currentKeyframe].value
	$: console.log(names)
</script>

<section class="flex flex-col h-full">
	<Timer
		class="absolute top-4 right-8"
		keyframeCount={keyframes.length}
		bind:currentKeyframe
		isEnabled={false}
	/>
	<content class="flex flex-col flex-wrap w-full px-8">
		<h1>Experiment</h1>

		<div>
			<Chart data={currentData} {fields} {theme} inverse={true}>
				<!-- <Axis orient="left" /> -->
				<BarPlot colors={languageColors} {fields} />
			</Chart>
		</div>
	</content>
</section>
