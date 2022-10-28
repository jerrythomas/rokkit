import { describe, expect, it } from 'vitest'
import { parse } from '../src/cookie.js'

describe('Cookie Parser', () => {
	it('argument validation', () => {
		expect(parse.bind()).toThrowError(/argument str must be a string/)
		expect(parse.bind(null, 42)).toThrowError(/argument str must be a string/)
	})

	it('basic', () => {
		expect(parse('foo=bar')).toEqual({ foo: 'bar' })
		expect(parse('foo=123')).toEqual({ foo: '123' })
	})

	it('ignore spaces', () => {
		expect(parse('FOO    = bar;   baz  =   raz')).toEqual({
			FOO: 'bar',
			baz: 'raz'
		})
	})

	it('escaping', () => {
		expect(parse('foo="bar=123456789&name=Magic+Mouse"')).toEqual({
			foo: 'bar=123456789&name=Magic+Mouse'
		})

		expect(parse('email=%20%22%2c%3b%2f')).toEqual({ email: ' ",;/' })
	})

	it('ignore escaping error and return original value', () => {
		expect(parse('foo=%1;bar=bar')).toEqual({ foo: '%1', bar: 'bar' })
	})

	it('ignore non values', () => {
		expect(parse('foo=%1;bar=bar;HttpOnly;Secure')).toEqual({
			foo: '%1',
			bar: 'bar'
		})
	})

	it('unencoded', () => {
		expect(
			parse('foo="bar=123456789&name=Magic+Mouse"', {
				decode: function (v) {
					return v
				}
			})
		).toEqual({ foo: 'bar=123456789&name=Magic+Mouse' })

		expect(
			parse('email=%20%22%2c%3b%2f', {
				decode: function (v) {
					return v
				}
			})
		).toEqual({ email: '%20%22%2c%3b%2f' })
	})

	it('dates', () => {
		expect(
			parse('priority=true; expires=Wed, 29 Jan 2014 17:43:25 GMT; Path=/', {
				decode: function (v) {
					return v
				}
			})
		).toEqual({
			priority: 'true',
			Path: '/',
			expires: 'Wed, 29 Jan 2014 17:43:25 GMT'
		})
	})

	it('missing value', () => {
		expect(
			parse('foo; bar=1; fizz= ; buzz=2', {
				decode: function (v) {
					return v
				}
			})
		).toEqual({ bar: '1', fizz: '', buzz: '2' })
	})

	it('assign only once', () => {
		expect(parse('foo=%1;bar=bar;foo=boo')).toEqual({ foo: '%1', bar: 'bar' })
		expect(parse('foo=false;bar=bar;foo=true'), {
			foo: 'false',
			bar: 'bar'
		})
		expect(parse('foo=;bar=bar;foo=boo')).toEqual({ foo: '', bar: 'bar' })
	})
})
