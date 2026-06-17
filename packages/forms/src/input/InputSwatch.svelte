<script lang="ts">
	import { Swatch } from '@rokkit/ui'

	type Props = {
		value?: unknown
		options?: Array<string | number | Record<string, unknown>>
		fields?: Record<string, string>
		multiple?: boolean
		shape?: 'square' | 'circle'
		size?: 'sm' | 'md' | 'lg'
		disabled?: boolean
		onchange?: (value: unknown, item: unknown) => void
	}

	let {
		value = $bindable(),
		options = [],
		fields,
		multiple = false,
		shape = 'square',
		size = 'md',
		disabled = false,
		onchange,
		..._rest
	}: Props = $props()
</script>

<Swatch {options} {fields} bind:value {multiple} {shape} {size} {disabled} {onchange} />
