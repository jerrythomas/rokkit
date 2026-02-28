const lookup = {
	1: 1,
	2: 2
}

const alpha = { key: 1, name: 'Alpha', lookup_key: 1 }
const beta = { key: 2, name: 'Beta', lookup_key: 1 }
const charlie = { key: 3, name: 'Charlie', lookup_key: 1 }
const delta = { key: 4, name: 'Delta', lookup_key: 2 }
const echo = { key: 5, name: 'Echo', lookup_key: 2 }
const foxtrot = { key: 6, name: 'Foxtrot', lookup_key: 2 }
const whiskey = { key: 5, name: 'Whiskey', lookup_key: 2 }

const items = [alpha, beta, charlie, delta, echo, foxtrot, whiskey]

const start = [charlie, delta, echo]

const actions = {
	add: {
		item: alpha,
		result: [charlie, delta, echo, alpha]
	},
	remove: {
		item: delta,
		result: [charlie, echo, alpha]
	},
	modify: {
		item: whiskey,
		result: [charlie, whiskey, alpha]
	}
}

export default { lookup, items, start, actions }
