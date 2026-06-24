import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { lockMode } from '../src/lock-mode.svelte.js'

describe('lockMode', () => {
	beforeEach(() => {
		const root = document.documentElement
		root.dataset.style = 'rokkit'
		root.dataset.skin = 'default'
		root.dataset.density = 'comfortable'
		root.dataset.mode = 'light'
	})

	afterEach(() => {
		const root = document.documentElement
		delete root.dataset.style
		delete root.dataset.skin
		delete root.dataset.density
		delete root.dataset.mode
	})

	it('forces data-mode to the locked value and mirrors root style/skin/density', () => {
		const node = document.createElement('section')
		const cleanup = $effect.root(() => lockMode(node, 'dark'))
		flushSync()

		expect(node.dataset.mode).toBe('dark')
		expect(node.dataset.style).toBe('rokkit')
		expect(node.dataset.skin).toBe('default')
		expect(node.dataset.density).toBe('comfortable')
		cleanup()
	})

	it('keeps mode pinned when the root mode changes', () => {
		const node = document.createElement('section')
		const cleanup = $effect.root(() => lockMode(node, 'dark'))
		flushSync()

		document.documentElement.dataset.mode = 'dark' // root flips
		expect(node.dataset.mode).toBe('dark') // still locked dark
		cleanup()
	})

	it('follows runtime style/density changes on the root', async () => {
		const node = document.createElement('section')
		const cleanup = $effect.root(() => lockMode(node, 'dark'))
		flushSync()

		document.documentElement.dataset.style = 'minimal'
		document.documentElement.dataset.density = 'compact'
		await new Promise((r) => setTimeout(r, 0)) // let MutationObserver fire

		expect(node.dataset.style).toBe('minimal')
		expect(node.dataset.density).toBe('compact')
		expect(node.dataset.mode).toBe('dark') // unchanged
		cleanup()
	})

	it('disconnects the observer on cleanup', async () => {
		const node = document.createElement('section')
		const cleanup = $effect.root(() => lockMode(node, 'dark'))
		flushSync()
		cleanup()

		document.documentElement.dataset.style = 'material'
		await new Promise((r) => setTimeout(r, 0))
		expect(node.dataset.style).toBe('rokkit') // last synced value, not updated
	})
})
