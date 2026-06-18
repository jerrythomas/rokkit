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
		required,
		disabled,
		name,
		id,
		autocomplete,
		...rest
	}: Props = $props()

	function handleChange(event: Event & { currentTarget: HTMLInputElement }) {
		value = event.currentTarget.value
		onchange?.(value)
	}
</script>

<input
	bind:value
	type="color"
	{required}
	{disabled}
	{name}
	{id}
	{autocomplete}
	onchange={handleChange}
	{onfocus}
	{onblur}
	{...rest}
/>
