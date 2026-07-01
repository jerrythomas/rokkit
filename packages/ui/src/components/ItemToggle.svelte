<script lang="ts">
	/**
	 * ItemToggle — compact toggle-group renderer for use inside a List / Menu / Tree
	 * item snippet.
	 *
	 * Each option is rendered as `<span role="radio" tabindex="-1">` with its own
	 * click handler. Navigator's `isNestedInteractive` guard defers to these
	 * nested [role="radio"] elements so the row's select flow is NOT triggered
	 * when a user picks an option. Consumers wire the state via `onchange`.
	 *
	 * The wrapping element remains a `<span>` (non-interactive) so it stays legal
	 * inside the parent `<button data-list-item>`.
	 */
	import type { ItemToggleProps, ItemToggleOption } from '../types/item-toggle.js'
	import ItemContent from './ItemContent.svelte'

	const {
		proxy,
		field = 'value',
		optionsField = 'options',
		onchange,
		size = 'md',
		showIcon = true,
		showSubtext = true,
		showLabels = true,
		class: className
	}: ItemToggleProps = $props()

	const options = $derived<ItemToggleOption[]>(
		Array.isArray(proxy.get(optionsField)) ? (proxy.get(optionsField) as ItemToggleOption[]) : []
	)
	const currentValue = $derived(proxy.get(field))

	function extractValue(opt: ItemToggleOption): unknown {
		if (opt && typeof opt === 'object') {
			const o = opt as { value?: unknown }
			return 'value' in o ? o.value : opt
		}
		return opt
	}

	function extractLabel(opt: ItemToggleOption): string {
		if (opt && typeof opt === 'object') {
			const o = opt as { label?: string; value?: unknown }
			if (o.label !== undefined && o.label !== null) return String(o.label)
			return String(extractValue(opt))
		}
		return String(opt)
	}

	function extractIcon(opt: ItemToggleOption): string | undefined {
		if (opt && typeof opt === 'object') {
			const o = opt as { icon?: string }
			return o.icon
		}
		return undefined
	}

	function handleClick(event: MouseEvent, opt: ItemToggleOption) {
		event.stopPropagation()
		const value = extractValue(opt)
		if (value === currentValue) return
		onchange?.(value, opt, proxy)
	}
</script>

<ItemContent {proxy} {showIcon} {showSubtext} />
<span
	data-item-toggle
	data-item-toggle-size={size}
	role="radiogroup"
	class={className || undefined}
>
	{#each options as opt (extractValue(opt))}
		{@const value = extractValue(opt)}
		{@const label = extractLabel(opt)}
		{@const icon = extractIcon(opt)}
		{@const selected = value === currentValue}
		<span
			data-item-toggle-option
			data-selected={selected || undefined}
			role="radio"
			tabindex="-1"
			aria-checked={selected}
			aria-label={label}
			onclick={(event) => handleClick(event, opt)}
			onkeydown={(event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					event.stopPropagation()
					handleClick(event as unknown as MouseEvent, opt)
				}
			}}
		>
			{#if icon}
				<span data-item-toggle-icon class={icon} aria-hidden="true"></span>
			{/if}
			{#if showLabels}
				<span data-item-toggle-label>{label}</span>
			{/if}
		</span>
	{/each}
</span>
