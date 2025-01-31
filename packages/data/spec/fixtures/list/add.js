import { alpha, beta, charlie, foxtrot } from './raw'

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
