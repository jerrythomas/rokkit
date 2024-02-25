export const data = [
	{
		level: 'make',
		name: 'Toyota',
		unitsSold: 260, // Aggregated sum for Toyota
		mpg: 33, // Aggregated average for Toyota
		capacity: 5, // Aggregated average for Toyota
		scope: '#/Toyota'
	},
	{
		level: 'model',
		name: 'Camry',
		unitsSold: 100,
		mpg: 30,
		capacity: 5,
		scope: '#/Toyota/Camry'
	},
	{
		level: 'model',
		name: 'Corolla',
		unitsSold: 80,
		mpg: 33.5, // Average of 35, 32
		capacity: 5,
		scope: '#/Toyota/Corolla'
	},
	{
		level: 'variant',
		name: 'LE',
		unitsSold: 40,
		mpg: 32,
		capacity: 5,
		scope: '#/Toyota/Corolla/LE'
	},
	{
		level: 'variant',
		name: 'SE',
		unitsSold: 40,
		mpg: 32,
		capacity: 5,
		scope: '#/Toyota/Corolla/SE'
	},
	{
		level: 'make',
		name: 'Ford',
		unitsSold: 200, // Aggregated sum for Ford
		mpg: 32.5, // Aggregated average for Ford
		capacity: 5, // Aggregated average for Ford
		scope: '#/Ford'
	},
	{
		level: 'model',
		name: 'Fusion',
		unitsSold: 200, // Sum of 120, 80
		mpg: 32.5, // Average of 25, 40
		capacity: 5,
		scope: '#/Ford/Fusion'
	},
	{
		level: 'variant',
		name: 'Hybrid',
		unitsSold: 80,
		mpg: 40,
		capacity: 5,
		scope: '#/Ford/Fusion/Hybrid'
	}
]
