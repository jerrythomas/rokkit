/**
 * Upload utility functions — shared helpers for UploadTarget and UploadProgress.
 * Pure functions with no Svelte dependency.
 */

const ARCHIVE_TYPES = new Set(['application/zip', 'application/gzip', 'application/x-tar'])

/**
 * Check if a file matches an accept string (comma-separated MIME types and extensions).
 * @param {{ type: string, name: string }} file
 * @param {string | null | undefined} accept - e.g. 'image/*,.pdf,application/json'
 * @returns {boolean}
 */
export function matchesAccept(file, accept) {
	if (!accept) return true

	const tokens = accept
		.split(',')
		.map((t) => t.trim())
		.filter(Boolean)
	if (tokens.length === 0) return true

	return tokens.some((token) => {
		if (token.startsWith('.')) {
			// Extension match (case-insensitive)
			return file.name.toLowerCase().endsWith(token.toLowerCase())
		}
		if (token.endsWith('/*')) {
			// Wildcard MIME type match (e.g. image/*)
			const prefix = token.slice(0, -1) // 'image/'
			return file.type.startsWith(prefix)
		}
		// Exact MIME type match
		return file.type === token
	})
}

/**
 * Validate a file against accept and maxSize constraints.
 * @param {{ type: string, name: string, size: number }} file
 * @param {{ accept?: string, maxSize?: number }} constraints
 * @returns {true | { reason: 'type' | 'size' }}
 */
function hasTypeError(file, accept) {
	return accept && !matchesAccept(file, accept)
}

function hasSizeError(file, maxSize) {
	return maxSize !== undefined && file.size > maxSize
}

export function validateFile(file, { accept, maxSize } = {}) {
	if (hasTypeError(file, accept)) return { reason: 'type' }
	if (hasSizeError(file, maxSize)) return { reason: 'size' }
	return true
}

/**
 * Map a MIME type to an icon class string.
 * @param {string | null | undefined} mimeType
 * @returns {string}
 */
const MIME_PREFIX_ICONS = [
	['image/', 'i-lucide:image'],
	['video/', 'i-lucide:video'],
	['audio/', 'i-lucide:music'],
	['text/', 'i-lucide:file-text'],
	['application/pdf', 'i-lucide:file-text']
]

function getPrefixIcon(mimeType) {
	for (const [prefix, icon] of MIME_PREFIX_ICONS) {
		if (mimeType.startsWith(prefix)) return icon
	}
	return null
}

export function inferIcon(mimeType) {
	if (!mimeType) return 'i-lucide:file'
	const prefixIcon = getPrefixIcon(mimeType)
	if (prefixIcon) return prefixIcon
	if (ARCHIVE_TYPES.has(mimeType)) return 'i-lucide:archive'
	return 'i-lucide:file'
}

/**
 * Format a byte count as a human-readable size string.
 * @param {number} bytes
 * @returns {string}
 */
export function formatSize(bytes) {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`
	if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
	return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

/**
 * Group a flat file array by path field into a nested tree structure.
 * Root-level items (empty path) stay ungrouped.
 * Group nodes use `text` as the label field (ProxyItem compatibility).
 *
 * @param {Array<Record<string, any>>} items
 * @param {string} pathField - field name containing the path (e.g. 'path')
 * @param {string} childrenField - field name for children arrays (e.g. 'children')
 * @returns {Array<Record<string, any>>}
 */
function resolveFolder(ctx, parent, segment, fullPath) {
	let folder = ctx.folderMap.get(fullPath)
	if (!folder) {
		folder = { text: segment, [ctx.childrenField]: [] }
		ctx.folderMap.set(fullPath, folder)
		parent.push(folder)
	}
	return folder[ctx.childrenField]
}

function walkSegments(ctx, item, rawPath, root) {
	const segments = rawPath.split('/').filter(Boolean)
	let parent = root
	let fullPath = ''
	for (const segment of segments) {
		fullPath = fullPath ? `${fullPath}/${segment}` : segment
		parent = resolveFolder(ctx, parent, segment, fullPath)
	}
	parent.push(item)
}

export function groupByPath(items, pathField, childrenField) {
	if (!items?.length) return []

	const root = []
	const ctx = { folderMap: new Map(), childrenField }

	for (const item of items) {
		const rawPath = item[pathField]
		if (!rawPath) {
			root.push(item)
			continue
		}
		walkSegments(ctx, item, rawPath, root)
	}

	return root
}
