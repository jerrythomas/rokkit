export class Response {
	constructor(body, opts) {
		this.body = body || ''
		this.status = opts.status || 200
		this.headers = opts.headers || {}
	}
}
