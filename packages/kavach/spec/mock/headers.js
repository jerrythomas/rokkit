const __data__ = Symbol('data')
export class Headers {
	constructor(headers) {
		this[__data__] = {}
		if (headers.location) this[__data__]['location'] = headers.location
		if (headers.cookie) this[__data__]['cookie'] = headers.cookie
	}

	get(key) {
		if (key in this[__data__]) return this[__data__][key]
		return null
	}
}
