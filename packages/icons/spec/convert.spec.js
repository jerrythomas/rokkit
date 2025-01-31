import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { convert } from '../src/convert'
import fs from 'fs'
import { omit } from 'ramda'
import { rimraf } from 'rimraf'
// Helper function to read JSON files
const readJSON = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'))

describe('convert', () => {
	const originalCwd = process.cwd()
	const baseDir = 'packages/icons/spec/fixtures'

	beforeAll(() => {
		process.chdir(baseDir)
		fs.mkdirSync('lib', { recursive: true })
	})

	afterAll(() => {
		rimraf.sync('./lib')
		// cleanOutputDir('./lib')
		process.chdir(originalCwd)
	})

	it('should import, process, and export icons correctly for b/w icons', async () => {
		// const inputDir = path.join(baseDir, 'icons', 'app')
		const prefix = 'app'
		await convert('./src/app', prefix)
		const files = fs.readdirSync('./lib/app')
		expect(files).toMatchSnapshot()
		const icons = readJSON('./lib/app.json')
		expect(omit(['lastModified'], icons)).toMatchSnapshot()
	})

	it('should import, process, and export icons correctly for colored icons', async () => {
		// const inputDir = path.join(baseDir, 'icons', 'web')
		const prefix = 'web'
		// const expectedOutput = readJSON(path.join(__dirname, 'fixtures', 'expected', 'web.json'))

		await convert('./src/web', prefix, true)
		const files = fs.readdirSync('./lib/web')
		expect(files).toMatchSnapshot()
		const icons = readJSON('./lib/web.json')
		expect(omit(['lastModified'], icons)).toMatchSnapshot()
	})

	it('should exclude invalid files', async () => {
		const prefix = 'err1'
		// eslint-disable-next-line no-console
		console.error = vi.fn()
		await convert('./src/err1', prefix)

		// eslint-disable-next-line no-console
		expect(console.error).toHaveBeenCalledWith('Error parsing not-icon: Invalid attribute name')
		// console.error = originalConsoleError
		await convert('./src/err1', prefix)
		const files = fs.readdirSync('./lib/err1')
		expect(files).toMatchSnapshot()
		const icons = readJSON('./lib/err1.json')
		expect(omit(['lastModified'], icons)).toMatchSnapshot()
		vi.restoreAllMocks()
	})
})
