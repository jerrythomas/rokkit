const variants = {
	text: {
		props: { label: 'Text input with label' },
		fields: [
			{ key: 'label', type: 'text' },
			{ key: 'placeholder', type: 'text' },
			{ key: 'readOnly', type: 'checkbox' }
		]
	}
}

/** @type {import('./[types]__types').RequestHandler}  */
export async function GET({ params }) {
	if (params.type in variants) {
		const { props, fields } = variants[params.type]
		return {
			status: 200,
			headers: {},
			body: { type: params.type, props, fields }
		}
	} else {
		return {
			status: 200,
			headers: {},
			body: { type: params.type }
		}
	}
}
