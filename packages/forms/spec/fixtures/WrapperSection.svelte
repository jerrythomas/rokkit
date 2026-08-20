<script>
	let { children, ...props } = $props()
</script>

<section data-layout-wrapper-alt {...props}>
	{@render children?.()}
</section>
