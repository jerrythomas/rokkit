<script>
	import { getComponent } from './groups'
	import Story from '$lib/Story.svelte'

	export let data
</script>

{#if data.props}
	<Story
		title={data.title}
		component={getComponent(data.group, data.type)}
		variants={data.variants}
		props={{ type: data.type, ...data.props }}
		fields={data.fields}
	/>
{/if}
