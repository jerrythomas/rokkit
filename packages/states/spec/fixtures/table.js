export const sampleData = [
	// Root level entries
	{ path: '/sales', count: 100, value: 1234.56, status: 'active', createDate: '2023-01-01' },
	{ path: '/marketing', count: 50, value: 567.89, status: 'active', createDate: '2023-01-02' },

	// Second level entries with their parents
	{ path: '/sales', count: 100, value: 1234.56, status: 'active', createDate: '2023-01-01' },
	{ path: '/sales/north', count: 45, value: 456.78, status: 'pending', createDate: '2023-02-01' },
	{ path: '/sales/south', count: 55, value: 789.12, createDate: '2023-02-02' }, // sparse status

	{ path: '/marketing', count: 50, value: 567.89, status: 'active', createDate: '2023-01-02' },
	{ path: '/marketing/digital', value: 234.56, status: 'active', createDate: '2023-03-01' }, // sparse count

	// Third level entries with their parent chain
	{ path: '/sales/north', count: 45, value: 456.78, status: 'pending', createDate: '2023-02-01' },
	{
		path: '/sales/north/retail',
		count: 30,
		value: 345.67,
		status: 'active',
		createDate: '2023-04-01'
	},

	// Entry without path
	{ count: 10, value: 123.45, status: 'inactive', createDate: '2023-05-01' }
]
