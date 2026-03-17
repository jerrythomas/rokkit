<script>
	// @ts-nocheck
	import { List } from '@rokkit/ui'

	const items = [
		{
			label: 'Fruits',
			icon: 'i-glyph:leaf',
			children: [{ label: 'Apple' }, { label: 'Banana' }, { label: 'Cherry' }]
		},
		{
			label: 'Vegetables',
			icon: 'i-glyph:leaf',
			children: [{ label: 'Carrot' }, { label: 'Broccoli' }, { label: 'Spinach' }]
		},
		{
			label: 'Grains',
			icon: 'i-glyph:leaf',
			children: [{ label: 'Rice' }, { label: 'Wheat' }, { label: 'Oats' }]
		}
	]
	let value = $state(null)
</script>

<List {items} collapsible bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z7 mt-4 text-sm">
		Selected: <strong>{value.label ?? value}</strong>
	</p>
{/if}
