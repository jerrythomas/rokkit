const lookup = {
	1: 'One',
	2: 'Two',
	3: 'Three'
}

const alpha = { id: 1, name: 'Alpha', lookup_id: 1 }
const beta = { id: 2, name: 'Beta', lookup_id: 1 }
const charlie = { id: 3, name: 'Charlie', lookup_id: 1 }
const delta = { id: 4, name: 'Delta', lookup_id: 2 }
const echo = { id: 5, name: 'Echo', lookup_id: 2 }
const foxtrot = { id: 6, name: 'Foxtrot', lookup_id: 2 }

const items = [alpha, beta, charlie, delta, echo, foxtrot]

const start = [charlie, beta, alpha, foxtrot, delta, echo]

const removals = [
	{
		item: alpha,
		result: {
			data: {
				unsorted: [charlie, beta, foxtrot, delta, echo],
				sorted: [beta, charlie, delta, echo, foxtrot]
			},
			grouped: {
				unsorted: [
					{
						key: '1',
						name: 'One',
						data: [charlie, beta]
					},
					{
						key: '2',
						name: 'Two',
						data: [foxtrot, delta, echo]
					}
				],
				sorted: [
					{
						key: '1',
						name: 'One',
						data: [beta, charlie]
					},
					{
						key: '2',
						name: 'Two',
						data: [delta, echo, foxtrot]
					}
				]
			}
		}
	},
	{
		item: delta,
		result: {
			data: {
				unsorted: [charlie, beta, foxtrot, echo],
				sorted: [beta, charlie, echo, foxtrot]
			},
			grouped: {
				unsorted: [
					{
						key: '1',
						name: 'One',
						data: [charlie, beta]
					},
					{
						key: '2',
						name: 'Two',
						data: [foxtrot, echo]
					}
				],
				sorted: [
					{
						key: '1',
						name: 'One',
						data: [beta, charlie]
					},
					{
						key: '2',
						name: 'Two',
						data: [echo, foxtrot]
					}
				]
			}
		}
	}
]

export default { lookup, items, start, removals }
