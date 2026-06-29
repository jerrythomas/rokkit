/**
 * Tests for src/config.svelte.ts
 *
 * pluginDisplay: reactive singleton that governs developer affordances.
 * configurePluginDisplay: partial-update helper.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { pluginDisplay, configurePluginDisplay } from '../src/config.svelte.js'

// Restore default after each test so state doesn't leak between specs
afterEach(() => {
	pluginDisplay.codeVisible = true
})

describe('pluginDisplay singleton', () => {
	it('defaults codeVisible to true', () => {
		expect(pluginDisplay.codeVisible).toBe(true)
	})

	it('allows direct mutation of codeVisible to false', () => {
		pluginDisplay.codeVisible = false
		expect(pluginDisplay.codeVisible).toBe(false)
	})

	it('allows direct mutation of codeVisible back to true', () => {
		pluginDisplay.codeVisible = false
		pluginDisplay.codeVisible = true
		expect(pluginDisplay.codeVisible).toBe(true)
	})
})

describe('configurePluginDisplay', () => {
	it('sets codeVisible to false via configurePluginDisplay', () => {
		configurePluginDisplay({ codeVisible: false })
		expect(pluginDisplay.codeVisible).toBe(false)
	})

	it('sets codeVisible to true via configurePluginDisplay', () => {
		pluginDisplay.codeVisible = false
		configurePluginDisplay({ codeVisible: true })
		expect(pluginDisplay.codeVisible).toBe(true)
	})

	it('ignores keys whose value is undefined', () => {
		pluginDisplay.codeVisible = false
		// Passing undefined for codeVisible should not change the current value
		configurePluginDisplay({ codeVisible: undefined as unknown as boolean })
		expect(pluginDisplay.codeVisible).toBe(false)
	})

	it('accepts an empty object without throwing', () => {
		expect(() => configurePluginDisplay({})).not.toThrow()
	})
})
