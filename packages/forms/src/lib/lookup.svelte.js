/**
 * @typedef {Object} LookupConfig
 * @property {string} url - URL template with optional placeholders (e.g., '/api/cities?country={country}')
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
 */

/**
 * Cache entry structure
 * @typedef {Object} CacheEntry
 * @property {any[]} data - Cached options
 * @property {number} timestamp - When the cache was created
 */

const DEFAULT_CACHE_TIME = 5 * 60 * 1000 // 5 minutes

/** @type {Map<string, CacheEntry>} */
const cache = new Map()

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
 * Generates a cache key from URL and parameters
 * @param {string} url - The resolved URL
 * @returns {string}
 */
function getCacheKey(url) {
	return url
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
 * Creates a lookup provider for a field
 * @param {LookupConfig} config - Lookup configuration
 * @returns {Object} Lookup provider with reactive state
 */
export function createLookup(config) {
	const { url, dependsOn = [], fields = {}, cacheTime = DEFAULT_CACHE_TIME, transform } = config

	let options = $state([])
	let loading = $state(false)
	let error = $state(null)

	/**
	 * Fetches options from the configured URL
	 * @param {Object} params - Parameter values for URL interpolation
	 * @returns {Promise<any[]>}
	 */
	async function fetch(params = {}) {
		// Check if all dependencies have values
		const missingDeps = dependsOn.filter((dep) => !params[dep] && params[dep] !== 0)
		if (missingDeps.length > 0) {
			options = []
			return []
		}

		const resolvedUrl = interpolateUrl(url, params)
		const cacheKey = getCacheKey(resolvedUrl)

		// Check cache first
		const cached = cache.get(cacheKey)
		if (cached && isCacheValid(cached, cacheTime)) {
			options = cached.data
			return cached.data
		}

		loading = true
		error = null

		try {
			const response = await globalThis.fetch(resolvedUrl)

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`)
			}

			let data = await response.json()

			// Apply transform if provided
			if (transform) {
				data = transform(data)
			}

			// Ensure data is an array
			if (!Array.isArray(data)) {
				data = data.data || data.items || data.results || []
			}

			// Cache the result
			cache.set(cacheKey, { data, timestamp: Date.now() })

			options = data
			return data
		} catch (err) {
			error = err.message || 'Failed to load options'
			options = []
			return []
		} finally {
			loading = false
		}
	}

	/**
	 * Clears the cache for this lookup
	 */
	function clearCache() {
		// Clear all cache entries that match this URL pattern
		const baseUrl = url.split('?')[0]
		for (const key of cache.keys()) {
			if (key.startsWith(baseUrl)) {
				cache.delete(key)
			}
		}
	}

	/**
	 * Resets the lookup state
	 */
	function reset() {
		options = []
		loading = false
		error = null
	}

	return {
		get options() {
			return options
		},
		get loading() {
			return loading
		},
		get error() {
			return error
		},
		get dependsOn() {
			return dependsOn
		},
		get fields() {
			return fields
		},
		fetch,
		clearCache,
		reset
	}
}

/**
 * Creates a lookup manager for a form with multiple lookups
 * @param {Object<string, LookupConfig>} lookupConfigs - Map of field paths to lookup configs
 * @returns {Object} Lookup manager
 */
export function createLookupManager(lookupConfigs) {
	/** @type {Map<string, ReturnType<typeof createLookup>>} */
	const lookups = new Map()

	// Create lookup providers for each configured field
	for (const [fieldPath, config] of Object.entries(lookupConfigs)) {
		lookups.set(fieldPath, createLookup(config))
	}

	/**
	 * Gets the lookup provider for a field
	 * @param {string} fieldPath
	 * @returns {ReturnType<typeof createLookup> | undefined}
	 */
	function getLookup(fieldPath) {
		return lookups.get(fieldPath)
	}

	/**
	 * Checks if a field has a lookup configured
	 * @param {string} fieldPath
	 * @returns {boolean}
	 */
	function hasLookup(fieldPath) {
		return lookups.has(fieldPath)
	}

	/**
	 * Handles a field value change and triggers dependent lookups
	 * @param {string} changedField - The field that changed
	 * @param {Object} formData - Current form data
	 */
	async function handleFieldChange(changedField, formData) {
		// Find all lookups that depend on this field
		for (const [fieldPath, lookup] of lookups) {
			if (lookup.dependsOn.includes(changedField)) {
				// Reset dependent field value and fetch new options
				await lookup.fetch(formData)
			}
		}
	}

	/**
	 * Initializes all lookups with current form data
	 * @param {Object} formData - Current form data
	 */
	async function initialize(formData) {
		const promises = []
		for (const [fieldPath, lookup] of lookups) {
			// Only fetch for lookups without dependencies or with all deps satisfied
			if (lookup.dependsOn.length === 0) {
				promises.push(lookup.fetch(formData))
			} else {
				const hasAllDeps = lookup.dependsOn.every(
					(dep) => formData[dep] !== undefined && formData[dep] !== null
				)
				if (hasAllDeps) {
					promises.push(lookup.fetch(formData))
				}
			}
		}
		await Promise.all(promises)
	}

	/**
	 * Clears all caches
	 */
	function clearAllCaches() {
		for (const lookup of lookups.values()) {
			lookup.clearCache()
		}
	}

	return {
		getLookup,
		hasLookup,
		handleFieldChange,
		initialize,
		clearAllCaches,
		get lookups() {
			return lookups
		}
	}
}

/**
 * Clears the entire lookup cache
 */
export function clearLookupCache() {
	cache.clear()
}
