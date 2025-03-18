import { defaultFields } from '@rokkit/core'
import { has } from 'ramda'

export class Proxy {
	value = $state()
	fields = $state()

	constructor(value, fields) {
		this.value = value
		this.fields = { ...defaultFields, ...fields }
	}

	/**
	 * Gets a mapped attribute from the original item
	 *
	 * @param {string} fieldName - Name of the field to get
	 * @returns {any|null} - The attribute value or null if not found
	 */
	get(fieldName) {
		if (typeof this.value === 'string' && fieldName === 'text') {
			return this.value
		}
		const mappedField = this.fields[fieldName]
		if (!mappedField || !has(mappedField, this.value)) {
			return null
		}
		return this.value[mappedField]
	}

	/**
	 * Checks if a mapped attribute exists in the original item
	 * @param {string} fieldName - Name of the field to check
	 * @returns boolean
	 */
	has(fieldName) {
		if (typeof this.value === 'string' && fieldName === 'text') {
			return true
		}
		const mappedField = this.fields[fieldName]
		return mappedField && has(mappedField, this.value)
	}
}
