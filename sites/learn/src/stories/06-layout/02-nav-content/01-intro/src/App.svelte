<script>
	import ContentNavigator from './ContentNavigator.svelte'
	import { Tabs } from '@rokkit/ui'

	let items = ['one', 'two', 'three', 'four']

	let value = $state()
</script>

<ContentNavigator vertical>
	{#snippet nav()}
		<Tabs {items} bind:value />
	{/snippet}
	{#snippet content()}
		<pre class="flex-grow">
			{JSON.stringify(value)}
		</pre>
	{/snippet}
</ContentNavigator>
