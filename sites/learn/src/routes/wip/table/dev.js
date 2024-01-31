export const dev = {
	theme: {
		logo: 'development.png',
		environment: 'dev',
		palette: {
			primary: {
				main: '#2196F3',
				light: '#64B5F6',
				dark: '#1565C0'
			},
			neutral: {
				main: '#B0BEC5',
				light: '#CFD8DC',
				dark: '#78909C'
			}
		}
	},
	modules: {
		inventory: {
			minimum_stock: 10,
			reorder_quantity: 20,
			retention_period: 30,
			inventory_prefix: 'WG'
		}
	}
}
