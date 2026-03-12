import { describe, it, expect } from 'vitest'
import {
	matchesAccept,
	validateFile,
	inferIcon,
	formatSize,
	groupByPath
} from '../src/utils/upload.js'

// ─── matchesAccept ──────────────────────────────────────────────────

describe('matchesAccept', () => {
	it('returns true when accept is empty', () => {
		expect(matchesAccept({ type: 'image/png', name: 'photo.png' }, '')).toBe(true)
	})

	it('returns true when accept is undefined', () => {
		expect(matchesAccept({ type: 'image/png', name: 'photo.png' }, undefined)).toBe(true)
	})

	it('returns true when accept is null', () => {
		expect(matchesAccept({ type: 'image/png', name: 'photo.png' }, null)).toBe(true)
	})

	it('matches exact MIME type', () => {
		expect(matchesAccept({ type: 'application/json', name: 'data.json' }, 'application/json')).toBe(
			true
		)
	})

	it('rejects non-matching exact MIME type', () => {
		expect(matchesAccept({ type: 'text/plain', name: 'readme.txt' }, 'application/json')).toBe(
			false
		)
	})

	it('matches wildcard MIME type (image/*)', () => {
		expect(matchesAccept({ type: 'image/png', name: 'photo.png' }, 'image/*')).toBe(true)
	})

	it('matches wildcard MIME type (video/*)', () => {
		expect(matchesAccept({ type: 'video/mp4', name: 'clip.mp4' }, 'video/*')).toBe(true)
	})

	it('rejects non-matching wildcard MIME type', () => {
		expect(matchesAccept({ type: 'text/plain', name: 'readme.txt' }, 'image/*')).toBe(false)
	})

	it('matches file extension (.pdf)', () => {
		expect(matchesAccept({ type: 'application/pdf', name: 'report.pdf' }, '.pdf')).toBe(true)
	})

	it('matches file extension case-insensitively', () => {
		expect(matchesAccept({ type: 'application/pdf', name: 'REPORT.PDF' }, '.pdf')).toBe(true)
	})

	it('rejects non-matching file extension', () => {
		expect(matchesAccept({ type: 'image/png', name: 'photo.png' }, '.pdf')).toBe(false)
	})

	it('matches any token in comma-separated accept', () => {
		const accept = 'image/*,.pdf,application/json'
		expect(matchesAccept({ type: 'image/jpeg', name: 'photo.jpg' }, accept)).toBe(true)
		expect(matchesAccept({ type: 'application/pdf', name: 'doc.pdf' }, accept)).toBe(true)
		expect(matchesAccept({ type: 'application/json', name: 'data.json' }, accept)).toBe(true)
	})

	it('rejects when no token matches in comma-separated accept', () => {
		const accept = 'image/*,.pdf'
		expect(matchesAccept({ type: 'text/plain', name: 'readme.txt' }, accept)).toBe(false)
	})

	it('handles whitespace around tokens', () => {
		expect(matchesAccept({ type: 'image/png', name: 'photo.png' }, ' image/* , .pdf ')).toBe(true)
	})
})

// ─── validateFile ───────────────────────────────────────────────────

describe('validateFile', () => {
	const file = { type: 'image/png', name: 'photo.png', size: 5000 }

	it('returns true when file passes both checks', () => {
		expect(validateFile(file, { accept: 'image/*', maxSize: 10000 })).toBe(true)
	})

	it('returns true when no constraints are given', () => {
		expect(validateFile(file, {})).toBe(true)
	})

	it('returns { reason: "type" } when type fails', () => {
		expect(validateFile(file, { accept: '.pdf', maxSize: 10000 })).toEqual({ reason: 'type' })
	})

	it('returns { reason: "size" } when size fails', () => {
		expect(validateFile(file, { accept: 'image/*', maxSize: 1000 })).toEqual({ reason: 'size' })
	})

	it('checks type before size (returns type even if both fail)', () => {
		expect(validateFile(file, { accept: '.pdf', maxSize: 1 })).toEqual({ reason: 'type' })
	})

	it('returns true when accept is empty and size is within limit', () => {
		expect(validateFile(file, { accept: '', maxSize: 10000 })).toBe(true)
	})

	it('returns true when maxSize is undefined', () => {
		expect(validateFile(file, { accept: 'image/*' })).toBe(true)
	})

	it('allows file when size equals maxSize exactly', () => {
		expect(validateFile({ ...file, size: 10000 }, { maxSize: 10000 })).toBe(true)
	})

	it('returns { reason: "size" } when file exceeds maxSize by 1', () => {
		expect(validateFile({ ...file, size: 10001 }, { maxSize: 10000 })).toEqual({ reason: 'size' })
	})
})

