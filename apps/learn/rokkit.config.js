import { PALETTE_FAMILIES, zenSumi, seaGlass, sakuraEmber, fujiDusk, mossGarden } from '@rokkit/unocss/palettes'

export default {
	/**
	 * rokkit's palette families (@rokkit/unocss/palettes) — imported, never copied. Every
	 * family's palettes are bare OKLCH components (colorSpace: 'oklch'); palettes shared between
	 * families (kami/sumi, the status colours) are identical, so spreading them all is safe.
	 */
	palettes: Object.assign({}, ...Object.values(PALETTE_FAMILIES).map((family) => family.palettes)),

	colorSpace: 'oklch',

	tokens: 'core',

	overrides: {
		// Add new tokens beyond the named vocabulary.
		canvas:        'kami.50',
		'canvas-grid': '#d4d4d4',
		'canvas-bleed': { light: 'kami.100', dark: 'sumi.900' },

		// Reserved-name overrides — these replace the named-token defaults
		// emitted by the skin pipeline. `paper-edge` is the hairline border
		// tone. In dark it was previously pinned near-black (oklch 0.04) for an
		// "etched" look, but on a same-colour-as-canvas element that hairline is
		// effectively invisible — borders disappeared across the app in dark
		// (cards, composer, rails). Use a subtle LIFTED hairline (sumi.300,
		// lighter than the sumi.50 canvas) so borders read in both modes.
		'paper-edge': { light: 'kami.400', dark: 'sumi.300' },

		// `paper-edge-hover` — the interactive/hover border tone. Components use
		// `paper-edge` (rest) + `paper-edge-hover` (hover) with the SAME token
		// names in both modes; the per-mode values live here, so a border that
		// reads wrong is a config tweak, not conditional [data-mode] CSS. Tuned
		// to be clearly visible on hover in both light (kami.600) and dark
		// (sumi.500) — no near-black etched value here.
		'paper-edge-hover': { light: 'kami.600', dark: 'sumi.500' },

		// `ink-fixed` — a fifth text tone that does NOT flip with mode (the four
		// flipping text tones are ink / ink-mute / ink-soft / ink-faint). For
		// text that sits on a fixed-dark fill regardless of page mode (badges,
		// tooltips, active step pips), so it stays a readable warm near-white.
		'ink-fixed': { light: 'sumi.900', dark: 'sumi.900' }

		// `on-primary` is no longer overridden — the core now auto-derives every
		// on-color (near-black / near-white) from the fill's luminance. The bright
		// vermillion #e8552b (L0.641) resolves to near-black text (~5:1), the brand
		// stays the brand, and dark-primary skins (violet) get white automatically.
	},

	shape: {
		radius: 'soft'
	},

	/**
	 * Multi-skin mode — the app supports programmatic / user-driven skin switching.
	 * `default` is the active colormap on first load (the zen-sumi family); the
	 * others are the remaining palette families, by their family names.
	 */
	skins: {
		default: zenSumi.skin,
		'sea-glass': seaGlass.skin,
		'sakura-ember': sakuraEmber.skin,
		'fuji-dusk': fujiDusk.skin,
		'moss-garden': mossGarden.skin
	},

	themes: ['rokkit', 'minimal', 'material', 'frosted', 'zen-sumi'],

	typography: {
		display: "'Fraunces', 'Iowan Old Style', Georgia, serif",
		sans:    "'Inter', system-ui, -apple-system, sans-serif",
		mono:    "'JetBrains Mono', 'SF Mono', Menlo, monospace"
	},

	icons: {
		app:   '@rokkit/icons/app.json'
		// `rokkit`, `semantic`, and `glyph` collections are registered by
		// the preset by default — no need to declare them here.
	},

	switcher:   'full',
	storageKey: 'rokkit-learn-app',

	chart: {
		colors: ['sky', 'emerald', 'rose', 'amber', 'violet', 'blue', 'pink', 'teal'],
		shades: {
			light: { fill: '300', stroke: '700' },
			dark:  { fill: '500', stroke: '200' }
		}
	}
}
