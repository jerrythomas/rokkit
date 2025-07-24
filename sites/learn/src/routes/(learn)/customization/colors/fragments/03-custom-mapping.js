import { defineConfig } from 'unocss'
import { Theme } from '@rokkit/themes'

const colors = {
	'my-custom-info': {
		50: '#e0f7fa',
		100: '#b2ebf2',
		200: '#80deea',
		300: '#4dd0e1',
		400: '#26c6da',
		500: '#00bcd4',
		600: '#00acc1',
		700: '#0097a7',
		800: '#00838f',
		900: '#006064'
	}
}

const theme = new Theme({
	colors,
	mapping: {
		info: 'my-custom-info' // Only override info
	}
})
export default defineConfig({
	theme: {
		colors: theme.getColorRules()
	}
})
