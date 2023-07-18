import { omit } from 'ramda'

/**
 *
 * @param {string} type
 * @param {Object} options
 * @returns
 */
export function getRenderer(type, options) {
	let component = 'input'
	let properties = {}

	switch (type) {
		case 'string':
			properties = { type: 'text' }
			break
		case 'number':
			properties = { type: 'number' }
			break
		case 'boolean':
			component = 'checkbox'
			break
		case 'integer':
			properties = { type: 'number', pattern: /d+/ }
			break
		case 'enum':
			component = 'radio-group'
			break
	}

	return {
		component: options?.editor ?? component,
		properties: { ...properties, ...omit(['editor'], options) }
	}
}
