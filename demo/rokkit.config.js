export default {
	colors: {
		surface: 'slate',
		primary: 'orange',
		secondary: 'pink'
	},
	skins: {
		default: { surface: 'slate', primary: 'orange', secondary: 'pink' },
		ocean: { primary: 'sky', secondary: 'teal', surface: 'slate' },
		violet: { primary: 'violet', secondary: 'purple', surface: 'zinc' },
		rose: { primary: 'rose', secondary: 'pink', surface: 'slate' },
		emerald: { primary: 'emerald', secondary: 'teal', surface: 'gray' }
	},
	themes: ['rokkit', 'minimal', 'material', 'frosted'],
	typography: {
		display: "'Fraunces', 'Iowan Old Style', Georgia, serif",
		sans: "'Inter', system-ui, -apple-system, sans-serif",
		mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace"
	},
	icons: {
		app: '@rokkit/icons/app.json',
		glyph: '@rokkit/icons/glyph.json'
	},
	switcher: 'full',
	storageKey: 'sensei-theme',
	chart: {
		colors: ['sky', 'emerald', 'rose', 'amber', 'violet', 'blue', 'pink', 'teal'],
		shades: {
			light: { fill: '300', stroke: '700' },
			dark: { fill: '500', stroke: '200' }
		}
	}
}
