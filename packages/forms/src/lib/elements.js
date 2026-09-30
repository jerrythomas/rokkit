/**
 * Layout + schema + state → the `FormElement`s a `FormRenderer` draws. Pure: everything it needs
 * arrives in `ctx`, so it is testable without a FormBuilder and derivable as one `$derived`.
 *
 * @typedef {Object} ElementContext
 * @property {Object} schema
 * @property {Object} layout - the whole layout (the fallback path renders all of it)
 * @property {Record<string, unknown>} data
 * @property {(path: string) => unknown} value
 * @property {(path: string) => Object | null} message - validation message for a field
 * @property {(path: string) => boolean} dirty
 * @property {(path: string, props: Object) => void} applyLookup - fold lookup state into props
 */
/**
 * @typedef {Object} FormElement
 * @property {string} scope - JSON Pointer path (e.g., '#/email', '#/user/name')
 * @property {string} type - Input type (text, number, range, checkbox, select, etc.)
 * @property {any} value - Current value from data
 * @property {boolean} override - Whether to use custom child snippet (from layout)
 * @property {Object} props - Merged properties from schema + layout + validation
 * @property {string} [props.label] - Display label (from layout)
 * @property {string} [props.description] - Help text (from layout)
 * @property {string} [props.placeholder] - Placeholder text (from layout)
 * @property {boolean} [props.required] - Required flag (from schema)
 * @property {number} [props.min] - Minimum value (from schema)
 * @property {number} [props.max] - Maximum value (from schema)
 * @property {Object} [props.message] - Validation message object
 * @property {string} [props.message.state] - Message state: 'error', 'warning', 'info', 'success'
 * @property {string} [props.message.text] - Message text content
 * @property {boolean} [props.dirty] - Whether field value differs from initial
 */

import { getSchemaWithLayout } from './fields.js'
import { evaluateCondition } from './conditions.js'

/** Schema types with a fixed input type. */
const SCHEMA_TYPE_MAP = { boolean: 'checkbox', array: 'array' }

