<script>
	import StoryWrapper from '$lib/StoryWrapper.svelte'
	import { List, Link } from '@rokkit/core'
	import { variants } from './data'

	let props

	$: variants[2].props.using = { Link }
</script>

<StoryWrapper component={'List'} {variants} bind:props>
	<div class="flex w-60" slot="component">
		{#if props}
			<List {...props} />
		{/if}
	</div>
</StoryWrapper>
