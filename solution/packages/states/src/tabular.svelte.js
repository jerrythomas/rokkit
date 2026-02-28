export class TableWrapper {
	data = null
	headers = $state([])

	constructor(items) {
		this.data = items
	}
}
