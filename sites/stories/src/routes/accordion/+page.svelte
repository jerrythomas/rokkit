<script>
	import StoryWrapper from '$lib/StoryWrapper.svelte'
	import { Accordion } from '@rokkit/core'

	export let data
	let props
	let using = {}
	let autoClose = true
</script>

<StoryWrapper component={'Accordion'} variants={data.variants} bind:props>
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
