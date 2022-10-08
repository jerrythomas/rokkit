<script>
	throw new Error(
		'@migration task: Add data prop (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292707)'
	)

	import StoryWrapper from '$lib/StoryWrapper.svelte'
	import { Accordion } from '@svelte-spice/core'

	export let variants
	let props
	let using = {}
	let autoClose = true
</script>

<StoryWrapper component={'Accordion'} {variants} bind:props>
	<div class="flex w-60 border px-4 py-2 border-gray-400" slot="component">
		{#if props}
			<Accordion {...props} {using} {autoClose} />
		{/if}
	</div>
	<div slot="control">
		<label>
			<input type="checkbox" bind:checked={autoClose} /> Auto Close
		</label>
	</div>
</StoryWrapper>
