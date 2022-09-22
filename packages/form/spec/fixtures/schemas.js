export const person = {
	// $id: 'https://example.com/person.schema.json',
	// $schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'Person',
	type: 'object',
	properties: {
		firstName: {
			type: 'string',
			description: "The person's first name."
		},
		lastName: {
			type: 'string',
			description: "The person's last name."
		},
		age: {
			description: 'Age in years which must be equal to or greater than zero.',
			type: 'integer',
			minimum: 0
		}
	}
}

export const list = {
	// $schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'Person',
	type: 'array',
	items: {
		type: 'object',
		properties: {
			firstName: {
				type: 'string',
				description: "The person's first name."
			},
			lastName: {
				type: 'string',
				description: "The person's last name."
			},
			age: {
				description:
					'Age in years which must be equal to or greater than zero.',
				type: 'integer',
				minimum: 0
			}
		}
	}
}

export const listEdit = [
	{
		component: 'layout',
		properties: { class: 'master-detail' },
		items: [
			{ component: 'list', properties: { schema: person } },
			{
				component: 'layout',
				properties: { class: 'vertical' },
				items: [
					{
						key: 'name',
						component: 'input',
						properties: { type: 'string' }
					},
					{
						key: 'summary',
						component: 'input',
						properties: { type: 'text', rows: 5 }
					},
					{
						key: 'age',
						component: 'input',
						properties: { type: 'number', pattern: '^d+$' }
					}
				]
			}
		]
	}
]
export const mixedList = {
	// $schema: 'https://json-schema.org/draft/2020-12/schema',
	title: 'Person',
	type: 'array',
	items: {
		type: 'object',
		properties: {
			firstName: {
				type: 'string',
				description: "The person's first name."
			},
			lastName: {
				type: 'string',
				description: "The person's last name."
			},
			age: {
				description:
					'Age in years which must be equal to or greater than zero.',
				type: 'integer',
				minimum: 0
			}
		}
	}
}
