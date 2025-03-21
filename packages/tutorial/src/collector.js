/* eslint-disable no-console */
import fs from 'fs'
import path from 'path'
import { omit } from 'ramda'
import { getSequenceAndKey, folderHierarchy } from './utils.js'
import { getFiles } from './files.js'
import { factory } from './metadata/index.js'

const defaultOptions = {
	rootFolder: './',
	metadataFilename: 'meta.json',
	readmeFilename: 'README.md',
	partialFolder: 'pre',
	solutionFolder: 'src',
	tutorialMetadata: 'tutorials.json'
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

	try {
		const reader = factory.create(filePath)
		metadata = await reader.read()
	} catch (error) {
		metadata = { error: error.message }
		console.error(error.message)
	}

	return metadata
}

/**
 * Read content of all files in the given folder.
 * @param {string} folder - The folder to read files from.
 * @returns {Promise<Object>} - A promise that resolves to an object containing file content keyed by file paths.
 */
export async function readFolderContent(folder) {
	const files = await getFiles(folder)
	for (const file of files) {
		const filePath = path.join(folder, file.path, file.name)
		file.content = await fs.promises.readFile(filePath, 'utf-8')
	}

	return files
}

/**
 * Get the folder content and its preview file if it exists.
 * @param {string} baseFolder - The base folder path.
 * @param {string} folder - The folder to get the content from.
 * @returns {Promise<Object|null>} - A promise that resolves to an object containing the folder content and preview file, or null if the folder does not exist or is empty.
 */
export async function getFolder(baseFolder, folder) {
	const folderPath = path.join(baseFolder, folder)
	if (!fs.existsSync(folderPath)) return null

	const files = await readFolderContent(folderPath)

	const preview = path.join(folderPath, 'App.svelte')
	return {
		preview: !fs.existsSync(preview) ? null : preview,
		files: folderHierarchy(files)
	}
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
		route: item.parts.includes(null) ? null : item.parts.map(({ key }) => key).join('/')
	}))
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
 * Convert the array of file objects into a hierarchical data structure.
 * @param {Array} data - The array of file objects.
 * @returns {Object} - The hierarchical data object.
 */
export function transform(data) {
	let result = {}
	data
		.filter((item) => item.route !== null)
		.forEach((item) => (result = addPart(result, omit(item.name ? [] : ['route'], item), 0)))
	return result
}

/**
 * Validate the level of the data object.
 * @param {Object} data - The data object to validate.
 * @param {string} key - The key of the data object to validate.
 * @param {Array} invalid - The array to store invalid entries.
 */
function validateLevel(data, key, invalid) {
	if (!data[key].title && !data[key].name) {
		invalid.push({
			key,
			path: data[key].path,
			error: 'Each level should have a title or a name property.'
		})
	}
}

/**
 * Remove invalid entries from the data object.
 * @param {Object} data - The data object to remove invalid entries from.
 * @param {Object} options - The options object containing validation criteria.
 * @returns {Object} - An object containing the cleaned data and any errors found.
 */
export function removeInvalidEntries(data, options) {
	let errors = []
	const invalid = []

	Object.keys(data).forEach((key) => {
		validateLevel(data, key, invalid)
		if (data[key].children) {
			const result = removeInvalidEntries(data[key].children, options)
			data[key].children = result.data
			if (Object.keys(data[key].children).length === 0) {
				invalid.push({ key, path: data[key].path, error: 'Empty folder' })
			}
			errors = [...errors, ...result.errors]
		} else if (data[key].name !== options.readmeFilename) {
			invalid.push({
				key,
				path: data[key].path,
				error: 'Innermost level should have a readme'
			})
		}
	})

	return {
		data: omit(
			invalid.map(({ key }) => key),
			data
		),
		errors: [...errors, ...invalid]
	}
}

/**
 * Collect tutorials based on the provided options.
 * @param {import('./types').TutorialOptions} options - The options for collecting tutorials.
 * @returns {Promise<void>} - A promise that resolves when the tutorials have been collected and written to the metadata file.
 */
export async function collectTutorials(options) {
	const config = { ...defaultOptions, ...options }
	const pattern = new RegExp(`(${config.metadataFilename}|${config.readmeFilename})$`)

	let tutorials = await getFiles(config.rootFolder, pattern)
	tutorials = await enrich(config.rootFolder, tutorials)
	tutorials = await Promise.all(
		tutorials.map(async (item) => {
			const tutorialFolder = path.join(config.rootFolder, item.path)
			if (item.name === 'README.md') {
				item.before = await getFolder(tutorialFolder, config.partialFolder)
				item.after = await getFolder(tutorialFolder, config.solutionFolder)
			}

			return item
		})
	)
	tutorials = transform(tutorials)
	const result = removeInvalidEntries(tutorials, config)

	if (result.errors.length > 0) {
		console.info('Invalid entries found:')
		console.table(result.errors)
	}

	const data = JSON.stringify(result.data, null, 2)
	return fs.promises.writeFile(config.tutorialMetadata, data, 'utf-8')
}
