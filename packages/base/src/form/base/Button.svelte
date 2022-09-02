<script>
	let className = ''
	export { className as class }
	export let type
	export let label

	$: showLeft = $$slots.left ? 'visible' : 'hidden'
	$: showRight = $$slots.right ? 'visible' : 'hidden'
</script>

<button {type} class="flex flex-row items-center {className}">
	<icon-left style:visibility={showLeft}>
		<slot name="left" />
	</icon-left>
	{label}
	<icon-right style:visibility={showRight}>
		<slot name="right" />
	</icon-right>
</button>
