/**
 * @typedef Column
 * @property {string} name
 * @property {string} label
 * @property {boolean} [hidden]
 * @property {boolean} [header]
 * @property {boolean} [virtual]
 * @property {boolean} [sortable]
 * @property {string} [order]
 * @property {string} [action]
 * @property {string} [type]
 * @property {string} [formatter]
 * @property {string} [align]
 */
export async function load() {
	let data = [
		{ product: 'Apple MacBook Pro 17', color: 'silver', category: 'Laptop', price: '$2999' },
		{ product: 'Microsoft Surface Pro', color: 'white', category: 'Laptop', price: '$1999' },
		{ product: 'Dell XPS 13', color: 'black', category: 'Laptop', price: '$1499' }
	]
	return {
		// data: generateIndex(combine(flat)),
		// columns: getColumns(flat)
		data,
		columns: [
			{ name: 'id', label: 'ID', hidden: true },
			{ name: 'product', label: 'Product Name', header: true },
			{ name: 'color', label: 'Color', sortable: true, order: 'ascending' },
			{ name: 'category', label: 'Category', sortable: true, order: 'descending' },
			{ name: 'price', label: 'Price', sortable: true, order: 'asc' },
			{ name: 'action', virtual: true, label: 'Action', action: 'edit' }
		]
	}
}
