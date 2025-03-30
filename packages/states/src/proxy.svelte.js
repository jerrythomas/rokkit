import { defaultFields } from '@rokkit/core'
import { isNil, has } from 'ramda'

export class Proxy {
	#original = null
	#value = null
	#fields = null

	constructor(value, fields) {
		this.fields = fields
		this.#original = value
		this.#value = typeof value === 'object' ? value : { [this.fields.text]: value }
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
			this.#value.text = value
			this.#original = value
		}
	}

	/**
	 * Gets a mapped attribute from the original item
	 *
	 * @param {string} fieldName - Name of the field to get
	 * @param {any} defaultValue - Default value to return if not found
	 * @returns {any|null} - The attribute value or null if not found
	 */
	get(fieldName, defaultValue = null) {
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
	 * Identifies if the item has children
	 */
	get hasChildren() {
		return (
			typeof this.#original === 'object' &&
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
