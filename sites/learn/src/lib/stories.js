import { omit } from 'ramda'
const LANGUAGE_MAP = {
	js: 'javascript',
	ts: 'typescript',
	md: 'markdown',
	sh: 'bash',
	bash: 'bash',
	shell: 'shell'
}

/**
 * @typedef {Object} SourceFile
 * @property {string} file     - The file path.
 * @property {string} [group]  - The group name.
 * @property {string} name     - The file name.
 * @property {string} language - The language of the file.
 * @property {string} content  - The content of the file.
 */

/**
 * @typedef {Object} ModuleFile
 * @property {string} file     - The file path.
 * @property {string} [group]  - The group name.
 * @property {string} name     - The file name.
 * @property {string} language - The language of the file.
 * @property {Object} content  - The content of the file.
 */

/** @typedef {SourceFile|ModuleFile} File */

/**
 * @typedef {Object} Metadata
 * @property {string}     title
 * @property {string}     description
 * @property {string}     category
 * @property {string[]}   tags
 * @property {number}     depth
 * @property {number}     order
 * @property {Metadata[]} [children]
 */

/**
 * @typedef {Object} Story
 * @property {File[]}                           files   - Array of files.
 * @property {import('svelte').SvelteComponent} [App]     - The preview component.
 */

/**
 * Returns the language of a file based on its extension.
 *
 * @param {string} file - The file to get the language from.
 * @returns {string} - The language of the file.
 */
function getLanguage(file) {
	const ext = file.split('.').pop()
	return LANGUAGE_MAP[ext] || ext
}
/**
 * Fetches the content of the sources.
 *
 * @param {Object} sources - The modules to fetch the content from.
 * @returns {Promise<File[]>} - The content of the modules.
 */
export async function fetchImports(sources) {
	const files = await Promise.all(
		Object.entries(sources).map(async ([file, content]) => ({
			file,
			group: file.split('/').slice(-2)[0],
			name: file.split('/').pop(),
			language: getLanguage(file),
			content: await content()
		}))
	)
	return files
}

/**
 * Returns the slug of a file.
 *
 * @param {string} file - The file to get the slug from.
 * @returns {string} - The slug of the file.
 */
export function getSlug(file) {
	const parts = file.split('/').slice(1).slice(0, -1)
	return `/${parts.join('/')}`
}

/**
 * Converts the input content into a group by catgeory
 * @param {ModuleFile[]} metadata - The metadata to convert.
 * @returns {Metadata[]} Array of section objects
 */
export function getSections(metadata) {
	/** @type Object<string, Metadata> */
	const sections = {}

	metadata.forEach(({ content, file, group }) => {
		const item = {
			category: group ?? '',
			order: 99,
			...content,
			slug: getSlug(file),
			depth: file.split('/').length - 2
		}

		const category = item.category.toLowerCase()
		if (!sections[category]) {
			sections[category] = { children: [] }
		}
		if (item.depth === 1) {
			sections[category] = {
				...sections[category],
				...item
			}
		} else {
			sections[category].children.push(item)
		}
		sections[category].children = sections[category].children.sort((a, b) => a.order - b.order)
	})

	return Object.values(sections).sort((a, b) => a.order - b.order)
}

/**
 *
 * @param {File[]} files
 * @returns
 */
export function groupFiles(files) {
	const groups = files
		.filter((file) => file.group !== '.')
		.reduce(
			(acc, file) => ({
				...acc,
				[file.group]: [...(acc[file.group] || []), omit(['group'], file)]
			}),
			{}
		)

	return groups
}

/**
 * Fetches the stories.
 *
 * @param {Object} sources - The sources to fetch the content from.
 * @param {Object} modules - The modules to fetch the content from.
 * @returns {Promise<Object<string, Story>>} - The stories.
 */
export async function fetchStories(sources, modules) {
	const components = groupFiles(await fetchImports(modules))
	const files = groupFiles(await fetchImports(sources))

	/** @type {Object<string, Story>} */
	const stories = {}

	Object.entries(files).forEach(([group, files]) => {
		stories[group] = { files }
		if (components[group]) {
			stories[group].App = components[group][0].content
		}
	})
	return stories
}
/**
 * Get all individual sections flattened from groups
 * @returns {Array} Array of all tutorial sections
 */
export function getAllSections() {
	return sections.flatMap((group) => group.children)
}

/**
 * Find a section by its ID
 * @param {string} slug - The section ID to find
 * @returns {Object|null} The section object or null if not found
 */
export function findSection(sections, slug) {
	for (const group of sections) {
		const section = group.children.find((child) => child.slug === slug)
		if (section) return section
	}
	return {}
}

/**
 * Get the group that contains a specific section
 * @param {string} sectionId - The section ID to find the group for
 * @returns {Object|null} The group object or null if not found
 */
export function findGroupForSection(sections, sectionId) {
	return sections.find((group) => group.children.some((child) => child.id === sectionId)) || null
}
