import path from 'path'
import { toPascalCase } from '@rokkit/utils/string'
import { omit } from 'ramda'

/** @type {import('./types').StoryOptions} */
const defaultOptions = {
	notes: 'README.md',
	preview: 'App.svelte',
	metadata: 'metadata.js'
}
const types = ['svelte', 'js', 'svx']

export function sortByPageAndFilename(a, b) {
	if (a.folder === b.folder) {
		if (a.page === b.page) {
			const typeOrder = types.indexOf(a.type) - types.indexOf(b.type)
			return typeOrder === 0 ? a.name.localeCompare(b.name) : typeOrder
		} else return a.page - b.page
	} else return a.name.localeCompare(b.folder)
}

export function getAttributes(file) {
	const name = path.basename(file)
	const type = path.extname(name).slice(1)
	let folder = path.dirname(file)
	let page = null
	let result = /\/(?<page>\d+).*/.exec(folder)
	if (result && result.groups) {
		page = parseInt(result.groups.page)
		folder = path.dirname(folder)
	}

	return { page, folder: path.basename(folder), file, name, type }
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
	if (story.page) {
		story['code'] = story.content.default
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
	const result = input.sort(sortByPageAndFilename).reduce((acc, curr) => {
		let pages = acc[curr.folder] ? acc[curr.folder].pages : []
		if (!acc[curr.folder]) {
			acc[curr.folder] = { name: toPascalCase(curr.folder) }
		}
		if (!curr.page) {
			acc[curr.folder] = { ...acc[curr.folder], metadata: curr.metadata }
		} else {
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
			.map((x) => extractCodeFromImports(x))
	]

	return transform(combined)
}
