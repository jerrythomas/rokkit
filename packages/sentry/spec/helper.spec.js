import { describe, expect, it } from 'vitest'
import {
	sessionFromCookies,
	cookiesFromSession,
	hasAuthParams
} from '../src/helper.js'

import { Headers } from './mock/headers.js'

describe('Helper functions', () => {
	const cookieProperties = 'Max-Age=3600; Path=/; HttpOnly; SameSite=Strict'
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
	const sessions = [
		{},
		{
			user: {
				id: 'xyz',
				email: 'john.doe@example.com',
				role: 'authenticated'
			}
		}
	]

	global.Headers = Headers

	it('Should extract session cookies from request', () => {
		let event = { request: { headers: new Headers({}) }, locals: {} }
		let session = sessionFromCookies(event)
		expect(session).toEqual({})

		const cookie =
			'id=74758948-0f30-4388-baaf-1279bbe5ff0b; email=jane%40example.com; role=authenticated'
		event.request.headers = new Headers({ cookie })
		session = sessionFromCookies(event)
		expect(session).toEqual({
			id: '74758948-0f30-4388-baaf-1279bbe5ff0b',
			email: 'jane@example.com',
			role: 'authenticated'
		})
	})

	it('Should exclude cookies from request', () => {
		let event = { request: { headers: new Headers({}) }, locals: {} }
		let session = sessionFromCookies(event)
		expect(session).toEqual({})

		const cookie = 'other=something'
		event.request.headers = new Headers({ cookie })
		session = sessionFromCookies(event)
		expect(session).toEqual({
			id: '',
			email: '',
			role: ''
		})
	})

	it.each(sessions)('Should create cookies from session', (session) => {
		let { id, email, role } = session.user || { id: '', email: '', role: '' }

		email = email.replace('@', '%40')
		const cookies = cookiesFromSession(session)
		const expected = {
			status: 200,
			headers: {
				'content-type': 'application/json',
				'set-cookie': [
					`id=${id}; ${cookieProperties}`,
					`email=${email}; ${cookieProperties}`,
					`role=${role}; ${cookieProperties}`
				]
			}
		}
		// console.log(session, cookies)
		expect(cookies).toEqual(expected)
	})

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
