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

<rk-status-report class={classes}>
	{#each items as { text, status }, index (index)}
		<rk-message class={status}>
			<Icon name={icons[status]} />
			<p>{text}</p>
		</rk-message>
	{/each}
</rk-status-report>
