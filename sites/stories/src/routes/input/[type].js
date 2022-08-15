import * as types from '../../config/models/input'
// const variants = {
// 	text: {
// 		props: { label: 'Text input with label' },
// 		fields: [
// 			{ key: 'label', type: 'text' },
// 			{ key: 'placeholder', type: 'text' },
// 			{ key: 'pass', type: 'checkbox' },
// 			{ key: 'fail', type: 'checkbox' },
// 			{ key: 'readOnly', type: 'checkbox' }
// 		]
// 	},
// 	number: {
// 		props: { label: 'Number input with label' },
// 		fields: [
// 			{ key: 'label', type: 'text' },
// 			{ key: 'placeholder', type: 'text' },
// 			{ key: 'pass', type: 'checkbox' },
// 			{ key: 'fail', type: 'checkbox' },
// 			{ key: 'readOnly', type: 'checkbox' },
// 			{ key: 'min', type: 'number' },
// 			{ key: 'max', type: 'number' }
// 		]
// 	},
// 	rating: {
// 		props: { label: 'Rate something', max: 5 },
// 		fields: [
// 			{ key: 'label', type: 'text' },
// 			{ key: 'max', type: 'number', props: { min: 3, max: 8 } },
// 			{ key: 'readOnly', type: 'checkbox', props: { value: false } }
// 		]
// 	},
// 	json: {
// 		props: { label: 'Some json data', value: { x: 1, y: 2 } },
// 		fields: [
// 			{ key: 'label', type: 'text' },
// 			{
// 				key: 'value',
// 				type: 'object',
// 				props: {
// 					fields: [
// 						{ key: 'x', type: 'number' },
// 						{ key: 'y', type: 'number' }
// 					]
// 				}
// 			}
// 		]
// 	},
// 	checkbox: {
// 		props: { label: 'Check on/off' },
// 		fields: [
// 			{ key: 'label', type: 'text' },
// 			{
// 				key: 'pass',
// 				type: 'checkbox'
// 			},
// 			{
// 				key: 'fail',
// 				type: 'checkbox'
// 			},
// 			{
// 				key: 'readOnly',
// 				type: 'checkbox'
// 			}
// 		]
// 	},
// 	object: {
// 		props: {
// 			label: 'Edit an object',
// 			value: { x: 1, y: 2 },
// 			fields: [
// 				{ key: 'x', type: 'number' },
// 				{ key: 'y', type: 'number' }
// 			]
// 		},
// 		fields: [
// 			{ key: 'label', type: 'text' },
// 			{
// 				key: 'fields',
// 				type: 'array',
// 				props: {
// 					fields: [
// 						{ key: 'key', type: 'text' },
// 						{ key: 'type', type: 'text' }
// 					]
// 				}
// 			}
// 		]
// 	},
// 	array: {
// 		props: {
// 			label: 'Edit an array',
// 			value: [
// 				{ a: 1, b: 2 },
// 				{ a: 3, b: 4 }
// 			],
// 			fields: [
// 				{ key: 'a', type: 'number' },
// 				{ key: 'b', type: 'number' }
// 			]
// 		},
// 		fields: [
// 			{ key: 'label', type: 'text' },
// 			{
// 				key: 'allowAdd',
// 				type: 'checkbox',
// 				props: { value: false }
// 			},
// 			{
// 				key: 'allowClose',
// 				type: 'checkbox',
// 				props: { value: false }
// 			},
// 			{
// 				key: 'fields',
// 				type: 'array',
// 				props: {
// 					fields: [
// 						{ key: 'key', type: 'text' },
// 						{ key: 'type', type: 'text' }
// 					]
// 				}
// 			}
// 		]
// 	}
// }

/** @type {import('./[types]__types').RequestHandler}  */
export async function GET({ params }) {
	if (params.type in types) {
		return {
			status: 200,
			headers: {},
			body: { type: params.type, ...types[params.type] }
		}
	} else {
		return {
			status: 200,
			headers: {},
			body: { type: params.type }
		}
	}
}
