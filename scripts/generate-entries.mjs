import {
	readFileSync,
	existsSync,
	readdirSync,
	statSync,
	writeFileSync
} from 'fs'
import { join } from 'path'
import frontmatter from 'front-matter'

function readFrontMatter(filePath) {
	const content = readFileSync(filePath, 'utf-8')
	const fmData = frontmatter(content)
	return fmData.attributes
}

function readLabsAttribute(dirPath) {
	const metaFile = join(dirPath, 'meta.json')
	if (existsSync(metaFile)) {
		const metaContent = readFileSync(metaFile, 'utf-8')
		const metaData = JSON.parse(metaContent)
		return metaData.labs
	}
	return undefined
}

function convertToJSONArrayAndWriteToFile(rootFolder) {
	const result = []
	let labsAttribute = null

	function traverseDirectory(currentDir, currentSlug) {
		const files = readdirSync(currentDir)

		for (const file of files) {
			const filePath = join(currentDir, file)
			const stat = statSync(filePath)

			if (stat.isFile() && file === 'README.md') {
				const frontMatterAttributes = readFrontMatter(filePath)
				const entry = {
					slug: currentSlug,
					labs: labsAttribute ?? frontMatterAttributes.labs
				}
				result.push(entry)
			} else if (stat.isDirectory()) {
				const dirName = file.replace(/^\d+-/, '')
				labsAttribute = labsAttribute ?? readLabsAttribute(filePath)
				const newSlug = [...currentSlug, dirName]
				traverseDirectory(filePath, newSlug)
			}
		}
	}

	traverseDirectory(rootFolder, [])

	const entries = [
		...result
			.filter((entry) => !entry.labs)
			.map(({ slug }) => ({ segment: 'tutorial', slug })),
		...result.map(({ slug }) => ({
			segment: 'labs',
			slug
		}))
	].map((entry) => ({
		...entry,
		slug: entry.slug.join('/')
	}))
	const jsonData = JSON.stringify(entries, null, 2)
	const outputFile = join('./sites/learn/src/lib', 'entries.json')

	writeFileSync(outputFile, jsonData)
	console.log('entries.json file created successfully.')
}

// Example usage:
const rootFolder = './sites/learn/src/stories'
convertToJSONArrayAndWriteToFile(rootFolder)
