import { defaultFields } from '@rokkit/core'
import { isNil, has } from 'ramda'

export class Proxy {
	#value = $state({})
	#fields = $state(defaultFields)

	constructor(value, fields) {
		this.#value = typeof value === 'object' ? value : { text: value }
		this.fields = fields
	}

	get fields() {
		return this.#fields
	}
	set fields(value) {
		this.#fields = { ...defaultFields, ...value }
	}

	get value() {
		return this.#value
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
		}
	}

	/**
	 * Gets a mapped attribute from the original item
	 *
	 * @param {string} fieldName - Name of the field to get
	 * @returns {any|null} - The attribute value or null if not found
	 */
	get(fieldName) {
		return this.has(fieldName) ? this.value[this.fields[fieldName]] : null
	}

	/**
	 * Checks if a mapped attribute exists in the original item
	 * @param {string} fieldName - Name of the field to check
	 * @returns boolean
	 */
	has(fieldName) {
		const mappedField = this.fields[fieldName]
		return !isNil(mappedField) && has(mappedField, this.value)
	}
}
