<script>
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} layers
	 * @property {number} [seconds]
	 */

	/** @type {Props} */
	let { class: className = 'flex flex-grow w-full mx-0 h-auto', layers, seconds = 10 } = $props();
</script>

<svg
	viewBox="0 0 320 72"
	style:--seconds="{seconds}s"
	class={className}
	preserveAspectRatio="xMidYMid meet"
>
	{#each layers as layer}
		{@const shade = layer.shade}
		<g class="fill-current {shade}">
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
