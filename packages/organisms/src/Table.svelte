<script>
	// import { createEventDispatcher } from 'svelte'
	// import { pick, omit } from 'ramda'
	import { isObject } from '@rokkit/core'
	// import { Connector, Icon } from '@rokkit/atoms'
	// import { Item } from '@rokkit/molecules'

	// const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	/** @type {Array<Object>} */
	export let data = []
	/** @type {Array<string>} */
	export let columns = []
	// export let striped = true
	// export let value = null
	// export let multiselect = false
	// export let using = {}
	// export let dataFilter = () => true

	let width

	$: columns = data.length == 0 ? [] : columns.length == 0 ? Object.keys(data[0]) : columns
</script>

<div class="overflow-x">
	<table class="w-full {className}">
		<thead class="w-full" {width}>
			<tr class="bg-neutral-inset upper text-neutral-800">
				{#each columns as column}
					{@const title = isObject(column) ? column.label ?? column.key : column}
					<th class="px-4 h-10">{title}</th>
				{/each}
			</tr>
		</thead>
		<tbody class="w-full overflow-y-scroll" bind:clientWidth={width}>
			{#each data as row}
				<tr class="border border-neutral-inset w-full gap-1px p-1px">
					{#each columns as column}
						<td class="px-4 h-10">{row[column]}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
