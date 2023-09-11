<script>
	import VirtualList from '../../src/VirtualList.svelte'

	export let items
	export let limit
</script>

<VirtualList {items} {limit} let:item>
	<div>{item}</div>
</VirtualList>
