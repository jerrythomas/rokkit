import { list } from '@rokkit/utils'
import { pick } from 'ramda'

export const data = [
	{
		category: 'Ball Games',
		name: 'Football',
		photo: 'https://shorturl.at/aMU34'
	},
	{
		category: 'Ball Games',
		name: 'Baseball',
		photo: 'https://shorturl.at/qyKM1'
	},
	{
		category: 'Ball Games',
		name: 'Volleyball',
		photo: 'https://shorturl.at/bryLO'
	},
	{
		category: 'Ball Games',
		name: 'Cricket',
		photo: 'https://shorturl.at/gjkJZ'
	},
	{
		category: 'Raquet Games',
		name: 'Tennis',
		photo: 'https://shorturl.at/lnoz9'
	},
	{
		category: 'Raquet Games',
		name: 'Table Tennis',
		photo: 'https://shorturl.at/ALTWX'
	},
	{
		category: 'Raquet Games',
		name: 'Badminton',
		photo: 'https://shorturl.at/bGJ18'
	},
	{
		category: 'Board Games',
		name: 'Scrabble',
		photo: 'https://shorturl.at/irvAV'
	},
	{
		category: 'Board Games',
		name: 'Chess',
		photo: 'https://shorturl.at/dOTV0'
	}
]

export const nestedItems = list(
	data.map(({ category, name }) => ({ category, text: name }))
)
	.groupBy('category')
	.current()
	.map(({ name, data }) => ({
		text: name,
		data: data.map((x) => pick(['text'], x))
	}))

export const withMapping = list(data)
	.groupBy('category')
	.current()
	.map(({ name, data }) => ({
		name,
		data: data.map((x) => pick(['name', 'photo'], x))
	}))
