const hasLS = () => typeof localStorage !== 'undefined'

export function read<T>(key: string, schema: (v: unknown) => boolean): T | null {
	if (!hasLS()) return null
	const raw = localStorage.getItem(key)
	if (raw == null) return null
	try {
		const parsed = JSON.parse(raw)
		return schema(parsed) ? (parsed as T) : null
	} catch {
		return null
	}
}

export function write<T>(key: string, value: T): void {
	if (!hasLS()) return
	try {
		localStorage.setItem(key, JSON.stringify(value))
	} catch {
		// quota exceeded or serialization error — swallow
	}
}

export function clear(key: string): void {
	if (!hasLS()) return
	localStorage.removeItem(key)
}
