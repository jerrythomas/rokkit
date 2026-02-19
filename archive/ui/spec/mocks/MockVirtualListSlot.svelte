<script>
	import VirtualList from '../../src/VirtualList.svelte'

	let { items, limit } = $props()
</script>

<VirtualList {items} {limit} let:item>
	<div>{item}</div>
</VirtualList>
