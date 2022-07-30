<script>
	import StoryWrapper from '$lib/StoryWrapper.svelte'
	import { Connector } from '@sparsh-ui/list'

	let variants = [
		{ title: 'last', props: { type: 'last' } },
		{ title: 'middle', props: { type: 'middle' } },
		{ title: 'line', props: { type: 'line' } },
		{ title: 'empty', props: { type: 'empty' } }
	]
	let props
</script>

<StoryWrapper component={'Connector'}>
	<div class="flex w-60 border px-4 py-2 border-gray-400" slot="component">
		{#each variants as { title, props }}
			<div class="flex-1">
				<h1 class="flex-start">{title}</h1>
				<Connector {...props} />
			</div>
		{/each}
	</div>
</StoryWrapper>
