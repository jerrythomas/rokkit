<script>
	import ContentNavigator from './ContentNavigator.svelte'
	import { Tabs } from '@rokkit/organisms'

	let items = ['one', 'two', 'three', 'four']

	let value
</script>

<ContentNavigator vertical>
	<Tabs {items} bind:value slot="nav" />
	<pre slot="content" class="flex-grow">
		{JSON.stringify(value)}
	</pre>
</ContentNavigator>
