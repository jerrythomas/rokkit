<script>
	/**
	 * Renders an array of objects as a styled list.
	 */
	import DisplayValue from './DisplayValue.svelte'

	let {
		data = [],
		fields = [],
		title,
		class: className = ''
	} = $props()
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
