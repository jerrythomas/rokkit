<script>
	import { Connector } from '@rokkit/core'

	let variants = [
		{ title: 'last', props: { type: 'last' } },
		{ title: 'middle', props: { type: 'middle' } },
		{ title: 'line', props: { type: 'line' } },
		{ title: 'empty', props: { type: 'empty' } }
	]
</script>

<h2>Regular connectors</h2>
<div class="flex w-60 border px-4 py-2 gap-2">
	{#each variants as { title, props }}
		<div class="flex flex-col items-center">
			<h1 class="flex-start">{title}</h1>
			<span class="w-4 h-8">
				<Connector {...props} />
			</span>
		</div>
	{/each}
</div>
<h2>With RTL</h2>
<div class="flex w-60 border px-4 py-2 gap-2">
	{#each variants as { title, props }}
		<div class="flex flex-col items-center">
			<h1 class="flex-start">{title}</h1>
			<span class="w-4 h-8">
				<Connector {...props} rtl />
			</span>
		</div>
	{/each}
</div>
