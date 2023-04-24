import fs from 'fs'
import path from 'path'
import frontmatter from 'frontmatter'
import { omit } from 'ramda'
import { getFiles } from './files'

const defaultFields = {
	children: 'children',
	sequence: 'sequence'
}

// const extractors = {
// 	js: async (filePath) => (await import(filePath)).default,
// 	json: async (filePath) =>
// 		JSON.parse(await fs.promises.readFile(filePath, 'utf-8')),
// 	md: async (filePath) => {
// 		const fileContent = await fs.promises.readFile(filePath, 'utf-8')
// 		return frontmatter(fileContent).data
// 	}
// }

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
			key,
			route: item.parts
				.slice(0, index + 1)
				.map(({ key }) => key)
				.join('/')
		}
	}
	if (index < item.parts.length - 1) {
		if (!data[key].children) {
			data[key].children = {}
		}
		addPart(data[key].children, item, index + 1)
	} else {
		data[key] = { ...data[key], ...omit(['parts'], item) }
	}
	return data
}

/**
 * Convert the array of file objects into a hierarchical data structure.
 * @param {Array} data - The array of file objects.
 * @returns {Object} - The hierarchical data object.
 */
export function convertData(data) {
	let result = {}
	data
		.map((file) => ({
			...file,
			parts: file.path.split('/').map((part) => getSequenceAndKey(part))
		}))
		.filter((item) => item.parts.includes(null) === false)
		.map((item) => (result = addPart(result, item, 0)))

	return result
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
 * Get metadata for the item based on its file type.
 * @param {string} rootFolder - The root folder containing the item.
 * @param {Object} item - The item to get the metadata for.
 * @returns {Promise<Object>} - A promise that resolves to
 * the metadata object.
 */
export async function getMetadata(rootFolder, item) {
	const filePath = path.join(rootFolder, item.path, item.file)
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
export async function readAndAddMetadata(rootFolder, data) {
	const result = await Promise.all(
		data.map(async (item) => ({
			...(await getMetadata(rootFolder, item)),
			...omit(
				item.file === 'README.md' ? ['type'] : ['type', 'file', 'route'],
				item
			)
		}))
	)

	return result
}

/**
 * Get stories from a root folder and a pattern.
 * @param {string} rootFolder - The root folder to search for stories.
 * @param {RegExp} pattern - The pattern to match the story file names.
 * @returns {Promise<Object>} - A promise that resolves to the stories object.
 */
export async function getStories(rootFolder, pattern) {
	const files = await getFiles(rootFolder, pattern)
	const result = await readAndAddMetadata(rootFolder, files)
	return convertData(result)
}

/**
 * Convert a data object to a sorted hierarchy.
 * @param {Object} data - The data object to convert.
 * @param {Object} [fields={}] - The fields used for creating the hierarchy.
 * @returns {Array} - An array of sorted hierarchical data.
 */
export function toSortedHierarchy(data, fields = {}) {
	fields = { ...defaultFields, ...fields }
	return Object.values(data)
		.map((item) => {
			if (item[fields.children]) {
				item[fields.children] = toSortedHierarchy(item[fields.children], fields)
			}
			return item //.file ? item : omit(['route'], item)
		})
		.sort((a, b) => a[fields.sequence] - b[fields.sequence])
}

/**
 * Create stories from a content folder and a metadata file.
 * @param {string} contentFolder - The folder containing the story content.
 * @param {string} metadataFile - The file to store the metadata in.
 * @returns {Object} - An object with generate, read, stories, and menu functions.
 */
export function assimilateTutorials(contentFolder, metadataFile) {
	const pattern = /(meta\.js|meta\.json|README\.md)$/
	let hierarchy = {}
	let menu = []

	const generate = async () => {
		hierarchy = await getStories(contentFolder, pattern)
		fs.writeFileSync(metadataFile, JSON.stringify(hierarchy, null, 2))
	}

	const read = () => {
		hierarchy = JSON.parse(fs.readFileSync(metadataFile, 'utf-8'))
		menu = toSortedHierarchy(hierarchy)
	}

	const get = (route) => {
		const parts = route.split('/').filter((part) => part !== '')
		let result = hierarchy
		parts.forEach((part) => {
			result = result[part]
		})
		if (result.file) {
			// find all files under src folder under the same folder as the README.md file
			const srcFolder = path.join(contentFolder, result.path, 'src')
			const srcFiles = fs.readdirSync(srcFolder)
			result.src = srcFiles.map((file) => ({
				file,
				content: fs.readFileSync(path.join(srcFolder, file), 'utf-8')
			}))
			// convert this list of file paths and content into a nested list with the folder structure
			result.src = result.src.reduce((acc, item) => {
				const parts = item.file.split('/')
				const key = parts[0]
				if (parts.length === 1) {
					acc.push({ file: key, content: item.content })
				} else {
					const index = acc.findIndex((item) => item.file === key)
					if (index === -1) {
						acc.push({
							file: key,
							children: [{ file: parts[1], content: item.content }]
						})
					} else {
						acc[index].children.push({ file: parts[1], content: item.content })
					}
				}
				return acc
			})
		}
		return result
	}

	return { generate, read, hierarchy: () => hierarchy, menu: () => menu }
}
