export default {
	colors: {
		surface: 'slate'
	},
	skins: {
		default: { surface: 'slate' },
		ocean: { primary: 'sky', secondary: 'teal', surface: 'slate' },
		violet: { primary: 'violet', secondary: 'purple', surface: 'zinc' },
		rose: { primary: 'rose', secondary: 'pink', surface: 'slate' },
		emerald: { primary: 'emerald', secondary: 'teal', surface: 'gray' }
	},
	themes: ['rokkit', 'minimal', 'material', 'frosted'],
	icons: {
		app: '@rokkit/icons/app.json',
		glyph: '@rokkit/icons/glyph.json'
	},
	switcher: 'full',
	storageKey: 'rokkit-demo-theme',
	chart: {
		colors: ['sky', 'emerald', 'rose', 'amber', 'violet', 'blue', 'pink', 'teal'],
		shades: {
			light: { fill: '300', stroke: '700' },
			dark: { fill: '500', stroke: '200' }
		}
	}
}
