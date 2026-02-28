<script>
	import { Toggle } from '@rokkit/ui'

	let { properties } = $props()
</script>

<aside class="bg-surface-z2 mb-6 flex justify-center gap-4 py-2">
	{#each properties as opt, index (index)}
		<div class="flex items-center gap-2 px-2">
			<p>{opt.label}</p>
			<Toggle bind:value={opt.value} options={opt.options} />
		</div>
	{/each}
</aside>
