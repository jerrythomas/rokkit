import { omit } from 'ramda'

const inputProperties = {
	string: 'text',
	number: 'number',
	integer: 'number'
}

const typeComponentMap = {
	boolean: 'checkbox',
	enum: 'radio-group'
}

/**
 * Get the renderer properties for a given type
 *
 * @param {string} type
 * @param {Object} options
 * @returns
 */
export function getRenderer(type, options) {
	let component = 'input'
	let properties = {}
	if (type in inputProperties) properties.type = inputProperties[type]
	if (type in typeComponentMap) component = typeComponentMap[type]
	if (type === 'integer') properties.pattern = /\d+/

	return {
		component: options?.editor ?? component,
		properties: { ...properties, ...omit(['editor'], options) }
	}
}
