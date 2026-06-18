<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'

	type Props = Omit<HTMLInputAttributes, 'value' | 'onchange'> & {
		value?: string
		onchange?: (value: string) => void
	}

	let {
		value = $bindable(),
		onchange,
		onfocus,
		onblur,
		placeholder,
		required,
		disabled,
		readonly,
		name,
		id,
		autocomplete,
		maxlength,
		minlength,
		pattern,
		size,
		multiple,
		...rest
	}: Props = $props()

	function handleChange(event: Event & { currentTarget: HTMLInputElement }) {
		value = event.currentTarget.value
		onchange?.(value)
	}
</script>

<input
	bind:value
	type="email"
	{placeholder}
	{required}
	{disabled}
	{readonly}
	{name}
	{id}
	{autocomplete}
	{maxlength}
	{minlength}
	{pattern}
	{size}
	{multiple}
	onchange={handleChange}
	{onfocus}
	{onblur}
	{...rest}
/>
