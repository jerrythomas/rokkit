const alpha = {
	id: 1,
	name: 'Alpha',
	lookup_id: 1
}
const beta = {
	id: 2,
	name: 'Beta',
	lookup_id: 1
}
const charlie = {
	id: 3,
	name: 'Charlie',
	lookup_id: 1
}
const delta = {
	id: 4,
	name: 'Delta',
	lookup_id: 2
}
const echo = {
	id: 5,
	name: 'Echo',
	lookup_id: 2
}
const foxtrot = {
	id: 6,
	name: 'Foxtrot',
	lookup_id: 2
}

const start = [charlie, beta]
const additions = [
	{
		item: alpha,
		result: {
			data: {
				unsorted: [charlie, beta, alpha],
				sorted: [alpha, beta, charlie]
			},
			grouped: {
				unsorted: [{ key: '1', name: 'One', data: [charlie, beta, alpha] }],
				sorted: [{ key: '1', name: 'One', data: [alpha, beta, charlie] }]
			}
		}
	},
	{
		item: foxtrot,
		result: {
			data: {
				unsorted: [charlie, beta, alpha, foxtrot],
				sorted: [alpha, beta, charlie, foxtrot]
			},
			grouped: {
				unsorted: [
					{ key: '1', name: 'One', data: [charlie, beta, alpha] },
					{ key: '2', name: 'Two', data: [foxtrot] }
				],
				sorted: [
					{ key: '1', name: 'One', data: [alpha, beta, charlie] },
					{ key: '2', name: 'Two', data: [foxtrot] }
				]
			}
		}
	}
]

export default { start, additions }
