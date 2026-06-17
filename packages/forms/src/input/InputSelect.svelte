<script lang="ts">
	import { Select } from '@rokkit/ui'

	type Option = string | Record<string, unknown>

	type Props = {
		value?: unknown
		fields?: Record<string, string>
		options?: Option[]
		placeholder?: string
		disabled?: boolean
		size?: 'sm' | 'md' | 'lg'
		onchange?: (value: unknown, item: unknown) => void
	}

	let {
		value = $bindable(),
		fields,
		options = [],
		placeholder,
		disabled = false,
		size,
		onchange,
		..._rest
	}: Props = $props()

	function isEmptyOption(opt: Option): boolean {
		return opt === '' || (typeof opt === 'object' && opt?.value === '')
	}

	// Check if options include an empty string (used as "none" option)
	const hasEmptyOption = $derived(options.some(isEmptyOption))

	// Filter out empty strings — Select + ProxyItem handles string options natively
	const filteredOptions = $derived(
		hasEmptyOption ? options.filter((opt) => !isEmptyOption(opt)) : options
	)

	// Use placeholder for empty option, or provide a default clear label
	const effectivePlaceholder = $derived(hasEmptyOption ? placeholder || 'None' : placeholder)
</script>

<Select
	items={filteredOptions}
	{fields}
	bind:value
	placeholder={effectivePlaceholder}
	{disabled}
	{size}
	{onchange}
/>
