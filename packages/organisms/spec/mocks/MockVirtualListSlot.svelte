<script>
	import VirtualList from '../../src/Virtual.svelte'

	export let items
	export let limit
</script>

<VirtualList {items} {limit} let:item>
	<div>{item}</div>
</VirtualList>
