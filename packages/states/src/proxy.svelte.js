import { defaultFields, id, toString, getNestedFields } from '@rokkit/core'
import { isNil, has } from 'ramda'

export class Proxy {
	#original = null
	#value = $state(null)
	#fields = null
	#id = null

	#children = $derived(this.#processChildren())

	constructor(value, fields) {
		this.fields = fields
		this.#original = value
		this.#value = typeof value === 'object' ? value : { [this.fields.text]: value }
		this.id = typeof value === 'object' ? (this.get('id') ?? id()) : value
	}

	#processChildren() {
		if (!this.has('children')) return []
		const children = this.#value[this.fields.children] ?? []
		if (Array.isArray(children)) {
			const fields = getNestedFields(this.fields)
			return children.map((child) => new Proxy(child, fields))
		}
		return []
	}

	get id() {
		return this.#id
	}
	set id(new_id) {
		this.#id = typeof new_id === 'string' ? new_id : toString(new_id)
	}
	get children() {
		return this.#children
	}
	get fields() {
		return this.#fields
	}
	set fields(value) {
		this.#fields = { ...defaultFields, ...value }
	}

	get value() {
		return typeof this.#original === 'object' ? this.#value : this.#original
	}

	set value(value) {
		if (typeof value === 'object') {
			const removedKeys = Object.keys(this.#value).filter(
				(key) => !Object.keys(value).includes(key)
			)
			Object.entries(value).forEach(([k, v]) => {
				this.#value[k] = v
			})
			removedKeys.forEach((key) => {
				delete this.#value[key]
			})
		} else {
			this.#value = typeof value === 'object' ? value : { [this.fields.text]: value }
			this.#original = value
		}
	}

	/**
	 * Gets a mapped attribute from the original item
	 *
	 * @param {string} fieldName - Name of the field to get
	 * @param {any}   [defaultValue] - Default value to return if not found
	 * @returns {any|undefined} - The attribute value or null if not found
	 */
	get(fieldName, defaultValue) {
		return this.has(fieldName) ? this.#value[this.fields[fieldName]] : defaultValue
	}

	/**
	 * Checks if a mapped attribute exists in the original item
	 * @param {string} fieldName - Name of the field to check
	 * @returns boolean
	 */
	has(fieldName) {
		const mappedField = this.fields[fieldName]
		return !isNil(mappedField) && has(mappedField, this.#value)
	}

	/**
	 * Gets the appropriate snippet for rendering this item:
	 * - Uses the 'snippet' field from the current item to find the snippet key
	 * - Finds a matching snippet in the provided collection using this key
	 * - Falls back to the defaultSnippet if:
	 *   - No snippet key is configured for this item
	 *   - The configured snippet key doesn't exist in the snippets collection
	 * @param {Object} snippets
	 * @param {import('svelte').Snippet|undefined} [defaultSnippet]
	 * @returns {import('svelte').Snippet|undefined}
	 */
	getSnippet(snippets, defaultSnippet) {
		const snippetKey = this.get('snippet')
		const snippet = has(snippetKey, snippets) ? snippets[snippetKey] : undefined
		return snippet ?? defaultSnippet
	}

	/**
	 * Identifies if the item has children
	 */
	get hasChildren() {
		return (
			typeof this.#original === 'object' &&
			has(this.fields.children, this.#value) &&
			Array.isArray(this.#value[this.fields.children]) &&
			this.#value[this.fields.children].length > 0
		)
	}

	get expanded() {
		return this.has('expanded') ? this.#value[this.fields.expanded] : false
	}

	set expanded(value) {
		if (typeof this.#original === 'object') {
			this.#value[this.fields.expanded] = Boolean(value)
		}
	}
}
