import { vi } from 'vitest'

// Svelte 5's svelte/motion uses window.matchMedia at import time via MediaQuery.
// JSDOM doesn't provide matchMedia, so we mock it here for all blocks tests.
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
