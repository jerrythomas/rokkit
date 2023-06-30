<script>
	import { Connector } from 'rokkit/atoms'

	let variants = [
		{ title: 'last', props: { type: 'last' } },
		{ title: 'child', props: { type: 'child' } },
		{ title: 'sibling', props: { type: 'sibling' } },
		{ title: 'empty', props: { type: 'empty' } }
	]
</script>

<h2>Regular connectors</h2>
<div class="w-60 flex gap-2 border px-4 py-2">
	{#each variants as { title, props }}
		<div class="flex flex-col items-center">
			<h1 class="flex-start">{title}</h1>
			<span class="h-8 w-4">
				<Connector {...props} />
			</span>
		</div>
	{/each}
</div>
<h2>With RTL</h2>
<div class="w-60 flex gap-2 border px-4 py-2">
	{#each variants as { title, props }}
		<div class="flex flex-col items-center">
			<h1 class="flex-start">{title}</h1>
			<span class="h-8 w-4">
				<Connector {...props} rtl />
			</span>
		</div>
	{/each}
</div>
