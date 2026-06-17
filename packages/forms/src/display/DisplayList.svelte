<script lang="ts">
	/**
	 * Renders an array of objects as a styled list.
	 */
	import DisplayValue from './DisplayValue.svelte'

	type DisplayField = {
		key: string
		label?: string
		format?: string
	}

	type Props = {
		data?: Array<Record<string, unknown>>
		fields?: DisplayField[]
		title?: string
		class?: string
	}

	let { data = [], fields = [], title, class: className = '' }: Props = $props()
</script>

<div data-display-list class={className}>
	{#if title}
		<div data-display-title>{title}</div>
	{/if}
	<ul>
		{#each data as item, index (index)}
			<li data-display-list-item>
				{#each fields as field (field.key)}
					<span data-display-field>
						<span data-display-label>{field.label ?? field.key}</span>
						<DisplayValue value={item[field.key]} format={field.format} />
					</span>
				{/each}
			</li>
		{/each}
	</ul>
</div>
