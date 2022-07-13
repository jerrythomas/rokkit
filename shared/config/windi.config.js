import colors from 'windicss/colors'

/**
 * @param {string} cssVariable
 */
function withOpacity(cssVariable) {
	return ({ opacityValue }) => {
		if (opacityValue !== undefined) {
			return `rgba(var(${cssVariable}), ${opacityValue})`
		}
		return `rgb(var(${cssVariable}))`
	}
}

const config = {
	extract: {
		include: [
			'./**/*.{html,js,svelte,ts,css}',
			'./node_modules/@jerrythomas/sentry/src/**/*.{html,js,svelte,ts,css}'
		]
	},
	theme: {
		extend: {
			textColor: {
				skin: {
					base: withOpacity('--color-text-base'),
					hover: withOpacity('--color-text-hover'),
					inverted: withOpacity('--color-fill-base')
				}
			},
			backgroundColor: {
				skin: {
					base: withOpacity('--color-fill-base'),
					hover: withOpacity('--color-fill-hover'),
					muted: withOpacity('--color-fill-muted'),
					inverted: withOpacity('--color-text-base'),
					button: withOpacity('--color-fill-button')
				}
			},
			borderColor: {
				skin: {
					base: withOpacity('--color-line-base')
				}
			},
			colors: {
				primary: {
					DEFAULT: '#FB8C00',
					50: '#FFF2E2',
					100: '#FFE7C8',
					200: '#FFD095',
					300: '#FFBA62',
					400: '#FFA32F',
					500: '#FB8C00',
					600: '#C87000',
					700: '#955300',
					800: '#623700',
					900: '#2F1A00'
				},
				secondary: colors.pink
			}
		}
	},
	variants: {},
	plugins: []
}

module.exports = config
