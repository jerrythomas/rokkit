import { describe, expect, it } from 'vitest'
import { shadesOf, stateColors, themeColors, iconShortcuts } from './utils'
// import {  } from './constants'

describe('utils', () => {
	it.each(['primary', 'secondary', 'other'])(
		'should generate theme palette using a name',
		(name) => {
			const result = shadesOf(name, 'hsl')
			expect(result).toEqual({
				50: `hsl(var(--${name}-50))`,
				100: `hsl(var(--${name}-100))`,
				200: `hsl(var(--${name}-200))`,
				300: `hsl(var(--${name}-300))`,
				400: `hsl(var(--${name}-400))`,
				500: `hsl(var(--${name}-500))`,
				600: `hsl(var(--${name}-600))`,
				700: `hsl(var(--${name}-700))`,
				800: `hsl(var(--${name}-800))`,
				900: `hsl(var(--${name}-900))`,
				DEFAULT: `hsl(var(--${name}-500))`
			})
		}
	)
	it.each(['info', 'error', 'warn', 'pass'])(
		'should generate shades for states using names',
		(name) => {
			const result = stateColors(name, 'hsl')
			expect(result).toEqual({
				DEFAULT: `hsl(var(--${name}-500))`,
				light: `hsl(var(--${name}-100))`,
				dark: `hsl(var(--${name}-800))`
			})
		}
	)
	it('should generate theme color palette', () => {
		const result = themeColors('hsl')
		const palette = {
			accent: shadesOf('accent', 'hsl'),
			primary: shadesOf('primary', 'hsl'),
			secondary: shadesOf('secondary', 'hsl'),
			skin: {
				...shadesOf('skin', 'hsl'),
				base: 'hsl(var(--skin-base))',
				contrast: 'hsl(var(--skin-800))',
				zebra: 'hsl(var(--skin-zebra))'
			},
			info: stateColors('info', 'hsl'),
			error: stateColors('error', 'hsl'),
			warn: stateColors('warn', 'hsl'),
			pass: stateColors('pass', 'hsl')
		}

		expect(result).toEqual(palette)
	})

	// it('should generate icon set from icons', () => {
	// 	const result = stateIconsFromNames(['list-opened', 'list-closed'])
	// 	expect(result).toEqual({
	// 		list: { opened: 'list-opened', closed: 'list-closed' }
	// 	})
	// })

	it('should generate shortcuts', () => {
		expect(iconShortcuts(['rating-filled', 'rating-empty'], 'x')).toEqual({
			'rating-filled': 'x:star-filled',
			'rating-empty': 'x:star-empty'
		})

		expect(iconShortcuts(['navigate-filled', 'navigate-empty'], 'x')).toEqual({
			'navigate-filled': 'x:chevron-filled',
			'navigate-empty': 'x:chevron-empty'
		})

		expect(iconShortcuts(['list-filled', 'list-empty'], 'x')).toEqual({
			'list-filled': 'x:list-filled',
			'list-empty': 'x:list-empty'
		})
		expect(iconShortcuts(['list-filled', 'list-empty'], 'x', 'z')).toEqual({
			'list-filled': 'x:list-filled-z',
			'list-empty': 'x:list-empty-z'
		})
	})
})
