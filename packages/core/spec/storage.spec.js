import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Storage } from '../src/storage.js'

describe('Storage', () => {
	beforeEach(() => {
		localStorage.clear()
	})

	afterEach(() => {
		localStorage.clear()
		vi.restoreAllMocks()
	})

	it('should initialize with default value', () => {
		const storage = new Storage({
			key: 'test',
			defaultValue: { foo: 'bar' }
		})

		expect(storage.value).toEqual({ foo: 'bar' })
	})

	it('should load existing value from localStorage', () => {
		localStorage.setItem('test', JSON.stringify({ foo: 'baz' }))

		const storage = new Storage({
			key: 'test',
			defaultValue: { foo: 'bar' }
		})

		expect(storage.value).toEqual({ foo: 'baz' })
	})

	it('should persist value changes to localStorage', () => {
		const storage = new Storage({
			key: 'test',
			defaultValue: { foo: 'bar' }
		})

		storage.value = { foo: 'baz' }

		expect(JSON.parse(localStorage.getItem('test'))).toEqual({ foo: 'baz' })
	})

	it('should handle partial updates', () => {
		const storage = new Storage({
			key: 'test',
			defaultValue: { foo: 'bar', baz: 'qux' }
		})

		storage.update({ foo: 'updated' })

		expect(storage.value).toEqual({ foo: 'updated', baz: 'qux' })
		expect(JSON.parse(localStorage.getItem('test'))).toEqual({ foo: 'updated', baz: 'qux' })
	})

	it('should handle storage events', () => {
		const storage = new Storage({
			key: 'test',
			defaultValue: { foo: 'bar' }
		})

		window.dispatchEvent(
			new StorageEvent('storage', {
				key: 'test',
				newValue: JSON.stringify({ foo: 'updated' })
			})
		)

		expect(storage.value).toEqual({ foo: 'updated' })
	})

	it('should migrate stored data', () => {
		localStorage.setItem('test', JSON.stringify({ oldFoo: 'bar' }))

		const storage = new Storage({
			key: 'test',
			defaultValue: { foo: 'bar' },
			migrate: (stored) => ({
				foo: stored.oldFoo
			})
		})

		expect(storage.value).toEqual({ foo: 'bar' })
	})

	describe('mocked', () => {
		const localStorageMock = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn()
		}
		beforeEach(() => {
			Object.defineProperty(window, 'localStorage', {
				value: localStorageMock,
				writable: true
			})
		})
		it("should not trigger storage update when value hasn't changed", () => {
			const mockValue = { foo: 'bar' }
			localStorageMock.getItem.mockReturnValue(JSON.stringify(mockValue))
			const storage = new Storage({
				key: 'test',
				defaultValue: { foo: 'bar' }
			})

			// Set the same value
			storage.value = { foo: 'bar' }
			// localStorage.setItem should not have been called
			expect(localStorage.setItem).not.toHaveBeenCalled()
			// Try updating with same partial value
			storage.update({ foo: 'bar' })
			// Should still not trigger a storage update
			expect(localStorage.setItem).not.toHaveBeenCalled()
		})
	})
})
