export const data = {
	tenant: {
		name: 'Walgreens',
		industry: 'Retail',
		domain: 'Health & Wellness'
	},
	services: {
		identity: {
			provider: 'Okta',
			url: 'https://walgreens.okta.com'
		},
		storage: {
			provider: 'Azure',
			url: 'https://walgreens.blob.core.windows.net'
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