const pathOf = (scope) => scope.replace(/^#\//, '')

function stringInputType(props) {
	if (!props.enum && !props.options) return 'text'
	// A select reads `options`; an enum is the options when none are given.
	if (Array.isArray(props.enum) && !props.options) props.options = props.enum
	return 'select'
}

function schemaInputType(props) {
	if (props.type === 'number' || props.type === 'integer') {
		return props.min !== undefined && props.max !== undefined ? 'range' : 'number'
	}
	if (props.type === 'string') return stringInputType(props)
	return SCHEMA_TYPE_MAP[props.type] ?? 'text'
}

/**
 * The input type for a field: an explicit renderer, then a non-basic format (`email`, `date`…),
 * then its schema type — a bounded number is a range, a string with choices a select. May set
 * `props.options` from an enum.
 * @param {Record<string, any>} props
 * @returns {string}
 */
export function resolveInputType(props) {
	if (props.renderer) return props.renderer
	if (props.format && !['text', 'number'].includes(props.format)) return props.format
	return schemaInputType(props)
}

/** A display element (`display-*`): its own type, its bound value, no input. */
function displayElement(layoutEl, ctx) {
	const { type, scope: rawScope, ...props } = layoutEl
	const scope = rawScope ?? null
	const value = scope ? ctx.value(pathOf(scope)) : null
	return { type, scope, value, override: false, props }
}

/** An unscoped element — a separator, a spacer, a heading. */
function unscopedElement(layoutEl) {
	const { type, ...props } = layoutEl
	return { type: type ?? 'separator', scope: null, value: null, override: false, props }
}

function groupElement(element, path, scope, ctx) {
	const children = element.elements.map((child) => fieldElement(child, ctx, path))
	const {
		key: _key,
		elements: _elements,
		override: _override,
		props: groupProps,
		...topLevel
	} = element
	return {
		scope,
		type: 'group',
		value: ctx.value(path),
		override: element.override || false,
		props: { ...topLevel, ...groupProps, elements: children, message: ctx.message(path) }
	}
}

function readonlyElement(element, path, scope, ctx) {
	return {
		scope,
		type: 'info',
		value: ctx.value(path),
		override: element.override || false,
		props: { ...element.props, type: 'info', message: ctx.message(path) }
	}
}

function inputElement(element, path, scope, ctx) {
	// `override` is authored on the LAYOUT element, and getSchemaWithLayout folds unknown layout
	// keys into `props` — read only from `element.override` it was always false and the child
	// snippet never rendered. Take it from either place; keep it out of the input's props.
	const { override: propsOverride, ...props } = element.props ?? {}
	const type = resolveInputType(props)
	const finalProps = { ...props, type, message: ctx.message(path), dirty: ctx.dirty(path) }
	ctx.applyLookup(path, finalProps)
	return {
		scope,
		type,
		value: ctx.value(path),
		override: element.override || propsOverride || false,
		props: finalProps
	}
}

/** A combined schema+layout element → FormElement. Null for one without a key. */
function fieldElement(element, ctx, parentPath = '') {
	/* v8 ignore start -- unreachable: every element arrives from getSchemaWithLayout's output,
	   which combinedByKey keeps only when keyed and whose group children are keyed too. Kept as
	   the guard FormBuilder always had. `ignore next` does not fire on a one-line `if`. */
	if (!element.key) return null
	/* v8 ignore stop */
	const path = parentPath ? `${parentPath}/${element.key}` : element.key
	const scope = `#/${path}`
	if (element.elements) return groupElement(element, path, scope, ctx)
	if (element.props.readonly) return readonlyElement(element, path, scope, ctx)
	return inputElement(element, path, scope, ctx)
}

/** The schema-merged element for each scoped, non-display layout element, by field key. */
function combinedByKey(layoutElements, ctx) {
	const elements = layoutElements.filter((el) => el.scope && !el.type?.startsWith('display-'))
	const combined = getSchemaWithLayout(ctx.schema, { ...ctx.layout, elements })
	return new Map((combined.elements ?? []).filter((el) => el.key).map((el) => [el.key, el]))
}

function scopedElement(layoutEl, combined, ctx) {
	if (layoutEl.showWhen && !evaluateCondition(layoutEl.showWhen, ctx.data)) return null
	const merged = combined.get(pathOf(layoutEl.scope).split('/').pop())
	return merged ? fieldElement(merged, ctx) : null
}

function layoutElement(layoutEl, combined, ctx) {
	if (layoutEl.type?.startsWith('display-')) return displayElement(layoutEl, ctx)
	if (!layoutEl.scope) return unscopedElement(layoutEl)
	return scopedElement(layoutEl, combined, ctx)
}

/** Last resort when building fails: every scoped layout element as a plain text input. */
function plainElements(ctx) {
	return (ctx.layout.elements ?? [])
		.filter((el) => el.scope)
		.map(({ scope, label, override = false, ...layoutProps }) => {
			const path = pathOf(scope)
			const props = {
				label: label || path,
				...layoutProps,
				message: ctx.message(path),
				dirty: ctx.dirty(path),
				type: 'text'
			}
			return { scope, type: 'text', value: ctx.value(path), override, props }
		})
}

/**
 * The FormElements for the given layout elements (a step's, or a flat layout's).
 *
 * A field hidden by `showWhen` has no element. If building throws — a layout scope the schema
 * does not know is one way — the whole layout falls back to plain text inputs rather than
 * rendering nothing.
 *
 * @param {Object[]} layoutElements
 * @param {ElementContext} ctx
 */
export function buildElements(layoutElements, ctx) {
	try {
		const combined = combinedByKey(layoutElements, ctx)
		return layoutElements.map((el) => layoutElement(el, combined, ctx)).filter(Boolean)
	} catch (error) {
		console.warn('Failed to build elements:', error) // eslint-disable-line no-console
		return plainElements(ctx)
	}
}
