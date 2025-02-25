import { FieldMapper } from '@rokkit/core'
import { SvelteSet } from 'svelte/reactivity'

export class DataWrapper {
	items = $state([])
	mapping = new FieldMapper()
	data = $state([])
	current = $state(null)
	selected = new SvelteSet()

	constructor(items, mapping) {
		this.items = items
		this.mapping = mapping
		this.items.forEach((item) => {
			this.data.push({ item, selected: false })
		})
	}
}
