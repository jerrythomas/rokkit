// People is  alist of person type.
// The master detail component can be used to list all items and also edit an item individually.
// This
export const peopleSchema = {
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
