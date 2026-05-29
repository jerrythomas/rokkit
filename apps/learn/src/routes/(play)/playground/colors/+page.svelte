<script>
	import { defaultPalette, shades } from '@rokkit/core'
</script>

<div class="grid grid-cols-2 gap-4">
	<div class="flex flex-col items-center gap-4 p-10">
		<h2 class="flex-1 capitalize">The Palette</h2>
		{#each defaultPalette as color (color)}
			<div class="flex flex-col">
				<p class="flex-1 capitalize">{color}</p>
				<div class="gap-1px flex">
					{#each shades as shade, index (index)}
						<div class="h-10 w-10 rounded-md bg-{color}-{shade}"></div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
	<div class="flex flex-col items-center gap-4 p-10">
		<h2 class="flex-1 capitalize">With 50% opacity</h2>
		{#each defaultPalette as color (color)}
			<div class="flex flex-col">
				<p class="flex-1 capitalize">{color}</p>
				<div class="gap-1px flex">
					{#each shades as shade, index (index)}
						<div class="h-10 w-10 rounded-md bg-{color}-{shade}/50"></div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
