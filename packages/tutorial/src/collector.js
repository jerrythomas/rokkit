import fs from 'fs'
import path from 'path'
import frontmatter from 'frontmatter'
import { omit } from 'ramda'
import { getSequenceAndKey, folderHierarchy } from './utils.js'
import { getFiles } from './files.js'

const extractors = {
	js: async (filePath) => (await import(/* @vite-ignore */ filePath)).default,
	json: async (filePath) =>
		JSON.parse(await fs.promises.readFile(filePath, 'utf-8')),
	md: async (filePath) => {
		const fileContent = await fs.promises.readFile(filePath, 'utf-8')
		return frontmatter(fileContent).data
	}
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
	} else {
		metadata = { error: `Unknown file type [${item.type}]` }
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

export async function getFolder(baseFolder, folder) {
	const folderPath = path.join(baseFolder, folder)
	if (!fs.existsSync(folderPath)) return null

	const files = await readFolderContent(folderPath)

	if (files.length === 0) return null

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

export function removeInvalidEntries(data, options) {
	let errors = []
	let invalid = []

	for (const key in data) {
		if (!data[key].title && !data[key].name) {
			invalid.push({
				key,
				path: data[key].path,
				error: 'Each level should have a title or a name property.'
			})
		}
		if (data[key].children) {
			let result = removeInvalidEntries(data[key].children, options)
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
	}

	return {
		data: omit(
			invalid.map(({ key }) => key),
			data
		),
		errors: [...errors, ...invalid]
	}
}

/**
 *
 * @param {import('./types').TutorialOptions} options
 * @returns
 */
export async function collectTutorials(options) {
	const config = {
		rootFolder: options.rootFolder,
		metadataFilename: options.metadataFilename || 'meta.json',
		readmeFilename: options.readmeFilename || 'README.md',
		partialFolder: options.partialFolder || 'pre',
		solutionFolder: options.solutionFolder || 'src',
		tutorialMetadata: options.tutorialMetadata
	}
	const pattern = new RegExp(
		`(${config.metadataFilename}|${config.readmeFilename})$`
	)

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
	let result = removeInvalidEntries(tutorials, config)

	if (result.errors.length > 0) {
		console.info('Invalid entries found:')
		console.table(result.errors)
	}

	const data = JSON.stringify(result.data, null, 2)
	return fs.promises.writeFile(config.tutorialMetadata, data, 'utf-8')
}