// ─── inferIcon ──────────────────────────────────────────────────────

describe('inferIcon', () => {
	it('returns image icon for image/* types', () => {
		expect(inferIcon('image/png')).toBe('i-lucide:image')
		expect(inferIcon('image/jpeg')).toBe('i-lucide:image')
		expect(inferIcon('image/svg+xml')).toBe('i-lucide:image')
	})

	it('returns video icon for video/* types', () => {
		expect(inferIcon('video/mp4')).toBe('i-lucide:video')
		expect(inferIcon('video/webm')).toBe('i-lucide:video')
	})

	it('returns music icon for audio/* types', () => {
		expect(inferIcon('audio/mpeg')).toBe('i-lucide:music')
		expect(inferIcon('audio/wav')).toBe('i-lucide:music')
	})

	it('returns file-text icon for application/pdf', () => {
		expect(inferIcon('application/pdf')).toBe('i-lucide:file-text')
	})

	it('returns file-text icon for text/* types', () => {
		expect(inferIcon('text/plain')).toBe('i-lucide:file-text')
		expect(inferIcon('text/html')).toBe('i-lucide:file-text')
	})

	it('returns archive icon for archive types', () => {
		expect(inferIcon('application/zip')).toBe('i-lucide:archive')
		expect(inferIcon('application/gzip')).toBe('i-lucide:archive')
		expect(inferIcon('application/x-tar')).toBe('i-lucide:archive')
	})

	it('returns generic file icon for unknown types', () => {
		expect(inferIcon('application/octet-stream')).toBe('i-lucide:file')
	})

	it('returns generic file icon for null', () => {
		expect(inferIcon(null)).toBe('i-lucide:file')
	})

	it('returns generic file icon for undefined', () => {
		expect(inferIcon(undefined)).toBe('i-lucide:file')
	})

	it('returns generic file icon for empty string', () => {
		expect(inferIcon('')).toBe('i-lucide:file')
	})
})

// ─── formatSize ─────────────────────────────────────────────────────

describe('formatSize', () => {
	it('formats 0 bytes', () => {
		expect(formatSize(0)).toBe('0 B')
	})

	it('formats bytes < 1024', () => {
		expect(formatSize(512)).toBe('512 B')
		expect(formatSize(1)).toBe('1 B')
		expect(formatSize(1023)).toBe('1023 B')
	})

	it('formats kilobytes', () => {
		expect(formatSize(1024)).toBe('1.0 KB')
		expect(formatSize(1536)).toBe('1.5 KB')
		expect(formatSize(10240)).toBe('10.0 KB')
	})

	it('formats megabytes', () => {
		expect(formatSize(1048576)).toBe('1.0 MB')
		expect(formatSize(1572864)).toBe('1.5 MB')
		expect(formatSize(5242880)).toBe('5.0 MB')
	})

	it('formats gigabytes', () => {
		expect(formatSize(1073741824)).toBe('1.0 GB')
		expect(formatSize(1610612736)).toBe('1.5 GB')
	})

	it('formats exact boundary values', () => {
		// 1024 is exactly 1.0 KB
		expect(formatSize(1024)).toBe('1.0 KB')
		// 1024^2 is exactly 1.0 MB
		expect(formatSize(1024 * 1024)).toBe('1.0 MB')
		// 1024^3 is exactly 1.0 GB
		expect(formatSize(1024 * 1024 * 1024)).toBe('1.0 GB')
	})
})

// ─── groupByPath ────────────────────────────────────────────────────

