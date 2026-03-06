import { vi } from 'vitest'

// Node.js v25 exposes a native `localStorage` global that is broken without
// `--localstorage-file` (setItem/getItem are undefined). Stub it with a
// working in-memory implementation so tests can use localStorage directly.
const storage = new Map()
vi.stubGlobal('localStorage', {
	getItem: (key) => storage.get(String(key)) ?? null,
	setItem: (key, value) => storage.set(String(key), String(value)),
	removeItem: (key) => storage.delete(String(key)),
	clear: () => storage.clear(),
	get length() {
		return storage.size
	},
	key: (index) => [...storage.keys()][index] ?? null
})
