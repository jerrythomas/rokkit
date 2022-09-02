<script>
	import { Input } from '@sparsh-ui/core'
	import Story from '$lib/Story.svelte'

	export let data
	// $: { type, variants, props, fields } = data
</script>

{#if data.props}
	<Story
		title="<Input type='{data.type}'>"
		component={Input}
		variants={data.variants}
		props={{ type: data.type, ...data.props }}
		fields={data.fields}
	/>
{/if}
