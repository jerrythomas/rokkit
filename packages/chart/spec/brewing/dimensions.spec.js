import { describe, it, expect } from 'vitest'
import { createDimensions, updateDimensions } from '../../src/lib/brewing/dimensions.svelte.js'

describe('dimensions module', () => {
	describe('createDimensions', () => {
		it('should create dimensions with default values', () => {
			const dimensions = createDimensions()

			expect(dimensions).toEqual({
				width: 600,
				height: 400,
				margin: { top: 20, right: 30, bottom: 40, left: 50 },
				innerWidth: 600 - 30 - 50,
				innerHeight: 400 - 20 - 40
			})
		})

		it('should create dimensions with custom values', () => {
			const dimensions = createDimensions(800, 500, { top: 30, right: 40, bottom: 50, left: 60 })

			expect(dimensions).toEqual({
				width: 800,
				height: 500,
				margin: { top: 30, right: 40, bottom: 50, left: 60 },
				innerWidth: 800 - 40 - 60,
				innerHeight: 500 - 30 - 50
			})
		})
	})

	describe('updateDimensions', () => {
		it('should update width and recalculate innerWidth', () => {
			const dimensions = createDimensions(600, 400)
			const updated = updateDimensions(dimensions, { width: 800 })

			expect(updated.width).toBe(800)
			expect(updated.innerWidth).toBe(800 - 30 - 50)
			expect(updated.height).toBe(400) // unchanged
			expect(updated.innerHeight).toBe(400 - 20 - 40) // unchanged
		})

		it('should update height and recalculate innerHeight', () => {
			const dimensions = createDimensions(600, 400)
			const updated = updateDimensions(dimensions, { height: 500 })

			expect(updated.height).toBe(500)
			expect(updated.innerHeight).toBe(500 - 20 - 40)
			expect(updated.width).toBe(600) // unchanged
			expect(updated.innerWidth).toBe(600 - 30 - 50) // unchanged
		})

		it('should update margins and recalculate inner dimensions', () => {
			const dimensions = createDimensions(600, 400)
			const updated = updateDimensions(dimensions, {
				margin: { top: 30, right: 40, bottom: 50, left: 60 }
			})

			expect(updated.margin).toEqual({ top: 30, right: 40, bottom: 50, left: 60 })
			expect(updated.innerWidth).toBe(600 - 40 - 60)
			expect(updated.innerHeight).toBe(400 - 30 - 50)
		})

		it('should handle multiple updates at once', () => {
			const dimensions = createDimensions(600, 400)
			const updated = updateDimensions(dimensions, {
				width: 800,
				height: 500,
				margin: { top: 30, right: 40, bottom: 50, left: 60 }
			})

			expect(updated).toEqual({
				width: 800,
				height: 500,
				margin: { top: 30, right: 40, bottom: 50, left: 60 },
				innerWidth: 800 - 40 - 60,
				innerHeight: 500 - 30 - 50
			})
		})

		it('should not modify the original dimensions object', () => {
			const dimensions = createDimensions(600, 400)
			const original = { ...dimensions }

			updateDimensions(dimensions, { width: 800 })

			expect(dimensions).toEqual(original)
		})
	})
})
