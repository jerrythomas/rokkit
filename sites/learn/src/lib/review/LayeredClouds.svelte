<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} [width]
	 * @property {number} [height]
	 * @property {any} [layers]
	 * @property {number} [seconds]
	 */

	/** @type {Props} */
	let {
		width = 320,
		height = 72,
		layers = [],
		seconds = 10
	} = $props();
</script>

<svg {width} {height} viewBox="0 0 {width} {height}" style:--seconds="{seconds}s">
	{#each layers as layer}
		<g fill={layer.fill}>
			{#each layer.items as item, index}
				{#if item.rx === item.ry}
					<circle
						class="bobble"
						cx={item.cx}
						cy={item.cy}
						r={item.r}
						style={`animation-delay: ${index / 2}s`}
					/>
				{:else}
					<ellipse
						class="bobble"
						cx={item.cx}
						cy={item.cy}
						rx={item.rx}
						ry={item.ry}
						style={`animation-delay: ${index / 2}s`}
					/>
				{/if}
			{/each}
		</g>
	{/each}
</svg>

<style>
	@keyframes bob {
		0% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
		100% {
			transform: translateY(0);
		}
	}

	.bobble {
		animation-name: bob;
		animation-duration: var(--seconds);
		animation-iteration-count: infinite;
		animation-timing-function: ease-in-out;
	}
</style>
