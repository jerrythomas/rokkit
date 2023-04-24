import fs from 'fs'
import path from 'path'
import frontmatter from 'frontmatter'
import { omit } from 'ramda'
import { getFiles } from './files'

/**
 * @typedef {Object} TutorialOptions
 * @property {string} rootFolder - The root folder containing tutorial files.
 * @property {string} [metadataFilename='meta.json'] - The optional filename for metadata, defaults to 'meta.json'.
 * @property {string} [readmeFilename='README.md'] - The optional filename for the readme, defaults to 'README.md'.
 * @property {string} partialFolder - The folder containing partial solutions.
 * @property {string} solutionFolder - The folder containing correct solutions.
 * @property {string} tutorialMetadata - The filename to write the hierarchical data.
 */

const extractors = {
	js: async (filePath) => (await import(filePath)).default,
	json: async (filePath) =>
		JSON.parse(await fs.promises.readFile(filePath, 'utf-8')),
	md: async (filePath) => {
		const fileContent = await fs.promises.readFile(filePath, 'utf-8')
		return frontmatter(fileContent).data
	}
}

/**
 * Get the sequence and key from a text string.
 * @param {string} text - The text to extract the sequence and key from.
 * @returns {Object|null} - An object containing the sequence and key or null if not found.
 */
export function getSequenceAndKey(text) {
	const result = /(?<number>\d+)(\s*-\s*)(?<key>.*)$/.exec(text)
	if (result && result.groups) {
		return {
			sequence: parseInt(result.groups.number),
			key: result.groups.key
		}
	}
	return null
}

/**
 * Recursively add part and its children to the data object.
 * @param {Object} data - The data object to add the part to.
 * @param {Object} item - The item containing the part information.
 * @param {number} index - The index of the part in the item's parts array.
 * @returns {Object} - The updated data object.
 */
function addPart(data, item, index) {
	const { key, sequence } = item.parts[index]

	if (!data[key]) {
		data[key] = {
			sequence,
			key
		}
	}

	if (index < item.parts.length - 1) {
		if (!data[key].children) {
			data[key].children = {}
		}
		addPart(data[key].children, item, index + 1)
	} else {
		data[key] = {
			...data[key],
			...omit(['parts'], item)
		}
	}
	return data
}

/**
 * Get metadata for the item based on its file type.
 * @param {string} rootFolder - The root folder containing the item.
 * @param {Object} item - The item to get the metadata for.
 * @returns {Promise<Object>} - A promise that resolves to the metadata object.
 */
export async function getMetadata(rootFolder, item) {
	const filePath = path.join(rootFolder, item.path, item.name)
	let metadata = {}
	if (item.type in extractors) {
		try {
			metadata = await extractors[item.type](filePath)
		} catch (error) {
			metadata = { error: error.message }
		}
	}
	return metadata
}

/**
 * Read and add metadata for each item in the data array.
 * @param {string} rootFolder - The root folder containing the items.
 * @param {Array} data - The array of items to read metadata for.
 * @returns {Promise<Array>} - A promise that resolves to an array of items with added metadata.
 */
export async function enrich(rootFolder, data) {
	const result = await Promise.all(
		data.map(async (item) => ({
			...(await getMetadata(rootFolder, item)),
			parts: item.path.split('/').map((part) => getSequenceAndKey(part)),
			...omit(item.name === 'README.md' ? ['type'] : ['type', 'name'], item)
		}))
	)
	return result.map((item) => ({
		...item,
		route: item.parts.includes(null)
			? null
			: item.parts.map(({ key }) => key).join('/')
	}))
}

/**
 * Convert the array of file objects into a hierarchical data structure.
 * @param {Array} data - The array of file objects.
 * @returns {Object} - The hierarchical data object.
 */
export function transform(data) {
	let result = {}
	data
		.filter((item) => item.route != null)
		.map(
			(item) =>
				(result = addPart(result, omit(item.name ? [] : ['route'], item), 0))
		)
	return result
}

export async function collectTutorials(options) {
	const config = {
		rootFolder: options.rootFolder,
		metadataFilename: options.metadataFilename || 'meta.json',
		readmeFilename: options.readmeFilename || 'README.md',
		partialFolder: options.partialFolder,
		solutionFolder: options.solutionFolder,
		tutorialMetadata: options.tutorialMetadata || 'tutorials.json'
	}
	const pattern = new RegExp(
		`(${options.metadataFilename}|${options.readmeFilename})$`
	)

	let tutorials = await getFiles(config.rootFolder, pattern)
	tutorials = await enrich(config.rootFolder, tutorials)
	tutorials = transform(tutorials)

	const data = JSON.stringify(tutorials, null, 2)
	return fs.promises.writeFile(config.tutorialMetadata, data, 'utf-8')
}
