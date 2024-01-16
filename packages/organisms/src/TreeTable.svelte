<script>
	import { pick } from 'ramda'
	import { defaultFields } from '@rokkit/core'
	import { Connector, Icon } from '@rokkit/atoms'
	import { Item } from '@rokkit/molecules'

	export let data = []
	export let columns = []
	export let striped = true

	let hiddenPaths = []
	let filtered = data

	function toggle(item) {
		if (nestedColumn === undefined) return

		const parentPath = item[nestedColumn.key] + '/'
		if (item._isParent) {
			item._isExpanded = !item._isExpanded
			if (item._isExpanded) {
				hiddenPaths = [...hiddenPaths.filter((i) => i !== parentPath)]
			} else {
				hiddenPaths = [...hiddenPaths, parentPath]
			}
			filtered = [...data.filter(isVisible)]
		}
	}

	function isVisible(item) {
		if (hiddenPaths.length === 0) return true
		return !hiddenPaths.some((i) => item[nestedColumn.key].startsWith(i))
	}

	$: sizes = columns.map((col) => col.width ?? '1fr').join(' ')
	$: nestedColumn = columns.find((col) => col.path)
</script>

<tree-table class="flex flex-col h-full w-full p-8 overflow-auto" style:--sizes={sizes}>
	<table class="flex flex-col h-full overflow-y-hidden">
		<thead>
			<tr class="grid gap-1px">
				{#each columns as col}
					<th class="bg-neutral-400">{col.label}</th>
				{/each}
			</tr>
		</thead>
		<tbody class="flex flex-col gap-1px overflow-y-auto">
			{#each filtered as item, index}
				{@const even = striped && index % 2 === 0}
				<tr class="grid gap-1px" class:even>
					{#each columns as col}
						{@const value = { ...pick(['icon'], col), ...item }}
						{@const fields = { ...defaultFields, text: col.key, ...col.fields }}
						<td class="flex gap-2 bg-neutral-muted">
							{#if col.path}
								{#each item._levels.slice(0, -1) as _}
									<Connector type="empty" />
								{/each}
								{#if item._isParent}
									<Icon
										name={item._isExpanded ? 'node-opened' : 'node-closed'}
										class="small cursor-pointer"
										on:click={() => toggle(item)}
									/>
								{/if}
							{/if}
							<Item {value} {fields} />
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</tree-table>

<style>
	tr {
		grid-template-columns: var(--sizes);
	}
	tr.even > td {
		@apply bg-neutral-subtle;
	}
	th,
	td {
		@apply px-4 py-4;
	}
	td :global(icon) {
		@apply text-secondary-700;
	}
</style>
