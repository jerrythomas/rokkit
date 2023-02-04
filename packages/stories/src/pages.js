import glob from 'glob'
import path from 'path'
import { toPascalCase } from '@rokkit/utils/string'

/** @type {import('./types').StoryOptions} */
const defaultOptions = {
	notes: 'guide.svx',
	preview: 'App.svelte',
	metadata: 'metadata.js'
}

/**
 *
 * @param {string} root
 * @returns {Array<import('./types').StoryFile>}
 */
export function findStoryFiles(root, pattern = '/**/*/*.{svelte,js,svx}') {
	const folderAndPage = /.*\/(?<folder>.*)\/(?<page>\d+).*/
	const folderOnly = /.*\/(?<folder>.*)\/.*/
	const files = glob.sync(`${root}${pattern}`).map((file) => {
		// console.log(file)
		const fileName = path.basename(file)

		// @ts-ignore
		// const matches = file.match(/.*\/(.*)\/(\d+).*$/)
		let data = {
			file: path.resolve(file),
			fileName,
			type: path.extname(file).slice(1)
		}
		let result = folderAndPage.exec(file)
		if (result) {
			data = {
				...data,
				folder: result.groups.folder,
				page: parseInt(result.groups.page)
			}
		} else {
			result = folderOnly.exec(file)
			data = { ...data, ...result.groups }
		}
		// const [, folder, pageNumber] = file.match(/.*\/(.*)\/(\d+).*$/)
		return data
	})
	return files
}

/**
 *
 * @param {string} root
 * @param {import('./types').StoryOptions} options
 * @returns {Promise<Array<import('./types').StoryFile>>}
 */
export function addImports(files, options) {
	options = { ...defaultOptions, ...(options ?? {}) }

	const guides = files
		.filter((f) => f.page || f.fileName === options.metadata)
		.map(async (f) => {
			let data = {}
			if (!f.page) {
				data['metadata'] = (await import(/* @vite-ignore */ f.file)).default
			} else if (f.fileName === options.notes) {
				const notes = await import(f.file)
				data['notes'] = notes.default
				data['metadata'] = notes.metadata
			} else {
				data['code'] = (
					await import(/* @vite-ignore */ `${f.file}?raw`)
				).default

				if (f.fileName === options.preview) {
					data['preview'] = (await import(/* @vite-ignore */ f.file)).default
				}
			}
			return { ...f, ...data }
		})

	return Promise.all(guides)
}

/**
 *
 * @param {Array<import('./types').StoryFile>} input
 * @returns {import('./types').Stories}
 */
export function fromArray(input) {
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
					file: curr.fileName,
					language: curr.type,
					code: curr.code
				})
			}
			acc[curr.folder].pages = pages
		}

		return acc
	}, {})
	return result
}

/**
 *
 * @param {string} root
 * @param {import('./types').StoryOptions} options
 * @returns {Promise<import('./types').Stories>}
 */
export async function findGuidesWithPages(root, options) {
	const files = findStoryFiles(root)
	const result = await addImports(files, options)
	return fromArray(result)
}

const types = ['svelte', 'js', 'svx']

export function sortByPageAndFilename(a, b) {
	if (a.folder === b.folder) {
		if (a.page === b.page) {
			const typeOrder = types.indexOf(a.type) - types.indexOf(b.type)
			return typeOrder === 0 ? a.fileName.localeCompare(b.fileName) : typeOrder
		} else return a.page - b.page
	} else return a.fileName.localeCompare(b.folder)
}
