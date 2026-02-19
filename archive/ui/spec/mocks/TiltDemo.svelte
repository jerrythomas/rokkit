<script>
	import Tilt from '../../src/Tilt.svelte'
	let { ...restProps } = $props()
</script>

<Tilt {...restProps}>
	<span>Content box</span>
</Tilt>
