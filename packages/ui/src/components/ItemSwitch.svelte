<script lang="ts">
	/**
	 * ItemSwitch — inert switch-shaped renderer for use inside a List / Menu / Tree
	 * item snippet.
	 *
	 * Renders `<ItemContent>` for the label / icon and then a purely visual switch
	 * (span-based, aria-hidden) that reflects the item's boolean state via
	 * `aria-checked`. Because nothing interactive is nested inside the parent
	 * `<button data-list-item>`, the HTML parser leaves the markup intact and the
	 * whole row remains a single click target — clicking the row triggers the
	 * parent's `onselect` flow, which the consumer uses to flip the state.
	 */
	import type { ItemSwitchProps } from '../types/item-switch.js'
	import ItemContent from './ItemContent.svelte'

	const {
		proxy,
		field = 'checked',
		size = 'md',
		showIcon = true,
		showSubtext = true,
		class: className
	}: ItemSwitchProps = $props()

	const checked = $derived(Boolean(proxy.get(field)))
</script>

<ItemContent {proxy} {showIcon} {showSubtext} />
<span
	data-item-switch
	data-switch
	data-switch-size={size}
	aria-checked={checked}
	aria-hidden="true"
	class={className || undefined}
>
	<span data-switch-track>
		<span data-switch-thumb></span>
	</span>
</span>
