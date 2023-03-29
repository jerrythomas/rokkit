<script>
	// import StoryWrapper from '$lib/StoryWrapper.svelte'
	import { List, Link } from '@rokkit/core'
	// import { variants } from './data'

	let props
	let value
	let items = [{ text: 'One' }, { text: 'Two' }, { text: 'Three' }]

	// $: variants[2].props.using = { Link }
</script>

<List {items} bind:value />

<pre>
	{JSON.stringify(value, null, 2)}
</pre>
