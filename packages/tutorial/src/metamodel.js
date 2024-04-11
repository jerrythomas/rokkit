import { omit } from 'ramda'
import { folderHierarchy, getSequenceAndKey } from './utils'

export async function fetchImports(modules) {
	return Promise.all(
		Object.entries(modules).map(async ([file, content]) => ({
			file,
			content: await content()
		}))
	)
}

export function addPathMetadata(files) {
	let result = files.map((item) => {
		let parts = item.file.split('/')
		let name = parts.pop()
		let path = parts.filter((part) => /^\d+/.test(part) !== true).join('/')
		let type = name.split('.').pop()
		parts = parts.map((part) => getSequenceAndKey(part)).filter((part) => part !== null)

		let metadata =
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
 *
 * @param {*} modules
 * @param {import('./types.js').TutorialOptions} options
 * @returns
 */
export function addModuleMetadata(modules, options) {
	return modules.map((item) => {
		let content = getContentBasedOnName(item, options)
		return {
			...omit(['content'], item),
			...content
		}
	})
}

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

function handleItemPath(data, item, key) {
	if (item.path) {
		handleItemWithPath(data, item, key)
	} else {
		handleItemWithoutPath(data, item, key)
	}
}

function handleItemWithPath(data, item, key) {
	let root = item.path.split('/').shift()
	data[key][root] = data[key][root] || {}
	data[key][root].files = data[key][root].files || []

	if (item.content) {
		data[key][root].files.push(omit(['parts'], item))
	} else if (item.preview) {
		data[key][root].preview = item.preview
	}
}

function handleItemWithoutPath(data, item, key) {
	const route = item.parts.map((part) => part.key).join('/')
	data[key] = {
		...data[key],
		...(item.readme ? { route } : {}),
		...omit(['parts', 'path', 'type', 'name'], item)
	}
}

export function convertFilesToFolderHierarchy(tutorials, options) {
	Object.keys(tutorials).forEach((key) => {
		let tutorial = tutorials[key]
		let keys = [options.partialFolder, options.solutionFolder]

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
