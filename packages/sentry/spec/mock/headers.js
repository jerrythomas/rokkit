export class Headers {
	#data = {}

	constructor(headers) {
		if (headers.location) this.#data['location'] = headers.location
		if (headers.cookie) this.#data['cookie'] = headers.cookie
	}

	get(key) {
		if (key in this.#data) return this.#data[key]
		return null
	}
}
