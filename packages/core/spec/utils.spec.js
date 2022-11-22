import { describe, expect, it } from 'vitest'
import { hslFromVariable } from '../src/utils'

describe('utils', () => {
	it.each(['primary', 'secondary', 'other'])(
		'should generate theme palette using a name',
		(name) => {
			const result = hslFromVariable(name)
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
})
