/**
 * Fetch current value from a writable
 *
 * @param {writable} store
 * @returns {*} current value of the store
 */
export function getSubscribedData(store) {
	let result
	const unsubscribe = store.subscribe((data) => {
		result = data
	})
	unsubscribe()
	return result
}

export function generator(keys, filled = false) {
	const dates = [
		'2020-01-01',
		'2020-02-01',
		'2020-03-01',
		'2020-04-01',
		'2020-05-01'
	]
	const scores = Array(10)
		.fill(0)
		.map(Math.round(Math.random() * 10))
	const teams = ['Alpha', 'Beta', 'Charlie', 'Echo', 'Foxtrot']
	const people = [
		{ name: 'Belle Starr', gender: 'Female' },
		{ name: 'Calamity Jane', gender: 'Female' },
		{ name: 'Alice', gender: 'Female' },
		{ name: 'Dusty Fog', gender: 'Male' },
		{ name: 'Mark Counter', gender: 'Male' },
		{ name: 'Remittance Kid', gender: 'Male' }
	]

	const numDates = Math.max(3, Math.round(Math.random() * 10) % 5)
	const numTeams = Math.max(3, Math.round(Math.random() * 10) % 5)
	const numPeople = Math.max(3, Math.round(Math.random() * 10) % 6)

	let nested = []
	dates.slice(0, numDates).map((key) => {
		let values = []
		teams.slice(0, numTeams).map((team) => {
			people.slice(0, numPeople).map((person) => {
				scores.map((score) => {
					values.push({
						team,
						...person,
						score
					})
				})
			})
		})
		nested.push({ key, value: values })
	})
}
