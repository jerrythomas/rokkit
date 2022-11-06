/**
 * @typedef PageRoutes
 * @property {string} home
 * @property {string} login
 */
/**
 * @typedef EndpointRoutes
 * @property {string} login
 * @property {string} logout
 * @property {string} session
 */

/**
 *
 * @param {*} options
 * @returns
 */
export function createDeflector(options = {}) {
	const page = getPageRoutes(options)
	const endpoint = getEndpointRoutes(options)
	const routesByRole = getRoutesByRole(options, page, endpoint)

	let isAuthenticated = false
	let authorizedRoutes = []

	const setSession = (session) => {
		const role = session?.user?.role ?? 'public'
		isAuthenticated = role !== 'public'
		authorizedRoutes = [...routesByRole['public']]

		if (isAuthenticated) {
			authorizedRoutes = [
				...authorizedRoutes,
				...routesByRole[role],
				endpoint.logout,
				endpoint.session
			]
		} else {
			authorizedRoutes = [
				...authorizedRoutes,
				page.login,
				endpoint.login,
				endpoint.session
			]
		}
	}

	const redirect = (route) => {
		let isAllowed = false

		if (route !== endpoint.logout || isAuthenticated) {
			isAllowed = isRouteAllowed(route, authorizedRoutes)
		}
		return isAllowed ? route : isAuthenticated ? page.home : page.login
	}

	setSession()
	return { page, endpoint, setSession, redirect }
}

export function getEndpointRoutes(options) {
	return {
		login: options?.endpoint?.login ?? '/auth/signin',
		logout: options?.endpoint?.logout ?? '/auth/signout',
		session: options?.endpoint?.session ?? '/auth/session'
	}
}

export function getPageRoutes(options) {
	return {
		home: options?.page?.home ?? '/',
		login: options?.page?.login ?? '/auth'
	}
}

export function cleanupRoles(routes, defaultRoutes) {
	let roleRoutes = [...new Set([...routes, ...defaultRoutes])].sort()

	// Remove child routes if parent is already in the list
	for (let i = 0; i < roleRoutes.length; i++) {
		const current = roleRoutes[i]
		for (let j = i + 1; j < roleRoutes.length; j++) {
			while (j < roleRoutes.length && roleRoutes[j].startsWith(current + '/')) {
				roleRoutes.splice(j, 1)
			}
		}
	}
	return roleRoutes
}

export function getRoutesByRole(options, page) {
	let routesByRole = {
		public: [],
		authenticated: []
	}
	options.routes = { ...routesByRole, ...options.routes }

	Object.entries(options.routes).map(([role, routes]) => {
		const defaultRoutes = role === 'public' ? [] : [page.home]
		routesByRole[role] = cleanupRoles(routes, defaultRoutes)
	})

	return routesByRole
}

/**
 *
 * @param {string} route
 * @returns {string}
 */
export function isRouteAllowed(route, allowedRoutes) {
	let isAllowed = false

	for (let i = 0; i < allowedRoutes.length && !isAllowed; i++) {
		isAllowed =
			route === allowedRoutes[i] || route.startsWith(allowedRoutes[i] + '/')
	}
	return isAllowed
}
