<script>
	import { Switch } from '@rokkit/ui'

	let { properties } = $props()
</script>

<aside class="bg-neutral-subtle mb-6 flex justify-center gap-4 py-2">
	{#each properties as opt, index (index)}
		<div class="flex items-center gap-2 px-2">
			<p>{opt.label}</p>
			<Switch bind:value={opt.value} options={opt.options} compact={opt.options.length == 2} />
		</div>
	{/each}
</aside>
