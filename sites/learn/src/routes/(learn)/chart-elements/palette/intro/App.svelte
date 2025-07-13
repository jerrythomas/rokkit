<script>
	import { swatch } from '@rokkit/chart/lib'
	
	$: palettes = Object.keys($swatch.palette).slice(0, 8) // Show first 8 palettes
	$: shades = [100, 200, 300, 400, 500, 600, 700, 800, 900]
</script>

<div class="space-y-6">
	<div>
		<h3 class="text-lg font-medium mb-4">Color Palettes</h3>
		<p class="text-sm text-gray-600 mb-4">
			Rokkit Chart includes a comprehensive set of color palettes designed for data visualization.
		</p>
		
		<div class="grid gap-4">
			{#each palettes as palette}
				<div>
					<h4 class="text-sm font-medium mb-2 capitalize">{palette}</h4>
					<div class="flex rounded-lg overflow-hidden border border-gray-200">
						{#each shades as shade}
							<div 
								class="flex-1 h-12 flex items-end justify-center"
								style="background-color: {$swatch.palette[palette][shade]}"
							>
								<span class="text-xs text-white mb-1 mix-blend-difference">{shade}</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
	
	<div>
		<h3 class="text-lg font-medium mb-4">Usage Example</h3>
		<div class="bg-gray-50 p-4 rounded-lg">
			<div class="flex gap-2 mb-2">
				{#each ['blue', 'green', 'orange', 'red'] as color}
					<div 
						class="w-8 h-8 rounded"
						style="background-color: {$swatch.palette[color][500]}"
						title="{color}-500"
					></div>
				{/each}
			</div>
			<p class="text-xs text-gray-600">
				Access colors: <code>$swatch.palette.blue[500]</code>
			</p>
		</div>
	</div>
</div>