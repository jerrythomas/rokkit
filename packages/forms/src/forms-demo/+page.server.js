import { deriveSchemaFromValue, deriveLayoutFromValue, getSchemaWithLayout } from '$lib/forms/lib'

/**
 * Sample data with various input types for testing
 */
const sampleData = {
	personal: {
		name: 'John Doe',
		email: 'john@example.com',
		age: 30,
		birthdate: '1993-05-15',
		phone: '+1 (555) 123-4567',
		bio: 'This is a sample biography text that spans multiple lines.',
		newsletter: true
	},
	address: {
		street: '123 Main Street',
		city: 'Springfield',
		state: 'IL',
		zip: 62701,
		country: 'United States'
	},
	preferences: {
		theme: 'dark',
		notifications: ['email', 'push'],
		privacyLevel: 2,
		interests: ['technology', 'design', 'photography']
	},
	metrics: {
		height: 182.5,
		weight: 75.2,
		bloodPressure: {
			systolic: 120,
			diastolic: 80
		}
	},
	schedule: {
		workHours: {
			start: '09:00',
			end: '17:00'
		},
		meetingTime: '14:30:00',
		weekAvailability: {
			monday: true,
			tuesday: true,
			wednesday: true,
			thursday: true,
			friday: true,
			saturday: false,
			sunday: false
		}
	},
	security: {
		twoFactor: true,
		accountType: 'premium',
		lastPasswordChange: '2023-04-10T15:30:45'
	}
}

/**
 * Custom schema with validation rules
 */
const schema = {
	type: 'object',
	properties: {
		personal: {
			type: 'object',
			properties: {
				name: { type: 'string', minLength: 3, maxLength: 100 },
				email: { type: 'string', format: 'email' },
				age: { type: 'number', min: 18, max: 120 },
				birthdate: { type: 'string', format: 'date' },
				phone: { type: 'string', pattern: '[0-9+() -]{7,20}' },
				bio: { type: 'string', multiline: true, maxLength: 500 },
				newsletter: { type: 'boolean' }
			},
			required: ['name', 'email', 'age']
		},
		address: {
			type: 'object',
			properties: {
				street: { type: 'string' },
				city: { type: 'string' },
				state: { type: 'string' },
				zip: { type: 'number', min: 10000, max: 99999 },
				country: { type: 'string' }
			},
			required: ['street', 'city', 'zip']
		},
		preferences: {
			type: 'object',
			properties: {
				theme: {
					type: 'string',
					enum: ['light', 'dark', 'system'],
					default: 'system'
				},
				notifications: {
					type: 'array',
					items: { type: 'string', enum: ['email', 'sms', 'push'] }
				},
				privacyLevel: {
					type: 'number',
					min: 1,
					max: 3,
					step: 1
				},
				interests: {
					type: 'array',
					items: { type: 'string' },
					uniqueItems: true
				}
			}
		},
		metrics: {
			type: 'object',
			properties: {
				height: { type: 'number', min: 0, unit: 'cm' },
				weight: { type: 'number', min: 0, unit: 'kg' },
				bloodPressure: {
					type: 'object',
					properties: {
						systolic: { type: 'number', min: 70, max: 190 },
						diastolic: { type: 'number', min: 40, max: 100 }
					}
				}
			}
		},
		schedule: {
			type: 'object',
			properties: {
				workHours: {
					type: 'object',
					properties: {
						start: { type: 'string', format: 'time' },
						end: { type: 'string', format: 'time' }
					}
				},
				meetingTime: { type: 'string', format: 'time' },
				weekAvailability: {
					type: 'object',
					properties: {
						monday: { type: 'boolean' },
						tuesday: { type: 'boolean' },
						wednesday: { type: 'boolean' },
						thursday: { type: 'boolean' },
						friday: { type: 'boolean' },
						saturday: { type: 'boolean' },
						sunday: { type: 'boolean' }
					}
				}
			}
		},
		security: {
			type: 'object',
			properties: {
				twoFactor: { type: 'boolean' },
				accountType: {
					type: 'string',
					enum: ['basic', 'premium', 'enterprise']
				},
				lastPasswordChange: { type: 'string', format: 'datetime-local' }
			}
		}
	}
}

/**
 * Custom layout for the form
 */
