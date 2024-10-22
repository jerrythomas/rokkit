import { omit } from 'ramda'
import { folderHierarchy, getSequenceAndKey } from './utils'

/**
 * Returns the content based on the name of the item.
 *
 * @param {Object} item - The item to get the content from.
 * @param {import('./types.js').TutorialOptions} options - The options to use.
 * @returns {Object} - The content of the item.
 */
function getContentBasedOnName(item, options) {
	if (item.name === options.metadataFilename) {
		return { ...item.content }
	}

	if (item.name === options.readmeFilename) {
		return { ...item.content.metadata, readme: item.content.default }
	}

	if (item.name === options.previewFilename) {
		return item.content.default ? { preview: item.content.default } : { content: item.content }
	}

	return { content: item.content }
}

/**
 * Handles the item with a path.
 *
 * @param {Object} data - The data object to add the item to.
 * @param {Object} item - The item to add to the data object.
 * @param {string} key - The key to use for the item in the data object.
 */
function handleItemWithPath(data, item, key) {
	const root = item.path.split('/').shift()
	data[key][root] = data[key][root] || {}
	data[key][root].files = data[key][root].files || []

	if (item.content) {
		data[key][root].files.push(omit(['parts'], item))
	} else if (item.preview) {
		data[key][root].preview = item.preview
	}
}

/**
 * Handles the item without a path.
 *
 * @param {Object} data - The data object to add the item to.
 * @param {Object} item - The item to add to the data object.
 * @param {string} key - The key to use for the item in the data object.
 */
function handleItemWithoutPath(data, item, key) {
	const route = item.parts.map((part) => part.key).join('/')
	data[key] = {
		...data[key],
		...(item.readme ? { route } : {}),
		...omit(['parts', 'path', 'type', 'name'], item)
	}
}
/**
 * Handles the item based on whether it has a path or not.
 *
 * @param {Object} data - The data object to add the item to.
 * @param {Object} item - The item to add to the data object.
 * @param {string} key - The key to use for the item in the data object.
 */
function handleItemPath(data, item, key) {
	if (item.path) {
		handleItemWithPath(data, item, key)
	} else {
		handleItemWithoutPath(data, item, key)
	}
}

/**
 * Fetches the content of the modules.
 *
 * @param {Object} modules - The modules to fetch the content from.
 * @returns {Promise<Array>} - The content of the modules.
 */
export function fetchImports(modules) {
	return Promise.all(
		Object.entries(modules).map(async ([file, content]) => ({
			file,
			content: await content()
		}))
	)
}

/**
 * Adds metadata to the files.
 *
 * @param {Array} files - The files to add metadata to.
 * @returns {Array} - The files with metadata.
 */
export function addPathMetadata(files) {
	const result = files.map((item) => {
		let parts = item.file.split('/')
		const name = parts.pop()
		const path = parts.filter((part) => /^\d+/.test(part) !== true).join('/')
		const type = name.split('.').pop()
		parts = parts.map((part) => getSequenceAndKey(part)).filter((part) => part !== null)

		const metadata =
			path === ''
				? {}
				: {
						path,
						type
					}

		return {
			...omit(['file'], item),
			parts,
			name,
			...metadata
		}
	})
	return result
}

/**
 * Adds metadata to the module
 *
 * @param {*} modules
 * @param {import('./types.js').TutorialOptions} options
 * @returns
 */
export function addModuleMetadata(modules, options) {
	return modules.map((item) => {
		const content = getContentBasedOnName(item, options)
		return {
			...omit(['content'], item),
			...content
		}
	})
}

/**
 * Recursively add part and its children to the data object.
 *
 * @param {Object} data - The data object to add the part to.
 * @param {Object} item - The item containing the part information.
 * @param {number} index - The index of the part in the item's parts array.
 * @returns {Object} - The updated data object.
 */
export function tutorialsToNestedObject(data, item, index = 0) {
	const { key, sequence } = item.parts[index]
	data[key] = data[key] || { sequence, key }

	if (index < item.parts.length - 1) {
		data[key].children = tutorialsToNestedObject(data[key].children || {}, item, index + 1)
	} else {
		handleItemPath(data, item, key)
	}
	return data
}

/**
 * Converts an array of files to a folder hierarchy.
 *
 * @param {Array} files - The files to convert to a folder hierarchy.
 * @returns {Object} - The folder hierarchy.
 */
export function convertFilesToFolderHierarchy(tutorials, options) {
	Object.keys(tutorials).forEach((key) => {
		const tutorial = tutorials[key]
		const keys = [options.partialFolder, options.solutionFolder]

		keys.forEach((folder) => {
			if (tutorial[folder]) {
				if (tutorial[folder].files) {
					tutorial[folder].files = folderHierarchy(tutorial[folder].files)
				}
			}
		})
		if (tutorial.children) {
			tutorial.children = convertFilesToFolderHierarchy(tutorial.children, options)
		}
	})
	return tutorials
}

/**
 * Extracts all thr routes from the folder hierarchy and returns them as an array.
 *
 * @param {Array} files - The files to convert to a folder hierarchy.
 * @returns {Array<string>} - array of route paths
 */
export function generateRouteEntries(input) {
	const output = []

	Object.values(input).forEach((value) => {
		if (value.route) {
			output.push(value.route)
		}
		if (value.children) {
			output.push(...generateRouteEntries(value.children))
		}
	})
	return output
}
