import { describe, beforeAll, beforeEach, expect, it, vi } from 'vitest'

import fs from 'fs'
import yaml from 'js-yaml'

// import fetchMock from 'fetch-mock'
import { adapter, Response, Headers } from './mock/index.js'
import { getSubscribedData } from './helper.js'

import { sentry } from '../src/sentry.js'
import { sessionFromCookies } from '../src/helper.js'

const VALID_EMAIL = 'john@doe@example.com'

describe('Sentry', () => {
	let context = {}
	global.fetch = vi.fn()

	// prepareFetch(globalThis, 'fetch')

	beforeAll(() => {
		global.window = { location: { href: '', pathname: '/' } }
		global.window.sessionStorage = {
			getItem(key) {
				return context.sessionStorage[key]
			},
			setItem(key, value) {
				context.sessionStorage[key] = value
			}
		}
		global.Response = Response
		global.Headers = Headers

		context.authProviders = yaml.load(
			fs.readFileSync('spec/fixtures/providers.yaml', 'utf8')
		)

		context.sessionStorage = {}
		context.providers = [
			{ provider: 'magic' },
			{ provider: 'google', scopes: ['email'], params: [] }
		]
		context.adapter = adapter
		context.routes = { routes: { authenticated: ['/visited'] } }
		context.authCookie = [
			'id=74758948-0f30-4388-baaf-1279bbe5ff0b',
			'email=jane%40example.com',
			'role=authenticated'
		].join('; ')
	})

	beforeEach(() => {
		// mockFetch.clearAll()
		// mock = mockGet('/auth/session').willResolve({})
	})

	it('Should handle different providers', () => {
		let calls = []

		sentry.init({ adapter: context.adapter, providers: context.providers })
		expect(context.adapter.calls()).toEqual([{ function: 'user', user: {} }])
		expect(sentry.routes()).toEqual({
			authUrl: '/auth/signin',
			loginUrl: '/auth'
		})
		let sentryStore = getSubscribedData(sentry)
		expect(sentryStore.user).toEqual({})
		context.adapter.clearCalls()

		context.authProviders.map(
			async ({ credentials, message, expected, call }) => {
				if (call) calls.push(call)
				const result = await sentry.handleSignIn(
					credentials,
					'http://localhost:3000'
				)
				expect(result).toEqual(expected, message)
			}
		)

		expect(context.adapter.calls()).toEqual(calls)
	})

	it('Should handle auth change', async () => {
		sentry.init({
			adapter: context.adapter,
			providers: context.providers,
			routes: context.routes
		})

		// fetchMock.mock('/auth/session', 200)

		const userSession = {
			user: { id: '123', email: VALID_EMAIL, role: 'authenticated' }
		}
		await sentry.handleAuthChange('/')
		await context.adapter.authStateCallback('SIGNED_IN', userSession)
		let sentryStore = getSubscribedData(sentry)
		expect(sentryStore.user).toEqual(userSession.user)

		expect(window.location.pathname).toEqual('/')
		expect(global.fetch).toBeCalledWith('/auth/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: `{"event":"SIGNED_IN","session":{"user":{"id":"123","email":"${VALID_EMAIL}","role":"authenticated"}}}`
		})
	})

	it('Should redirect to cached route after authentication', async () => {
		sentry.init({
			adapter: context.adapter,
			providers: context.providers,
			routes: context.routes
		})
		const userSession = {
			user: { id: '123', email: VALID_EMAIL, role: 'authenticated' }
		}

		await sentry.handleAuthChange('/visited')

		await context.adapter.authStateCallback('SIGNED_IN', userSession)
		let sentryStore = getSubscribedData(sentry)
		expect(sentryStore.user).toEqual(userSession.user)

		expect(window.location.pathname).toEqual('/visited')
		expect(global.fetch).toBeCalledWith('/auth/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: `{"event":"SIGNED_IN","session":{"user":{"id":"123","email":"${VALID_EMAIL}","role":"authenticated"}}}`
		})
	})

	it('Should handle sign out', async () => {
		const userSession = {
			user: { id: '123', email: VALID_EMAIL, role: 'authenticated' }
		}
		let sentryStore = getSubscribedData(sentry)
		expect(sentryStore.user).toEqual(userSession.user)
		context.adapter.clearCalls()

		await sentry.handleSignOut()
		sentryStore = getSubscribedData(sentry)
		expect(sentryStore.user).toEqual({})

		expect(global.fetch).toBeCalledWith('/auth/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'same-origin',
			body: '{}'
		})

		expect(window.location.pathname).toEqual('/auth')
		expect(context.adapter.calls()).toEqual([{ function: 'signOut', user: {} }])
		context.adapter.clearCalls()
	})

	it('Should bypass routing when url is not present', () => {
		const input = { request: { headers: new Headers({}) }, locals: {} }
		const response = new Response('', { status: 200 })
		const result = sentry.protectServerRoute(input, response)

		expect(result).toEqual(response)
	})

	it('Should redirect protected routes for auth', () => {
		const input = {
			request: { headers: {} },
			locals: {},
			url: { pathname: '/' }
		}
		const response = new Response('', {
			status: 302,
			headers: new Headers({ location: '/auth' })
		})
		const result = sentry.protectServerRoute(
			input,
			new Response('', { status: 200 })
		)
		expect(result).toEqual(response)
	})

	it('Should allow auth route when not authenticated', () => {
		const input = {
			request: { headers: new Headers({}) },
			locals: {},
			url: { pathname: '/auth' }
		}
		const response = new Response('auth content', {
			status: 200
		})

		const result = sentry.protectServerRoute(input, response)
		expect(result).toEqual(response)
	})

	it('Should allow protected routes when authenticated', () => {
		let input = {
			request: {
				headers: new Headers({
					cookie: context.authCookie
				})
			},
			locals: {},
			url: { pathname: '/' }
		}
		const response = new Response('some content', {
			status: 200
		})
		input.locals = sessionFromCookies(input)
		const result = sentry.protectServerRoute(input, response)
		expect(result).toEqual(response)
	})

	it('Should redirect to home when authenticated', () => {
		let input = {
			request: {
				headers: new Headers({
					cookie: context.authCookie
				})
			},
			locals: {},
			url: { pathname: '/' }
		}

		const response = new Response('', {
			status: 302,
			headers: new Headers({ location: '/' })
		})
		input.locals = sessionFromCookies(input)
		const result = sentry.protectServerRoute(input, response)
		expect(result).toEqual(response)
	})
})