describe('groupByPath', () => {
	it('returns empty array for empty input', () => {
		expect(groupByPath([], 'path', 'children')).toEqual([])
	})

	it('returns ungrouped items for root-level (empty path)', () => {
		const items = [
			{ name: 'readme.md', path: '' },
			{ name: 'license.txt', path: '' }
		]
		const result = groupByPath(items, 'path', 'children')
		expect(result).toEqual([
			{ name: 'readme.md', path: '' },
			{ name: 'license.txt', path: '' }
		])
	})

	it('groups items by single-level path', () => {
		const items = [
			{ name: 'photo.jpg', path: 'images/' },
			{ name: 'doc.pdf', path: 'docs/' }
		]
		const result = groupByPath(items, 'path', 'children')
		expect(result).toEqual([
			{ text: 'images', children: [{ name: 'photo.jpg', path: 'images/' }] },
			{ text: 'docs', children: [{ name: 'doc.pdf', path: 'docs/' }] }
		])
	})

	it('groups multiple items under the same path', () => {
		const items = [
			{ name: 'a.jpg', path: 'images/' },
			{ name: 'b.jpg', path: 'images/' },
			{ name: 'c.jpg', path: 'images/' }
		]
		const result = groupByPath(items, 'path', 'children')
		expect(result).toEqual([
			{
				text: 'images',
				children: [
					{ name: 'a.jpg', path: 'images/' },
					{ name: 'b.jpg', path: 'images/' },
					{ name: 'c.jpg', path: 'images/' }
				]
			}
		])
	})

	it('mixes root-level and grouped items', () => {
		const items = [
			{ name: 'photo.jpg', path: 'images/' },
			{ name: 'doc.pdf', path: 'docs/' },
			{ name: 'readme.md', path: '' }
		]
		const result = groupByPath(items, 'path', 'children')
		expect(result).toEqual([
			{ text: 'images', children: [{ name: 'photo.jpg', path: 'images/' }] },
			{ text: 'docs', children: [{ name: 'doc.pdf', path: 'docs/' }] },
			{ name: 'readme.md', path: '' }
		])
	})

	it('creates nested folder structure for multi-level paths', () => {
		const items = [{ name: 'thumb.jpg', path: 'images/thumbnails/' }]
		const result = groupByPath(items, 'path', 'children')
		expect(result).toEqual([
			{
				text: 'images',
				children: [
					{
						text: 'thumbnails',
						children: [{ name: 'thumb.jpg', path: 'images/thumbnails/' }]
					}
				]
			}
		])
	})

	it('handles deep nesting (3+ levels)', () => {
		const items = [{ name: 'file.txt', path: 'a/b/c/' }]
		const result = groupByPath(items, 'path', 'children')
		expect(result).toEqual([
			{
				text: 'a',
				children: [
					{
						text: 'b',
						children: [
							{
								text: 'c',
								children: [{ name: 'file.txt', path: 'a/b/c/' }]
							}
						]
					}
				]
			}
		])
	})

	it('merges items at different levels of the same path', () => {
		const items = [
			{ name: 'photo.jpg', path: 'images/' },
			{ name: 'thumb.jpg', path: 'images/thumbnails/' }
		]
		const result = groupByPath(items, 'path', 'children')
		expect(result).toEqual([
			{
				text: 'images',
				children: [
					{ name: 'photo.jpg', path: 'images/' },
					{
						text: 'thumbnails',
						children: [{ name: 'thumb.jpg', path: 'images/thumbnails/' }]
					}
				]
			}
		])
	})

	it('uses custom pathField and childrenField', () => {
		const items = [{ name: 'photo.jpg', dir: 'images/' }]
		const result = groupByPath(items, 'dir', 'items')
		expect(result).toEqual([{ text: 'images', items: [{ name: 'photo.jpg', dir: 'images/' }] }])
	})

	it('handles paths without trailing slash', () => {
		const items = [{ name: 'photo.jpg', path: 'images' }]
		const result = groupByPath(items, 'path', 'children')
		expect(result).toEqual([{ text: 'images', children: [{ name: 'photo.jpg', path: 'images' }] }])
	})

	it('preserves order: groups appear in first-seen order', () => {
		const items = [
			{ name: 'b.pdf', path: 'docs/' },
			{ name: 'a.jpg', path: 'images/' },
			{ name: 'c.pdf', path: 'docs/' }
		]
		const result = groupByPath(items, 'path', 'children')
		// docs seen first, then images
		expect(result[0].text).toBe('docs')
		expect(result[1].text).toBe('images')
	})
})
