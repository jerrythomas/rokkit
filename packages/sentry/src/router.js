const ROOT = '/'

export class Router {
	#base = {
		home: ROOT,
		login: '/auth',
		logout: '/auth/logout',
		session: '/auth/session',
		authUrl: '/auth/signin'
	}

	#routes = {
		public: [],
		authenticated: []
	}

	#isAuthenticated = false
	#allowedRoutes = []

	#authRoles = null

	constructor(options) {
		options = options || {}

		Object.keys(this.#base).map((key) => {
			if (key in options) this.#base[key] = options[key]
		})

		const routes = Object.assign(this.#routes, options.routes || {})
		Object.keys(routes).map((role) => {
			this.add(role, routes[role])
		})
	}

	get home() {
		return this.#base.home
	}
	get login() {
		return this.#base.login
	}
	get logout() {
		return this.#base.logout
	}
	get session() {
		return this.#base.session
	}
	get authUrl() {
		return this.#base.authUrl
	}
	get routes() {
		return this.#routes
	}
	get isAuthenticated() {
		return this.#isAuthenticated
	}
	get allowedRoutes() {
		return this.#allowedRoutes
	}

	/**
	 * @param {string|string[]} roles
	 */
	set authRoles(roles) {
		this.#isAuthenticated = roles && roles !== '' ? true : false
		this.#authRoles = (Array.isArray(roles) ? roles : [roles]).filter(
			(role) => role && role !== ''
		)
		this.#authRoles = ['public', ...this.#authRoles]
		this.#allowedRoutes = []

		if (this.#isAuthenticated) {
			this.#authRoles.map((role) => {
				if (role in this.routes)
					this.#allowedRoutes = [...this.#allowedRoutes, ...this.routes[role]]
			})

			this.#allowedRoutes = [
				...new Set([...this.#allowedRoutes, this.logout, this.session])
			]
				.filter((route) => route !== this.login && route !== this.authUrl)
				.sort()
		} else {
			this.#allowedRoutes = this.routes['public']
		}
	}

	add(role, routes) {
		if (role === 'public') {
			let publicRoutes = [this.login, this.authUrl, this.session]
			publicRoutes = [...new Set([...publicRoutes, ...routes])]
			this.#routes[role] = publicRoutes.sort()
		} else {
			this.#routes[role] = [...new Set([...routes, this.home])].sort()
		}
		// Remove child routes if parent is already in the list
		for (let i = 0; i < this.#routes[role].length; i++) {
			const current = this.#routes[role][i]
			for (let j = i + 1; j < this.#routes[role].length; j++) {
				while (
					j < this.#routes[role].length &&
					this.#routes[role][j].startsWith(current + '/')
				) {
					this.#routes[role].splice(j, 1)
				}
			}
		}
	}

	/**
	 *
	 * @param {string} route
	 * @returns {string}
	 */
	redirect(route) {
		let isAllowed = false

		if (route !== this.logout || this.isAuthenticated) {
			for (let i = 0; i < this.allowedRoutes.length && !isAllowed; i++) {
				isAllowed =
					route === this.allowedRoutes[i] ||
					route.startsWith(this.allowedRoutes[i] + '/')
			}
		}
		return isAllowed ? route : this.#isAuthenticated ? this.home : this.login
	}
}
