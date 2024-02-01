import { equals } from 'ramda'

export function combine(dataArray) {
	let paths = [...new Set([...dataArray.map(({ data }) => Object.keys(data))].flat())]
	let data = paths
		.map((scope) => ({
			scope,
			key: scope.split('/').pop(),
			instances: dataArray.map((dataItem) => ({
				type: dataItem.data[scope]?.type,
				value: dataItem.data[scope]?.value
			}))
		}))
		.map(compareItem)
	return data
}

export function compareItem(item) {
	let instances = item.instances
	let type_diff = instances.slice(1).some((instance) => instance.type !== instances[0].type)
	let value_diff = instances
		.slice(1)
		.some((instance) => !equals(instance.value, instances[0].value))
	let flat_props = Object.fromEntries(
		instances
			.map((instance, index) => [
				[`${index}_type`, 'type-' + instance.type],
				[`${index}_value`, ['array', 'object'].includes(instance.type) ? '...' : instance.value]
			])
			.flat()
	)
	delete item.instances

	return {
		...item,
		...flat_props,
		type_diff,
		value_diff
	}
}
export function getColumns(dataArray) {
	// Generate columns based on input data
	let columns = dataArray.map((dataItem, index) => ({
		key: `${index}_value`,
		label: dataItem.label,
		fields: { text: `${index}_value`, icon: `${index}_type` }
	}))

	// Add path column
	columns.unshift({
		key: 'scope',
		label: 'path',
		width: '2fr',
		fields: { text: 'key' },
		path: true
	})

	return columns
}
