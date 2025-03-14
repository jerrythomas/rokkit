export const layout = {
	type: 'vertical',
	elements: [
		{
			title: 'name',
			type: 'horizontal',
			elements: [
				{
					label: 'First Name',
					scope: '#/first_name'
				},
				{
					label: 'Last Name',
					scope: '#/last_name'
				}
			]
		},
		{
			label: 'gender',
			scope: '#/gender'
		},
		{
			label: 'age',
			scope: '#/age'
		}
	]
}
