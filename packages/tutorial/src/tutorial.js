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
			let res = { ...item, title: item.title ?? item.name }
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
export function findTutorial(tutorials, route) {
	let current = tutorials
	let crumbs = []

	for (let i = 0; i < route.length; i++) {
		const key = route[i]
		if (!current[key]) {
			return null
		}

		crumbs.push(current[key].title || current[key].name)
		current = i < route.length - 1 ? current[key].children : current[key]
	}
	return { ...current, crumbs }
}

/**
 * Get the tutorial by the route and fetch all files under the folders specified by solutionFolder and partialFolder.
 * @param {TutorialOptions} options - The options for getting the tutorial.
 * @param {string} route - The route of the tutorial to get.
 * @returns {Promise<Object|null>} - A promise that resolves to the tutorial with file content or null if not found.
 */
export function getTutorials(options) {
	options = {
		rootFolder: options.rootFolder,
		metadataFilename: options.metadataFilename || 'meta.json',
		readmeFilename: options.readmeFilename || 'README.md',
		partialFolder: options.partialFolder || 'pre',
		solutionFolder: options.solutionFolder || 'src',
		tutorialMetadata: options.tutorialMetadata
	}

	let tutorials
	let hierarchy

	const load = async () => {
		tutorials = (await import(/* @vite-ignore */ options.tutorialMetadata)).default
		hierarchy = toSortedHierarchy(tutorials, {
			children: 'children',
			sequence: 'sequence'
		})
	}

	const get = async (route) => {
		if (!tutorials) await load()
		const tutorial = findTutorial(tutorials, route.split('/'))
		if (!tutorial || !tutorial.name) return null
		return tutorial
	}

	return { tutorials: () => tutorials, hierarchy: () => hierarchy, load, get }
}
