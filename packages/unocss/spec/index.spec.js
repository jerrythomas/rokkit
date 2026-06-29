import { describe, it, expect } from 'vitest'
import { presetRokkit, presetBackgrounds, loadConfig, buildNamedShortcuts, NAMED_SHORTCUT_PREFIXES, shouldEmitShortcut } from '../src/index.js'

describe('@rokkit/unocss — barrel exports', () => {
	it('exports presetRokkit', () => {
		expect(presetRokkit).toBeDefined()
		expect(typeof presetRokkit).toBe('function')
	})

	it('exports presetBackgrounds', () => {
		expect(presetBackgrounds).toBeDefined()
		expect(typeof presetBackgrounds).toBe('function')
	})

	it('exports loadConfig', () => {
		expect(loadConfig).toBeDefined()
		expect(typeof loadConfig).toBe('function')
	})

	it('exports buildNamedShortcuts', () => {
		expect(buildNamedShortcuts).toBeDefined()
		expect(typeof buildNamedShortcuts).toBe('function')
	})

	it('exports NAMED_SHORTCUT_PREFIXES', () => {
		expect(NAMED_SHORTCUT_PREFIXES).toBeDefined()
		expect(Array.isArray(NAMED_SHORTCUT_PREFIXES)).toBe(true)
	})

	it('exports shouldEmitShortcut', () => {
		expect(shouldEmitShortcut).toBeDefined()
		expect(typeof shouldEmitShortcut).toBe('function')
	})
})
