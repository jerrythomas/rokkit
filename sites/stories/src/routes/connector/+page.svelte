<script>
	import StoryWrapper from '$lib/StoryWrapper.svelte'
	import { Connector } from '@rokkit/core'

	let variants = [
		{ title: 'last', props: { type: 'last' } },
		{ title: 'middle', props: { type: 'middle' } },
		{ title: 'line', props: { type: 'line' } },
		{ title: 'empty', props: { type: 'empty' } }
	]
	let props
</script>

<content>
	<div class="flex w-60 border px-4 py-2 gap-2 border-gray-400">
		{#each variants as { title, props }}
			<div class="flex flex-col items-center">
				<h1 class="flex-start">{title}</h1>
				<span class="w-4 h-8 border border-gray-200">
					<Connector {...props} />
				</span>
			</div>
		{/each}
	</div>
	<div class="flex w-60 border px-4 py-2 gap-2 border-gray-400">
		{#each variants as { title, props }}
			<div class="flex flex-col  items-center">
				<h1 class="flex-start">{title}</h1>
				<span class="w-4 h-8 border border-gray-200">
					<Connector {...props} rtl />
				</span>
			</div>
		{/each}
	</div>
</content>
