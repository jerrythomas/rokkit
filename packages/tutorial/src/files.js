import fs from 'fs'
import path from 'path'

/**
 * Recursively get files in a folder that match the given pattern.
 * @param {string} folderPath - The folder to search in.
 * @param {RegExp} pattern - The pattern to match the file names.
 * @param {string} [dir=''] - The current directory, used for recursion.
 * @returns {Promise<Array<import('../../rokkit/packages/tutorial/src/types.js').FileMetadata>>} - An array of matched files.
 */
export async function getFiles(folderPath, pattern = null, dir = '') {
	const entries = await fs.promises.readdir(path.join(folderPath, dir), {
		withFileTypes: true
	})
	const files = await Promise.all(
		entries.map(async (entry) => {
			const currentPath = path.join(dir, entry.name)
			if (entry.isDirectory()) {
				return getFiles(folderPath, pattern, currentPath)
			}
			if (pattern === null || pattern.test(entry.name)) {
				return {
					path: dir,
					name: entry.name,
					type: path.extname(entry.name).slice(1)
				}
			}
			return null
		})
	)

	return Array.prototype.concat(...files).filter(Boolean)
}

// export function filesToNestedArray(files) {
// 	let data = []

// 	files.forEach((item) => {
// 		let current = data
// 		let parts = item.path.split('/')
// 		parts.forEach((part, index) => {
// 			let element = current.find((element) => element.name == part)
// 			if (!element) {
// 				element = { name: part, type: 'folder' }
// 				current.push(element)
// 			}
// 			current = element
// 			if (index == parts.length - 1) {
// 				if (!current.files) current.files = []
// 				current.files.push(item)
// 			}
// 		})
// 	})
// 	return data
// }
