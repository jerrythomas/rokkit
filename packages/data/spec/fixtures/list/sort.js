import { alpha, beta, charlie, delta, echo, foxtrot } from './raw'

const lookup = {
	1: 'Second',
	2: 'First'
}

const foxtrot2 = { id: 7, name: 'Foxtrot', lookup_id: 2 }

const items = [alpha, beta, charlie, delta, echo, foxtrot, foxtrot2]

const result = {
	data: [delta, echo, foxtrot, foxtrot2, alpha, beta, charlie]
}

export default { lookup, items, result }
