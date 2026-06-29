import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { bundleFolders, convertFolders, readConfigFile, getFolderNames } from '../src/convert.js'

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

		console.info = vi.fn()

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
		expect(bundleFolders).toHaveBeenCalled()
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

	it('should invoke init() for the init command', async () => {
		const initMock = vi.fn()
		vi.doMock('../src/init.js', () => ({ init: initMock }))

		process.argv = ['node', 'index.js', 'init']
		await import('../src/index.js')
		await new Promise((r) => setTimeout(r, 10))
		expect(initMock).toHaveBeenCalled()
		vi.doUnmock('../src/init.js')
	})

	it('should invoke init() for the add command (alias)', async () => {
		const initMock = vi.fn()
		vi.doMock('../src/init.js', () => ({ init: initMock }))

		process.argv = ['node', 'index.js', 'add']
		await import('../src/index.js')
		await new Promise((r) => setTimeout(r, 10))
		expect(initMock).toHaveBeenCalled()
		vi.doUnmock('../src/init.js')
	})

	it('should invoke doctor() for the doctor command', async () => {
		const doctorMock = vi.fn()
		vi.doMock('../src/doctor.js', () => ({ doctor: doctorMock }))

		process.argv = ['node', 'index.js', 'doctor']
		await import('../src/index.js')
		await new Promise((r) => setTimeout(r, 10))
		expect(doctorMock).toHaveBeenCalled()
		vi.doUnmock('../src/doctor.js')
	})

	it('should invoke upgrade() for the upgrade command', async () => {
		const upgradeMock = vi.fn()
		vi.doMock('../src/upgrade.js', () => ({ upgrade: upgradeMock }))

		process.argv = ['node', 'index.js', 'upgrade']
		await import('../src/index.js')
		await new Promise((r) => setTimeout(r, 10))
		expect(upgradeMock).toHaveBeenCalled()
		vi.doUnmock('../src/upgrade.js')
	})

	it('should invoke skillsCommand("list") for the skills list command', async () => {
		const skillsCommandMock = vi.fn()
		vi.doMock('../src/skills.js', () => ({ skillsCommand: skillsCommandMock }))

		process.argv = ['node', 'index.js', 'skills', 'list']
		await import('../src/index.js')
		// Give the async action a tick to run
		await new Promise((r) => setTimeout(r, 10))
		expect(skillsCommandMock).toHaveBeenCalledWith('list')
		vi.doUnmock('../src/skills.js')
	})

	it('should invoke skillsCommand("add") for the skills add command', async () => {
		const skillsCommandMock = vi.fn()
		vi.doMock('../src/skills.js', () => ({ skillsCommand: skillsCommandMock }))

		process.argv = ['node', 'index.js', 'skills', 'add', '--all']
		await import('../src/index.js')
		await new Promise((r) => setTimeout(r, 10))
		expect(skillsCommandMock).toHaveBeenCalledWith('add', expect.objectContaining({ all: true }))
		vi.doUnmock('../src/skills.js')
	})

	it('should invoke skin("list") for the skin list command', async () => {
		const skinMock = vi.fn()
		vi.doMock('../src/skin.js', () => ({ skin: skinMock }))

		process.argv = ['node', 'index.js', 'skin', 'list']
		await import('../src/index.js')
		await new Promise((r) => setTimeout(r, 10))
		expect(skinMock).toHaveBeenCalledWith('list')
		vi.doUnmock('../src/skin.js')
	})

	it('should invoke skin("create", opts) for the skin create command', async () => {
		const skinMock = vi.fn()
		vi.doMock('../src/skin.js', () => ({ skin: skinMock }))

		process.argv = ['node', 'index.js', 'skin', 'create', '--name', 'ocean']
		await import('../src/index.js')
		await new Promise((r) => setTimeout(r, 10))
		expect(skinMock).toHaveBeenCalledWith('create', expect.objectContaining({ name: 'ocean' }))
		vi.doUnmock('../src/skin.js')
	})

	it('should invoke theme("list") for the theme list command', async () => {
		const themeMock = vi.fn()
		vi.doMock('../src/theme.js', () => ({ theme: themeMock }))

		process.argv = ['node', 'index.js', 'theme', 'list']
		await import('../src/index.js')
		await new Promise((r) => setTimeout(r, 10))
		expect(themeMock).toHaveBeenCalledWith('list')
		vi.doUnmock('../src/theme.js')
	})

	it('should invoke theme("create", opts) for the theme create command', async () => {
		const themeMock = vi.fn()
		vi.doMock('../src/theme.js', () => ({ theme: themeMock }))

		process.argv = ['node', 'index.js', 'theme', 'create', '--name', 'midnight']
		await import('../src/index.js')
		await new Promise((r) => setTimeout(r, 10))
		expect(themeMock).toHaveBeenCalledWith('create', expect.objectContaining({ name: 'midnight' }))
		vi.doUnmock('../src/theme.js')
	})
})
