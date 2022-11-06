import { describe, expect, it } from 'vitest'
import cookie from '../src/cookie.js'

describe('Cookie Serialize', () => {
	it('basic', () => {
		expect(cookie.serialize('foo', 'bar')).toEqual('foo=bar')
		expect(cookie.serialize('foo', 'bar baz')).toEqual('foo=bar%20baz')
		expect(cookie.serialize('foo', '')).toEqual('foo=')
		expect(cookie.serialize.bind(cookie, 'foo\n', 'bar')).toThrowError(
			/argument name is invalid/
		)
		expect(cookie.serialize.bind(cookie, 'foo\u280a', 'bar')).toThrowError(
			/argument name is invalid/
		)
		expect(
			cookie.serialize.bind(cookie, 'foo', 'bar', { encode: 42 })
		).toThrowError(/option encode is invalid/)
	})

	it('path', () => {
		expect(cookie.serialize('foo', 'bar', { path: '/' })).toEqual(
			'foo=bar; Path=/'
		)
		expect(
			cookie.serialize.bind(cookie, 'foo', 'bar', {
				path: '/\n'
			})
		).toThrowError(/option path is invalid/)
	})

	it('secure', () => {
		expect(cookie.serialize('foo', 'bar', { secure: true })).toEqual(
			'foo=bar; Secure'
		)
		expect(cookie.serialize('foo', 'bar', { secure: false })).toEqual('foo=bar')
	})

	it('domain', () => {
		expect(cookie.serialize('foo', 'bar', { domain: 'example.com' })).toEqual(
			'foo=bar; Domain=example.com'
		)
		expect(
			cookie.serialize.bind(cookie, 'foo', 'bar', {
				domain: 'example.com\n'
			})
		).toThrowError(/option domain is invalid/)
	})

	it('httpOnly', () => {
		expect(cookie.serialize('foo', 'bar', { httpOnly: true })).toEqual(
			'foo=bar; HttpOnly'
		)
	})

	it('maxAge', () => {
		expect(() =>
			cookie.serialize('foo', 'bar', {
				maxAge: 'buzz'
			})
		).toThrowError(/option maxAge is invalid/)

		expect(() =>
			cookie.serialize('foo', 'bar', {
				maxAge: Infinity
			})
		).toThrowError(/option maxAge is invalid/)

		expect(cookie.serialize('foo', 'bar', { maxAge: 1000 })).toEqual(
			'foo=bar; Max-Age=1000'
		)
		expect(cookie.serialize('foo', 'bar', { maxAge: '1000' })).toEqual(
			'foo=bar; Max-Age=1000'
		)
		expect(cookie.serialize('foo', 'bar', { maxAge: 0 })).toEqual(
			'foo=bar; Max-Age=0'
		)
		expect(cookie.serialize('foo', 'bar', { maxAge: '0' })).toEqual(
			'foo=bar; Max-Age=0'
		)
		expect(cookie.serialize('foo', 'bar', { maxAge: null })).toEqual('foo=bar')
		expect(cookie.serialize('foo', 'bar', { maxAge: undefined })).toEqual(
			'foo=bar'
		)
		expect(cookie.serialize('foo', 'bar', { maxAge: 3.14 })).toEqual(
			'foo=bar; Max-Age=3'
		)
	})

	it('expires', () => {
		expect(
			cookie.serialize('foo', 'bar', {
				expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900))
			})
		).toEqual('foo=bar; Expires=Sun, 24 Dec 2000 10:30:59 GMT')

		expect(
			cookie.serialize.bind(cookie, 'foo', 'bar', {
				expires: Date.now()
			})
		).toThrowError(/option expires is invalid/)
	})

	it('sameSite', () => {
		expect(cookie.serialize('foo', 'bar', { sameSite: true })).toEqual(
			'foo=bar; SameSite=Strict'
		)
		expect(cookie.serialize('foo', 'bar', { sameSite: 'Strict' })).toEqual(
			'foo=bar; SameSite=Strict'
		)
		expect(cookie.serialize('foo', 'bar', { sameSite: 'strict' })).toEqual(
			'foo=bar; SameSite=Strict'
		)
		expect(cookie.serialize('foo', 'bar', { sameSite: 'Lax' })).toEqual(
			'foo=bar; SameSite=Lax'
		)
		expect(cookie.serialize('foo', 'bar', { sameSite: 'lax' })).toEqual(
			'foo=bar; SameSite=Lax'
		)
		expect(cookie.serialize('foo', 'bar', { sameSite: 'None' })).toEqual(
			'foo=bar; SameSite=None'
		)
		expect(cookie.serialize('foo', 'bar', { sameSite: 'none' })).toEqual(
			'foo=bar; SameSite=None'
		)
		expect(cookie.serialize('foo', 'bar', { sameSite: false })).toEqual(
			'foo=bar'
		)

		expect(
			cookie.serialize.bind(cookie, 'foo', 'bar', {
				sameSite: 'foo'
			})
		).toThrowError(/option sameSite is invalid/)
	})

	it('escaping', () => {
		expect(cookie.serialize('cat', '+ ')).toEqual('cat=%2B%20')
	})

	it('parse->serialize', () => {
		expect(
			cookie.parse(cookie.serialize('cat', 'foo=123&name=baz five'))
		).toEqual({
			cat: 'foo=123&name=baz five'
		})

		expect(cookie.parse(cookie.serialize('cat', ' ";/'))).toEqual({
			cat: ' ";/'
		})
	})

	it('unencoded', () => {
		expect(
			cookie.serialize('cat', '+ ', {
				encode: function (value) {
					return value
				}
			})
		).toEqual('cat=+ ')

		expect(
			cookie.serialize.bind(cookie, 'cat', '+ \n', {
				encode: function (value) {
					return value
				}
			})
		).toThrowError(/argument val is invalid/)
	})
})
