<script>
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {string} [unit]
	 * @property {number} [group]
	 * @property {number} [thickness]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		unit = '.5rem',
		group = 4,
		thickness = 0.5,
		children
	} = $props();
</script>

<graph-paper
	class="flex flex-col bg-op-20 text-op-40 {className}"
	style:--unit={unit}
	style:--size="calc( {group} * {unit})"
	style:--thin="{thickness}px"
	style:--thick="{2 * thickness}px"
>
	<content class="min-h-full flex flex-col">
		{@render children?.()}
	</content>
</graph-paper>

<style>
	graph-paper {
		background-image: linear-gradient(currentColor var(--thick), transparent var(--thick)),
			linear-gradient(90deg, currentColor var(--thick), transparent var(--thick)),
			linear-gradient(currentColor var(--thin), transparent var(--thin)),
			linear-gradient(90deg, currentColor var(--thin), transparent var(--thin));
		background-size:
			var(--size) var(--size),
			var(--size) var(--size),
			var(--unit) var(--unit),
			var(--unit) var(--unit);
		background-position:
			calc(-1 * var(--thin)) calc(-1 * var(--thin)),
			calc(-1 * var(--thin)) calc(-1 * var(--thin)),
			calc(-1 * var(--thin)) calc(-1 * var(--thin)),
			calc(-1 * var(--thin)) calc(-1 * var(--thin));
	}
</style>
