<script>
	import { run } from 'svelte/legacy'

	import { Symbol } from '@rokkit/chart'

	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {any} rows
	 * @property {number} [columns]
	 * @property {number} [spacing]
	 * @property {any} [shapes]
	 * @property {any} [shades]
	 * @property {boolean} [repeat] - export let prefix
	 */

	/** @type {Props} */
	let {
		size = 40,
		rows = $bindable(),
		columns = 16,
		spacing = 10,
		shapes = [],
		shades = $bindable([]),
		repeat = false
	} = $props()

	run(() => {
		rows = rows ? rows : Math.ceil(shapes.length / columns)
	})
	let height = $derived((size + spacing) * rows)
	let width = $derived(spacing + (size + spacing) * columns)
	let data = $derived(
		shapes.map((id, index) => ({
			id,
			x: spacing / 2 + ((index % columns) + 0.5) * (size + spacing),
			y: (0.5 + Math.floor(index / columns)) * (size + spacing)
		}))
	)
	run(() => {
		shades = repeat ? shapes.map((id, index) => shades[index % shades.length]) : shades
	})
</script>

<svg viewBox="0 0 {width} {height}">
	{#each data as { id, x, y }, i}
		<Symbol {id} {x} {y} {size} {...shades[i]} />
	{/each}
</svg>
