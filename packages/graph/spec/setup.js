import { vi } from 'vitest'

// Svelte 5's svelte/motion touches window.matchMedia at import time via MediaQuery,
// and JSDOM does not provide it. Same shape as packages/blocks/spec/setup.js.
if (typeof window !== 'undefined' && !window.matchMedia) {
	window.matchMedia = vi.fn().mockImplementation((query) => ({
		media: query,
		matches: false,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
}