const layout = {
	type: 'vertical',
	elements: [
		{
			key: 'personal',
			type: 'vertical',
			title: 'Personal Information',
			elements: [
				{
					key: 'name',
					label: 'Full Name',
					placeholder: 'Enter your full name',
					required: true
				},
				{
					type: 'horizontal',
					elements: [
						{
							key: 'email',
							label: 'Email Address',
							placeholder: 'your@email.com',
							required: true,
							span: 8
						},
						{
							key: 'age',
							label: 'Age',
							type: 'number',
							required: true,
							span: 4
						}
					]
				},
				{
					key: 'birthdate',
					label: 'Date of Birth',
					type: 'date'
				},
				{
					key: 'phone',
					label: 'Phone Number',
					placeholder: '+1 (123) 456-7890'
				},
				{
					key: 'bio',
					label: 'Biography',
					type: 'textarea',
					rows: 4,
					placeholder: 'Tell us about yourself...'
				},
				{
					key: 'newsletter',
					label: 'Subscribe to newsletter',
					type: 'checkbox'
				}
			]
		},
		{
			key: 'address',
			type: 'vertical',
			title: 'Address',
			elements: [
				{
					key: 'street',
					label: 'Street Address',
					required: true
				},
				{
					type: 'horizontal',
					elements: [
						{
							key: 'city',
							label: 'City',
							required: true,
							span: 6
						},
						{
							key: 'state',
							label: 'State/Province',
							span: 3
						},
						{
							key: 'zip',
							label: 'ZIP/Postal Code',
							type: 'number',
							required: true,
							span: 3
						}
					]
				},
				{
					key: 'country',
					label: 'Country'
				}
			]
		},
		{
			key: 'preferences',
			type: 'vertical',
			title: 'Preferences',
			elements: [
				{
					key: 'theme',
					label: 'Theme',
					type: 'select',
					options: [
						{ value: 'light', label: 'Light' },
						{ value: 'dark', label: 'Dark' },
						{ value: 'system', label: 'System Default' }
					]
				},
				{
					key: 'notifications',
					label: 'Notification Methods',
					type: 'checkbox-group',
					options: [
						{ value: 'email', label: 'Email' },
						{ value: 'sms', label: 'SMS' },
						{ value: 'push', label: 'Push Notifications' }
					]
				},
				{
					key: 'privacyLevel',
					label: 'Privacy Level',
					type: 'range',
					min: 1,
					max: 3,
					step: 1,
					marks: [
						{ value: 1, label: 'Public' },
						{ value: 2, label: 'Limited' },
						{ value: 3, label: 'Private' }
					]
				},
				{
					key: 'interests',
					label: 'Interests',
					type: 'tags',
					placeholder: 'Add interests...'
				}
			]
		},
		{
			key: 'metrics',
			type: 'vertical',
			title: 'Metrics',
			elements: [
				{
					type: 'horizontal',
					elements: [
						{
							key: 'height',
							label: 'Height (cm)',
							type: 'number',
							step: 0.1,
							span: 6
						},
						{
							key: 'weight',
							label: 'Weight (kg)',
							type: 'number',
							step: 0.1,
							span: 6
						}
					]
				},
				{
					key: 'bloodPressure',
					type: 'vertical',
					label: 'Blood Pressure',
					elements: [
						{
							type: 'horizontal',
							elements: [
								{
									key: 'systolic',
									label: 'Systolic',
									type: 'number',
									span: 6
								},
								{
									key: 'diastolic',
									label: 'Diastolic',
									type: 'number',
									span: 6
								}
							]
						}
					]
				}
			]
		},
		{
			key: 'schedule',
			type: 'vertical',
			title: 'Schedule',
			elements: [
				{
					key: 'workHours',
					type: 'vertical',
					label: 'Work Hours',
					elements: [
						{
							type: 'horizontal',
							elements: [
								{
									key: 'start',
									label: 'Start Time',
									type: 'time',
									span: 6
								},
								{
									key: 'end',
									label: 'End Time',
									type: 'time',
									span: 6
								}
							]
						}
					]
				},
				{
					key: 'meetingTime',
					label: 'Preferred Meeting Time',
					type: 'time'
				},
				{
					key: 'weekAvailability',
					type: 'vertical',
					label: 'Weekly Availability',
					elements: [
						{
							type: 'horizontal',
							elements: [
								{
									key: 'monday',
									label: 'Monday',
									type: 'checkbox',
									span: 4
								},
								{
									key: 'tuesday',
									label: 'Tuesday',
									type: 'checkbox',
									span: 4
								},
								{
									key: 'wednesday',
									label: 'Wednesday',
									type: 'checkbox',
									span: 4
								}
							]
						},
						{
							type: 'horizontal',
							elements: [
								{
									key: 'thursday',
									label: 'Thursday',
									type: 'checkbox',
									span: 4
								},
								{
									key: 'friday',
									label: 'Friday',
									type: 'checkbox',
									span: 4
								},
								{
									key: 'saturday',
									label: 'Saturday',
									type: 'checkbox',
									span: 4
								}
							]
						},
						{
							type: 'horizontal',
							elements: [
								{
									key: 'sunday',
									label: 'Sunday',
									type: 'checkbox',
									span: 4
								}
							]
						}
					]
				}
			]
		},
		{
			key: 'security',
			type: 'vertical',
			title: 'Security',
			elements: [
				{
					key: 'twoFactor',
					label: 'Enable Two-Factor Authentication',
					type: 'checkbox'
				},
				{
					key: 'accountType',
					label: 'Account Type',
					type: 'radio-group',
					options: [
						{ value: 'basic', label: 'Basic' },
						{ value: 'premium', label: 'Premium' },
						{ value: 'enterprise', label: 'Enterprise' }
					]
				},
				{
					key: 'lastPasswordChange',
					label: 'Last Password Change',
					type: 'datetime-local',
					readonly: true
				}
			]
		}
	]
}

/**
 * Get combined schema and layout
 */
const combinedSchema = getSchemaWithLayout(schema, layout)

/**
 * Load function to provide data to the page
 */
export function load() {
	return {
		schema,
		layout,
		combinedSchema,
		value: sampleData
	}
}
