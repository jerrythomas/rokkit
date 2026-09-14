import { describe, it, expect, vi, afterEach } from 'vitest'
import { flushSync } from 'svelte'
import { shortcuts } from '../src/shortcuts.svelte.js'

function fakeRegistry(map) {
	// map: canonical 'ctrl+k' → { id, global? }
	return {
		execute: vi.fn(),
		resolve: (e) => {
			const parts = []
			if (e.ctrlKey) parts.push('ctrl')
			if (e.metaKey) parts.push('meta')
			if (e.shiftKey) parts.push('shift')
			parts.push(e.key.toLowerCase())
			return map[parts.join('+')] ?? null
		}
	}
}

afterEach(() => {
	document.body.replaceChildren()
})

function mount(registry) {
	const node = document.createElement('div')
	document.body.appendChild(node)
	const cleanup = $effect.root(() => shortcuts(node, registry))
	flushSync()
	return { node, cleanup }
}

describe('shortcuts action', () => {
	it('executes the resolved command on keydown', () => {
		const reg = fakeRegistry({ 'ctrl+k': { id: 'palette', global: true } })
		mount(reg)
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }))
		flushSync()
		expect(reg.execute).toHaveBeenCalledWith('palette')
	})

	it('ignores a non-global command while a text input is focused', () => {
		const reg = fakeRegistry({ 'ctrl+j': { id: 'next', global: false } })
		mount(reg)
		const input = document.createElement('input')
		document.body.appendChild(input)
		input.focus()
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', ctrlKey: true, cancelable: true }))
		flushSync()
		expect(reg.execute).not.toHaveBeenCalled()
	})

	it('still fires a global command while a text input is focused', () => {
		const reg = fakeRegistry({ 'ctrl+k': { id: 'palette', global: true } })
		mount(reg)
		const input = document.createElement('input')
		document.body.appendChild(input)
		input.focus()
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }))
		flushSync()
		expect(reg.execute).toHaveBeenCalledWith('palette')
	})

	it('removes the listener on destroy', () => {
		const reg = fakeRegistry({ 'ctrl+k': { id: 'palette', global: true } })
		const { cleanup } = mount(reg)
		cleanup()
		flushSync()
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }))
		expect(reg.execute).not.toHaveBeenCalled()
	})
})

describe('shortcuts action — editable and registry guards', () => {
	it('ignores a non-global command while a contenteditable element is focused', () => {
		// inEditable() checks isContentEditable before falling back to the tag test,
		// so a contenteditable <div> must suppress the shortcut just like an <input>.
		const reg = fakeRegistry({ 'ctrl+j': { id: 'next', global: false } })
		mount(reg)
		const editor = document.createElement('div')
		editor.setAttribute('contenteditable', 'true')
		// JSDOM does not implement isContentEditable from the attribute.
		Object.defineProperty(editor, 'isContentEditable', { value: true, configurable: true })
		document.body.appendChild(editor)
		editor.focus()

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', ctrlKey: true, cancelable: true }))
		flushSync()

		expect(reg.execute).not.toHaveBeenCalled()
	})

	it('still runs a global command from a contenteditable element', () => {
		const reg = fakeRegistry({ 'ctrl+k': { id: 'palette', global: true } })
		mount(reg)
		const editor = document.createElement('div')
		Object.defineProperty(editor, 'isContentEditable', { value: true, configurable: true })
		document.body.appendChild(editor)
		editor.focus()

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }))
		flushSync()

		expect(reg.execute).toHaveBeenCalledWith('palette')
	})

	it('is inert when the registry has no resolve function', () => {
		// Consumers pass the registry through a prop; an undefined or partially
		// constructed one must not throw on every keystroke.
		const execute = vi.fn()
		mount({ execute })

		expect(() =>
			window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
		).not.toThrow()
		expect(execute).not.toHaveBeenCalled()
	})

	it('treats a null activeElement as not editable', () => {
		const reg = fakeRegistry({ 'ctrl+j': { id: 'next', global: false } })
		mount(reg)
		const spy = vi.spyOn(document, 'activeElement', 'get').mockReturnValue(null)
		try {
			window.dispatchEvent(
				new KeyboardEvent('keydown', { key: 'j', ctrlKey: true, cancelable: true })
			)
			flushSync()
		} finally {
			spy.mockRestore()
		}

		expect(reg.execute).toHaveBeenCalledWith('next')
	})
})
