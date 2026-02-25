<script lang="ts">
	import type { SwitchProps, SwitchItem } from '../types/switch.js'
	import { ItemProxy } from '../types/item-proxy.js'

	const DEFAULT_OPTIONS: [SwitchItem, SwitchItem] = [false, true]

	let {
		options = DEFAULT_OPTIONS,
		fields: userFields,
		value = $bindable(),
		onchange,
		showLabels = false,
		size = 'md',
		disabled = false,
		class: className = ''
	}: SwitchProps = $props()

	let offProxy = $derived(new ItemProxy(options[0] as Record<string, unknown>, userFields))
	let onProxy = $derived(new ItemProxy(options[1] as Record<string, unknown>, userFields))
	let isChecked = $derived(value === onProxy.itemValue)
	let currentProxy = $derived(isChecked ? onProxy : offProxy)

	function toggle() {
		if (disabled) return
		const next = isChecked ? offProxy : onProxy
		const nextValue = next.itemValue
		value = nextValue
		onchange?.(nextValue, next.original as SwitchItem)
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled) return
		switch (event.key) {
			case ' ':
			case 'Enter':
				event.preventDefault()
				toggle()
				break
			case 'ArrowRight':
				event.preventDefault()
				if (!isChecked) toggle()
				break
			case 'ArrowLeft':
				event.preventDefault()
				if (isChecked) toggle()
				break
		}
	}
</script>

<button
	type="button"
	role="switch"
	data-switch
	data-switch-size={size}
	data-switch-disabled={disabled || undefined}
	aria-checked={isChecked}
	aria-label={currentProxy.text || undefined}
	title={currentProxy.description ?? currentProxy.text ?? undefined}
	{disabled}
	class={className || undefined}
	onclick={toggle}
	onkeydown={handleKeyDown}
>
	<span data-switch-track>
		<span data-switch-thumb>
			{#if currentProxy.icon}
				<span data-switch-icon class={currentProxy.icon} aria-hidden="true"></span>
			{/if}
		</span>
	</span>
	{#if showLabels && currentProxy.text}
		<span data-switch-label>{currentProxy.text}</span>
	{/if}
</button>
