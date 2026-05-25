<script lang="ts">
	interface ChipItem {
		label?: string
		icon?: string
		active?: boolean
		[k: string]: unknown
	}

	interface ChipFields {
		label?: string
		icon?: string
		active?: string
	}

	interface ChipsProps {
		/** Array of chip data */
		items: ChipItem[]
		/** Field mapping — keys point at properties in each item */
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
	const activeKey = $derived(fields.active ?? 'active')
</script>

<div data-chips data-variant={variant}>
	{#each items as item, i (i)}
		{@const label = item[labelKey] as string | undefined}
		{@const icon = item[iconKey] as string | undefined}
		{@const active = item[activeKey] === true}
		<button
			type="button"
			data-chip
			data-active={active || undefined}
			onclick={() => onselect?.(item)}
		>
			{#if icon}
				<span data-chip-icon class={icon} aria-hidden="true"></span>
			{/if}
			<span data-chip-label>{label}</span>
			{#if active}
				<span data-chip-clear aria-hidden="true">·&nbsp;clear</span>
			{/if}
		</button>
	{/each}
</div>
