<script>
	import * as Plot from '@observablehq/plot'
	// import * as d3 from 'd3'
	export let options
	function myplot(node) {
		node.appendChild(Plot.plot(options))
	}
</script>

{#key options}
	<div use:myplot {...$$restProps} />
{/key}
