import { describe, expect, it } from 'vitest'
import {
	getPageRoutes,
	getEndpointRoutes,
	cleanupRoles,
	getRoutesByRole,
	isRouteAllowed,
	createDeflector
} from '../src/deflector'
import { options } from './fixtures/config'
import { pick } from 'ramda'

describe('Router functions', () => {
	const defaultRoutes = {
		page: { home: '/', login: '/auth' },
		endpoint: {
			login: '/auth/signin',
			logout: '/auth/signout',
			session: '/auth/session'
		}
	}

	const routes = [
		[{ public: [] }, { public: [] }],
		[{ authenticated: [] }, { authenticated: [] }]
	]
	it('should return default routes', () => {
		expect(getPageRoutes()).toEqual(defaultRoutes.page)
		expect(getEndpointRoutes()).toEqual(defaultRoutes.endpoint)
		// const res = deflector()
		// expect(res.page).toEqual(defaultRoutes.page)
		// expect(res.endpoint).toEqual(defaultRoutes.endpoint)
	})

	it.each(options)('should %s', (msg, input) => {
		const expectedPageRoutes = {
			...defaultRoutes.page,
			...pick(['home', 'login'], input.page ?? {})
		}
		expect(getPageRoutes(input)).toEqual(expectedPageRoutes)

		const expectedEndpointRoutes = {
			...defaultRoutes.endpoint,
			...pick(['login', 'logout', 'session'], input.endpoint ?? {})
		}
		expect(getEndpointRoutes(input)).toEqual(expectedEndpointRoutes)
	})

	it('should sort and exclude child routes', () => {
		expect(cleanupRoles(['/pub'], [])).toEqual(['/pub'])
		expect(cleanupRoles(['/pub', '/pub'], [])).toEqual(['/pub'])
		expect(cleanupRoles(['/pub', '/pub/a'], [])).toEqual(['/pub'])
		expect(cleanupRoles(['/pub', '/pub'], ['/'])).toEqual(['/', '/pub'])
		expect(cleanupRoles(['/pub', '/pub/a'], ['/'])).toEqual(['/', '/pub'])
		expect(cleanupRoles(['/pub', '/pub/a/b'], ['/'])).toEqual(['/', '/pub'])
	})

	it('should set routes by role', () => {
		const page = { home: '/' }
		let options = {}
		let routes

		routes = getRoutesByRole(options, page)
		expect(routes).toEqual({
			public: [],
			authenticated: [page.home]
		})

		options = { routes: { public: ['/blog'] } }
		routes = getRoutesByRole(options, page)
		expect(routes).toEqual({
			public: [...options.routes.public],
			authenticated: [page.home]
		})

		options = { routes: { authenticated: ['/blog'] } }
		routes = getRoutesByRole(options, page)
		expect(routes).toEqual({
			public: [],
			authenticated: [page.home, ...options.routes.authenticated]
		})

		options = { routes: { other: ['/blog'] } }
		routes = getRoutesByRole(options, page)
		expect(routes).toEqual({
			public: [],
			authenticated: [page.home],
			other: [page.home, ...options.routes.other]
		})
	})

	it('should verify that route is allowed', () => {
		const allowed = ['/', '/blog', '/page', '/auth']
		expect(isRouteAllowed('/', allowed)).toBeTruthy()
		expect(isRouteAllowed('/page', allowed)).toBeTruthy()
		expect(isRouteAllowed('/blog', allowed)).toBeTruthy()
		expect(isRouteAllowed('/blog/1', allowed)).toBeTruthy()
		expect(isRouteAllowed('/auth', allowed)).toBeTruthy()
		expect(isRouteAllowed('/auth/session', allowed)).toBeTruthy()
		expect(isRouteAllowed('/bg', allowed)).toBeFalsy()
	})

	it('should protect routes based on role', () => {
		const { page, endpoint } = defaultRoutes
		const options = {
			routes: { public: ['/blog'], authenticated: ['/user'], other: ['/other'] }
		}
		const res = createDeflector(options)
		expect(res.page, page)
		expect(res.endpoint, endpoint)

		expect(res.redirect(page.home)).toEqual(page.login)
		expect(res.redirect(page.login)).toEqual(page.login)
		expect(res.redirect(endpoint.login)).toEqual(endpoint.login)
		expect(res.redirect(endpoint.session)).toEqual(endpoint.session)
		expect(res.redirect(endpoint.logout)).toEqual(page.login)
		expect(res.redirect('/blog')).toEqual('/blog')
		expect(res.redirect('/user')).toEqual(page.login)

		res.setSession({ user: { role: 'authenticated' } })
		expect(res.redirect(page.home)).toEqual(page.home)
		expect(res.redirect(page.login)).toEqual(page.home)
		expect(res.redirect(endpoint.login)).toEqual(page.home)
		expect(res.redirect(endpoint.session)).toEqual(endpoint.session)
		expect(res.redirect(endpoint.logout)).toEqual(endpoint.logout)
		expect(res.redirect('/blog')).toEqual('/blog')
		expect(res.redirect('/user')).toEqual('/user')
		expect(res.redirect('/other')).toEqual(page.home)

		res.setSession({ user: { role: 'other' } })
		expect(res.redirect(page.home)).toEqual(page.home)
		expect(res.redirect(page.login)).toEqual(page.home)
		expect(res.redirect(endpoint.login)).toEqual(page.home)
		expect(res.redirect(endpoint.session)).toEqual(endpoint.session)
		expect(res.redirect(endpoint.logout)).toEqual(endpoint.logout)
		expect(res.redirect('/blog')).toEqual('/blog')
		expect(res.redirect('/user')).toEqual(page.home)
		expect(res.redirect('/other')).toEqual('/other')
	})
})
