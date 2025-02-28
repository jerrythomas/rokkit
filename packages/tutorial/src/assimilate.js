/* eslint-disable no-console */
import { toSortedHierarchy } from './tutorial'
import { flattenNestedList } from '@rokkit/core'
import {
	fetchImports,
	addPathMetadata,
	addModuleMetadata,
	tutorialsToNestedObject,
	generateRouteEntries,
	convertFilesToFolderHierarchy
} from './metamodel'

const defaultOptions = {
	root: '../stories/',
	previewFilename: 'App.svelte',
	readmeFilename: 'README.md',
	metadataFilename: 'meta.json',
	partialFolder: 'pre',
	solutionFolder: 'src'
}

/**
 * Filters out menu items that are labs.
 *
 * @param {Array} data - The data to filter.
 * @param {boolean} labs - Whether to include labs in the result.
 * @returns {Array} - The filtered data.
 */
export function filterMenuItems(data, labs = false) {
	return data
		.map((item) => {
			if (!labs && item.labs) return null

			if (item.children) {
				item.children = filterMenuItems(item.children, labs)
				if (item.children.length === 0) return null
			}

			return item
		})
		.filter((item) => item !== null)
}

/**
 * Finds the previous index in the flat list of tutorials.
 *
 * @param {Array} flat - The flat list of tutorials.
 * @param {number} index - The index of the tutorial.
 * @returns {number} - The index of the previous tutorial.
 */
function findPrevIndex(flat, index) {
	let prevIndex = index - 1
	while (prevIndex >= 0 && !flat[prevIndex].route) prevIndex--
	return prevIndex
}

/**
 * Finds the next index in the flat list of tutorials.
 *
 * @param {Array} flat - The flat list of tutorials.
 * @param {number} index - The index of the tutorial.
 * @returns {number} - The index of the next tutorial.
 */
function findNextIndex(flat, index) {
	let nextIndex = index + 1
	while (nextIndex <= flat.length - 1 && !flat[nextIndex].route) nextIndex++
	return nextIndex
}

/**
 * Generates the bread crumbs for the tutorial.
 *
 * @param {Array} flat - The flat list of tutorials.
 * @param {number} index - The index of the tutorial.
 * @returns {Array} - The bread crumbs for the tutorial.
 */
function generateCrumbs(flat, index) {
	const crumbs = []
	let currentLevel = flat[index].level

	// Work backwards through the array
	for (let i = index; i >= 0 && currentLevel > 0; i--) {
		if (flat[i].level < currentLevel) {
			crumbs.unshift(flat[i].title)
			currentLevel = flat[i].level
		}
	}

	// Add the current item's title
	crumbs.push(flat[index].title)

	return crumbs
}

/**
 * Finds the tutorial in the flat list of tutorials.
 *
 * @param {Array} flat - The flat list of tutorials.
 * @param {string} route - The route of the tutorial.
 * @returns {Object} - The tutorial.
 */
export function findTutorial(flat, route) {
	const index = flat.findIndex((item) => item.route === route)
	if (index === -1) return null

	const prevIndex = findPrevIndex(flat, index)
	const nextIndex = findNextIndex(flat, index)

	const result = {
		...flat[index],
		previous: prevIndex >= 0 ? flat[prevIndex].route : null,
		next: nextIndex < flat.length ? flat[nextIndex].route : null
	}

	const crumbs = generateCrumbs(flat, index)

	return { ...result, crumbs }
}

/**
 * Processes files from dynamic imports and adds metadata.
 *
 * @param {Array} modules - The modules to process.
 * @param {Array} sources - The sources to process.
 * @param {Object} options - The options to use.
 * @returns {Promise<Object>} - The tutorials and routes.
 */
async function fetchAndProcessFiles(modules, sources, options) {
	const importedModules = await fetchImports(modules)
	const importedSources = await fetchImports(sources)

	let files = [...importedModules, ...importedSources].map((item) => ({
		...item,
		file: item.file.replace(new RegExp(`^${options.root}`), '')
	}))

	files = addPathMetadata(files)
	files = addModuleMetadata(files, options)
	return files
}

/**
 * Process the tutorials, generates the hierarchy and sorts it.
 *
 * @param {Array} modules - The modules to process.
 * @param {Array} sources - The sources to process.
 * @param {Object} options - The options to use.
 * @returns {Promise<Object>} - The tutorials and routes.
 */
async function processTutorials(modules, sources, options) {
	let tutorials = {}
	const files = await fetchAndProcessFiles(modules, sources, options)
	files.forEach((item) => {
		tutorials = tutorialsToNestedObject(tutorials, item)
	})
	const routes = generateRouteEntries(tutorials)
	tutorials = convertFilesToFolderHierarchy(tutorials, options)
	tutorials = toSortedHierarchy(tutorials)

	return { tutorials, routes }
}

/**
 * Processes the tutorials and returns the tutorials and routes.
 *
 * @param {Record<string,Function<Promise>} modules - The modules to process.
 * @param {Record<string,Function<Promise>} sources - The sources to process.
 * @param {Object} options - The options to use.
 * @returns {Object} - The tutorials and routes.
 */
export function assimilateTutorials(modules, sources, options) {
	let loaded = false
	let tutorials = null
	let routes = null

	options = { ...defaultOptions, ...(options ?? {}) }

	const assimilate = async () => {
		if (loaded) return

		console.info('Assimilating tutorials...')
		const result = await processTutorials(modules, sources, options)

		tutorials = result.tutorials
		routes = result.routes
		loaded = true
		console.info('Assimilation complete.')
	}

	const ensureLoaded = async () => {
		if (!loaded) await assimilate()
	}

	return {
		assimilate,
		menu: async (labs = false) => {
			await ensureLoaded()
			return filterMenuItems(tutorials, labs)
		},
		find: async (route, labs = false) => {
			await ensureLoaded()
			const flat = flattenNestedList(filterMenuItems(tutorials, labs))

			return findTutorial(flat, route)
		},
		entries: async () => {
			await ensureLoaded()
			return routes
		},
		content: () => tutorials,
		assimilated: () => loaded
	}
}
