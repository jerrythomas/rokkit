export default {
	colors: {
		surface: 'shark'
	},
	skins: {
		default: { surface: 'shark' },
		'grada-ui': {
			primary: 'orange',
			secondary: 'violet',
			accent: 'purple',
			surface: 'slate',
			success: 'green',
			warning: 'yellow',
			danger: 'rose',
			error: 'rose',
			info: 'purple'
		},
		vibrant: { primary: 'blue', secondary: 'purple' },
		seaweed: {
			primary: 'sky',
			secondary: 'green',
			accent: 'blue',
			danger: 'rose',
			error: 'rose',
			success: 'lime',
			surface: 'zinc',
			warning: 'amber',
			info: 'indigo'
		}
	},
	themes: ['rokkit'],
	icons: {
		app: '@rokkit/icons/app.json',
		logo: '@rokkit/icons/auth.json',
		glyph: '@rokkit/icons/glyph.json',
		file: './static/icons/files/icons.json',
		solar: '@iconify-json/solar/icons.json'
	},
	switcher: 'full',
	storageKey: 'rokkit-theme'
}
