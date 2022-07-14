import { omit, pick } from 'ramda'

export const data = [
	{
		country: 'South Korea',
		name: 'Heeyong Park',
		age: 34,
		score: 180,
		time: 3600,
		rank: 1,
		level: 4
	},
	{
		country: 'Germany',
		name: 'Simon Brunner',
		age: 18,
		score: 180,
		time: 3600,
		rank: 2,
		level: 4
	},
	{
		country: 'Brazil',
		name: 'Ricardo de Oliviera',
		age: 24,
		score: 160,
		time: 93,
		rank: 3,
		level: 3
	},
	{
		country: 'Mexico',
		name: 'Omar Zamitiz',
		age: 36,
		score: 150,
		time: 6,
		rank: 4,
		level: 3
	},
	{
		country: 'Mexico',
		name: 'Matias Chavez',
		age: 29,
		score: 100,
		time: 6,
		rank: 5,
		level: 3
	},
	{
		country: 'Germany',
		name: 'Markus Ertelt',
		age: 37,
		score: 50,
		time: 145,
		rank: 6,
		level: 2
	},
	{
		country: 'United States',
		name: 'Shaun Provost',
		age: 26,
		score: 50,
		time: 200,
		rank: 7,
		level: 2
	},
	{
		country: 'United States',
		name: 'Shinobi Poli',
		age: 31,
		score: 40,
		time: 196,
		rank: 8,
		level: 2
	},
	{
		country: 'Japan',
		name: 'Takehide Sato',
		age: 34,
		score: 40,
		time: 208,
		rank: 9,
		level: 1
	},
	{
		country: 'Japan',
		name: 'Toyohiko Kubota',
		age: 40,
		score: 40,
		time: 188,
		rank: 10,
		level: 1
	},
	{
		country: 'South Korea',
		name: 'Myon Tuk Han',
		age: 33,
		score: 30,
		time: 142,
		rank: 11,
		level: 1
	},
	{
		country: 'Brazil',
		name: 'Karine Abrahim',
		age: 31,
		score: 10,
		time: 18,
		rank: 12,
		level: 1
	}
]

export const byName = [
	{ name: 'Heeyong Park', age: 34, rank: 1 },
	{ name: 'Karine Abrahim', age: 31, rank: 12 },
	{ name: 'Markus Ertelt', age: 37, rank: 6 },
	{ name: 'Matias Chavez', age: 29, rank: 5 },
	{ name: 'Myon Tuk Han', age: 33, rank: 11 },
	{ name: 'Omar Zamitiz', age: 36, rank: 4 },
	{ name: 'Ricardo de Oliviera', age: 24, rank: 3 },
	{ name: 'Shaun Provost', age: 26, rank: 7 },
	{ name: 'Shinobi Poli', age: 31, rank: 8 },
	{ name: 'Simon Brunner', age: 18, rank: 2 },
	{ name: 'Takehide Sato', age: 34, rank: 9 },
	{ name: 'Toyohiko Kubota', age: 40, rank: 10 }
]

export const byAgeNameDesc = [
	{ name: 'Simon Brunner', age: 18, rank: 2 },
	{ name: 'Ricardo de Oliviera', age: 24, rank: 3 },
	{ name: 'Shaun Provost', age: 26, rank: 7 },
	{ name: 'Matias Chavez', age: 29, rank: 5 },
	{ name: 'Shinobi Poli', age: 31, rank: 8 },
	{ name: 'Karine Abrahim', age: 31, rank: 12 },
	{ name: 'Myon Tuk Han', age: 33, rank: 11 },
	{ name: 'Takehide Sato', age: 34, rank: 9 },
	{ name: 'Heeyong Park', age: 34, rank: 1 },
	{ name: 'Omar Zamitiz', age: 36, rank: 4 },
	{ name: 'Markus Ertelt', age: 37, rank: 6 },
	{ name: 'Toyohiko Kubota', age: 40, rank: 10 }
]

export const byAgeDescNameAsc = [
	{ name: 'Toyohiko Kubota', age: 40, rank: 10 },
	{ name: 'Markus Ertelt', age: 37, rank: 6 },
	{ name: 'Omar Zamitiz', age: 36, rank: 4 },
	{ name: 'Heeyong Park', age: 34, rank: 1 },
	{ name: 'Takehide Sato', age: 34, rank: 9 },
	{ name: 'Myon Tuk Han', age: 33, rank: 11 },
	{ name: 'Karine Abrahim', age: 31, rank: 12 },
	{ name: 'Shinobi Poli', age: 31, rank: 8 },
	{ name: 'Matias Chavez', age: 29, rank: 5 },
	{ name: 'Shaun Provost', age: 26, rank: 7 },
	{ name: 'Ricardo de Oliviera', age: 24, rank: 3 },
	{ name: 'Simon Brunner', age: 18, rank: 2 }
]

