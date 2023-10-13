<script>
	let className = ''
	export { className as class }
	export let unit = '.5rem'
	export let group = 4
	export let thickness = 0.5
</script>

<graph-paper
	class="p-8 border bg-op-20 text-op-30 bg-neutral-50 text-neutral-300 border-neutral-400 {className}"
	style:--unit={unit}
	style:--size="calc( {group} * {unit})"
	style:--thin="{thickness}px"
	style:--thick="{2 * thickness}px"
>
	<slot />
</graph-paper>

<style>
	graph-paper {
		background-image: linear-gradient(
				currentColor var(--thick),
				transparent var(--thick)
			),
			linear-gradient(
				90deg,
				currentColor var(--thick),
				transparent var(--thick)
			),
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
