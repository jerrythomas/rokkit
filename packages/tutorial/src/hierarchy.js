import fs from 'fs'
import path from 'path'
import { getFiles, folderHierarchy } from './files'

const defaultFields = {
	children: 'children',
	sequence: 'sequence'
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
			let res = { ...item }
			if (item[fields.children]) {
				res[fields.children] = toSortedHierarchy(item[fields.children], fields)
			}
			return res
		})
		.sort((a, b) => a[fields.sequence] - b[fields.sequence])
}

/**
 * Get the tutorial by the given route.
 * @param {Object} tutorials - The tutorials data.
 * @param {Array<string>} route - The route to find the tutorial by.
 * @returns {Object|null} - The found tutorial or null if not found.
 */
function findTutorial(tutorials, route) {
	let current = tutorials

	for (let i = 0; i < route.length; i++) {
		const key = route[i]
		if (!current[key]) {
			return null
		}
		current = i < route.length - 1 ? current[key].children : current[key]
	}
	return current
}

export async function getImportedComponent(folder, file) {
	const filePath = path.join(folder, file)
	let result = {}
	if (fs.existsSync(filePath)) {
		try {
			result.component = await import(filePath)
		} catch (error) {
			result.error = error.message
		}
	} else {
		result.error = `${file} not found in ${folder}`
	}

	return result
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
	const files = (await readFolderContent(folderPath)).map((file) => ({
		...file,
		path: path.join(folder, file.path)
	}))

	if (files.length === 0) return null

	const preview = path.join(folderPath, 'App.svelte')
	return {
		preview: !fs.existsSync(preview) ? null : preview,
		files: folderHierarchy(files)
	}
}

/**
 * Get the tutorial by the route and fetch all files under the folders specified by solutionFolder and partialFolder.
 * @param {TutorialOptions} options - The options for getting the tutorial.
 * @param {string} route - The route of the tutorial to get.
 * @returns {Promise<Object|null>} - A promise that resolves to the tutorial with file content or null if not found.
 */
export async function getTutorials(options) {
	const rawData = await fs.promises.readFile(options.tutorialMetadata, 'utf-8')
	const tutorials = JSON.parse(rawData)
	// let hierarchy
	const hierarchy = toSortedHierarchy(tutorials, {
		children: 'children',
		sequence: 'sequence'
	})

	const get = async (route) => {
		const tutorial = findTutorial(tutorials, route.split('/'))
		// console.log(route, tutorial)
		if (!tutorial || !tutorial.name) return null

		const tutorialFolder = path.join(options.rootFolder, tutorial.path)
		// console.log(tutorialFolder)
		return {
			...tutorial,
			readme: path.join(tutorialFolder, tutorial.name),
			before: await getFolder(tutorialFolder, options.partialFolder),
			after: await getFolder(tutorialFolder, options.solutionFolder)
		}
	}

	return { tutorials, hierarchy, get }
}
