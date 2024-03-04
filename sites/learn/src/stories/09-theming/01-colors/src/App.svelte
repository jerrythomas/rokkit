<script>
	import { shades, defaultPalette as palette } from '@rokkit/core'
</script>

<div class="flex flex-col gap-2">
	{#each palette as color}
		<p>{color}</p>
		<div class="flex flex-wrap gap-2">
			{#each shades as shade}
				<div class="w-10 h-10 rounded-md" style="background-color: var(--{color}-{shade})"></div>
			{/each}
		</div>
	{/each}
</div>
