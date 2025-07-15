<script>
	import { Symbol } from '@rokkit/chart'
	import { swatch, swatchGrid } from '@rokkit/chart/lib'

	$: grid = swatchGrid($swatch.keys.symbol.length, 10, 10)
	
	let selectedSymbol = 'circle'
	let symbolSize = 5
	let fillColor = 'blue'
	let strokeColor = 'blue'
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium mb-4">Available Symbols</h3>
		<p class="text-sm text-gray-600 mb-4">
			Symbols provide distinct markers for data points in scatter plots, line charts, and other visualizations.
		</p>
		
		<svg viewBox="0 0 {grid.width} {grid.height}" class="w-full max-w-lg border border-gray-200 rounded-lg bg-white">
			{#each grid.data as { x, y, r }, index}
				<Symbol
					{x}
					{y}
					size={r / 5}
					name={$swatch.keys.symbol[index]}
					fill={$swatch.palette['teal'][500]}
					stroke={$swatch.palette['teal'][700]}
				/>
				<text 
					x={x} 
					y={y + r + 8} 
					text-anchor="middle" 
					class="text-xs fill-gray-600"
				>
					{$swatch.keys.symbol[index]}
				</text>
			{/each}
		</svg>
	</div>
	
	<div>
		<h3 class="text-lg font-medium mb-4">Interactive Symbol Editor</h3>
		<div class="grid grid-cols-2 gap-4 mb-4">
			<div>
				<label class="block text-sm font-medium mb-2">Symbol Type</label>
				<select bind:value={selectedSymbol} class="border rounded px-3 py-2 w-full">
					{#each $swatch.keys.symbol as symbol}
						<option value={symbol}>{symbol}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium mb-2">Size: {symbolSize}</label>
				<input 
					type="range" 
					bind:value={symbolSize} 
					min="2" 
					max="15" 
					class="w-full"
				/>
			</div>
			<div>
				<label class="block text-sm font-medium mb-2">Fill Color</label>
				<select bind:value={fillColor} class="border rounded px-3 py-2 w-full">
					<option value="blue">Blue</option>
					<option value="green">Green</option>
					<option value="orange">Orange</option>
					<option value="red">Red</option>
				</select>
			</div>
			<div>
				<label class="block text-sm font-medium mb-2">Stroke Color</label>
				<select bind:value={strokeColor} class="border rounded px-3 py-2 w-full">
					<option value="blue">Blue</option>
					<option value="green">Green</option>
					<option value="orange">Orange</option>
					<option value="red">Red</option>
				</select>
			</div>
		</div>
		
		<div class="bg-gray-50 p-6 rounded-lg text-center">
			<svg viewBox="0 0 60 60" class="w-16 h-16 mx-auto border border-gray-200 bg-white rounded">
				<Symbol
					x={30}
					y={30}
					size={symbolSize}
					name={selectedSymbol}
					fill={$swatch.palette[fillColor][500]}
					stroke={$swatch.palette[strokeColor][700]}
				/>
			</svg>
			<p class="text-sm text-gray-600 mt-2">
				{selectedSymbol} symbol (size: {symbolSize})
			</p>
		</div>
	</div>
</div>