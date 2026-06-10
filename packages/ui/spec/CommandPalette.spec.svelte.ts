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
})
