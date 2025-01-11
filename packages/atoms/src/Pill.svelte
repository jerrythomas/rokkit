<script>
	import { FieldMapper, noop } from '@rokkit/core'
	import Item from './Item.svelte'
	import Icon from './Icon.svelte'
	import { keyboard } from '@rokkit/actions'

	/**
	 * @type {Object} Props
	 * @property {string|Object} [value]
	 * @property {FieldMapper}   [mapping]
	 * @property {boolean} [removable]
	 * @property {boolean} [disabled]
	 */
	let {
		value,
		mapping = new FieldMapper(),
		removable = false,
		disabled = false,
		onremove = noop
	} = $props()
	const keyMappings = {
		remove: ['Delete', 'Backspace']
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rkt-pill use:keyboard={keyMappings} onremove={() => onremove(value)} tabindex="0">
	<Item {value} {mapping}></Item>
	{#if removable}
		<button {disabled} onclick={() => onremove(value)}>
			<Icon name="remove" />
		</button>
	{/if}
</rkt-pill>
