import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { bundleFolders, convertFolders, readConfigFile, getFolderNames } from '../src/convert.js'
import path from 'path'

// Mock the modules
vi.mock('../src/convert.js', () => ({
	bundleFolders: vi.fn(),
	convertFolders: vi.fn(),
	readConfigFile: vi.fn().mockReturnValue({
		test: { color: true },
		icons: { color: false },
		package: {
			namespace: '@test',
			version: '1.0.0',
			homepage: 'https://github.com/test/test'
		}
	}),
	getFolderNames: vi.fn().mockReturnValue(['test', 'icons'])
}))

describe('CLI Integration', () => {
	let originalArgv
	let consoleSpy
	let consoleWarnSpy

	beforeEach(() => {
		// Store original process.argv
		originalArgv = process.argv
		// eslint-disable-next-line no-console
		console.info = vi.fn()
		// eslint-disable-next-line no-console
		console.warn = vi.fn()
		// Spy on console methods
		consoleSpy = vi.spyOn(console, 'info')
		consoleWarnSpy = vi.spyOn(console, 'warn')
	})

	afterEach(() => {
		// Restore original process.argv
		process.argv = originalArgv

		// Clear mocks
		vi.clearAllMocks()
		vi.resetModules()

		consoleSpy.mockRestore()
		consoleWarnSpy.mockRestore()
	})

	it('should call bundle with default options', async () => {
		// Set up process.argv
		process.argv = [
			'node', // First arg is always node
			'index.js', // Second arg is script name
			'bundle'
		]

		// Import index.js
		await import('../src/index.js')
		expect(getFolderNames).toHaveBeenCalledWith('./src')
		expect(readConfigFile).toHaveBeenCalledWith('./src/config.json')
		expect(bundleFolders).toHaveBeenCalled
	})

	it('should call bundle with custom input and output', async () => {
		// Set up process.argv
		process.argv = ['node', 'index.js', 'bundle', '--input', './icons', '--output', './dist']

		// Import index.js
		await import('../src/index.js')
		expect(getFolderNames).toHaveBeenCalledWith('./icons')
		expect(bundleFolders).toHaveBeenCalledWith(
			['test', 'icons'],
			{
				icons: {
					color: false
				},
				package: {
					homepage: 'https://github.com/test/test',
					namespace: '@test',
					version: '1.0.0'
				},
				test: {
					color: true
				}
			},
			expect.objectContaining({ config: 'config.json', input: './icons', output: './dist' })
		)
	})

	it('should call bundle with custom config', async () => {
		process.argv = ['node', 'index.js', 'bundle', '--config', 'custom-config.json']

		await import('../src/index.js')
		expect(readConfigFile).toHaveBeenCalledWith('./src/custom-config.json')
	})

	it('should warn when no folders found during bundling', async () => {
		getFolderNames.mockReturnValueOnce([])

		process.argv = ['node', 'index.js', 'bundle']

		await import('../src/index.js')
		expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('No folders found'))
		expect(bundleFolders).not.toHaveBeenCalled()
	})

	it('should call convert with default options', async () => {
		process.argv = ['node', 'index.js', 'build']

		await import('../src/index.js')
		expect(getFolderNames).toHaveBeenCalledWith('./src')
		expect(readConfigFile).toHaveBeenCalledWith('./src/config.json')
		expect(convertFolders).toHaveBeenCalledWith(
			['test', 'icons'],
			{
				icons: {
					color: false
				},
				package: {
					homepage: 'https://github.com/test/test',
					namespace: '@test',
					version: '1.0.0'
				},
				test: {
					color: true
				}
			},
			expect.objectContaining({ config: 'config.json', input: './src', output: './lib' })
		)
	})

	it('should call convert with custom input and output', async () => {
		process.argv = ['node', 'index.js', 'build', '--input', './icons', '--output', './build']

		await import('../src/index.js')
		expect(getFolderNames).toHaveBeenCalledWith('./icons')
		expect(convertFolders).toHaveBeenCalledWith(
			['test', 'icons'],
			{
				icons: {
					color: false
				},
				package: {
					homepage: 'https://github.com/test/test',
					namespace: '@test',
					version: '1.0.0'
				},
				test: {
					color: true
				}
			},
			expect.objectContaining({ config: 'config.json', input: './icons', output: './build' })
		)
	})

	it('should call convert with custom config', async () => {
		process.argv = ['node', 'index.js', 'build', '--config', 'custom-config.json']

		await import('../src/index.js')
		expect(readConfigFile).toHaveBeenCalledWith('./src/custom-config.json')
	})

	it('should warn when no folders found during build', async () => {
		getFolderNames.mockReturnValueOnce([])

		process.argv = ['node', 'index.js', 'build']

		await import('../src/index.js')
		expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('No folders found'))
		expect(convertFolders).not.toHaveBeenCalled()
	})
})
