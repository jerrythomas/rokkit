import colors from 'windicss/colors'
const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

function hsla(cssVariable) {
	return ({ opacityValue }) => {
		if (opacityValue !== undefined) {
			return `hsla(var(${cssVariable}), ${opacityValue})`
		}
		return `hsl(var(${cssVariable}))`
	}
}

const config = {
	safelist: [
		shades.map((i) => `bg-primary-${i}`),
		shades.map((i) => `bg-secondary-${i}`),
		shades.map((i) => `bg-skin-${i}`),
		shades.map((i) => `border-skin-${i}`),
		shades.map((i) => `text-skin-${i}`)
	],
	extract: {
		include: [
			'./**/*.{html,js,svelte,ts,css}',
			'./node_modules/@svelte-spice/base/src/**/*.{html,js,svelte,ts,css}',
			'./node_modules/@svelte-spice/list/src/**/*.{html,js,svelte,ts,css}',
			'./node_modules/@svelte-spice/chart/src/**/*.{html,js,svelte,ts,css}'
		]
	},
	theme: {
		fontFamily: {
			mono: ['Victor-Mono', 'monospace'],
			serif: ['Montserrat Alternates', 'ui-serif', 'sans-serif'],
			body: ['Montserrat Alternates', 'ui-serif', 'sans-serif']
		},

		extend: {
			extend: {
				gridTemplateColumns: {
					fluid: 'repeat(auto-fit, minmax(20rem, 1fr))'
				},
				gridTemplateRows: {
					fluid: 'repeat(auto-fit, minmax(20rem, 1fr))'
				}
			},
			textColor: {
				white: hsla('--text-white'),
				black: hsla('--text-black')
			},
			colors: {
				info: colors.blue,
				error: colors.red,
				warn: colors.yellow,
				pass: colors.green,
				primary: {
					DEFAULT: hsla('--primary-500'),
					50: hsla('--primary-50'),
					100: hsla('--primary-100'),
					200: hsla('--primary-200'),
					300: hsla('--primary-300'),
					400: hsla('--primary-400'),
					500: hsla('--primary-500'),
					600: hsla('--primary-600'),
					700: hsla('--primary-700'),
					800: hsla('--primary-800'),
					900: hsla('--primary-900')
				},
				secondary: {
					DEFAULT: hsla('--secondary-500'),
					50: hsla('--secondary-50'),
					100: hsla('--secondary-100'),
					200: hsla('--secondary-200'),
					300: hsla('--secondary-300'),
					400: hsla('--secondary-400'),
					500: hsla('--secondary-500'),
					600: hsla('--secondary-600'),
					700: hsla('--secondary-700'),
					800: hsla('--secondary-800'),
					900: hsla('--secondary-900')
				},
				skin: {
					DEFAULT: hsla('--skin-500'),
					base: hsla('--skin-50'),
					contrast: hsla('--skin-900'),
					zebra: hsla('--skin-zebra'),
					50: hsla('--skin-50'),
					100: hsla('--skin-100'),
					200: hsla('--skin-200'),
					300: hsla('--skin-300'),
					400: hsla('--skin-400'),
					500: hsla('--skin-500'),
					600: hsla('--skin-600'),
					700: hsla('--skin-700'),
					800: hsla('--skin-800'),
					900: hsla('--skin-900')
				}
			},
			backgroundImage: () => ({
				texture: "url('/subtle-grey.png')"
			})
		}
	},
	plugins: [require('windicss/plugin/typography')]
}

module.exports = config
