import { describe, it, expect } from 'vitest'
import { ColorBrewer } from '../../src/lib/color.js'

describe('color', () => {
	describe('ColorBrewer', () => {
		it('should create a color brewer object', () => {
			const brewer = new ColorBrewer()
			expect(brewer).toBeDefined()
			expect(brewer.colors).toEqual([
				'blue',
				'pink',
				'teal',
				'indigo',
				'purple',
				'amber',
				'rose'
			])
			expect(Object.keys(brewer.palette)).toEqual([
				'indigo',
				'blue',
				'sky',
				'cyan',
				'teal',
				'emerald',
				'green',
				'lime',
				'yellow',
				'amber',
				'orange',
				'red',
				'rose',
				'pink',
				'fuchsia',
				'purple',
				'violet',
				'warmGray',
				'trueGray',
				'gray',
				'blueGray'
			])
			expect(brewer.grayscale).toEqual(brewer.palette['trueGray'])
			expect(brewer.fill).toEqual(100)
			expect(brewer.stroke).toEqual(600)
			expect(brewer.contrast).toEqual(600)
		})
	})
})
