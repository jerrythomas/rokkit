<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'

	type Props = Omit<HTMLInputAttributes, 'value' | 'onchange'> & {
		value?: FileList | null
		onchange?: (value: FileList | null) => void
	}

	let {
		value = $bindable(),
		onchange,
		onfocus,
		onblur,
		accept,
		multiple,
		required,
		disabled,
		name,
		id,
		...rest
	}: Props = $props()

	function handleChange(event: Event & { currentTarget: HTMLInputElement }) {
		value = event.currentTarget.files
		onchange?.(value)
	}
</script>

<input
	type="file"
	{accept}
	{multiple}
	{required}
	{disabled}
	{name}
	{id}
	onchange={handleChange}
	{onfocus}
	{onblur}
	{...rest}
/>
