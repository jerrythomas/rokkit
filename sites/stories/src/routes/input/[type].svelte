<script>
	import { inputTypes, FormFields } from '@sparsh-ui/core'
	import Story from '$lib/Story.svelte'

	export let type
	export let props
	export let fields
</script>

{#if props}
	<Story title="Input {type}" component={inputTypes[type]} {props} {fields} />
{/if}
