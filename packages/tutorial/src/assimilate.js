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

export function filterMenuItems(data, labs = false) {
	return data
		.map((item) => {
			if (!labs && item.labs) return null

			if (item.children) {
				item.children = filterMenuItems(item.children, labs)
				if (item.children.length == 0) return null
			}

			return item
		})
		.filter((item) => item !== null)
}

export function findTutorial(flat, route) {
	const index = flat.findIndex((item) => item.route == route)
	if (index == -1) return null

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

function findPrevIndex(flat, index) {
	let prevIndex = index - 1
	while (prevIndex >= 0 && !flat[prevIndex].route) prevIndex--
	return prevIndex
}

function findNextIndex(flat, index) {
	let nextIndex = index + 1
	while (nextIndex <= flat.length - 1 && !flat[nextIndex].route) nextIndex++
	return nextIndex
}

function generateCrumbs(flat, index) {
	let crumbs = [flat[index].title]
	let level = flat[index].level

	while (index >= 0 && level > 0) {
		while (index >= 0 && flat[index].level >= level) index--
		if (index >= 0) {
			crumbs = [flat[index].title, ...crumbs]
			level = flat[index].level
		}
	}

	return crumbs
}

export function assimilateTutorials(modules, sources, options) {
	let loaded = false
	let tutorials
	let routes

	options = { ...defaultOptions, ...(options ?? {}) }

	const assimilate = async () => {
		if (loaded) return

		console.info('Assimilating tutorials...')
		let result = await processTutorials(modules, sources, options)

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
			let flat = flattenNestedList(filterMenuItems(tutorials, labs))
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

async function fetchAndProcessFiles(modules, sources, options) {
	let files = [...(await fetchImports(modules)), ...(await fetchImports(sources))].map((item) => ({
		...item,
		file: item.file.replace(new RegExp('^' + options.root), '')
	}))

	files = addPathMetadata(files)
	files = addModuleMetadata(files, options)
	return files
}

async function processTutorials(modules, sources, options) {
	let tutorials = {}
	let routes
	let files = await fetchAndProcessFiles(modules, sources, options)
	files.map((item) => {
		tutorials = tutorialsToNestedObject(tutorials, item)
	})
	routes = generateRouteEntries(tutorials)
	tutorials = convertFilesToFolderHierarchy(tutorials, options)
	tutorials = toSortedHierarchy(tutorials)

	return { tutorials, routes }
}
