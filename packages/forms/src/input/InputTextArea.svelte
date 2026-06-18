<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements'

	type Props = Omit<HTMLTextareaAttributes, 'value' | 'onchange'> & {
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
		rows,
		cols,
		maxlength,
		minlength,
		wrap,
		...rest
	}: Props = $props()

	function handleChange(event: Event & { currentTarget: HTMLTextAreaElement }) {
		value = event.currentTarget.value
		onchange?.(value)
	}
</script>

<textarea
	bind:value
	{placeholder}
	{required}
	{disabled}
	{readonly}
	{name}
	{id}
	{rows}
	{cols}
	{maxlength}
	{minlength}
	{wrap}
	onchange={handleChange}
	{onfocus}
	{onblur}
	{...rest}
></textarea>
