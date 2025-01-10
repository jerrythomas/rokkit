import { defaultFields } from './constants'
import {
	getComponent,
	getIcon,
	getValue,
	getText,
	getAttribute,
	getFormattedText,
	hasChildren,
	isExpanded,
	isNested
} from './mapping'

export class FieldMapper {
	_fields = {}
	_using = {}

	constructor(fields = defaultFields, using = {}) {
		this.fields = fields
		this.using = using
	}

	get fields() {
		return this._fields
	}

	set fields(fields) {
		this._fields = { ...defaultFields, ...fields }
	}

	get using() {
		return this._using
	}
	set using(using) {
		this._using = using ?? {}
	}

	getComponent(value) {
		return getComponent(value, this.fields, this.using)
	}

	getIcon(value) {
		return getIcon(value, this.fields)
	}

	getValue(node) {
		return getValue(node, this.fields)
	}

	getText(node) {
		return getText(node, this.fields)
	}

	getAttribute(node, attr) {
		return getAttribute(node, attr)
	}

	getFormattedText(node, formatter) {
		return getFormattedText(node, this.fields, formatter)
	}

	hasChildren(item) {
		return hasChildren(item, this.fields)
	}

	isExpanded(item) {
		return isExpanded(item, this.fields)
	}

	isNested(items) {
		return Array.isArray(items) && items.some((item) => this.hasChildren(item))
	}
}
