// uno.config.js
import { defineConfig } from 'unocss'
import { themeRules } from '@rokkit/themes'

export default defineConfig({
	rules: themeRules({
		icons: {
			add: 'i-glyph:add-circle',
			remove: 'i-glyph:minus-circle',
			expand: 'i-glyph:alt-arrow-down',
			collapse: 'i-glyph:alt-arrow-up',
			check: 'i-glyph:check-circle',
			close: 'i-glyph:close-circle'
		}
	})
})
