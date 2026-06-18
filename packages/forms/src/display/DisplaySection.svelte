<script lang="ts">
	/**
	 * Renders an object as key-value pairs (detail/summary view).
	 */
	import DisplayValue from './DisplayValue.svelte'

	type DisplayField = {
		key: string
		label?: string
		format?: string
	}

	type Props = {
		data?: Record<string, unknown>
		fields?: DisplayField[]
		title?: string
	}

	let { data = {}, fields = [], title }: Props = $props()
</script>

<div data-display-section>
	{#if title}
		<div data-display-title>{title}</div>
	{/if}
	{#each fields as field (field.key)}
		<div data-display-field>
			<span data-display-label>{field.label ?? field.key}</span>
			<DisplayValue value={data[field.key]} format={field.format} />
		</div>
	{/each}
</div>
