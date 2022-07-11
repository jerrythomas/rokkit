export class Response {
	body = ''
	status = 200
	headers = {}
	constructor(body, opts) {
		this.body = body
		this.status = opts.status
		this.headers = opts.headers
	}
}
