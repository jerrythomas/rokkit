import { toPascalCase } from './string'
import { omit } from 'ramda'

/** @type {import('./types').StoryOptions} */
const defaultOptions = {
	notes: 'guide.svx',
	preview: 'App.svelte',
	metadata: 'metadata.js'
}

export function fileSorter(a, b) {
	if (a.folder !== b.folder) {
		return a.folder < b.folder ? -1 : 1
	} else if (!a.page) {
		return 1
	} else if (!b.page) {
		return -1
	} else if (a.page !== b.page) {
		return a.page - b.page
	} else if (a.name === 'App.svelte') {
		return -1
	} else if (b.name === 'App.svelte') {
		return 1
	} else if (a.type === 'svelte' && b.type === 'js') {
		return -1
	} else if (a.type === 'js' && b.type === 'svelte') {
		return 1
	} else {
		return a.name < b.name ? -1 : 1
	}
}
// export function sortByPageAndFilename(a, b) {
// 	if (a.folder === b.folder) {
// 		if (a.page === b.page) {
// 			const typeOrder = types.indexOf(a.type) - types.indexOf(b.type)
// 			return typeOrder === 0 ? a.name.localeCompare(b.name) : typeOrder
// 		} else return (a.page ?? 99) - (b.page ?? 99)
// 	} else return a.name.localeCompare(b.folder)
// }

export function getAttributes(file) {
	const parts = file.split('/')
	const name = parts[parts.length - 1]
	const type = name.split('.').pop()
	let folder = parts[parts.length - 2]
	let page
	let result = /(?<page>\d+).*$/.exec(folder)
	if (result && result.groups) {
		page = parseInt(result.groups.page)
		folder = parts[parts.length - 3]
	} else {
		file
	}

	return { page, folder, file, name, type }
}

export async function fetchImports(modules) {
	return Promise.all(
		Object.entries(modules).map(async ([file, content]) => ({
			file,
			content: await content()
		}))
	)
}

export function extractModuleFromImports(story, options) {
	options = { ...defaultOptions, ...options }

	if (!story.page && story.name === options.metadata) {
		story['metadata'] = story.content.default ?? {}
	} else if (story.name === options.preview) {
		story['preview'] = story.content.default
	} else if (story.name === options.notes) {
		story['notes'] = story.content.default
		story['metadata'] = story.content.metadata ?? {}
	} else {
		story['error'] = 'Invalid file for import as module'
	}
	return omit(['content'], story)
}

export function extractCodeFromImports(story) {
	// console.log(story)
	if (story.page) {
		story['code'] = story.content
	} else {
		story['error'] = 'Code examples should be within a page.'
	}
	return omit(['content'], story)
}

/**
 *
 * @param {Array<import('./types').StoryFile>} input
 * @returns {import('./types').Stories}
 */
export function transform(input) {
	const result = input.sort(fileSorter).reduce((acc, curr) => {
		let pages = acc[curr.folder] ? acc[curr.folder].pages : []
		if (!acc[curr.folder]) {
			acc[curr.folder] = { name: toPascalCase(curr.folder) }
		}
		if (!curr.page) {
			acc[curr.folder] = { ...acc[curr.folder], metadata: curr.metadata }
		} else {
			// console.log(curr.folder, pages.length, curr.page)
			if (pages.length < curr.page) {
				pages.push({
					files: [],
					preview: null,
					notes: null
				})
			}
			if (curr.preview) {
				pages[curr.page - 1].preview = curr.preview
			}
			if (curr.notes) {
				pages[curr.page - 1].notes = curr.notes
				pages[curr.page - 1] = { ...curr.metadata, ...pages[curr.page - 1] }
			}
			if (curr.code) {
				pages[curr.page - 1].files.push({
					file: curr.name,
					language: curr.type,
					code: curr.code
				})
			}
		}
		acc[curr.folder].pages = pages

		return acc
	}, {})
	return result
}

export async function extractStories(modules, sources, options) {
	let combined = [
		...(await fetchImports(modules))
			.map((x) => ({ ...getAttributes(x.file), ...x }))
			.map((x) => extractModuleFromImports(x, options)),
		...(await fetchImports(sources))
			.map((x) => ({ ...getAttributes(x.file), ...x }))
			// .filter((x) => x.page)
			.map((x) => extractCodeFromImports(x))
	].filter((x) => !x.error)

	return transform(combined)
}
