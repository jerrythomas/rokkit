export default {
	/**
	 * Zen-Sumi OKLCH palettes — baked in as the base token system.
	 * Values are stored as bare OKLCH components (L C H) so that colorSpace: 'oklch'
	 * can wrap them as oklch(var(--color-x) / alpha) for opacity utility support.
	 */
	palettes: {
		/** kami — warm neutral, from washi paper (z0) to sumi ink (z9/z10) */
		kami: {
			50:  '0.985 0.005 85',
			100: '0.975 0.008 85',
			200: '0.955 0.010 85',
			300: '0.920 0.012 85',
			400: '0.850 0.010 70',
			500: '0.750 0.008 50',
			600: '0.580 0.010 50',
			700: '0.380 0.012 50',
			800: '0.280 0.012 50',
			900: '0.220 0.012 50',
			950: '0.170 0.010 50',
		},
		/** shu — vermillion, primary accent */
		shu: {
			50:  '0.970 0.020 35',
			100: '0.940 0.040 35',
			200: '0.880 0.070 35',
			300: '0.800 0.100 35',
			400: '0.700 0.130 35',
			500: '0.580 0.150 35',
			600: '0.500 0.140 35',
			700: '0.420 0.120 35',
			800: '0.350 0.100 35',
			900: '0.280 0.080 35',
			950: '0.220 0.060 35',
		},
		/** hisui — jade green, secondary / success */
		hisui: {
			50:  '0.970 0.015 160',
			100: '0.940 0.030 160',
			200: '0.880 0.050 160',
			300: '0.800 0.065 160',
			400: '0.720 0.075 160',
			500: '0.620 0.080 160',
			600: '0.540 0.075 160',
			700: '0.460 0.065 160',
			800: '0.380 0.055 160',
			900: '0.300 0.045 160',
			950: '0.240 0.035 160',
		},
		/** kohaku — amber, tertiary / warning */
		kohaku: {
			50:  '0.980 0.020 75',
			100: '0.950 0.040 75',
			200: '0.900 0.070 75',
			300: '0.850 0.095 75',
			400: '0.790 0.110 75',
			500: '0.720 0.120 75',
			600: '0.640 0.110 75',
			700: '0.560 0.095 75',
			800: '0.470 0.080 75',
			900: '0.380 0.065 75',
			950: '0.300 0.050 75',
		},

		/**
		 * sumi — dark-mode surface scale (ink tones + warm paper whites).
		 *
		 * Designed as a two-pole scale: the "light" end (50–400) holds warm paper whites
		 * for dark-mode text, and the "dark" end (500–950) holds sumi-ink tones for
		 * dark-mode backgrounds. The z-flip in base.css then maps z0→950 (ink bg) and
		 * z9→100 (primary text) automatically.
		 *
		 *   z0 dark (bg)    ← sumi-950: 0.170 0.010 50  (sumi ink)
		 *   z1 dark (card)  ← sumi-900: 0.210 0.012 50
		 *   z6 dark (faint) ← sumi-400: 0.420 0.012 85  (warm paper white)
		 *   z9 dark (text)  ← sumi-100: 0.940 0.008 85  (primary text)
		 */
		/**
		 * sumi — the dark-mode counterpart for the kami surface/ink axes.
		 *
		 * Convention matches kami: shade 50 = lightest, shade 950 = darkest.
		 * The named-token shade map (`paper → 50`, `ink → 900`, etc.) reads
		 * the same index in light and dark, so each side gets:
		 *   - paper (bg)  = shade 50   = lightest sumi-ink in dark
		 *   - ink (text)  = shade 900  = warm paper white in dark
		 *
		 * Wait — that's NOT what we want. For dark mode the page background
		 * needs to be DARK and the text LIGHT. So sumi is INVERTED relative
		 * to kami: index 50 holds the darkest sumi-ink (canvas), index 900
		 * holds the lightest warm-paper (text). Same shade key, opposite
		 * lightness scale.
		 *
		 * The palette is intentionally two-pole — the dark end (50–400)
		 * holds sumi-ink tones (hue ~50, warm-shadow chroma); the light end
		 * (700–950) holds warm-paper whites (hue ~85). 500 sits between.
		 */
		sumi: {
			50:  '0.170 0.010 50',
			100: '0.210 0.012 50',
			200: '0.250 0.012 50',
			300: '0.320 0.012 50',
			400: '0.420 0.010 50',
			500: '0.570 0.010 50',
			600: '0.420 0.012 85',
			700: '0.600 0.010 85',
			800: '0.780 0.008 85',
			900: '0.940 0.008 85',
			950: '0.975 0.008 85',
		}
	},

	colorSpace: 'oklch',

	tokens: 'core',

	custom: {
		canvas:        'kami.50',
		'canvas-grid': '#d4d4d4',
		'canvas-bleed': { light: 'kami.100', dark: 'sumi.900' }
	},

	shape: {
		radius: 'soft'
	},

	/**
	 * Active skin (singular) — the preset uses this to resolve named tokens and
	 * emit the [data-mode="dark"] block. Mirrors `skins.default` below; keeping
	 * them in sync means switching skins at runtime can target named tokens too.
	 */
	skin: {
		surface:   { light: 'kami', dark: 'sumi' },
		ink:       { light: 'kami', dark: 'sumi' },
		primary:   'shu',
		secondary: 'hisui',
		tertiary:  'kohaku',
		// Accent stays aligned with primary so highlight surfaces across
		// the demo (`text-accent-z5`, `border-accent-z5`, `bg-accent-z1`)
		// read in the saffron brand color. The rokkit theme's gradient
		// flattens to a one-tone saffron fill when accent === primary,
		// which is the documented fallback.
		accent:    'shu',
		success:   'hisui',
		warning:   'kohaku',
		danger:    'shu',
		error:     'shu',
		info:      'kohaku'
	},

	/**
	 * Multi-skin mode — the app supports programmatic / user-driven skin switching.
	 * `default` is the active colormap on first load (zen-sumi OKLCH palette).
	 * Other skins reference Tailwind named colors available via defaultColors merge.
	 */
	skins: {
		default:  {
			surface:   { light: 'kami', dark: 'sumi' },
			ink:       { light: 'kami', dark: 'sumi' },
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
		ocean:    { surface: 'slate', primary: 'sky',     secondary: 'teal',   accent: 'cyan' },
		violet:   { surface: 'zinc',  primary: 'violet',  secondary: 'purple', accent: 'indigo' },
		rose:     { surface: 'stone', primary: 'rose',    secondary: 'pink',   accent: 'orange' },
		emerald:  { surface: 'slate', primary: 'emerald', secondary: 'teal',   accent: 'cyan' }
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
