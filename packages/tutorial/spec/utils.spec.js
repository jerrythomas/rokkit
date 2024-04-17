import { describe, it, expect } from 'vitest'
import { folderHierarchy, getSequenceAndKey } from '../src/utils'

describe('utils', () => {
	describe('getSequenceAndKey', () => {
		it('should return the sequence and key from the given text', () => {
			const input = '01 - Introduction'
			const expected = { sequence: 1, key: 'Introduction' }
			expect(getSequenceAndKey(input)).toEqual(expected)
		})

		it('should return null if the input does not match the pattern', () => {
			const input = 'Invalid Text'
			expect(getSequenceAndKey(input)).toBeNull()
		})
	})
	describe('folderHierarchy', () => {
		it('should convert an array of files without folders as an array', () => {
			const files = [
				{ path: '', name: 'x.md', content: '...' },
				{ path: '', name: 'a.js', content: '...' }
			]
			expect(folderHierarchy(files)).toEqual([
				{ path: '', name: 'x.md', content: '...' },
				{ path: '', name: 'a.js', content: '...' }
			])
		})
		it('should convert an array of files without folders as an array', () => {
			const files = [
				{ path: 'a', name: 'x.md', content: '...' },
				{ path: '', name: 'a.js', content: '...' }
			]
			expect(folderHierarchy(files)).toEqual([
				{
					path: '',
					name: 'a',
					type: 'folder',
					children: [{ path: 'a', name: 'x.md', content: '...' }]
				},
				{ path: '', name: 'a.js', content: '...' }
			])
		})
		it('should convert an array of files with path into a nested array', () => {
			const files = [
				{ path: 'a/b/c', name: 'x.md', content: '...' },
				{ path: 'a/b/c', name: 'a.js', content: '...' },
				{ path: 'a/b', name: 'x.json', content: '...' }
			]
			expect(folderHierarchy(files)).toEqual([
				{
					name: 'a',
					path: '',
					type: 'folder',
					children: [
						{
							name: 'b',
							path: 'a',
							type: 'folder',
							children: [
								{
									name: 'c',
									path: 'a/b',
									type: 'folder',
									children: [
										{
											path: 'a/b/c',
											name: 'x.md',
											content: '...'
										},
										{
											path: 'a/b/c',
											name: 'a.js',
											content: '...'
										}
									]
								},
								{
									path: 'a/b',
									name: 'x.json',
									content: '...'
								}
							]
						}
					]
				}
			])
		})
	})
})
