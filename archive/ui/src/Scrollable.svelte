<script>
	let { class: className = '', children } = $props()
</script>

<div data-scrollable-root class={className}>
	{@render children?.()}
</div>

<style>
	[data-scrollable-root] {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: scroll;
	}
</style>
