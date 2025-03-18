import { defaultFields } from './constants.js'
import { isNil, has, omit } from 'ramda'
import { isObject } from './utils.js'

export class FieldMapper {
	#fields = { ...defaultFields }
	#componentMap = {}
	#childMapper = null

	constructor(fields = defaultFields, componentMap = {}) {
		this.#updateFields(fields)
		this.#updateComponentMap(componentMap)
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

	#updateComponentMap(components) {
		if (typeof components === 'object' && components) {
			Object.keys(components).forEach((key) => {
				this.#componentMap[key] = components[key]
			})
		}
	}

	get fields() {
		return this.#fields
	}

	set fields(fields) {
		this.#updateFields(fields)
	}

	get componentMap() {
		return this.#componentMap
	}

	set componentMap(components) {
		this.#updateComponentMap(components)
	}

	getComponent(value) {
		if (this.hasComponent(value))
			return this.componentMap[value[this.fields.component]] ?? this.componentMap.default
		return this.componentMap.default
	}

	getIcon(value) {
		if (!this.hasIcon(value)) return null
		const icon = value[this.fields.icon]
		if (isObject(icon)) return this.withPrefix(icon[value[this.fields.state]])
		return this.withPrefix(icon)
	}
	getImage(value) {
		return this.getAttribute(value, 'image')
	}

	getValue(value) {
		if (this.hasValue(value)) {
			return value[this.fields.value]
		}
		return value
	}

	getText(value) {
		if (this.hasText(value)) {
			return value[this.fields.text]
		}
		return typeof value === 'object' ? null : value
	}

	getLabel(value) {
		return this.getAttribute(value, 'label') ?? this.getText(value)
	}

	getAttribute(value, attr) {
		if (has(attr, this.fields)) {
			return has(this.fields[attr], value) ? value[this.fields[attr]] : null
		}
		return null
	}

	getFormattedText(value, formatter) {
		const text = this.getText(value)
		if (isNil(text)) return ''

		if (typeof formatter !== 'function') return text.toString()

		if (this.hasCurrency(value)) {
			return formatter(text, this.getAttribute(value, 'currency'))
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

	isExpanded(item) {
		if (this.hasChildren(item)) {
			return has(this.fields.isOpen, item) && item[this.fields.isOpen]
		}
		return false
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

	toggleExpansion(item) {
		if (this.hasChildren(item)) {
			item[this.fields.isOpen] = !item[this.fields.isOpen]
			this.toggleVisibility(item[this.fields.children], item[this.fields.isOpen])
		}
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
