<script>
	throw new Error(
		'@migration task: Add data prop (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292707)'
	)

	import { Input } from '@sparsh-ui/core'
	import Story from '$lib/Story.svelte'

	export let type
	export let variants
	export let props
	export let fields
</script>

{#if props}
	<Story
		title="<Input type='{type}'>"
		component={Input}
		{variants}
		{props}
		{fields}
	/>
{/if}
