import Ajv from 'ajv'

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

// export function updateLayout(layout, errors){
// 	return errors
// }
