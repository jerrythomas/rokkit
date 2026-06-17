<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements'

	type Props = Omit<HTMLInputAttributes, 'value' | 'onchange'> & {
		value?: number
		onchange?: (value: number) => void
	}

	let {
		value = $bindable(),
		min = undefined,
		max = undefined,
		step = undefined,
		list = undefined,
		required,
		disabled,
		name,
		id,
		onchange,
		onfocus,
		onblur,
		...rest
	}: Props = $props()

	function handleChange(event: Event & { currentTarget: HTMLInputElement }) {
		value = event.currentTarget.valueAsNumber
		onchange?.(value)
	}
</script>

<input
	bind:value
	type="range"
	{min}
	{max}
	{step}
	{list}
	{required}
	{disabled}
	{name}
	{id}
	onchange={handleChange}
	{onfocus}
	{onblur}
	{...rest}
/>
