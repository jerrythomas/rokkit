import { omit } from 'ramda'

const LANGUAGE_MAP = {
	js: 'javascript',
	ts: 'typescript',
	md: 'markdown'
}

/**
 * @typedef {Object} CodeFile
 * @property {string} file     - The file path.
 * @property {string} [group]  - The group name.
 * @property {string} name     - The file name.
 * @property {string} language - The language of the file.
 * @property {string} content  - The content of the file.
 */

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
	const components = await fetchImports(modules)
	const files = await fetchImports(sources)
	const stories = {}

	Object.entries(files).forEach(([group, files]) => {
		stories[group] = { files }
		if (components[group]) {
			stories[group].App = components[group][0].content
		}
	})
	return stories
}
