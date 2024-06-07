import fs from 'fs'
import path from 'path'

/**
 * Recursively get files in a folder that match the given pattern.
 * @param {string} folderPath - The folder to search in.
 * @param {RegExp} pattern - The pattern to match the file names.
 * @param {string} [dir=''] - The current directory, used for recursion.
 * @returns {Promise<Array<import('./types').FileMetadata>>} - An array of matched files.
 */
export async function getFiles(folderPath, pattern = null, dir = '') {
	const entries = await fs.promises.readdir(path.join(folderPath, dir), {
		withFileTypes: true
	})

	const files = await processEntries(entries, folderPath, pattern, dir)

	return files.flat().filter(Boolean)
}

/**
 * Process the entries in a directory.
 * @param {fs.Dirent[]} entries - The entries to process.
 * @param {string} folderPath - The folder path.
 * @param {RegExp} pattern - The pattern to match the file names.
 * @param {string} dir - The current directory.
 * @returns {Promise<Array<import('.types').FileMetadata>>} - An array of matched files.
 */
function processEntries(entries, folderPath, pattern, dir) {
	return Promise.all(entries.map((entry) => processEntry(entry, folderPath, pattern, dir)))
}

/**
 * Process an entry in a directory.
 * @param {fs.Dirent} entry - The entry to process.
 * @param {string} folderPath - The folder path.
 * @param {RegExp} pattern - The pattern to match the file names.
 * @param {string} dir - The current directory.
 * @returns {Promise<import('./types').FileMetadata>} - The matched file.
 */
function processEntry(entry, folderPath, pattern, dir) {
	const currentPath = path.join(dir, entry.name)
	if (entry.isDirectory()) {
		return getFiles(folderPath, pattern, currentPath)
	}

	if (pattern === null || pattern.test(entry.name)) {
		return Promise.resolve(createFileObject(dir, entry))
	}

	return Promise.resolve(null)
}

/**
 * Create a file object.
 * @param {string} dir - The directory.
 * @param {fs.Dirent} entry - The entry.
 * @returns {import('./types').FileMetadata} - The file object.
 */
function createFileObject(dir, entry) {
	return {
		path: dir,
		name: entry.name,
		type: path.extname(entry.name).slice(1)
	}
}
