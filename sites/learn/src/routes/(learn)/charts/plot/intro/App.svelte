<script>
	import { Plot } from '@rokkit/chart'
	import { data } from './cars.js'

	const labels = {
		x: 'Economy (MPG)',
		y: 'Horsepower'
	}
	
	let chartType = 'scatter'
	let colorBy = 'cyl'
	let showLegend = true
	
	$: plotData = data.map(d => ({
		...d,
		cylinders: `${d.cyl} cylinders`,
		transmission: d.am ? 'Manual' : 'Automatic'
	}))
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium mb-4">Interactive Chart Example</h3>
		<p class="text-sm text-gray-600 mb-4">
			The Plot component provides powerful data visualization using Observable Plot. Explore different chart configurations below.
		</p>
		
		<div class="grid grid-cols-3 gap-4 mb-4">
			<div>
				<label class="block text-sm font-medium mb-2">Chart Type</label>
				<select bind:value={chartType} class="border rounded px-3 py-2 w-full">
					<option value="scatter">Scatter Plot</option>
					<option value="line">Line Chart</option>
					<option value="bar">Bar Chart</option>
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium mb-2">Color By</label>
				<select bind:value={colorBy} class="border rounded px-3 py-2 w-full">
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
		
		<div class="border border-gray-200 rounded-lg p-4 bg-white">
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
		<h3 class="text-lg font-medium mb-4">Basic Usage</h3>
		<div class="bg-gray-50 p-4 rounded-lg">
			<pre class="text-sm"><code>&lt;Plot 
  data={`{data}`} 
  x="mpg" 
  y="hp" 
  stroke="cylinders" 
  symbol="cylinders" 
  legend 
  labels={`{labels}`} 
/&gt;</code></pre>
		</div>
	</div>
</div>