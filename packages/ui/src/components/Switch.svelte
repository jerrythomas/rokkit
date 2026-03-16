<script lang="ts">
	import type { SwitchProps, SwitchItem } from '../types/switch.js'
	import { ProxyItem } from '@rokkit/states'

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

	let offProxy = $derived(new ProxyItem(options[0], userFields))
	let onProxy = $derived(new ProxyItem(options[1], userFields))
	let isChecked = $derived(value === onProxy.value)
	let currentProxy = $derived(isChecked ? onProxy : offProxy)

	function toggle() {
		if (disabled) return
		const next = isChecked ? offProxy : onProxy
		const nextValue = next.value
		value = nextValue
		onchange?.(nextValue, next.original as SwitchItem)
	}

	function shouldToggle(key: string): boolean {
		if (key === ' ' || key === 'Enter') return true
		if (key === 'ArrowRight') return !isChecked
		if (key === 'ArrowLeft') return isChecked
		return false
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (disabled) return
		if (shouldToggle(event.key)) {
			event.preventDefault()
			toggle()
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
	aria-label={currentProxy.label || undefined}
	title={currentProxy.get('subtext') ?? currentProxy.label ?? undefined}
	{disabled}
	class={className || undefined}
	onclick={toggle}
	onkeydown={handleKeyDown}
>
	<span data-switch-track>
		<span data-switch-thumb>
			{#if currentProxy.get('icon')}
				<span data-switch-icon class={currentProxy.get('icon')} aria-hidden="true"></span>
			{/if}
		</span>
	</span>
	{#if showLabels && currentProxy.label}
		<span data-switch-label>{currentProxy.label}</span>
	{/if}
</button>
