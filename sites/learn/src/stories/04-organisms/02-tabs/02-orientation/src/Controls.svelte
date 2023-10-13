<script>
	import { Switch } from '@rokkit/organisms'

	export let properties
</script>

<aside class="mb-6 flex justify-center gap-4 bg-neutral-subtle py-2">
	{#each properties as opt}
		<div class="flex items-center gap-2 px-2">
			<p>{opt.label}</p>
			<Switch
				bind:value={opt.value}
				options={opt.options}
				compact={opt.options.length == 2}
			/>
		</div>
	{/each}
</aside>
