// uno.config.js
import { themeRules } from '@rokkit/themes'

export default defineConfig({
	rules: themeRules({
		colors: {
			primary: {
				50: '#eff6ff',
				100: '#dbeafe',
				// ... full shade scale
				900: '#1e3a5f'
			}
		}
	})
})
