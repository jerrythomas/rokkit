import { describe, it, expect, vi } from 'vitest'
import { convert } from '../src/convert'
// Mock the convert function
vi.mock('../src/convert.js', () => ({
	convert: vi.fn()
}))

describe('index', () => {
	describe('Test convert function calls', () => {
		it('should call convert with correct arguments for each group', async () => {
			const groups = ['auth', 'app', 'base', 'light', 'solid', 'twotone', 'components']
			await import('../src/index.js')

			// Check that convert was called with the correct arguments
			for (const group of groups) {
				expect(convert).toHaveBeenCalledWith(`./src/${group}`, group, group === 'auth')
			}
		})
	})
})
