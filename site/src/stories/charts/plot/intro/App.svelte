<script>
	// @ts-nocheck
	import { Plot } from '@rokkit/chart'
	import { data } from './cars.js'

	const labels = {
		x: 'Economy (MPG)',
		y: 'Horsepower'
	}

	let chartType = $state('scatter')
	let colorBy = $state('cyl')
	let showLegend = $state(true)

	let plotData = $derived(
		data.map((d) => ({
			...d,
			cylinders: `${d.cyl} cylinders`,
			transmission: d.am ? 'Manual' : 'Automatic'
		}))
	)
</script>

<div class="space-y-6">
	<div>
		<h3 class="mb-4 text-lg font-medium">Interactive Chart Example</h3>
		<p class="mb-4 text-sm text-gray-600">
			The Plot component provides powerful data visualization using Observable Plot. Explore
			different chart configurations below.
		</p>

		<div class="mb-4 grid grid-cols-3 gap-4">
			<div>
				<label class="mb-2 block text-sm font-medium">Chart Type</label>
				<select bind:value={chartType} class="w-full rounded border px-3 py-2">
					<option value="scatter">Scatter Plot</option>
					<option value="line">Line Chart</option>
					<option value="bar">Bar Chart</option>
				</select>
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium">Color By</label>
				<select bind:value={colorBy} class="w-full rounded border px-3 py-2">
					<option value="cyl">Cylinders</option>
					<option value="transmission">Transmission</option>
					<option value="gear">Gears</option>
				</select>
			</div>
			<div class="flex items-end">
				<label class="flex items-center space-x-2">
					<input type="checkbox" bind:checked={showLegend} />
					<span class="text-sm">Show Legend</span>
				</label>
			</div>
		</div>

		<div class="rounded-lg border border-gray-200 bg-white p-4">
			{#if chartType === 'scatter'}
				<Plot
					data={plotData}
					x="mpg"
					y="hp"
					stroke={colorBy === 'transmission' ? 'transmission' : 'cylinders'}
					symbol={colorBy === 'transmission' ? 'transmission' : 'cylinders'}
					legend={showLegend}
					{labels}
				/>
			{:else if chartType === 'bar'}
				<Plot
					data={plotData}
					x="model"
					y="hp"
					fill={colorBy === 'transmission' ? 'transmission' : 'cylinders'}
					legend={showLegend}
					labels={{ x: 'Car Model', y: 'Horsepower' }}
				/>
			{:else}
				<Plot
					data={plotData.slice(0, 10)}
					x="wt"
					y="mpg"
					stroke={colorBy === 'transmission' ? 'transmission' : 'cylinders'}
					legend={showLegend}
					labels={{ x: 'Weight (1000 lbs)', y: 'Miles per Gallon' }}
				/>
			{/if}
		</div>
	</div>

	<div>
		<h3 class="mb-4 text-lg font-medium">Basic Usage</h3>
		<div class="rounded-lg bg-gray-50 p-4">
			<pre class="text-sm"><code
					>&lt;Plot 
  data={`{data}`} 
  x="mpg" 
  y="hp" 
  stroke="cylinders" 
  symbol="cylinders" 
  legend 
  labels={`{labels}`} 
/&gt;</code
				></pre>
		</div>
	</div>
</div>
