import Ajv from 'ajv'
import { omit } from 'ramda'

const mapTypes = {
	enum: (props) => (props.items.length > 3 ? 'select' : 'radio'),
	uuid: () => 'text',
	float: () => 'number',
	integer: () => 'number',
	string: (props) => (props.maxLength < 255 ? 'text' : 'textarea'),
	boolean: () => 'checkbox'
}

const mapPatterns = {
	float: () => '^[0-9]+.[0-9]+$',
	integer: () => '^[0-9]+$',
	uuid: () =>
		'^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$'
}

export function validate(schema, data) {
	const ajv = new Ajv({ allErrors: true })
	ajv.addVocabulary(['hasChanged', 'widget'])
	const valid = ajv.validate(schema, data)
	let result = { ...schema }

	if (!valid) {
		ajv.errors.map((err) => {
			let ref = result
			err.schemaPath
				.split('/')
				.slice(1, -1)
				.map((k) => {
					ref[k] = { ...ref[k] }
					ref = ref[k]
				})
			if (ref['hasChanged']) ref.error = err.message
		})
	}
	return result
}

export function deriveLayout(schema) {
	return [schema]
}

export function propsFromSchema(props) {
	let { component, type, pattern } = props
	let result = { ...omit(['component'], props) }
	if (!component) {
		component = 'Input'
	}
	if (type in mapTypes) {
		result = { ...result, type: mapTypes[type](props) }
	}

	if (type in mapPatterns && !pattern) {
		result = { pattern: mapPatterns[type](), ...result }
	}
	return { component, properties: result }
}
