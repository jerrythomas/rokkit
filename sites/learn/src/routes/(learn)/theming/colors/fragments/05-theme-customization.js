// Customizing the palette
const mapping = {
	primary: 'norway' // Override Primary color with custom color
}

const colors = {
	norway: {
		DEFAULT: '#83A666',
		50: '#E1EADA',
		100: '#D7E2CE',
		200: '#C2D3B4',
		300: '#ADC49A',
		400: '#98B580',
		500: '#83A666',
		600: '#6F9054',
		700: '#5B7645',
		800: '#475C36',
		900: '#334227',
		950: '#29361F'
	}
	// Include other palette colors with custom values as needed
}

themeRules('custom', mapping, colors)
