import { omit, pick } from 'ramda'
import { toHyphenCase } from './string'

/** @type {import('./types').StoryOptions} */
const defaultOptions = {
	notes: 'README.md',
	preview: 'App.svelte',
	metadata: 'meta.json'
}

export function getSequenceAndTitle(text) {
	const result = /(?<number>\d+)(\s*-\s*)(?<title>.*)$/.exec(text)
	if (result && result.groups) {
		return {
			sequence: parseInt(result.groups.number),
			title: result.groups.title
		}
	}
	return null
}

export function getAttributes(file, options = defaultOptions) {
	let page = null
	let element = null
	let section = null

	const parts = file.split('/')
	const name = parts.pop()
	const type = name.split('.').pop()

	if (parts.length > 0) page = getSequenceAndTitle(parts.pop())
	if (parts.length > 0) element = getSequenceAndTitle(parts.pop())
	if (parts.length > 0) section = getSequenceAndTitle(parts.pop())

	if (section == null) {
		section = element
		element = null
	}
	if (name == options.metadata) {
		if (section == null) {
			section = page
		} else {
			element = page
		}
		page = null
	}

	return section == null ? null : { section, element, page, file, name, type }
}

function addPage(dest, item) {
	if (item.page) {
		let page = dest.pages[item.page.slug] ?? {
			...item.page,
			files: []
		}
		page.files.push(pick(['name', 'type', 'file', 'code'], item))
		dest.pages[item.page.slug] = page
	}

	return dest
}
function addElement(dest, item, options = defaultOptions) {
	if (!item.element) return dest
	let element = dest.elements[item.element.slug] ?? {
		...item.element,
		pages: {}
	}

	dest.elements[item.element.slug] = addPage(element, item, options)
	return dest
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
	let level = story.page ? 'page' : story.element ? 'element' : 'section'

	if (story.name === options.metadata) {
		story[level] = { ...story[level], ...story.content.default /*?? {}*/ }
	} else if (story.name === options.preview) {
		story[level]['preview'] = story.content.default
	} else if (story.name === options.notes) {
		story[level] = {
			...story[level],
			...(story.content.metadata ?? {}),
			notes: story.content.default
		}
	} else {
		story['error'] = 'Invalid file for import as module'
	}
	return omit(['content'], story)
}

export function extractCodeFromImports(story) {
	if (story.page) {
		story['code'] = story.content
	} else {
		story['error'] = 'Code examples should be within a page.'
	}
	return omit(['content'], story)
}

export async function extractStories(
	modules,
	sources,
	options = defaultOptions
) {
	let combined = [
		...(await fetchImports(modules))
			.map((x) => ({
				...getAttributes(x.file, options),
				...x
			}))
			.map((x) => extractModuleFromImports(x, options)),
		...(await fetchImports(sources))
			.map((x) => ({ ...getAttributes(x.file, options), ...x }))
			.map((x) => extractCodeFromImports(x))
	]
		.filter((x) => !x.error)
		.map((x) => ({
			...x,
			section: { ...x.section, slug: toHyphenCase(x.section.title) },
			element: x.element
				? { ...x.element, slug: toHyphenCase(x.element.title) }
				: null,
			page: x.page ? { ...x.page, slug: toHyphenCase(x.page.title) } : null
		}))
	return convertToSections(combined, options)
}
export function convertToSections(data, options = defaultOptions) {
	let sections = {}
	data.map((item) => {
		let section = sections[item.section.slug] ?? {
			...item.section,
			elements: {},
			pages: {}
		}

		section = addElement(section, item, options)
		section = addPage(section, item, options)

		sections[item.section.slug] = section
	})

	return sections
}

export function toSortedHierarchy(data) {
	const sections = Object.values(data)
		.map((section) => ({
			...section,
			elements: Object.values(section.elements)
				.map((element) => ({
					...element,
					pages: Object.values(element.pages).sort(
						(a, b) => a.sequence - b.sequence
					)
				}))
				.sort((a, b) => a.sequence - b.sequence),
			pages: Object.values(section.pages).sort(
				(a, b) => a.sequence - b.sequence
			)
		}))
		.sort((a, b) => a.sequence - b.sequence)
	return sections
}

export function createStories(modules, sources, options = {}) {
	let stories = {}
	let sections = []
	let ready = false

	options = { ...defaultOptions, ...options }

	const fetch = async () => {
		console.info('Fetching ...')
		stories = await extractStories(modules, sources, options)
		sections = toSortedHierarchy(stories)
		ready = true
		console.info('Fetching Completed...')
	}

	return {
		fetch,
		ready: () => ready,
		story: (name) => (name in stories ? stories[name] : null),
		stories: () => stories,
		sections: () => sections
	}
}
