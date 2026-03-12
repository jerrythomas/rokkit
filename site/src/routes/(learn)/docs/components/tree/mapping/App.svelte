<script>
	// @ts-nocheck
	import { Tree } from '@rokkit/ui'

	const items = [
		{
			name: 'Components',
			id: 'components',
			children: [
				{ name: 'Button', id: 'btn' },
				{ name: 'Input', id: 'input' }
			]
		},
		{
			name: 'Utilities',
			id: 'utils',
			children: [
				{ name: 'Format', id: 'format' },
				{ name: 'Parse', id: 'parse' }
			]
		}
	]

	const fields = { label: 'name', value: 'id' }
	let value = $state(null)
</script>

<Tree {items} {fields} bind:value onselect={(v) => (value = v)} />

{#if value}
	<p class="text-surface-z6 mt-3 text-sm">Selected ID: <strong>{value}</strong></p>
{/if}
