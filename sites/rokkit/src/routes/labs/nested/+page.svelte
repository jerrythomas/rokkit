<script>
	import { NestedList } from '@rokkit/core'

	export let data
	let props
	// let using = { default: Node, collapsible: Collapsible }
	let items = [
		{ text: 'Alpha', data: [{ text: 'One' }] },
		{
			text: 'Beta',
			data: [
				{ text: 'One' },
				{ text: 'Two', data: [{ text: 'One' }, { text: 'Two' }] }
			]
		},
		{ text: 'Delta' }
	]
	let linesVisible = false
	let value
</script>

<!-- <StoryWrapper component={'NestedList'} variants={data.variants} bind:props>
	<div class="flex w-60 border px-4 py-2 border-gray-400" slot="component">
		{#if props}
			<NestedList {...props} {using} />
		{/if}
	</div>
</StoryWrapper> -->

<NestedList {items} {linesVisible} bind:value />

<pre>
	{JSON.stringify(value, null, 2)}
</pre>
