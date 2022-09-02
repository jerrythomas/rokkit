import { error, redirect } from '@sveltejs/kit'
import { createClient } from '@supabase/supabase-js'

export const config = {
	supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
	supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
}

export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)

export const actions = {
	get: async (/** @type {string} */ entity, /** @type {Record<string, unknown>} */ data) =>
		await supabase.from(entity).select().match(data),
	put: async (/** @type {string} */ entity, /** @type {any | Partial<any>} */ data) =>
		await supabase.from(entity).insert([data]),
	post: async (/** @type {string} */ entity, /** @type {Partial<any> | Partial<any>[]} */ data) =>
		await supabase.from(entity).upsert(data),
	delete: async (/** @type {string} */ entity, /** @type {Record<string, unknown>} */ data) =>
		await supabase.from(entity).delete().match(data)
}

export async function getRequestBody(request) {
	let body
	try {
		body = await request.formData()
		body = Object.fromEntries(body.entries())
	} catch (err) {
		body = await request.json()
	}

	return body
}

/**
 * @param {string} entity
 * @param {any} url
 * @returns
 */
export async function getter(entity, url) {
	const data = Object.fromEntries(url.searchParams.entries())
	const result = await supabase.from(entity).select().match(data)

	if (result.error) {
		throw error(400, result.error.message)
	}
	return new Response(JSON.stringify(result.data))
}

/**
 *
 * @param {*} method
 * @param {*} entity
 * @param {*} request
 * @returns
 */
export async function setter(method, entity, request) {
	const data = await getRequestBody(request)
	let result
	if (method === 'PUT') {
		result = await supabase.from(entity).insert([data])
	} else if (method === 'DELETE') {
		result = await supabase.from(entity).delete().match(data)
	} else {
		result = await supabase.from(entity).upsert(data)
	}

	if (result.error) {
		throw error(400, result.error.message)
	}
	return new Response(JSON.stringify(result.data))
}

/**
 *
 * @param {*} event
 */
export async function initiateSignIn({ setHeaders, request }) {
	const { email, name /*, scopes, params*/ } = await getRequestBody(request)
	const credentials = name === 'magic' ? { email } : { provider: name }

	const options = {
		redirectTo: '/auth',
		scopes: '', //scopes.join(' '),
		params: []
	}

	const result = await supabase.auth.signIn(credentials, options)
	console.log('initiateSignIn', result)
	if (result.error) {
		throw error(400, result.error.message)
	}
	setAuthCookies({ setHeaders }, result.user)
}

/**
 *
 * @param {*} event
 */
export async function initiateSignOut({ setHeaders, request }) {
	const result = await supabase.auth.signOut()
	console.log('initiateSignOut', result)
	if (result.error) {
		throw error(400, result.error.message)
	}
	setAuthCookies({ setHeaders, request })
}

/**
 *
 * @param {*} event
 * @param {*} data
 */
export async function setAuthCookies({ setHeaders, request }, data = {}) {
	const keys = ['id', 'email', 'role', 'token']
	supabase.auth.api.setAuthCookie(request, new Response())
	keys.map((key) => {
		setHeaders({
			'set-cookie': `${key}=${encodeURIComponent(data[key] || '')}; HttpOnly`
		})
	})
	if (data || data.token) {
		throw redirect(307, '/')
	} else {
		throw redirect(307, '/auth')
	}
}

export async function handleAuthChange(event, session) {
	await fetch('/api/auth/cookie', {
		method: 'POST',
		headers: new Headers({ 'Content-Type': 'application/json' }),
		credentials: 'same-origin',
		body: JSON.stringify({ event, session })
	})
}

export async function watcher() {
	const { data: listener } = supabase.auth.onAuthStateChange(handleAuthChange)

	return () => {
		if (listener) listener.unsubscribe()
	}
}
