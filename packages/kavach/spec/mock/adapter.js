let _calls = []
let _user = {}
let _authStateCallback

export const ERROR_EMAIL = 'rate@limit.error'
export const adapter = {
	auth: {
		user: () => {
			_calls.push({ function: 'user', user: _user })
			return _user
		},
		signIn: async (credentials, options) => {
			_calls.push({ function: 'signIn', credentials, options })
			if ('email' in credentials && credentials.email === ERROR_EMAIL) {
				return { error: 'Rate limit error' }
			} else {
				return { error: null }
			}
		},
		signOut: async () => {
			_user = {}
			_calls.push({ function: 'signOut', user: _user })
			await _authStateCallback('SIGNED_OUT', null)
		},
		onAuthStateChange: (cb) => {
			_authStateCallback = cb
		}
	},
	// user(),
	calls: () => _calls,
	clearCalls: () => {
		_calls = []
	},
	authStateCallback: (event, session) => _authStateCallback(event, session)
}
