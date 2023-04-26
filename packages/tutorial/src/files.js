import fs from 'fs'
import path from 'path'

/**
 * Recursively get files in a folder that match the given pattern.
 * @param {string} folderPath - The folder to search in.
 * @param {RegExp} pattern - The pattern to match the file names.
 * @param {string} [dir=''] - The current directory, used for recursion.
 * @returns {Promise<Array>} - An array of matched files.
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

// convert array of files into nested array of files based on path
// ex { path: 'a/b/c', content: '...' } => [ {name: a, type: folder, children: [{ name: b, type:folder, children: [{ name: c, content: '...' }]}] }]

export function folderHierarchy(files) {
	const result = files.reduce((acc, file) => {
		const parts = file.path.split(path.sep)
		let current = acc
		parts.forEach((part, index) => {
			let child = current.find((item) => item.name === part)
			if (!child && part != '') {
				child = {
					name: part,
					path: parts.slice(0, index).join(path.sep),
					type: 'folder',
					children: []
				}
				current.push(child)
			}
			if (part != '') current = child.children
		})
		current.push(file)
		return acc
	}, [])
	return result
}
