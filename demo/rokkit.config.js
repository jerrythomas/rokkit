export default {
	/**
	 * Zen-Sumi OKLCH palettes — baked in as the base token system.
	 * These are merged with Tailwind defaultColors so both custom and
	 * named Tailwind palettes remain available for skins / theme overrides.
	 */
	palettes: {
		/** kami — warm neutral, from washi paper (z0) to sumi ink (z9/z10) */
		kami: {
			50:  'oklch(0.975 0.008 85)',
			100: 'oklch(0.955 0.010 85)',
			200: 'oklch(0.920 0.012 85)',
			300: 'oklch(0.880 0.015 85)',
			400: 'oklch(0.750 0.008 50)',
			500: 'oklch(0.580 0.010 50)',
			600: 'oklch(0.450 0.012 50)',
			700: 'oklch(0.380 0.012 50)',
			800: 'oklch(0.300 0.012 50)',
			900: 'oklch(0.220 0.012 50)',
			950: 'oklch(0.170 0.010 85)',
		},
		/** shu — vermillion, primary accent */
		shu: {
			50:  'oklch(0.960 0.020 35)',
			100: 'oklch(0.920 0.040 35)',
			200: 'oklch(0.860 0.070 35)',
			300: 'oklch(0.780 0.100 35)',
			400: 'oklch(0.680 0.130 35)',
			500: 'oklch(0.580 0.150 35)',
			600: 'oklch(0.500 0.140 35)',
			700: 'oklch(0.420 0.120 35)',
			800: 'oklch(0.350 0.100 35)',
			900: 'oklch(0.280 0.080 35)',
			950: 'oklch(0.220 0.060 35)',
		},
		/** hisui — jade green, secondary / success */
		hisui: {
			50:  'oklch(0.960 0.015 160)',
			100: 'oklch(0.920 0.030 160)',
			200: 'oklch(0.860 0.050 160)',
			300: 'oklch(0.780 0.065 160)',
			400: 'oklch(0.700 0.075 160)',
			500: 'oklch(0.620 0.080 160)',
			600: 'oklch(0.540 0.075 160)',
			700: 'oklch(0.460 0.065 160)',
			800: 'oklch(0.380 0.055 160)',
			900: 'oklch(0.300 0.045 160)',
			950: 'oklch(0.240 0.035 160)',
		},
		/** kohaku — amber, tertiary / warning */
		kohaku: {
			50:  'oklch(0.970 0.020 75)',
			100: 'oklch(0.940 0.040 75)',
			200: 'oklch(0.890 0.070 75)',
			300: 'oklch(0.830 0.095 75)',
			400: 'oklch(0.780 0.110 75)',
			500: 'oklch(0.720 0.120 75)',
			600: 'oklch(0.640 0.110 75)',
			700: 'oklch(0.560 0.095 75)',
			800: 'oklch(0.480 0.080 75)',
			900: 'oklch(0.400 0.065 75)',
			950: 'oklch(0.320 0.050 75)',
		}
	},

	/**
	 * Role → palette mapping. Drives --color-* CSS vars at :root AND generates
	 * semantic shortcut classes (bg-success-z5, text-warning-z5, text-on-danger …).
	 * Every role used in component CSS must be listed here.
	 */
	colors: {
		surface:   'kami',
		primary:   'shu',
		secondary: 'hisui',
		tertiary:  'kohaku',
		accent:    'shu',
		success:   'hisui',
		warning:   'kohaku',
		danger:    'shu',
		error:     'shu',
		info:      'kohaku'
	},

	/** Use oklch() wrapper so OKLCH palette values work correctly with opacity utilities */
	colorSpace: 'oklch',

	shape: {
		radius: 'soft'
	},

	/**
	 * Skins still reference Tailwind named colors (available via defaultColors merge).
	 * They override the base zen-sumi palette when activated via the ThemePanel.
	 */
	skins: {
		default:  { surface: 'kami',  primary: 'shu',     secondary: 'hisui',   accent: 'kohaku' },
		ocean:    { surface: 'slate', primary: 'sky',      secondary: 'teal',    accent: 'cyan' },
		violet:   { surface: 'zinc',  primary: 'violet',   secondary: 'purple',  accent: 'indigo' },
		rose:     { surface: 'stone', primary: 'rose',     secondary: 'pink',    accent: 'orange' },
		emerald:  { surface: 'slate', primary: 'emerald',  secondary: 'teal',    accent: 'cyan' }
	},

	themes: ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi'],

	typography: {
		display: "'Fraunces', 'Iowan Old Style', Georgia, serif",
		sans:    "'Inter', system-ui, -apple-system, sans-serif",
		mono:    "'JetBrains Mono', 'SF Mono', Menlo, monospace"
	},

	icons: {
		app:   '@rokkit/icons/app.json',
		glyph: '@rokkit/icons/glyph.json'
	},

	switcher:   'full',
	storageKey: 'sensei-theme',

	chart: {
		colors: ['sky', 'emerald', 'rose', 'amber', 'violet', 'blue', 'pink', 'teal'],
		shades: {
			light: { fill: '300', stroke: '700' },
			dark:  { fill: '500', stroke: '200' }
		}
	}
}
