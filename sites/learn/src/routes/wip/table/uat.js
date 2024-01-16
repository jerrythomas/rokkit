export const uat = {
	theme: {
		logo: 'acceptance.png',
		environment: 'uat',
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
		},
		status: {
			warn: {
				main: '#FFC107',
				light: '#FFD54F',
				dark: '#FFA000'
			},
			error: {
				main: '#FF5252',
				light: '#EF9A9A',
				dark: '#D32F2F'
			},
			info: {
				main: '#2196F3',
				light: '#90CAF9',
				dark: '#1565C0'
			},
			success: {
				main: '#4CAF50',
				light: '#81C784',
				dark: '#388E3C'
			}
		}
	},
	departments: ['Sales', 'Marketing', 'Finance'],
	modules: [
		{
			name: 'Module1',
			enabled: true
		},
		{
			name: 'Module2',
			enabled: false
		},
		{
			name: 'Module3',
			enabled: true
		}
	]
}
