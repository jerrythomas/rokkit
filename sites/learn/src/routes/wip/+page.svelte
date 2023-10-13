<script>
	import { VirtualList } from '@rokkit/organisms'
	// import VirtualList from '@sveltejs/svelte-virtual-list'
	// import { Item } from '@rokkit/molecules'
	const options = Array.from({ length: 50 }).map((_, i) => `Option ${i + 1}`)
	let start
	let end
</script>

<span>
	<h1>Work in Progress</h1>
</span>

<VirtualList items={options} limit={5} bind:start bind:end></VirtualList>

{start}-{end}
<!-- <VirtualList items={options} /> -->
