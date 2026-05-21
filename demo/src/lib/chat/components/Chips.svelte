<script lang="ts">
	interface ChipItem {
		label?: string
		icon?: string
		[k: string]: unknown
	}

	interface ChipFields {
		label?: string
		icon?: string
	}

	interface ChipsProps {
		/** Array of chip data */
		items: ChipItem[]
		/** Field mapping — `label` and `icon` keys point at the property in each item */
		fields?: ChipFields
		/** Fires when a chip is clicked with the chip item */
		onselect?: (item: ChipItem) => void
		/** Visual variant — `solid` adds a dashed border + paper background */
		variant?: 'default' | 'solid'
	}

	const {
		items = [],
		fields = {},
		onselect,
		variant = 'default'
	}: ChipsProps = $props()

	const labelKey = $derived(fields.label ?? 'label')
	const iconKey = $derived(fields.icon ?? 'icon')
</script>

<div data-chips data-variant={variant}>
	{#each items as item, i (i)}
		{@const label = item[labelKey] as string | undefined}
		{@const icon = item[iconKey] as string | undefined}
		<button
			type="button"
			data-chip
			onclick={() => onselect?.(item)}
		>
			{#if icon}
				<span data-chip-icon class={icon} aria-hidden="true"></span>
			{/if}
			<span data-chip-label>{label}</span>
		</button>
	{/each}
</div>
