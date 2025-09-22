import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the shiki module completely
vi.mock('shiki', () => ({
	createHighlighter: vi.fn()
}))

// Import functions once at the top
import { highlightCode, preloadHighlighter, resetForTesting } from './shiki.js'

describe('shiki.js', () => {
	let mockHighlighter
	let mockCreateHighlighter

	beforeEach(async () => {
		vi.clearAllMocks()

		// Create mock highlighter instance
		mockHighlighter = {
			codeToHtml: vi.fn()
		}

		// Get the mocked createHighlighter
		const { createHighlighter } = await import('shiki')
		mockCreateHighlighter = createHighlighter
		mockCreateHighlighter.mockResolvedValue(mockHighlighter)

		// Reset module state before each test
		resetForTesting()
	})

	describe('highlightCode', () => {
		it('should highlight code successfully with default options', async () => {
			const code = 'console.log("hello world")'
			const expectedHtml = '<pre class="shiki"><code>console.log("hello world")</code></pre>'

			mockHighlighter.codeToHtml.mockReturnValue(expectedHtml)

			const result = await highlightCode(code)

			expect(mockCreateHighlighter).toHaveBeenCalledWith({
				themes: ['github-light', 'github-dark'],
				langs: ['svelte', 'javascript', 'typescript', 'css', 'html', 'json', 'bash', 'shell']
			})
			expect(mockHighlighter.codeToHtml).toHaveBeenCalledWith(code, {
				lang: undefined,
				theme: undefined
			})
			expect(result).toBe(expectedHtml)
		})

		it('should highlight code with specified language and theme', async () => {
			const code = 'const x = 42;'
			const options = { lang: 'javascript', theme: 'github-light' }
			const expectedHtml = '<pre class="shiki"><code>const x = 42;</code></pre>'

			mockHighlighter.codeToHtml.mockReturnValue(expectedHtml)

			const result = await highlightCode(code, options)

			expect(mockHighlighter.codeToHtml).toHaveBeenCalledWith(code, {
				lang: 'javascript',
				theme: 'github-light'
			})
			expect(result).toBe(expectedHtml)
		})

		it('should remove conflicting background color styles', async () => {
			const code = 'test code'
			const htmlWithStyle =
				'<pre class="shiki" style="background-color: #fff; color: #000;">code</pre>'
			const expectedHtml = '<pre class="shiki">code</pre>'

			mockHighlighter.codeToHtml.mockReturnValue(htmlWithStyle)

			const result = await highlightCode(code)

			expect(result).toBe(expectedHtml)
		})

		it('should throw error for invalid code input - null', async () => {
			await expect(highlightCode(null)).rejects.toThrow('Invalid code provided for highlighting')
		})

		it('should throw error for invalid code input - undefined', async () => {
			await expect(highlightCode(undefined)).rejects.toThrow(
				'Invalid code provided for highlighting'
			)
		})

		it('should throw error for invalid code input - number', async () => {
			await expect(highlightCode(123)).rejects.toThrow('Invalid code provided for highlighting')
		})

		it('should throw error for invalid code input - object', async () => {
			await expect(highlightCode({})).rejects.toThrow('Invalid code provided for highlighting')
		})

		it('should handle empty string code', async () => {
			const code = ''

			// Empty string should throw error based on the current validation
			await expect(highlightCode(code)).rejects.toThrow('Invalid code provided for highlighting')
		})

		it('should throw error when highlighter creation fails', async () => {
			const code = 'test code'
			const error = new Error('Failed to create highlighter')

			mockCreateHighlighter.mockRejectedValue(error)

			await expect(highlightCode(code)).rejects.toThrow(
				'Failed to highlight code: Failed to create highlighter'
			)
		})

		it('should throw error when codeToHtml fails', async () => {
			const code = 'test code'
			const error = new Error('Highlighting failed')

			mockHighlighter.codeToHtml.mockImplementation(() => {
				throw error
			})

			await expect(highlightCode(code)).rejects.toThrow(
				'Failed to highlight code: Highlighting failed'
			)
		})
	})

	describe('preloadHighlighter', () => {
		it('should preload highlighter successfully', async () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

			await preloadHighlighter()

			expect(mockCreateHighlighter).toHaveBeenCalledWith({
				themes: ['github-light', 'github-dark'],
				langs: ['svelte', 'javascript', 'typescript', 'css', 'html', 'json', 'bash', 'shell']
			})
			expect(consoleSpy).not.toHaveBeenCalled()

			consoleSpy.mockRestore()
		})

		it('should handle preload failure gracefully', async () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			const error = new Error('Preload failed')

			mockCreateHighlighter.mockRejectedValue(error)

			await preloadHighlighter()

			expect(consoleSpy).toHaveBeenCalledWith(
				'Failed to preload syntax highlighter:',
				'Preload failed'
			)

			consoleSpy.mockRestore()
		})

		it('should not throw error even if initialization fails', async () => {
			const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
			mockCreateHighlighter.mockRejectedValue(new Error('Init failed'))

			// Should not throw
			await expect(preloadHighlighter()).resolves.toBeUndefined()

			consoleSpy.mockRestore()
		})
	})

	describe('code validation', () => {
		it('should accept valid string code', async () => {
			const code = 'console.log("test")'
			const expectedHtml = '<pre class="shiki"><code>test</code></pre>'

			mockHighlighter.codeToHtml.mockReturnValue(expectedHtml)

			const result = await highlightCode(code)
			expect(result).toBe(expectedHtml)
		})

		it('should reject falsy values except empty string', async () => {
			await expect(highlightCode(false)).rejects.toThrow('Invalid code provided for highlighting')
			await expect(highlightCode(0)).rejects.toThrow('Invalid code provided for highlighting')
			await expect(highlightCode('')).rejects.toThrow('Invalid code provided for highlighting')
		})
	})

	describe('error handling', () => {
		it('should wrap all errors with descriptive message', async () => {
			const code = 'test'

			mockHighlighter.codeToHtml.mockImplementation(() => {
				throw new Error('Random error')
			})

			await expect(highlightCode(code)).rejects.toThrow('Failed to highlight code: Random error')
		})
	})

	describe('style removal', () => {
		it('should remove various style patterns', async () => {
			const code = 'test'

			const testCases = [
				{
					input: '<pre class="shiki" style="background: red;">code</pre>',
					expected: '<pre class="shiki">code</pre>'
				},
				{
					input: '<pre id="test" style="color: blue; background: white;">code</pre>',
					expected: '<pre id="test">code</pre>'
				},
				{
					input: '<pre>code</pre>', // No style attribute
					expected: '<pre>code</pre>'
				}
			]

			for (const testCase of testCases) {
				mockHighlighter.codeToHtml.mockReturnValue(testCase.input)
				const result = await highlightCode(code)
				expect(result).toBe(testCase.expected)
			}
		})
	})

	describe('concurrent initialization', () => {
		it('should handle concurrent calls to highlightCode', async () => {
			// This test takes ~50ms due to the setTimeout delay in the waiting loop
			const code1 = 'console.log("test1")'
			const code2 = 'console.log("test2")'
			const expectedHtml1 = '<pre class="shiki"><code>test1</code></pre>'
			const expectedHtml2 = '<pre class="shiki"><code>test2</code></pre>'

			// Make createHighlighter slow to ensure concurrent calls hit the waiting logic
			let resolveHighlighter
			const highlighterPromise = new Promise((resolve) => {
				resolveHighlighter = resolve
			})
			mockCreateHighlighter.mockReturnValue(highlighterPromise)

			// Set up the mock to return different values based on input
			mockHighlighter.codeToHtml.mockImplementation((code) => {
				if (code === code1) return expectedHtml1
				if (code === code2) return expectedHtml2
				return '<pre class="shiki"><code>default</code></pre>'
			})

			// Start concurrent calls - they will wait for highlighter creation
			const promise1 = highlightCode(code1)
			const promise2 = highlightCode(code2)

			// Resolve the highlighter after a small delay to ensure both calls are waiting
			setTimeout(() => resolveHighlighter(mockHighlighter), 10)

			const [result1, result2] = await Promise.all([promise1, promise2])

			expect(result1).toBe(expectedHtml1)
			expect(result2).toBe(expectedHtml2)
			// Should only create highlighter once despite concurrent calls
			expect(mockCreateHighlighter).toHaveBeenCalledTimes(1)
		})
	})

	describe('resetForTesting environment check', () => {
		it('should throw error when called outside test environment', () => {
			// Mock process.env to simulate non-test environment
			const originalEnv = process.env.NODE_ENV
			process.env.NODE_ENV = 'production'

			try {
				expect(() => resetForTesting()).toThrow(
					'resetForTesting should only be called in test environment'
				)
			} finally {
				// Restore original environment
				process.env.NODE_ENV = originalEnv
			}
		})
	})
})
