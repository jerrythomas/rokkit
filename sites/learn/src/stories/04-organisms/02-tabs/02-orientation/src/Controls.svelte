<script>
	import { Switch } from '@rokkit/organisms'

	export let options
</script>

<aside class="mb-6 flex justify-center gap-4 bg-skin-subtle py-2">
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
