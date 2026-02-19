<script>
	let { orientation = 'horizontal' } = $props()
</script>

<div
	data-separator-root
	data-orientation={orientation}
	role="separator"
	aria-orientation={orientation}
></div>
