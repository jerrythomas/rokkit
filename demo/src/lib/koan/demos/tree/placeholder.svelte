<script lang="ts">
	import { Tree } from '@rokkit/ui'

	const items = [
		{
			name: 'src',
			id: 'src',
			children: [
				{ name: 'components', id: 'components', children: [
					{ name: 'Button.svelte', id: 'button' },
					{ name: 'Input.svelte', id: 'input' }
				]},
				{ name: 'utilities', id: 'utilities', children: [
					{ name: 'format.ts', id: 'format' },
					{ name: 'parse.ts', id: 'parse' }
				]}
			]
		}
	]

	const fields = { label: 'name', value: 'id' }
	let value = $state<unknown>(null)
</script>

<Tree {items} {fields} bind:value />
