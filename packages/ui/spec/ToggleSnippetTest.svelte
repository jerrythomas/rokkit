<script lang="ts">
	import Toggle from '../src/components/Toggle.svelte'

	const {
		options = [],
		fields,
		value,
		onchange
	}: {
		options?: unknown[]
		fields?: Record<string, string>
		value?: unknown
		onchange?: (value: unknown, item: unknown) => void
	} = $props()
</script>

<Toggle {options} {fields} {value} {onchange}>
	{#snippet itemContent(proxy, selected)}
		<span
			data-custom-toggle-item
			data-item-value={proxy.get('value')}
			data-selected={selected || undefined}
		>
			Custom: {proxy.label}
		</span>
	{/snippet}
</Toggle>
