import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import { commands } from '@rokkit/states'
import CommandPalette from '../src/components/CommandPalette.svelte'

afterEach(() => {
	for (const c of [...commands.all]) commands.unregister(c.id)
})

describe('CommandPalette', () => {
	it('renders the overlay when open and lists registered commands', () => {
		commands.register({ id: 'new', label: 'New conversation', run: () => {} })
		commands.register({ id: 'theme', label: 'Toggle theme', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		expect(container.querySelector('[data-command-palette]')).toBeTruthy()
		expect(container.querySelectorAll('[data-command-item]').length).toBe(2)
	})

	it('filters the list by the search query', async () => {
		commands.register({ id: 'new', label: 'New conversation', run: () => {} })
		commands.register({ id: 'theme', label: 'Toggle theme', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		const input = container.querySelector('[data-command-input]') as HTMLInputElement
		await fireEvent.input(input, { target: { value: 'theme' } })
		const items = container.querySelectorAll('[data-command-item]')
		expect(items.length).toBe(1)
		expect(items[0].textContent).toContain('Toggle theme')
	})

	it('runs the selected command and closes', async () => {
		const run = vi.fn()
		commands.register({ id: 'new', label: 'New conversation', run })
		const { container } = render(CommandPalette, { props: { open: true } })
		await fireEvent.click(container.querySelector('[data-command-item]')!)
		expect(run).toHaveBeenCalledOnce()
		expect(container.querySelector('[data-command-palette]')).toBeFalsy()
	})

	it('shows the no-results message when nothing matches', async () => {
		commands.register({ id: 'new', label: 'New conversation', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		const input = container.querySelector('[data-command-input]') as HTMLInputElement
		await fireEvent.input(input, { target: { value: 'zzzz' } })
		expect(container.querySelector('[data-command-empty]')).toBeTruthy()
	})

	// ─── Closed state ─────────────────────────────────────────────────

	it('does not render the overlay when closed', () => {
		const { container } = render(CommandPalette, { props: { open: false } })
		expect(container.querySelector('[data-command-palette]')).toBeFalsy()
		expect(container.querySelector('[data-command-backdrop]')).toBeFalsy()
	})

	// ─── Keyboard navigation ───────────────────────────────────────────

	it('ArrowDown increments the active index', async () => {
		commands.register({ id: 'a', label: 'Alpha', run: () => {} })
		commands.register({ id: 'b', label: 'Beta', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		const input = container.querySelector('[data-command-input]') as HTMLInputElement
		await fireEvent.keyDown(input, { key: 'ArrowDown' })
		// Second item should be active
		const items = container.querySelectorAll('[data-command-item]')
		expect(items[1].hasAttribute('data-active')).toBe(true)
	})

	it('ArrowUp decrements the active index (clamps at 0)', async () => {
		commands.register({ id: 'a', label: 'Alpha', run: () => {} })
		commands.register({ id: 'b', label: 'Beta', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		const input = container.querySelector('[data-command-input]') as HTMLInputElement
		await fireEvent.keyDown(input, { key: 'ArrowUp' })
		// Already at index 0 so nothing changes — first item active
		const items = container.querySelectorAll('[data-command-item]')
		expect(items[0].hasAttribute('data-active')).toBe(true)
	})

	it('Enter runs the active command', async () => {
		const run = vi.fn()
		commands.register({ id: 'a', label: 'Alpha', run })
		const { container } = render(CommandPalette, { props: { open: true } })
		const input = container.querySelector('[data-command-input]') as HTMLInputElement
		await fireEvent.keyDown(input, { key: 'Enter' })
		expect(run).toHaveBeenCalledOnce()
	})

	it('Escape closes the palette', async () => {
		commands.register({ id: 'a', label: 'Alpha', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		const input = container.querySelector('[data-command-input]') as HTMLInputElement
		await fireEvent.keyDown(input, { key: 'Escape' })
		expect(container.querySelector('[data-command-palette]')).toBeFalsy()
	})

	// ─── Mouse hover ─────────────────────────────────────────────────

	it('mousemove on item sets it as active', async () => {
		commands.register({ id: 'a', label: 'Alpha', run: () => {} })
		commands.register({ id: 'b', label: 'Beta', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		const items = container.querySelectorAll('[data-command-item]')
		await fireEvent.mouseMove(items[1])
		expect(items[1].hasAttribute('data-active')).toBe(true)
	})

	// ─── Keywords search ──────────────────────────────────────────────

	it('filters by keywords', async () => {
		commands.register({ id: 'a', label: 'Alpha', keywords: ['greek', 'first'], run: () => {} })
		commands.register({ id: 'b', label: 'Beta', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		const input = container.querySelector('[data-command-input]') as HTMLInputElement
		await fireEvent.input(input, { target: { value: 'greek' } })
		const items = container.querySelectorAll('[data-command-item]')
		expect(items.length).toBe(1)
		expect(items[0].textContent).toContain('Alpha')
	})

	// ─── Enter on item (keydown handler) ─────────────────────────────

	it('Enter on item runs the command', async () => {
		const run = vi.fn()
		commands.register({ id: 'a', label: 'Alpha', run })
		const { container } = render(CommandPalette, { props: { open: true } })
		const item = container.querySelector('[data-command-item]')!
		await fireEvent.keyDown(item, { key: 'Enter' })
		expect(run).toHaveBeenCalledOnce()
	})

	it('non-Enter keydown on item does nothing', async () => {
		const run = vi.fn()
		commands.register({ id: 'a', label: 'Alpha', run })
		const { container } = render(CommandPalette, { props: { open: true } })
		const item = container.querySelector('[data-command-item]')!
		await fireEvent.keyDown(item, { key: 'Space' })
		expect(run).not.toHaveBeenCalled()
	})

	// ─── ARIA ─────────────────────────────────────────────────────────

	it('palette has role="dialog" and aria-modal', () => {
		commands.register({ id: 'a', label: 'Alpha', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		const palette = container.querySelector('[data-command-palette]')
		expect(palette?.getAttribute('role')).toBe('dialog')
		expect(palette?.getAttribute('aria-modal')).toBe('true')
	})

	it('list has role="listbox"', () => {
		commands.register({ id: 'a', label: 'Alpha', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		expect(container.querySelector('[data-command-list]')?.getAttribute('role')).toBe('listbox')
	})

	// ─── Custom placeholder ────────────────────────────────────────────

	it('uses custom placeholder when provided', () => {
		const { container } = render(CommandPalette, { props: { open: true, placeholder: 'Search...' } })
		const input = container.querySelector('[data-command-input]') as HTMLInputElement
		expect(input.placeholder).toBe('Search...')
	})

	// ─── Shortcut display ─────────────────────────────────────────────

	it('renders shortcut when command has shortcut', () => {
		commands.register({ id: 'a', label: 'Alpha', shortcut: 'Ctrl+K', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		expect(container.querySelector('[data-command-shortcut]')?.textContent).toBe('Ctrl+K')
	})

	// ─── Empty query shows all commands ────────────────────────────────

	it('shows all commands when query is empty', async () => {
		commands.register({ id: 'a', label: 'Alpha', run: () => {} })
		commands.register({ id: 'b', label: 'Beta', run: () => {} })
		const { container } = render(CommandPalette, { props: { open: true } })
		const input = container.querySelector('[data-command-input]') as HTMLInputElement
		await fireEvent.input(input, { target: { value: 'x' } })
		await fireEvent.input(input, { target: { value: '' } })
		// After clearing, all commands shown
		expect(container.querySelectorAll('[data-command-item]').length).toBe(2)
	})
})
