<script>
	import { library } from './constants'
	import * as templates from './shapes'
	import { pick } from 'ramda'

	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {string} [fill]
	 * @property {string} [stroke]
	 * @property {number} [thickness]
	 * @property {string} [name]
	 */

	/** @type {Props} */
	let {
		size = 10,
		fill = 'none',
		stroke = 'none',
		thickness = 0.5,
		name = 'Waves'
	} = $props();

	let pattern = $derived(library[name])
	let props = $derived(pick(pattern.allowed ?? [], { fill, stroke, thickness }))

	const SvelteComponent = $derived(templates[pattern.component]);
</script>

<SvelteComponent {size} {...props} data={pattern.data} />
