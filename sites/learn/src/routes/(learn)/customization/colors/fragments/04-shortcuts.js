import { defineConfig } from 'unocss'
import { Theme } from '@rokkit/themes'

const theme = new Theme({
	mapping: {
		surface: 'stone',
		primary: 'blue',
		secondary: 'green'
	}
})

export default defineConfig({
	shortcuts: [
		...theme.getShortcuts('surface'),
		...theme.getShortcuts('primary'),
		...theme.getShortcuts('secondary'),
		...theme.getShortcuts('info')
		// etc.
	]
})
