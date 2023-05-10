<script>
	import { Switch } from '@rokkit/core'

	export let options
</script>

<aside class="flex gap-4 justify-center mb-6 bg-skin-subtle py-2">
	{#each options as opt}
		<div class="flex items-center gap-2 px-2">
			<p>{opt.label}</p>
			<Switch
				bind:value={opt.value}
				items={opt.items}
				compact={opt.items.length == 2}
			/>
		</div>
	{/each}
</aside>
