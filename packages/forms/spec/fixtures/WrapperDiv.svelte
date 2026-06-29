<script>
	let { children, ...props } = $props()
</script>

<div data-layout-wrapper {...props}>
	{@render children?.()}
</div>