export const grouped = {
	country: [
		{ country: 'South Korea', _df: [data[0], data[10]] },
		{ country: 'Germany', _df: [data[1], data[5]] },
		{ country: 'Brazil', _df: [data[2], data[11]] },
		{ country: 'Mexico', _df: [data[3], data[4]] },
		{ country: 'United States', _df: [data[6], data[7]] },
		{ country: 'Japan', _df: [data[8], data[9]] }
	],
	countryAndRank: [
		{ country: 'South Korea', rank: 1, _df: [data[0]] },
		{ country: 'Germany', rank: 2, _df: [data[1]] },
		{ country: 'Brazil', rank: 3, _df: [data[2]] },
		{ country: 'Mexico', rank: 4, _df: [data[3]] },
		{ country: 'Mexico', rank: 5, _df: [data[4]] },
		{ country: 'Germany', rank: 6, _df: [data[5]] },
		{ country: 'United States', rank: 7, _df: [data[6]] },
		{ country: 'United States', rank: 8, _df: [data[7]] },
		{ country: 'Japan', rank: 9, _df: [data[8]] },
		{ country: 'Japan', rank: 10, _df: [data[9]] },
		{ country: 'South Korea', rank: 11, _df: [data[10]] },
		{ country: 'Brazil', rank: 12, _df: [data[11]] }
	]
}

export const exclusions = {
	country: [
		{ country: 'South Korea', _df: [data[0], data[10]] },
		{ country: 'Germany', _df: [data[1], data[5]] },
		{ country: 'Brazil', _df: [data[2], data[11]] },
		{ country: 'Mexico', _df: [data[3], data[4]] },
		{ country: 'United States', _df: [data[6], data[7]] },
		{ country: 'Japan', _df: [data[8], data[9]] }
	].map((d) => ({ ...d, _df: d._df.map((x) => omit(['name'], x)) })),
	countryAndRank: [
		{ country: 'South Korea', rank: 1, _df: [data[0]] },
		{ country: 'Germany', rank: 2, _df: [data[1]] },
		{ country: 'Brazil', rank: 3, _df: [data[2]] },
		{ country: 'Mexico', rank: 4, _df: [data[3]] },
		{ country: 'Mexico', rank: 5, _df: [data[4]] },
		{ country: 'Germany', rank: 6, _df: [data[5]] },
		{ country: 'United States', rank: 7, _df: [data[6]] },
		{ country: 'United States', rank: 8, _df: [data[7]] },
		{ country: 'Japan', rank: 9, _df: [data[8]] },
		{ country: 'Japan', rank: 10, _df: [data[9]] },
		{ country: 'South Korea', rank: 11, _df: [data[10]] },
		{ country: 'Brazil', rank: 12, _df: [data[11]] }
	].map((d) => ({ ...d, _df: d._df.map((x) => omit(['name', 'age'], x)) }))
}

export const inclusions = {
	country: [
		{ country: 'South Korea', _df: [data[0], data[10]] },
		{ country: 'Germany', _df: [data[1], data[5]] },
		{ country: 'Brazil', _df: [data[2], data[11]] },
		{ country: 'Mexico', _df: [data[3], data[4]] },
		{ country: 'United States', _df: [data[6], data[7]] },
		{ country: 'Japan', _df: [data[8], data[9]] }
	].map((d) => ({ ...d, _df: d._df.map((x) => pick(['name'], x)) })),
	countryAndRank: [
		{ country: 'South Korea', rank: 1, _df: [data[0]] },
		{ country: 'Germany', rank: 2, _df: [data[1]] },
		{ country: 'Brazil', rank: 3, _df: [data[2]] },
		{ country: 'Mexico', rank: 4, _df: [data[3]] },
		{ country: 'Mexico', rank: 5, _df: [data[4]] },
		{ country: 'Germany', rank: 6, _df: [data[5]] },
		{ country: 'United States', rank: 7, _df: [data[6]] },
		{ country: 'United States', rank: 8, _df: [data[7]] },
		{ country: 'Japan', rank: 9, _df: [data[8]] },
		{ country: 'Japan', rank: 10, _df: [data[9]] },
		{ country: 'South Korea', rank: 11, _df: [data[10]] },
		{ country: 'Brazil', rank: 12, _df: [data[11]] }
	].map((d) => ({ ...d, _df: d._df.map((x) => pick(['name', 'age'], x)) }))
}

export const rawMissing = [
	{ country: 'South Korea', gender: 'Male', count: 1 },
	{ country: 'Germany', gender: 'Female', count: 1 },
	{ country: 'Japan' },
	{
		country: 'Brazil',
		gender: 'Female',
		count: 1
	},
	{ country: 'Brazil', gender: 'Male', count: 1 }
]
export const missing = [
	{ country: 'South Korea', _df: [{ gender: 'Male', count: 1 }] },
	{ country: 'Germany', _df: [{ gender: 'Female', count: 1 }] },
	{ country: 'Japan', _df: [] },
	{
		country: 'Brazil',
		_df: [
			{ gender: 'Female', count: 1 },
			{ gender: 'Male', count: 1 }
		]
	}
]

export const filled = [
	{
		country: 'South Korea',
		_df: [
			{ gender: 'Male', count: 1 },
			{ gender: 'Female', count: null }
		]
	},
	{
		country: 'Germany',
		_df: [
			{ gender: 'Female', count: 1 },
			{ gender: 'Male', count: null }
		]
	},
	{
		country: 'Japan',
		_df: [
			{ gender: 'Male', count: null },
			{ gender: 'Female', count: null }
		]
	},
	{
		country: 'Brazil',
		_df: [
			{ gender: 'Female', count: 1 },
			{ gender: 'Male', count: 1 }
		]
	}
]
