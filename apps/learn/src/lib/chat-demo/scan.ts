/**
 * Low-level scanning over raw completion text: find balanced `{...}` blobs
 * (respecting JSON string literals), copy existing fences verbatim, and wrap
 * bare JSON blobs whose shape maps to a known fence language.
 */
import { inferFenceLanguage } from './prompt'

/**
 * Copy a ```fence``` block starting at `i` verbatim into `out`, returning the
 * index just past the closing ``` (or `content.length` when it never closes).
 */
function copyFence(content: string, i: number, out: string[]): number {
	const close = content.indexOf('```', i + 3)
	if (close === -1) {
		out.push(content.slice(i))
		return content.length
	}
	out.push(content.slice(i, close + 3))
	return close + 3
}

/**
 * Walk `content` finding top-level (depth = 1) `{...}` blocks that lie
 * *outside* any existing ```fence``` and are not already inside a JSON string.
 * For each block whose shape maps to a known fence language, wrap it in the
 * matching fence in-place. Untouched otherwise.
 */
/**
 * Try to consume a balanced `{ … }` starting at `i` and push its fenced (or
 * verbatim) form. Returns the index to continue scanning from, or -1 when there
 * is nothing usable there — in which case the caller copies one character and
 * moves on, exactly as it would for any other text.
 */
function tryWrapBlob(content: string, i: number, out: string[]): number {
	const end = findBalancedBraceEnd(content, i)
	if (end === -1) return -1
	const blob = content.slice(i, end + 1)
	let lang: string | null
	try {
		lang = inferFenceLanguage(JSON.parse(blob))
	} catch {
		return -1
	}
	// Valid JSON but no known shape — leave it alone.
	out.push(lang ? `\`\`\`${lang}\n${blob}\n\`\`\`` : blob)
	return end + 1
}

export function wrapBareJSON(content: string): string {
	const out: string[] = []
	let i = 0
	while (i < content.length) {
		if (content.startsWith('```', i)) {
			i = copyFence(content, i, out)
			continue
		}
		if (content[i] === '{') {
			const next = tryWrapBlob(content, i, out)
			if (next !== -1) {
				i = next
				continue
			}
		}
		out.push(content[i])
		i++
	}
	return out.join('')
}

/**
 * Returns the index of the closing quote for a `"..."` string literal that
 * starts at `quote`, honoring backslash escapes. Returns -1 when the string
 * never closes.
 */
function skipString(content: string, quote: number): number {
	let escaped = false
	for (let i = quote + 1; i < content.length; i++) {
		const ch = content[i]
		if (escaped) escaped = false
		else if (ch === '\\') escaped = true
		else if (ch === '"') return i
	}
	return -1
}

/**
 * Returns the index of the `}` that closes the `{` at `start`, or -1 if the
 * braces are unbalanced. Respects JSON string literals (skips `{` / `}` and
 * escaped quotes inside `"..."`).
 */
export function findBalancedBraceEnd(content: string, start: number): number {
	let depth = 0
	for (let i = start; i < content.length; i++) {
		const ch = content[i]
		if (ch === '"') {
			const end = skipString(content, i)
			if (end === -1) return -1
			i = end
			continue
		}
		if (ch === '{') depth++
		else if (ch === '}') {
			depth--
			if (depth === 0) return i
		}
	}
	return -1
}
