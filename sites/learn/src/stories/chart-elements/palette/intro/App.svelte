<script>
	import { swatch } from '@rokkit/chart/lib'

	let palettes = $state(Object.keys(swatch.palette).slice(0, 8)) // Show first 8 palettes
	let shades = $state([100, 200, 300, 400, 500, 600, 700, 800, 900])
</script>

<div class="space-y-6">
	<div>
		<h3 class="mb-4 text-lg font-medium">Color Palettes</h3>
		<p class="mb-4 text-sm text-gray-600">
			Rokkit Chart includes a comprehensive set of color palettes designed for data visualization.
		</p>

		<div class="grid gap-4">
			{#each palettes as palette, index (index)}
				<div>
					<h4 class="mb-2 text-sm font-medium capitalize">{palette}</h4>
					<div class="flex overflow-hidden rounded-lg border border-gray-200">
						{#each shades as shade (shade)}
							<div
								class="flex h-12 flex-1 items-end justify-center"
								style="background-color: {$swatch.palette[palette][shade]}"
							>
								<span class="mb-1 text-xs text-white mix-blend-difference">{shade}</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div>
		<h3 class="mb-4 text-lg font-medium">Usage Example</h3>
		<div class="rounded-lg bg-gray-50 p-4">
			<div class="mb-2 flex gap-2">
				{#each ['blue', 'green', 'orange', 'red'] as color (color)}
					<div
						class="h-8 w-8 rounded"
						style="background-color: {swatch.palette[color][500]}"
						title="{color}-500"
					></div>
				{/each}
			</div>
			<p class="text-xs text-gray-600">
				Access colors: <code>swatch.palette.blue[500]</code>
			</p>
		</div>
	</div>
</div>
