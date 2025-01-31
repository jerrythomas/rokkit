import { alpha, beta, charlie, delta, echo, foxtrot } from './raw'
const lookup = {
	1: 'One',
	2: 'Two',
	3: 'Three'
}

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
