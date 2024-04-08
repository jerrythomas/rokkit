const lookup = {
	1: 'Second',
	2: 'First'
}

const alpha = { id: 1, name: 'Alpha', lookup_id: 1 }
const beta = { id: 2, name: 'Beta', lookup_id: 1 }
const charlie = { id: 3, name: 'Charlie', lookup_id: 1 }
const delta = { id: 4, name: 'Delta', lookup_id: 2 }
const echo = { id: 5, name: 'Echo', lookup_id: 2 }
const foxtrot = { id: 6, name: 'Foxtrot', lookup_id: 2 }
const foxtrot2 = { id: 7, name: 'Foxtrot', lookup_id: 2 }

const items = [alpha, beta, charlie, delta, echo, foxtrot, foxtrot2]

const result = {
	data: [delta, echo, foxtrot, foxtrot2, alpha, beta, charlie]
}

export default { lookup, items, result }
