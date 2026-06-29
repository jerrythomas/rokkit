<script lang="ts">
	import Swatch from '../src/components/Swatch.svelte'

	let {
		options = [],
		fields,
		value = $bindable<unknown>(undefined),
		multiple = false,
		shape = 'square',
		size = 'md',
		disabled = false,
		label = 'Select',
		class: className = '',
		onchange
	}: {
		options?: unknown[]
		fields?: Record<string, string>
		value?: unknown
		multiple?: boolean
		shape?: 'square' | 'circle'
		size?: 'sm' | 'md' | 'lg'
		disabled?: boolean
		label?: string
		class?: string
		onchange?: (value: unknown, item: unknown) => void
	} = $props()
</script>

<Swatch {options} {fields} bind:value {multiple} {shape} {size} {disabled} {label} class={className} {onchange} />
