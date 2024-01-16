<script>
	export let left
	export let top
	export let hidden = true
</script>

<div class="tooltip {$$props.class}" {hidden} style="--top: {top};--left: {left}">
	<slot />
</div>

<style lang="postcss">
	.tooltip {
		padding: 1em 0.5em;
		left: var(--left);
		top: var(--top);
		position: absolute;
		z-index: 10;
	}
</style>
