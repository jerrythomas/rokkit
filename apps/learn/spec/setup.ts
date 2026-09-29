import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Node.js v25 exposes a native `localStorage` global that is broken without
// `--localstorage-file` (setItem/getItem are undefined). Stub it with a
// working in-memory implementation so tests can use localStorage directly.
const storage = new Map<string, string>()
vi.stubGlobal('localStorage', {
	getItem: (key: string) => storage.get(String(key)) ?? null,
	setItem: (key: string, value: string) => storage.set(String(key), String(value)),
	removeItem: (key: string) => storage.delete(String(key)),
	clear: () => storage.clear(),
	get length() {
		return storage.size
	},
	key: (index: number) => [...storage.keys()][index] ?? null
})

/**
 * `bind:clientWidth` compiles to a ResizeObserver, which JSDOM does not implement — so any
 * spec rendering a component that measures its own box dies on a ReferenceError rather than
 * on anything to do with the test. The package projects get this from
 * `packages/helpers/src/mocks`; this app's project loads only this file.
 */
if (typeof globalThis.ResizeObserver === 'undefined') {
	globalThis.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	} as unknown as typeof ResizeObserver
}
