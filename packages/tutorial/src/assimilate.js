import { findTutorial, toSortedHierarchy } from './tutorial'
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
export function assimilateTutorials(modules, sources, options) {
	let loaded = false
	let tutorials
	let routes
	let hierarchy

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
		// console.log('files', files)
		files = addModuleMetadata(files, options)
		// console.log('files', files)

		tutorials = {}
		files.map((item) => {
			tutorials = turorialsToNestedObject(tutorials, item)
		})
		// console.log('tutorials', JSON.stringify(tutorials, null, 2))
		routes = generateRouteEntries(tutorials)
		tutorials = convertFilesToFolderHierarchy(tutorials, options)
		hierarchy = toSortedHierarchy(tutorials)
		loaded = true
		console.info('Assimilation complete.')
	}

	const find = async (route) => {
		if (!loaded) await assimilate()
		return findTutorial(tutorials, route.split('/'))
	}
	const menu = async (labs = false) => {
		if (!loaded) await assimilate()
		return filterMenuItems(hierarchy, labs)
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
