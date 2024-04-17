import data from './data.json'

export function load() {
	const body = {
		data: data.map((d) => ({
			...d,
			year: new Date(d.year),
			age: Number(d.age),
			fired: Number(d.fired),
			hits: Number(d.hits)
		}))
	}

	return {
		body
	}
}
