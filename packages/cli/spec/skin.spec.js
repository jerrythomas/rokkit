import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
	generateSkinScaffold,
	addSkinToConfig,
	serializeConfig,
	runSkinList,
	runSkinCreate
} from '../src/skin.js'

describe('generateSkinScaffold', () => {
	it('returns an object with all 9 color token keys', () => {
		const scaffold = generateSkinScaffold()
		const keys = [
			'primary',
			'secondary',
			'accent',
			'surface',
			'success',
			'warning',
			'danger',
			'error',
			'info'
		]
		for (const key of keys) {
			expect(scaffold).toHaveProperty(key)
			expect(typeof scaffold[key]).toBe('string')
		}
	})

	it('returns separate objects on each call (no shared reference)', () => {
		const a = generateSkinScaffold()
		const b = generateSkinScaffold()
		a.primary = 'modified'
		expect(b.primary).not.toBe('modified')
	})
})

describe('addSkinToConfig', () => {
	it('adds a new skin to empty skins block', () => {
		const config = { themes: ['rokkit'] }
		const result = addSkinToConfig(config, 'midnight')
		expect(result.skins).toHaveProperty('midnight')
		expect(result.skins.midnight).toHaveProperty('primary')
	})

	it('preserves existing skins', () => {
		const config = { skins: { default: { primary: 'orange' } } }
		const result = addSkinToConfig(config, 'midnight')
		expect(result.skins.default).toEqual({ primary: 'orange' })
		expect(result.skins.midnight).toBeDefined()
	})

	it('does not mutate original config', () => {
		const config = { skins: {} }
		addSkinToConfig(config, 'test')
		expect(config.skins).toEqual({})
	})
})

describe('serializeConfig', () => {
	it('produces valid JS module export', () => {
		const config = { themes: ['rokkit'] }
		const src = serializeConfig(config)
		expect(src).toMatch(/^export default \{/)
		expect(src).toContain('"themes"')
	})
})

describe('runSkinList', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
	})

	it('lists skin names from config', async () => {
		const adapters = {
			readConfig: () => ({
				skins: {
					default: { primary: 'orange', secondary: 'pink' },
					vibrant: { primary: 'blue' }
				}
			})
		}
		await runSkinList(adapters)
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('default'))
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('vibrant'))
	})

	it('shows message when no skins defined', async () => {
		const adapters = { readConfig: () => ({}) }
		await runSkinList(adapters)
		expect(console.info).toHaveBeenCalledWith(expect.stringContaining('No skins'))
	})
})

describe('runSkinCreate', () => {
	beforeEach(() => {
		vi.spyOn(console, 'info').mockImplementation(() => {})
		vi.spyOn(console, 'warn').mockImplementation(() => {})
		vi.spyOn(console, 'error').mockImplementation(() => {})
	})

	it('adds a new skin to the config', async () => {
		const written = { value: null }
		const adapters = {
			readConfig: () => ({ skins: {} }),
			writeConfig: (config) => {
				written.value = config
			}
		}
		await runSkinCreate('midnight', adapters)
		expect(written.value.skins).toHaveProperty('midnight')
		expect(written.value.skins.midnight).toHaveProperty('primary')
	})

	it('warns when skin already exists', async () => {
		const adapters = {
			readConfig: () => ({ skins: { midnight: { primary: 'blue' } } }),
			writeConfig: vi.fn()
		}
		await runSkinCreate('midnight', adapters)
		expect(adapters.writeConfig).not.toHaveBeenCalled()
		expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('already exists'))
	})

	it('errors when name is missing', async () => {
		const adapters = { readConfig: () => ({}) }
		await runSkinCreate(undefined, adapters)
		expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Usage'))
	})

	it('returns null config gracefully when readConfig returns null', async () => {
		const adapters = {
			readConfig: () => null,
			writeConfig: vi.fn()
		}
		await runSkinCreate('test', adapters)
		expect(adapters.writeConfig).not.toHaveBeenCalled()
	})
})
