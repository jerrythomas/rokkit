import { defaultFields } from './constants'
import { isNil, has } from 'ramda'
import { isObject } from './utils'

export class FieldMapper {
	#fields = { ...defaultFields }
	#componentMap = {}

	constructor(fields = defaultFields, componentMap = {}) {
		this.fields = fields
		this.componentMap = componentMap
	}

	set fields(fields) {
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
	}

	set componentMap(components) {
		if (typeof components === 'object' && components) {
			Object.keys(components).forEach((key) => {
				this.#componentMap[key] = components[key]
			})
		}
	}

	getComponent(value) {
		if (this.hasComponent(value))
			return this.#componentMap[value[this.#fields.component]] ?? this.#componentMap.default
		return this.#componentMap.default
	}

	getIcon(value) {
		if (!this.hasIcon(value)) return null
		const icon = value[this.#fields.icon]
		if (isObject(icon)) return this.withPrefix(icon[value[this.#fields.state]])
		return this.withPrefix(icon)
	}
	getImage(value) {
		return this.getAttribute(value, this.#fields.image)
	}

	getValue(value) {
		if (this.hasValue(value)) {
			return value[this.#fields.value]
		}
		return value
	}

	getText(value) {
		if (this.hasText(value)) {
			return value[this.#fields.text]
		}
		return typeof value === 'object' ? null : value
	}

	getLabel(value) {
		return this.getAttribute(value, this.#fields.label)
	}

	getAttribute(value, attr) {
		if (has(attr, value)) {
			return value[attr]
		}
		return null
	}

	getFormattedText(value, formatter) {
		const text = this.getText(value)
		if (isNil(text)) return ''

		if (typeof formatter !== 'function') return text.toString()

		if (this.hasCurrency(value)) {
			return formatter(text, this.getAttribute(value, this.#fields.currency))
		}
		return formatter(text)
	}

	hasChildren(item) {
		return has(this.#fields.children, item) && Array.isArray(item[this.#fields.children])
	}

	isExpanded(item) {
		if (this.hasChildren(item)) {
			return has(this.#fields.isOpen, item) && item[this.#fields.isOpen]
		}
		return false
	}

	isNested(items) {
		return Array.isArray(items) && items.some((item) => this.hasChildren(item))
	}
}
