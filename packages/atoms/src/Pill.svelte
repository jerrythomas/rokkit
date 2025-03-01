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

	/** @type {Props} */
	let {
		value,
		class: classes = '',
		mapping = new FieldMapper(),
		removable = false,
		disabled = false,
		onremove = noop
	} = $props()

	const keyMappings = {
		remove: ['Delete', 'Backspace']
	}

	function handle(event) {
		if (!disabled) onremove(value)
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<rk-pill use:keyboard={keyMappings} onremove={handle} tabindex="0" class={classes}>
	<Item {value} {mapping}></Item>
	{#if removable}
		<Icon name="action-close" role="button" aria-label="Remove" {disabled} onclick={handle} small
		></Icon>
	{/if}
</rk-pill>
