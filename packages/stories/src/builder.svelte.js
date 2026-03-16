import { fetchStories } from './lib/stories.js'

/**
 * @typedef {Object} Example
 * @property {Object[]} files
 * @property {import('svelte').SvelteComponent} App
 */

export class StoryBuilder {
	#modules
	#sources
	/** @type {Record<string, Example>} */
	#processed = $state({})
	#loading = $state(true)
	#error = $state(null)

	constructor(sources, modules) {
		this.#modules = modules
		this.#sources = sources
		this.#init()
	}

	async #init() {
		try {
			this.#processed = await fetchStories(this.#sources, this.#modules)
			this.#loading = false
		} catch (err) {
			this.#error = err
			this.#loading = false
		}
	}

	get loading() {
		return this.#loading
	}

	get error() {
		return this.#error
	}

	get examples() {
		return this.#processed || {}
	}

	get fragments() {
		return this.#processed?.fragments?.files || []
	}

	/**
	 * @param {string} name
	 * @returns {Example}
	 */
	getExample(name) {
		return this.#processed?.[name]
	}

	getFragment(index) {
		return this.#processed?.fragments?.files?.[index]
	}

	hasExample(name) {
		return Boolean(this.#processed?.[name])
	}

	hasFragment(index) {
		return Boolean(this.#processed?.fragments?.files?.[index])
	}
}
