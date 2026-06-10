import { describe, it, expect, vi, beforeEach } from 'vitest'
import { commands, normalizeShortcut, eventToShortcut } from '../src/commands.svelte.js'
import { messages } from '../src/messages.svelte.js'

function keydown(props) {
	return { key: props.key, ctrlKey: !!props.ctrl, metaKey: !!props.meta, altKey: !!props.alt, shiftKey: !!props.shift, preventDefault() {} }
}

describe('shortcut normalization', () => {
	it('normalizes modifier order and case (non-mac: mod→ctrl)', () => {
		expect(normalizeShortcut('mod+K')).toBe('ctrl+k')
		expect(normalizeShortcut('shift+mod+p')).toBe('ctrl+shift+p')
		expect(normalizeShortcut('?')).toBe('?')
	})
	it('builds the same canonical string from an event', () => {
		expect(eventToShortcut(keydown({ key: 'k', ctrl: true }))).toBe('ctrl+k')
		expect(eventToShortcut(keydown({ key: 'P', ctrl: true, shift: true }))).toBe('ctrl+shift+p')
	})
})

describe('CommandRegistry', () => {
	beforeEach(() => {
		for (const c of [...commands.all]) commands.unregister(c.id)
	})

	it('register adds to all and returns an unregister fn', () => {
		const off = commands.register({ id: 'a', label: 'A', run: () => {} })
		expect(commands.all.map((c) => c.id)).toContain('a')
		off()
		expect(commands.all.map((c) => c.id)).not.toContain('a')
	})

	it('resolve maps a keydown to the matching command', () => {
		commands.register({ id: 'palette', label: 'Palette', shortcut: 'mod+k', run: () => {} })
		expect(commands.resolve(keydown({ key: 'k', ctrl: true }))?.id).toBe('palette')
		expect(commands.resolve(keydown({ key: 'j', ctrl: true }))).toBeNull()
	})

	it('execute runs the command; unknown id is a safe no-op', () => {
		const run = vi.fn()
		commands.register({ id: 'run-me', label: 'Run', run })
		commands.execute('run-me')
		expect(run).toHaveBeenCalledOnce()
		expect(() => commands.execute('nope')).not.toThrow()
	})

	it('disabled commands do not resolve or run', () => {
		const run = vi.fn()
		commands.register({ id: 'gated', label: 'Gated', shortcut: 'mod+g', run, enabled: () => false })
		expect(commands.resolve(keydown({ key: 'g', ctrl: true }))).toBeNull()
		commands.execute('gated')
		expect(run).not.toHaveBeenCalled()
	})

	it('warns on a duplicate shortcut and keeps the first binding', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
		const first = vi.fn(), second = vi.fn()
		commands.register({ id: 'first', label: 'First', shortcut: 'mod+d', run: first })
		commands.register({ id: 'second', label: 'Second', shortcut: 'mod+d', run: second })
		expect(warn).toHaveBeenCalled()
		commands.resolve(keydown({ key: 'd', ctrl: true }))?.run()
		expect(first).toHaveBeenCalledOnce()
		expect(second).not.toHaveBeenCalled()
		warn.mockRestore()
	})

	it('registerMany returns one unregister for the batch', () => {
		const off = commands.registerMany([
			{ id: 'm1', label: 'M1', run: () => {} },
			{ id: 'm2', label: 'M2', run: () => {} }
		])
		expect(commands.all.map((c) => c.id)).toEqual(expect.arrayContaining(['m1', 'm2']))
		off()
		expect(commands.all.map((c) => c.id)).not.toContain('m1')
		expect(commands.all.map((c) => c.id)).not.toContain('m2')
	})
})

describe('command messages namespace', () => {
	it('exposes default palette chrome strings', () => {
		expect(typeof messages.command.placeholder).toBe('string')
		expect(messages.command.placeholder.length).toBeGreaterThan(0)
		expect(typeof messages.command.noResults).toBe('string')
		expect(typeof messages.command.label).toBe('string')
	})
})
