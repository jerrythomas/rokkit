import { omit } from 'ramda'
import { getSequenceAndKey } from './collector'
import { folderHierarchy } from './files'

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
		let path = parts.filter((part) => /^\d+/.test(part) != true).join('/')
		let type = name.split('.').pop()
		parts = parts
			.map((part) => getSequenceAndKey(part))
			.filter((part) => part != null)

		let metadata =
			path == ''
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
	let result = modules.map((item) => {
		let content = {}
		if (item.name == options.metadataFilename) {
			content = { ...item.content }
		} else if (item.name == options.readmeFilename) {
			content = { ...item.content.metadata, readme: item.content.default }
		} else if (item.name == options.previewFilename) {
			content = item.content.default
				? { preview: item.content.default }
				: { content: item.content }
		}

		return {
			...omit(['content'], item),
			...content
		}
	})
	return result
}

// export function addModuleSource(modules) {
// 	let result = modules.map((item) => {
// 		return {
// 			...omit(['content'], item),
// 			source: item.content
// 		}
// 	})
// 	return result
// }

/**
 * Recursively add part and its children to the data object.
 *
 * @param {Object} data - The data object to add the part to.
 * @param {Object} item - The item containing the part information.
 * @param {number} index - The index of the part in the item's parts array.
 * @returns {Object} - The updated data object.
 */
export function turorialsToNestedObject(data, item, index = 0) {
	const { key, sequence } = item.parts[index]

	if (!data[key]) data[key] = { sequence, key }

	if (index < item.parts.length - 1) {
		if (!data[key].children) data[key].children = {}
		data[key].children = turorialsToNestedObject(
			data[key].children,
			item,
			index + 1
		)
	} else {
		if (item.path) {
			let root = item.path.split('/').shift()

			if (!data[key][root]) data[key][root] = {}
			if (!data[key][root].files) data[key][root].files = []

			if (item.content) {
				data[key][root].files.push(omit(['parts'], item))
			} else if (item.preview) {
				data[key][root].preview = item.preview
			}
		} else {
			const route = item.parts
				.slice(0, index + 1)
				.map((part) => part.key)
				.join('/')
			data[key] = {
				...data[key],
				...(item.readme ? { route } : {}),
				...omit(['parts', 'path', 'type', 'name'], item)
			}
		}
	}
	return data
}

export function convertFilesToFolderHierarchy(tutorials, options) {
	Object.keys(tutorials).forEach((key) => {
		let tutorial = tutorials[key]
		let keys = [options.partialFolder, options.solutionFolder]
		keys.forEach((key) => {
			if (tutorial[key]) {
				if (tutorial[key].files) {
					tutorial[key].files = folderHierarchy(tutorial[key].files)
				}
			}
		})
		if (tutorial.children) {
			tutorial.children = convertFilesToFolderHierarchy(
				tutorial.children,
				options
			)
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
