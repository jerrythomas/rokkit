import { describe, expect, it } from 'vitest'
import { shadesOf, stateColors, themeColors, iconShortcuts } from './utils'
// import {  } from './constants'

describe('utils', () => {
	const palettes = ['primary', 'secondary', 'other']

	describe('shadesOf', () => {
		it.each(palettes)('should generate shades without a modifier', (name) => {
			const result = shadesOf(name)
			expect(result).toEqual({
				50: `var(--${name}-50)`,
				100: `var(--${name}-100)`,
				200: `var(--${name}-200)`,
				300: `var(--${name}-300)`,
				400: `var(--${name}-400)`,
				500: `var(--${name}-500)`,
				600: `var(--${name}-600)`,
				700: `var(--${name}-700)`,
				800: `var(--${name}-800)`,
				900: `var(--${name}-900)`,
				DEFAULT: `var(--${name}-500)`,
				base: `var(--${name}-100)`,
				contrast: `var(--${name}-700)`,
				elevated: `var(--${name}-500)`,
				floating: `var(--${name}-600)`,
				inset: `var(--${name}-50)`,
				muted: `var(--${name}-300)`,
				raised: `var(--${name}-400)`,
				recessed: `var(--${name}-50)`,
				subtle: `var(--${name}-200)`,
				sunken: `var(--${name}-50)`
			})
		})

		it.each(palettes)('should generate shades using hsl modifier', (name) => {
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
				DEFAULT: `hsl(var(--${name}-500))`,
				base: `hsl(var(--${name}-100))`,
				contrast: `hsl(var(--${name}-700))`,
				elevated: `hsl(var(--${name}-500))`,
				floating: `hsl(var(--${name}-600))`,
				inset: `hsl(var(--${name}-50))`,
				muted: `hsl(var(--${name}-300))`,
				raised: `hsl(var(--${name}-400))`,
				recessed: `hsl(var(--${name}-50))`,
				subtle: `hsl(var(--${name}-200))`,
				sunken: `hsl(var(--${name}-50))`
			})
		})
		it.each(palettes)(
			'should generate shades with invalid modifier',
			(name) => {
				const result = shadesOf(name, 'invalid')
				expect(result).toEqual({
					50: `var(--${name}-50)`,
					100: `var(--${name}-100)`,
					200: `var(--${name}-200)`,
					300: `var(--${name}-300)`,
					400: `var(--${name}-400)`,
					500: `var(--${name}-500)`,
					600: `var(--${name}-600)`,
					700: `var(--${name}-700)`,
					800: `var(--${name}-800)`,
					900: `var(--${name}-900)`,
					DEFAULT: `var(--${name}-500)`,
					base: `var(--${name}-100)`,
					contrast: `var(--${name}-700)`,
					elevated: `var(--${name}-500)`,
					floating: `var(--${name}-600)`,
					inset: `var(--${name}-50)`,
					muted: `var(--${name}-300)`,
					raised: `var(--${name}-400)`,
					recessed: `var(--${name}-50)`,
					subtle: `var(--${name}-200)`,
					sunken: `var(--${name}-50)`
				})
			}
		)
	})

	describe('stateColors', () => {
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
	})

	describe('themeColors', () => {
		it('should generate theme color palette', () => {
			const result = themeColors('hsl')
			const palette = {
				accent: shadesOf('accent', 'hsl'),
				primary: shadesOf('primary', 'hsl'),
				secondary: shadesOf('secondary', 'hsl'),
				skin: {
					...shadesOf('skin', 'hsl'),
					base: 'hsl(var(--skin-100))',
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
		it.each([null, 'invalid'])(
			'should handle invalid/missing modifier',
			(modifier) => {
				const result = modifier ? themeColors(modifier) : themeColors()
				const palette = {
					accent: shadesOf('accent'),
					primary: shadesOf('primary'),
					secondary: shadesOf('secondary'),
					skin: {
						...shadesOf('skin'),
						base: 'var(--skin-100)',
						contrast: 'var(--skin-800)',
						zebra: 'var(--skin-zebra)'
					},
					info: stateColors('info'),
					error: stateColors('error'),
					warn: stateColors('warn'),
					pass: stateColors('pass')
				}

				expect(result).toEqual(palette)
			}
		)
	})

	describe('iconShortcuts', () => {
		it('should not generate shortcuts', () => {
			expect(iconShortcuts(['rating-filled', 'rating-empty'])).toEqual({})
		})
		it('should generate shortcuts', () => {
			expect(
				iconShortcuts(['rating-filled', 'rating-empty', 'action-sort-up'], 'x')
			).toEqual({
				'rating-filled': 'x:rating-filled',
				'rating-empty': 'x:rating-empty',
				'action-sort-up': 'x:action-sort-up'
			})
		})
		it('should generate variants', () => {
			expect(
				iconShortcuts(
					['rating-filled', 'rating-empty', 'action-sort-up'],
					'x',
					'solid'
				)
			).toEqual({
				'rating-filled': 'x:rating-filled-solid',
				'rating-empty': 'x:rating-empty-solid',
				'action-sort-up': 'x:action-sort-up-solid'
			})
		})
	})
})
