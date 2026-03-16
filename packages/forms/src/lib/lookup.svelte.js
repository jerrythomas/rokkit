import { SvelteMap } from 'svelte/reactivity'

/**
 * @typedef {Object} LookupConfig
 * @property {string} [url] - URL template with optional placeholders (e.g., '/api/cities?country={country}')
 * @property {(formData: any) => Promise<any[]>} [fetch] - Async function replacing URL template
 * @property {any[]} [source] - Pre-loaded array for filter pattern
 * @property {(items: any[], formData: any) => any[]} [filter] - Client-side filter applied to source
 * @property {(formData: any) => string} [cacheKey] - Custom cache key for fetch hooks (no caching when absent)
 * @property {string[]} [dependsOn] - Field paths this lookup depends on
 * @property {Object} [fields] - Field mapping for the response data
 * @property {number} [cacheTime] - Cache duration in milliseconds (default: 5 minutes)
 * @property {(data: any) => any[]} [transform] - Transform response data to options array
 */

/**
 * @typedef {Object} LookupState
 * @property {any[]} options - Current options
 * @property {boolean} loading - Whether lookup is in progress
 * @property {string|null} error - Error message if lookup failed
 * @property {boolean} disabled - Whether field is disabled (deps not met)
 */

/**
 * Cache entry structure
 * @typedef {Object} CacheEntry
 * @property {any[]} data - Cached options
 * @property {number} timestamp - When the cache was created
 */

const DEFAULT_CACHE_TIME = 5 * 60 * 1000 // 5 minutes

/** @type {Map<string, CacheEntry>} */
const cache = new SvelteMap()

/**
 * Interpolates URL template with values
 * @param {string} template - URL template with {placeholders}
 * @param {Object} values - Values to interpolate
 * @returns {string}
 */
function interpolateUrl(template, values) {
	return template.replace(/\{(\w+)\}/g, (_, key) => {
		const value = values[key]
		return value !== undefined && value !== null ? encodeURIComponent(String(value)) : ''
	})
}

/**
 * Checks if a cache entry is still valid
 * @param {CacheEntry} entry
 * @param {number} cacheTime
 * @returns {boolean}
 */
function isCacheValid(entry, cacheTime) {
	return Date.now() - entry.timestamp < cacheTime
}

/**
 * Extract first matching array from common API response envelope keys
 * @private
 */
function unwrapApiResponse(data) {
	const ENVELOPE_KEYS = ['data', 'items', 'results']
	for (const k of ENVELOPE_KEYS) {
		if (data?.[k]) return data[k]
	}
	return []
}

/**
 * Normalise raw API data to an array
 * @param {any} data
 * @returns {any[]}
 */
function normaliseToArray(data) {
	if (Array.isArray(data)) return data
	return unwrapApiResponse(data)
}

/**
 * Apply optional transform then normalise to array
 * @param {any} data
 * @param {((d: any) => any)|undefined} transform
 * @returns {any[]}
 */
function applyTransformAndNormalise(data, transform) {
	const transformed = transform ? transform(data) : data
	return normaliseToArray(transformed)
}

/**
 * Try to return cached data for a given key
 * @private
 */
function getCachedData(key, cacheTime) {
	if (key === undefined) return null
	const cached = cache.get(key)
	return cached && isCacheValid(cached, cacheTime) ? cached.data : null
}

/**
 * @typedef {{ fetchHook: Function, cacheKeyFn?: Function, cacheTime: number, transform?: Function }} HookConfig
 */

/**
 * Handle the async fetch-hook branch (with optional caching)
 * @param {HookConfig} hookConfig
 * @param {Object} params
 * @private
 */
async function fetchFromHook(hookConfig, params) {
	const { fetchHook, cacheKeyFn, cacheTime, transform } = hookConfig
	const key = cacheKeyFn?.(params)

	const cached = getCachedData(key, cacheTime)
	if (cached) return cached

	const rawData = await fetchHook(params)
	const data = applyTransformAndNormalise(rawData, transform)

	if (key !== undefined) cache.set(key, { data, timestamp: Date.now() })
	return data
}

/**
 * @typedef {{ url: string, cacheTime: number, transform?: Function }} UrlConfig
 */

/**
 * Handle the URL-based fetch branch (with caching)
 * @param {UrlConfig} urlConfig
 * @param {Object} params
 * @private
 */
