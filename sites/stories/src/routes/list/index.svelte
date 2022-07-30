<script>
	import StoryWrapper from '$lib/StoryWrapper.svelte'
	import { List, Link } from '@sparsh-ui/list'

	export let variants
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
