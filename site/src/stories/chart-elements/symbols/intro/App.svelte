<script>
	// @ts-nocheck
	import { Symbol } from '@rokkit/chart'
	import { swatch, swatchGrid } from '@rokkit/chart/lib'
	import { get } from 'svelte/store'

	const swatchData = get(swatch)
	const grid = swatchGrid(swatchData.keys.symbol.length, 10, 10)

	let selectedSymbol = $state('circle')
	let symbolSize = $state(5)
	let fillColor = $state('blue')
	let strokeColor = $state('blue')
</script>

<div class="space-y-6">
	<div>
		<h3 class="mb-4 text-lg font-medium">Available Symbols</h3>
		<p class="mb-4 text-sm text-gray-600">
			Symbols provide distinct markers for data points in scatter plots, line charts, and other
			visualizations.
		</p>

		<svg
			viewBox="0 0 {grid.width} {grid.height}"
			class="w-full max-w-lg rounded-lg border border-gray-200 bg-white"
		>
			{#each grid.data as { x, y, r }, index}
				<Symbol
					{x}
					{y}
					size={r / 5}
					name={swatchData.keys.symbol[index]}
					fill={swatchData.palette['teal'][500]}
					stroke={swatchData.palette['teal'][700]}
				/>
				<text {x} y={y + r + 8} text-anchor="middle" class="fill-gray-600 text-xs">
					{swatchData.keys.symbol[index]}
				</text>
			{/each}
		</svg>
	</div>

	<div>
		<h3 class="mb-4 text-lg font-medium">Interactive Symbol Editor</h3>
		<div class="mb-4 grid grid-cols-2 gap-4">
			<div>
				<label class="mb-2 block text-sm font-medium">Symbol Type</label>
				<select bind:value={selectedSymbol} class="w-full rounded border px-3 py-2">
					{#each swatchData.keys.symbol as symbol}
						<option value={symbol}>{symbol}</option>
					{/each}
				</select>
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium">Size: {symbolSize}</label>
				<input type="range" bind:value={symbolSize} min="2" max="15" class="w-full" />
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium">Fill Color</label>
				<select bind:value={fillColor} class="w-full rounded border px-3 py-2">
					<option value="blue">Blue</option>
					<option value="green">Green</option>
					<option value="orange">Orange</option>
					<option value="red">Red</option>
				</select>
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium">Stroke Color</label>
				<select bind:value={strokeColor} class="w-full rounded border px-3 py-2">
					<option value="blue">Blue</option>
					<option value="green">Green</option>
					<option value="orange">Orange</option>
					<option value="red">Red</option>
				</select>
			</div>
		</div>

		<div class="rounded-lg bg-gray-50 p-6 text-center">
			<svg viewBox="0 0 60 60" class="mx-auto h-16 w-16 rounded border border-gray-200 bg-white">
				<Symbol
					x={30}
					y={30}
					size={symbolSize}
					name={selectedSymbol}
					fill={swatchData.palette[fillColor][500]}
					stroke={swatchData.palette[strokeColor][700]}
				/>
			</svg>
			<p class="mt-2 text-sm text-gray-600">
				{selectedSymbol} symbol (size: {symbolSize})
			</p>
		</div>
	</div>
</div>
