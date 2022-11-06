import { describe, expect, it } from 'vitest'
import { hasAuthParams } from '../src/helper.js'
import { Headers } from './mock/headers.js'

describe('Helper functions', () => {
	const pathname = '/auth'
	const origin = 'http://localhost:3000'
	const locations = [
		['/auth#access_token=abcd', true],
		['/auth#type=other&access_token=abcd', true],
		[
			'/auth#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNjQxNjk4MzI5LCJzdWIiOiI2MzUxMTdmZC0yMjY0LTQ3ZGEtYWYwZS1hY2RiN2ZmOGU5ZTUiLCJlbWFpbCI6ImplcnJ5LnRob21hc0BzZW5lY2FnbG9iYWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6e30sInJvbGUiOiJhdXRoZW50aWNhdGVkIn0.QhVMcq9qfSV4FmMTRik20dWzVUGltOfdCrbphRqW99w&expires_in=3600&refresh_token=dSsLeCJCof1knFRrv7aG4A&token_type=bearer&type=magiclink',
			true
		],
		['/auth#', false],
		['/auth?provider=magic', false]
	]

	global.Headers = Headers

	it.each(locations)(
		'Should identify url with auth params',
		(path, expected) => {
			const location = {
				pathname,
				origin,
				href: origin + path
			}
			expect(hasAuthParams(location)).toEqual(expected)
		}
	)
})
