<script>
	import StoryWrapper from '$lib/StoryWrapper.svelte'
	import { Accordion } from '@sparsh-ui/list'

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
		<label>Auto Close</label>
		<input type="checkbox" bind:checked={autoClose} />
	</div>
</StoryWrapper>
