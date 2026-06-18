<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'
	import { isNil } from 'ramda'

	type StateIcons = {
		checked?: string
		unchecked?: string
		unknown?: string
	}

	type Props = Omit<HTMLInputAttributes, 'value' | 'onchange'> & {
		value?: boolean | null
		variant?: 'default' | 'custom'
		icons?: StateIcons
		onchange?: (value: boolean) => void
	}

	let {
		value = $bindable(),
		variant = 'custom',
		icons,
		onchange,
		onfocus,
		onblur,
		required,
		disabled,
		name,
		id,
		...rest
	}: Props = $props()

	function handleChange(event: Event & { currentTarget: HTMLInputElement }) {
		value = Boolean(event.currentTarget.checked)
		onchange?.(value)
	}

	function toggle() {
		value = !value
		onchange?.(value)
	}

	let checked = $derived(Boolean(value))
	let stateIcons = $derived({ ...DEFAULT_STATE_ICONS.checkbox, ...icons })
	let icon = $derived(stateIcons[isNil(value) ? 'unknown' : value ? 'checked' : 'unchecked'])
</script>

<div data-checkbox-root data-variant={variant}>
	<input
		type="checkbox"
		hidden={variant !== 'default'}
		{required}
		{disabled}
		{name}
		{id}
		{checked}
		onchange={handleChange}
		{onfocus}
		{onblur}
		{...rest}
	/>
	{#if variant !== 'default'}
		<span
			class={icon}
			data-checkbox-icon
			role="button"
			tabindex="0"
			onclick={toggle}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && toggle()}
			aria-hidden="true"
		></span>
	{/if}
</div>
