import { toSortedHierarchy } from './tutorial'
import { flattenNestedList } from 'rokkit/utils'
import {
	fetchImports,
	addPathMetadata,
	addModuleMetadata,
	turorialsToNestedObject,
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
function filterMenuItems(data, labs = false) {
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
	let index = flat.findIndex((item) => item.route == route)

	if (index == -1) return null
	let prevIndex = index - 1
	let nextIndex = index + 1
	while (prevIndex >= 0 && !flat[prevIndex].route) prevIndex--
	while (nextIndex <= flat.length - 1 && !flat[nextIndex].route) nextIndex++
	let result = {
		...flat[index],
		previous: prevIndex >= 0 ? flat[prevIndex].route : null,
		next: nextIndex < flat.length ? flat[nextIndex].route : null
	}
	let crumbs = [flat[index].title]
	let level = flat[index].level

	while (index >= 0 && level > 0) {
		while (index >= 0 && flat[index].level >= level) index--
		if (index >= 0) {
			crumbs = [flat[index].title, ...crumbs]
			level = flat[index].level
		}
	}

	return { ...result, crumbs }
}

export function assimilateTutorials(modules, sources, options) {
	let loaded = false
	let tutorials
	let routes

	options = { ...defaultOptions, ...(options ?? {}) }
	const assimilate = async () => {
		if (loaded) return

		console.info('Assimilating tutorials...')
		let files = [
			...(await fetchImports(modules)),
			...(await fetchImports(sources))
		].map((item) => ({
			...item,
			file: item.file.replace(new RegExp('^' + options.root), '')
		}))

		files = addPathMetadata(files)
		files = addModuleMetadata(files, options)

		tutorials = {}
		files.map((item) => {
			tutorials = turorialsToNestedObject(tutorials, item)
		})
		routes = generateRouteEntries(tutorials)
		tutorials = convertFilesToFolderHierarchy(tutorials, options)
		tutorials = toSortedHierarchy(tutorials)

		loaded = true
		console.info('Assimilation complete.')
	}

	const find = async (route, labs = false) => {
		if (!loaded) await assimilate()
		let flat = flattenNestedList(filterMenuItems(tutorials, labs))
		return findTutorial(flat, route)
	}
	const menu = async (labs = false) => {
		if (!loaded) await assimilate()
		return filterMenuItems(tutorials, labs)
	}
	const entries = async () => {
		if (!loaded) await assimilate()
		return routes
	}

	// assimilate()

	return {
		assimilate,
		menu,
		find,
		entries,
		content: () => tutorials,
		assimilated: () => loaded
	}
}
