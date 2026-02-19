<script>
	import Shine from '../../src/Shine.svelte'
	let { ...restProps } = $props()
</script>

<Shine {...restProps}>
	<span>Content box</span>
</Shine>
