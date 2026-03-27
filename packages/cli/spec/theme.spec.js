import { describe, it, expect, vi, beforeEach } from 'vitest'
import { THEME_COMPONENTS, generateThemeStub, runThemeList, runThemeCreate } from '../src/theme.js'

describe('THEME_COMPONENTS', () => {
	it('is a non-empty array of strings', () => {
		expect(Array.isArray(THEME_COMPONENTS)).toBe(true)
		expect(THEME_COMPONENTS.length).toBeGreaterThan(0)
		for (const c of THEME_COMPONENTS) expect(typeof c).toBe('string')
	})

	it('includes core components', () => {
		expect(THEME_COMPONENTS).toContain('button')
		expect(THEME_COMPONENTS).toContain('card')
		expect(THEME_COMPONENTS).toContain('list')
		expect(THEME_COMPONENTS).toContain('select')
		expect(THEME_COMPONENTS).toContain('toolbar')
	})
})

describe('generateThemeStub', () => {
	it('includes the theme name in the header comment', () => {
		const css = generateThemeStub('midnight')
		expect(css).toContain('midnight')
		expect(css).toContain('data-style="midnight"')
	})

	it('produces a CSS block for each component', () => {
		const css = generateThemeStub('test')
		for (const component of THEME_COMPONENTS) {
			expect(css).toContain(`[data-style='test'] [data-${component}]`)
		}
	})

	it('produces valid CSS structure (balanced braces)', () => {
		const css = generateThemeStub('test')
		const opens = (css.match(/\{/g) || []).length
		const closes = (css.match(/\}/g) || []).length
		expect(opens).toBe(closes)
		expect(opens).toBe(THEME_COMPONENTS.length)
	})

	it('returns a string', () => {
		expect(typeof generateThemeStub('test')).toBe('string')
	})
})

describe('runThemeList', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
	})

	it('lists built-in themes from config', async () => {
		const adapters = {
			readConfig: () => ({ themes: ['rokkit', 'minimal'] }),
			listFiles: () => []
		}
		await runThemeList(adapters)
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('rokkit'))
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('minimal'))
	})

	it('lists custom themes from src/themes/', async () => {
		const adapters = {
			readConfig: () => ({}),
			listFiles: () => ['midnight.css', 'ocean.css']
		}
		await runThemeList(adapters)
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('midnight'))
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('ocean'))
	})

	it('shows no-themes message when both are empty', async () => {
		const adapters = {
			readConfig: () => ({}),
			listFiles: () => []
		}
		await runThemeList(adapters)
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('No themes'))
	})

	it('handles null config (no rokkit.config.js)', async () => {
		const adapters = {
			readConfig: () => null,
			listFiles: () => []
		}
		await runThemeList(adapters)
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('No themes'))
	})
})

describe('runThemeCreate', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	it('writes a CSS stub file to src/themes/<name>.css', async () => {
		const files = {}
		const adapters = {
			writeFile: (path, content) => {
				files[path] = content
			},
			exists: () => false,
			mkdir: vi.fn()
		}
		await runThemeCreate('midnight', adapters)
		const paths = Object.keys(files)
		expect(paths.some((p) => p.endsWith('midnight.css'))).toBe(true)
		const content = Object.values(files)[0]
		expect(content).toContain('midnight')
		expect(content).toContain("[data-style='midnight']")
	})

	it('creates src/themes/ directory if absent', async () => {
		const mkdir = vi.fn()
		const adapters = {
			writeFile: vi.fn(),
			exists: () => false,
			mkdir
		}
		await runThemeCreate('midnight', adapters)
		expect(mkdir).toHaveBeenCalledOnce()
	})

	it('warns when theme file already exists', async () => {
		const adapters = {
			writeFile: vi.fn(),
			exists: () => true,
			mkdir: vi.fn()
		}
		await runThemeCreate('midnight', adapters)
		expect(adapters.writeFile).not.toHaveBeenCalled()
		expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('already exists'))
	})

	it('errors when name is missing', async () => {
		const adapters = { writeFile: vi.fn(), exists: () => false, mkdir: vi.fn() }
		await runThemeCreate(undefined, adapters)
		expect(adapters.writeFile).not.toHaveBeenCalled()
		expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Usage'))
	})

	it('does not create directory when file exists', async () => {
		const mkdir = vi.fn()
		const adapters = {
			writeFile: vi.fn(),
			exists: () => true,
			mkdir
		}
		await runThemeCreate('midnight', adapters)
		expect(mkdir).not.toHaveBeenCalled()
	})

	it('generates CSS stub with all component blocks', async () => {
		const files = {}
		const adapters = {
			writeFile: (path, content) => {
				files[path] = content
			},
			exists: () => false,
			mkdir: vi.fn()
		}
		await runThemeCreate('test', adapters)
		const css = Object.values(files)[0]
		for (const component of THEME_COMPONENTS) {
			expect(css).toContain(`[data-${component}]`)
		}
	})
})
