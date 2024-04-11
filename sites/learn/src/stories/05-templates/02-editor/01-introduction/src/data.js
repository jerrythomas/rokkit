export const data = {
	tenant: {
		name: 'Example',
		industry: 'Retail',
		domain: null
	},
	services: {
		identity: {
			provider: 'Okta',
			url: 'https://example.okta.com'
		},
		storage: {
			provider: 'Azure',
			url: 'https://storage.example.com'
		}
	},
	modules: {
		inventory: {
			minimum_stock: 10,
			restock_threshold: 20,
			max_age: 365
		},
		perishable: {
			minimum_stock: 5,
			restock_threshold: 10,
			max_age: 30
		}
	},
	instance: {
		type: 'production',
		language: 'en-US',
		time_zone: 'EST'
	}
}
