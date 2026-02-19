<script>
	import { FieldMapper } from '@rokkit/core'
	import Item from './Item.svelte'
	/**
	 * @typedef {Object} Props
	 * @property {string}        [class]
	 * @property {string|Object} [value]
	 * @property {FieldMapper}   [mapping]
	 * @property {string}        [href]
	 * @property {Object}        [rest]
	 */

	/** @type {Props} */
	let { class: classes = '', value, mapping = new FieldMapper(), href = '#', ...rest } = $props()
	let url = $derived(mapping.get('href', value, href))
	let props = $derived({ ...mapping.get('props', value, {}), ...rest })
</script>

<a href={url} class={classes} {...props}>
	<Item {value} {mapping} />
</a>
