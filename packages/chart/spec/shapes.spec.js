import { beforeAll, describe, expect, it, vi } from 'vitest'
import { namedShapes } from '../src/lib/shapes'

describe('Utility functions', () => {
	it('should generate a unique id', () => {
		// builtIn.map(({ shape }) => console.log(shape(10)))
		console.log(namedShapes['crosshair'](10))
	})
})
