import { presetRokkit } from '@rokkit/unocss'

const preset = presetRokkit({
	// Override semantic color → Tailwind palette name
	colors: {
		primary: 'violet',
		surface: 'zinc'
	},

	// Define color skin variants (activated via data-palette attribute)
	skins: {
		ocean: { primary: 'blue', secondary: 'cyan' }
	},

	// Register icon collections
	icons: {
		solar: '@iconify-json/solar/icons.json'
	},

	// Which theme styles to include (rokkit | minimal | material)
	themes: ['rokkit', 'minimal'],

	// Theme switcher mode: 'manual' | 'full'
	switcher: 'full'
})
