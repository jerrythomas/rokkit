const LANGUAGE_MAP = {
	js: 'javascript',
	ts: 'typescript',
	md: 'markdown',
	sh: 'bash',
	bash: 'bash',
	shell: 'shell'
}
/**
 * @typedef {Object} Story
 * @property {CodeFile[]} files     - Array of files.
 * @property {SvelteComponent} App  - The preview component.
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
 * @returns {Promise<Array>} - The content of the modules.
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
 * @returns {<Array>} Array of section objects
 */
export function getSections(metadata) {
	// const metadata = await fetchImports(componentMetadata)
	const sections = {}

	metadata.forEach(({ content, file, group }) => {
		const item = {
			category: group,
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
		sections[category].children.sort((a, b) => a.order - b.order)
	})

	// console.log(sections)
	return Object.values(sections).sort((a, b) => a.order - b.order)

	return sections
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
