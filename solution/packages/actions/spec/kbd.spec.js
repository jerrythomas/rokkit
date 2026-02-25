import { describe, it, expect, beforeEach } from 'vitest'
import { getKeyboardAction } from '../src/kbd.js'

describe('kbd', () => {
	describe('getKeyboardAction', () => {
		const options = {}

		beforeEach(() => {
			options.orientation = 'horizontal'
			options.dir = 'ltr'
			options.nested = false
		})

		describe('common behaviors', () => {
			it('should return "select" for Enter key press', () => {
				const event = new KeyboardEvent('keydown', { key: 'Enter' })
				expect(getKeyboardAction(event, options)).toBe('select')
			})

			it('should return "select" for Space key press', () => {
				const event = new KeyboardEvent('keydown', { key: ' ' })
				expect(getKeyboardAction(event, options)).toBe('select')
			})

			it('should return "extend" when Space+Ctrl key is pressed', () => {
				const event = new KeyboardEvent('keydown', { key: ' ', ctrlKey: true })
				expect(getKeyboardAction(event, options)).toBe('extend')
			})

			it('should return "extend" when Space+Meta key is pressed', () => {
				const event = new KeyboardEvent('keydown', { key: ' ', metaKey: true })
				expect(getKeyboardAction(event, options)).toBe('extend')
			})

			it('should return null if key is not mapped', () => {
				const event = new KeyboardEvent('keydown', { key: 'x' })
				expect(getKeyboardAction(event, options)).toBeNull()
			})
		})

		describe('vertical', () => {
			beforeEach(() => {
				options.orientation = 'vertical'
			})

			describe('ltr', () => {
				beforeEach(() => {
					options.dir = 'ltr'
				})

				it('should return "previous" for ArrowUp key', () => {
					const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
					expect(getKeyboardAction(event, options)).toBe('previous')
				})

				it('should return "next" for ArrowDown key', () => {
					const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
					expect(getKeyboardAction(event, options)).toBe('next')
				})

				describe('nested', () => {
					beforeEach(() => {
						options.nested = true
					})

					it('should return "collapse" for ArrowLeft key', () => {
						const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
						expect(getKeyboardAction(event, options)).toBe('collapse')
					})

					it('should return "expand" for ArrowRight key', () => {
						const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
						expect(getKeyboardAction(event, options)).toBe('expand')
					})
				})
			})

			describe('rtl', () => {
				beforeEach(() => {
					options.dir = 'rtl'
				})

				it('should return "previous" for ArrowUp key', () => {
					const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
					expect(getKeyboardAction(event, options)).toBe('previous')
				})

				it('should return "next" for ArrowDown key', () => {
					const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
					expect(getKeyboardAction(event, options)).toBe('next')
				})

				describe('nested', () => {
					beforeEach(() => {
						options.nested = true
					})

					it('should return "expand" for ArrowLeft key', () => {
						const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
						expect(getKeyboardAction(event, options)).toBe('expand')
					})

					it('should return "collapse" for ArrowRight key', () => {
						const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
						expect(getKeyboardAction(event, options)).toBe('collapse')
					})
				})
			})
		})

		describe('horizontal', () => {
			beforeEach(() => {
				options.orientation = 'horizontal'
			})

			describe('ltr', () => {
				beforeEach(() => {
					options.dir = 'ltr'
				})

				it('should return "previous" for ArrowLeft key', () => {
					const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
					expect(getKeyboardAction(event, options)).toBe('previous')
				})

				it('should return "next" for ArrowRight key', () => {
					const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
					expect(getKeyboardAction(event, options)).toBe('next')
				})

				describe('nested', () => {
					beforeEach(() => {
						options.nested = true
					})

					it('should return "collapse" for ArrowUp key', () => {
						const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
						expect(getKeyboardAction(event, options)).toBe('collapse')
					})

					it('should return "expand" for ArrowDown key', () => {
						const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
						expect(getKeyboardAction(event, options)).toBe('expand')
					})
				})
			})

			describe('rtl', () => {
				beforeEach(() => {
					options.dir = 'rtl'
				})

				it('should return "next" for ArrowLeft key', () => {
					const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
					expect(getKeyboardAction(event, options)).toBe('next')
				})

				it('should return "previous" for ArrowRight key', () => {
					const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
					expect(getKeyboardAction(event, options)).toBe('previous')
				})

				describe('nested', () => {
					beforeEach(() => {
						options.nested = true
					})

					it('should return "collapse" for ArrowUp key', () => {
						const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
						expect(getKeyboardAction(event, options)).toBe('collapse')
					})

					it('should return "expand" for ArrowDown key', () => {
						const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
						expect(getKeyboardAction(event, options)).toBe('expand')
					})
				})
			})
		})
	})
})