async function fetchFromUrl(urlConfig, params) {
	const { url, cacheTime, transform } = urlConfig
	const resolvedUrl = interpolateUrl(url, params)

	const cached = getCachedData(resolvedUrl, cacheTime)
	if (cached) return cached

	const response = await globalThis.fetch(resolvedUrl)

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${response.statusText}`)
	}

	const rawData = await response.json()
	const data = applyTransformAndNormalise(rawData, transform)

	cache.set(resolvedUrl, { data, timestamp: Date.now() })
	return data
}

/**
 * Execute an async fetch function and capture result/error into reactive state
 * @private
 */
async function runWithLoadingState(asyncFn, state) {
	state.loading = true
	state.error = null
	try {
		const data = await asyncFn()
		state.options = data
		return data
	} catch (err) {
		state.error = err.message || 'Failed to load options'
		state.options = []
		return []
	} finally {
		state.loading = false
	}
}

/**
 * @typedef {{ state: Object, meta: Object, fetch: Function, clearCache: Function, reset: Function }} LookupApi
 */

/**
 * Build the public API object returned by createLookup
 * @param {{ state: Object, meta: Object }} ctx
 * @param {{ fetch: Function, clearCache: Function, reset: Function }} fns
 * @private
 */
function buildLookupApi(ctx, fns) {
	const { state, meta } = ctx
	return {
		get options() { return state.options },
		get loading() { return state.loading },
		get error() { return state.error },
		get disabled() { return state.disabled },
		get dependsOn() { return meta.dependsOn },
		get fields() { return meta.fields },
		...fns
	}
}

/**
 * Clear URL-based cache entries for a given URL template
 * @private
 */
function clearUrlCache(url) {
	if (!url) return
	const baseUrl = url.split('?')[0]
	for (const key of cache.keys()) {
		if (key.startsWith(baseUrl)) cache.delete(key)
	}
}

/**
 * Reset lookup state to initial values
 * @private
 */
function resetState(state) {
	state.options = []
	state.loading = false
	state.error = null
	state.disabled = false
}

/**
 * Dispatch fetch to the appropriate strategy
 * @private
 */
function fetchDispatch(params, ctx) {
	const { state, dependsOn, source, filter, fetchHook, cacheKeyFn, cacheTime, transform, url } = ctx

	const missingDeps = dependsOn.filter((dep) => !params[dep] && params[dep] !== 0)
	if (missingDeps.length > 0) {
		state.options = []
		state.disabled = true
		return Promise.resolve([])
	}

	state.disabled = false

	if (filter !== undefined && source !== undefined) {
		state.options = filter(source, params)
		return Promise.resolve(state.options)
	}

	if (fetchHook) {
		return runWithLoadingState(() => fetchFromHook({ fetchHook, cacheKeyFn, cacheTime, transform }, params), state)
	}

	return runWithLoadingState(() => fetchFromUrl({ url, cacheTime, transform }, params), state)
}

/**
 * Creates a lookup provider for a field
 * @param {LookupConfig} config - Lookup configuration
 * @returns {Object} Lookup provider with reactive state
 */
export function createLookup(config) {
	const { url, fetch: fetchHook, source, filter, cacheKey: cacheKeyFn,
		dependsOn = [], fields = {}, cacheTime = DEFAULT_CACHE_TIME, transform } = config

	let state = $state({ options: [], loading: false, error: null, disabled: false })
	const ctx = { state, dependsOn, source, filter, fetchHook, cacheKeyFn, cacheTime, transform, url }

	return buildLookupApi(
		{ state, meta: { dependsOn, fields } },
		{
			fetch: (params = {}) => fetchDispatch(params, ctx),
			clearCache: () => clearUrlCache(url),
			reset: () => resetState(state)
		}
	)
}

/**
 * Initialize all lookups from the lookup map
 * @private
 */
async function initializeAllLookups(lookups, formData) {
	const promises = []
	for (const [_fieldPath, lookup] of lookups) {
		promises.push(lookup.fetch(formData))
	}
	await Promise.all(promises)
}

/**
 * Trigger all lookups that depend on the changed field
 * @private
 */
async function triggerDependentLookups(lookups, changedField, formData) {
	for (const [_fieldPath, lookup] of lookups) {
		if (lookup.dependsOn.includes(changedField)) {
			await lookup.fetch(formData)
		}
	}
}

/**
 * Build a SvelteMap of fieldPath -> lookup from configs
 * @private
 */
function buildLookupMap(lookupConfigs) {
	const lookups = new SvelteMap()
	for (const [fieldPath, config] of Object.entries(lookupConfigs)) {
		lookups.set(fieldPath, createLookup(config))
	}
	return lookups
}

/**
 * Creates a lookup manager for a form with multiple lookups
 * @param {Object<string, LookupConfig>} lookupConfigs - Map of field paths to lookup configs
 * @returns {Object} Lookup manager
 */
export function createLookupManager(lookupConfigs) {
	const lookups = buildLookupMap(lookupConfigs)

	return {
		getLookup: (fieldPath) => lookups.get(fieldPath),
		hasLookup: (fieldPath) => lookups.has(fieldPath),
		handleFieldChange: (changedField, formData) =>
			triggerDependentLookups(lookups, changedField, formData),
		initialize: (formData) => initializeAllLookups(lookups, formData),
		clearAllCaches: () => { for (const lookup of lookups.values()) lookup.clearCache() },
		get lookups() { return lookups }
	}
}

/**
 * Clears the entire lookup cache
 */
export function clearLookupCache() {
	cache.clear()
}
