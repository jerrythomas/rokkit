export const options = [
	['set custom home page', { page: { home: '/home' } }],
	['set custom login page', { page: { login: '/login' } }],
	['set all custom page routes', { page: { home: '/home', login: '/login' } }],
	['exclude unused page route', { page: { invalid: '/invalid' } }],
	['set custom login endpoint', { endpoint: { login: '/api/login' } }],
	['set custom logout endpoint', { endpoint: { logout: '/api/logout' } }],
	['set custom session endpoint', { endpoint: { session: '/api/session' } }],
	['exclude unused endpoint route', { endpoint: { invalid: '/invalid' } }],
	[
		'set all custom endpoints',
		{
			endpoint: {
				login: '/api/login',
				logout: '/api/logout',
				session: '/api/session'
			}
		}
	],
	[
		'set all custom endpoints and page routes',
		{
			page: { home: '/home', login: '/login' },
			endpoint: {
				login: '/api/login',
				logout: '/api/logout',
				session: '/api/session'
			}
		}
	]
]
