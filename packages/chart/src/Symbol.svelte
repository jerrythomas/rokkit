<script>
	import { components } from './symbols'

	
	/**
	 * @typedef {Object} Props
	 * @property {number} [x]
	 * @property {number} [y]
	 * @property {number} [size]
	 * @property {string} [fill]
	 * @property {string} [stroke]
	 * @property {string} [name]
	 * @property {any} [using]
	 */

	/** @type {Props & { [key: string]: any }} */
	let {
		x = 0,
		y = 0,
		size = 10,
		fill = 'currentColor',
		stroke = 'currentColor',
		name = 'circle',
		using = components,
		...rest
	} = $props();

	let component = $derived(using[name] || using.default)
	let props = $derived(using[name] ? rest : { name, ...rest })

	const SvelteComponent = $derived(component);
</script>

<SvelteComponent {x} {y} {size} {fill} {stroke} {...props} />
