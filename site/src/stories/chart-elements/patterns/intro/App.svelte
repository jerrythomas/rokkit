<script>
	// @ts-nocheck
	import { DefinePatterns } from '@rokkit/chart/elements'
	import { swatch, swatchGrid } from '@rokkit/chart/lib'
	import { get } from 'svelte/store'

	let { base = 'blue', fill = 300, stroke = 500, outline = 600 } = $props()

	const swatchData = get(swatch)

	let patterns = $derived(
		swatchData.keys.pattern.map((id) => ({
			id: `${base}-${fill}-${id}`,
			component: swatchData.patterns[id],
			fill: swatchData.palette[base][fill],
			stroke: swatchData.palette[base][stroke]
		}))
	)
	let grid = $derived(swatchGrid(patterns.length, 30, 10))
</script>

<div class="space-y-6">
	<div>
		<h3 class="mb-4 text-lg font-medium">Available Patterns</h3>
		<p class="mb-4 text-sm text-gray-600">
			Patterns provide visual alternatives to colors, enhancing accessibility for users with color
			vision differences.
		</p>

		<svg
			viewBox="0 0 {grid.width} {grid.height}"
			class="w-full max-w-md rounded-lg border border-gray-200"
		>
			<DefinePatterns {patterns} size={10} />
			{#each grid.data as { x, y, r }, index}
				<rect
					x={x - r}
					y={y - r}
					width={r * 2}
					height={r * 2}
					fill="url(#{patterns[index].id})"
					stroke={swatchData.palette[base][outline]}
					stroke-width="0.5"
				/>
			{/each}
		</svg>
	</div>

	<div>
		<h3 class="mb-4 text-lg font-medium">Interactive Controls</h3>
		<div class="grid grid-cols-2 gap-4">
			<div>
				<label class="mb-2 block text-sm font-medium">Base Color</label>
				<select bind:value={base} class="w-full rounded border px-3 py-2">
					<option value="blue">Blue</option>
					<option value="green">Green</option>
					<option value="orange">Orange</option>
					<option value="red">Red</option>
				</select>
			</div>
			<div>
				<label class="mb-2 block text-sm font-medium">Fill Shade</label>
				<select bind:value={fill} class="w-full rounded border px-3 py-2">
					<option value={200}>200 (Light)</option>
					<option value={300}>300</option>
					<option value={400}>400 (Medium)</option>
					<option value={500}>500</option>
				</select>
			</div>
		</div>
	</div>
</div>
