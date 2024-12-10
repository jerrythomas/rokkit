<script>
	import { defaultStateIcons } from '@rokkit/core'
	import { Icon } from '@rokkit/atoms'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} items
	 * @property {any} [icons]
	 */

	/** @type {Props} */
	let { class: className = '', items, icons = defaultStateIcons.badge } = $props()
</script>

<status-report class="flex flex-col {className}">
	{#each items as { text, status }}
		<message class="flex gap-2 {status}">
			<Icon name={icons[status]} />
			<p>{text}</p>
		</message>
	{/each}
</status-report>
