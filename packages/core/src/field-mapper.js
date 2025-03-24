import { defaultFields } from './constants.js'
import { isNil, has, omit } from 'ramda'
import { isObject } from './utils.js'

export class FieldMapper {
	#fields = { ...defaultFields }
	// #componentMap = {}
	#childMapper = null

	constructor(fields = defaultFields) {
		this.#updateFields(fields)
		// this.#updateComponentMap(componentMap)
	}

	#updateFields(fields) {
		Object.keys(fields).forEach((key) => {
			this.#fields[key] = fields[key]
		})
		this.hasIcon = has(this.#fields.icon)
		this.hasImage = has(this.#fields.image)
		this.hasText = has(this.#fields.text)
		this.hasValue = has(this.#fields.value)
		this.hasLabel = has(this.#fields.label)
		this.hasComponent = has(this.#fields.component)
		this.hasCurrency = has(this.#fields.currency)
		this.withPrefix = (x) => [this.#fields.iconPrefix, x].join('-').replace(/^-+/g, '')
		this.excludeFlags = omit([
			this.#fields.isDeleted,
			this.#fields.isHidden,
			this.#fields.isSelected,
			this.#fields.isFiltered,
			this.#fields.isOpen
		])
	}

	// #updateComponentMap(components) {
	// 	if (typeof components === 'object' && components) {
	// 		Object.keys(components).forEach((key) => {
	// 			this.#componentMap[key] = components[key]
	// 		})
	// 	}
	// }

	getChildMapper() {
		if (!this.#childMapper) {
			this.#childMapper = new FieldMapper(this.fields.fields ?? this.fields)
		}
		return this.#childMapper
	}
	/**
	 * @private
	 */
	prop(fieldName, value) {
		// Early return for null/undefined value
		if (isNil(value)) return null

		// For objects, look up mapped field
		if (typeof value === 'object') {
			return value[this.fields[fieldName]]
		}

		// For non-objects, only honor 'text' field
		return fieldName === 'text' ? value : null
	}
	/**
	 * Gets a mapped attribute from the original item
	 *
	 * @param {string} fieldName - Name of the field to get
	 * @returns {any|null} - The attribute value or null if not found
	 */
	get(fieldName, value, defaultValue = null) {
		// For non-objects, only honor 'text' field
		return this.prop(fieldName, value) ?? defaultValue
	}

	get fields() {
		return this.#fields
	}

	set fields(fields) {
		this.#updateFields(fields)
	}

	getIcon(value) {
		if (!this.hasIcon(value)) return null
		const icon = value[this.fields.icon]
		if (isObject(icon)) return this.withPrefix(icon[value[this.fields.state]])
		return this.withPrefix(icon)
	}

	getValue(value) {
		if (this.hasValue(value)) {
			return value[this.fields.value]
		}
		return value
	}

	getFormattedText(value, formatter) {
		const text = this.get('text', value)

		if (isNil(text)) return ''

		if (typeof formatter !== 'function') return text.toString()

		if (this.hasCurrency(value)) {
			return formatter(text, this.get('currency', value))
		}
		return formatter(text)
	}

	hasChildren(item) {
		return (
			!isNil(item) &&
			has(this.fields.children, item) &&
			Array.isArray(item[this.fields.children]) &&
			item[this.fields.children].length > 0
		)
	}

	isHidden(item) {
		return has(this.fields.isHidden, item) && item[this.fields.isHidden]
	}

	isNested(items) {
		return Array.isArray(items) && items.some((item) => this.hasChildren(item))
	}

	toggleVisibility(items, visible) {
		items.forEach((item) => {
			item[this.fields.isHidden] = !visible
			if (this.hasChildren(item)) {
				this.toggleVisibility(item[this.fields.children], visible && item[this.fields.isOpen])
			}
		})
	}

	getChildren(item) {
		return this.hasChildren(item) ? item[this.fields.children] : []
	}

	/**
	 * Finds children by an index path
	 *
	 * @param {Array<Object>} items
	 * @param {Array<number>} path
	 * @returns {Array<Object>}
	 */
	getChildrenByPath(items, path = []) {
		const result = path.reduce(
			(children, index) => children?.[index]?.[this.fields.children],
			items
		)

		if (result === undefined) throw new Error('Invalid path')
		return result
	}

	/**
	 * Finds an item by an index path
	 *
	 * @param {Array<Object>} items
	 * @param {Array<number>} path
	 * @returns {Object|null}
	 */
	getItemByPath(items, path = []) {
		// skipcq: JS-W1042 default undefined is needed
		const result = path.reduce(
			(item, index, i) => (i === 0 ? items?.[index] : item?.[this.fields.children]?.[index]),
			undefined
		)

		if (result === undefined) throw new Error('Invalid path')
		return result
	}
}
