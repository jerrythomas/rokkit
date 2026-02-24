<script>
	import { List } from '@rokkit/ui'

	let items = $state([
		{
			text: 'Fruits',
			icon: 'i-lucide:apple',
			children: [
				{ text: 'Apple' },
				{ text: 'Banana' },
				{ text: 'Cherry' }
			]
		},
		{
			text: 'Vegetables',
			icon: 'i-lucide:carrot',
			children: [
				{ text: 'Carrot' },
				{ text: 'Broccoli' },
				{ text: 'Spinach' }
			]
		},
		{
			text: 'Grains',
			icon: 'i-lucide:wheat',
			children: [
				{ text: 'Rice' },
				{ text: 'Wheat' },
				{ text: 'Oats' }
			]
		}
	])
	let value = $state(null)
</script>

<List bind:items bind:value />

{#if value}
	<p class="text-surface-z7 mt-4 text-sm">
		Selected: <strong>{value.text ?? value}</strong>
	</p>
{/if}

<p class="text-surface-z6 mt-2 text-sm">
	Click a group to expand or collapse it. Arrow keys navigate through items; left/right
	collapse/expand groups.
</p>
