<script>
	import GraphPaper from '../../src/GraphPaper.svelte'
	let { ...restProps } = $props()
</script>

<GraphPaper {...restProps}>
	<span>Content box</span>
</GraphPaper>
