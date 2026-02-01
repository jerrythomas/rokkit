<script>
	import { defaultStateIcons } from '@rokkit/core'
	import Icon from './Icon.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} items
	 * @property {any} [icons]
	 */

	/** @type {Props} */
	let { class: classes = '', items, icons = defaultStateIcons.badge } = $props()
</script>

<div data-validation-report-root class={classes} role="status">
	{#each items as { text, status }, index (index)}
		<div data-validation-item data-status={status}>
			<Icon name={icons[status]} />
			<p>{text}</p>
		</div>
	{/each}
</div>
