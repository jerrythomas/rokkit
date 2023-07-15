export const messages = {
	required: '{name} is required',
	email: '{name} should be a valid email address',
	url: '{name} should be a valid URL',
	color: '{name} should be a valid color',
	number: '{name} should be a valid number',
	min: '{name} should be greater than or equal to {min}',
	max: '{name} should be less than or equal to {max}',
	pattern: '{name} should match the pattern {pattern}',
	exclusiveMin: '{name} should be greater than {min}',
	exclusiveMax: '{name} should be less than {max}',
	minLength: '{name} should be at least {minLength} characters',
	maxLength: '{name} should be at most {maxLength} characters',
	minItems: '{name} should have at least {minItems} items',
	maxItems: '{name} should have at most {maxItems} items',
	uniqueItems: '{name} should have unique items',
	contains: '{name} should contain {contains}',
	exclude: '{name} should not contain {exclude}',
	integer: '{name} should be an integer'
}

export const dataTypes = {
	integer: {
		editor: 'inputText',
		props: { type: 'number', step: 1 },
		availableProps: ['min', 'max']
	},
	number: {
		editor: 'inputText',
		props: { type: 'number', step: 0.01 },
		availableProps: ['min', 'max']
	},
	range: {
		editor: 'inputRange',
		props: { type: 'range' }
	},

	string: {
		default: 'inputText',
		text: 'inputText',
		password: 'inputPassword',
		email: 'inputEmail',
		url: 'inputUrl',
		tel: 'inputTel',
		date: 'inputDate',
		'datetime-local': 'inputDateTimeLocal',
		time: 'inputTime',
		week: 'inputWeek',
		month: 'inputMonth',
		file: 'inputFile',
		hidden: 'inputHidden',
		color: 'inputColor',
		colorpicker: 'inputColorPicker'
	},
	enum: {
		default: 'inputSelect',
		select: 'inputSelect',
		radio: 'inputRadio'
	},
	boolean: {
		default: 'inputCheckbox',
		checkbox: 'inputCheckbox',
		switch: 'inputSwitch',
		radio: 'inputRadio'
	},
	array: {
		default: 'inputArray'
	},
	object: {
		default: 'inputObject'
	}
}
export function deriveRulesFromSchema(entity) {
	const rules = []
	for (const [key, value] of Object.entries(entity)) {
		rules.push({
			text: 'Required',
			value,
			key
		})
	}
}
