import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import Toggle from '../src/components/Toggle.svelte'
import ToggleSnippetTest from './ToggleSnippetTest.svelte'

const basicOptions = [
	{ text: 'Option A', value: 'a' },
	{ text: 'Option B', value: 'b' },
	{ text: 'Option C', value: 'c' }
]

describe('Toggle', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a toggle container', () => {
		const { container } = render(Toggle, { options: basicOptions })
		expect(container.querySelector('[data-toggle]')).toBeTruthy()
	})

	it('renders all options', () => {
		const { container } = render(Toggle, { options: basicOptions })
		const opts = container.querySelectorAll('[data-toggle-option]')
		expect(opts.length).toBe(3)
	})

	it('has role="radiogroup"', () => {
		const { container } = render(Toggle, { options: basicOptions })
		const el = container.querySelector('[data-toggle]')
		expect(el?.getAttribute('role')).toBe('radiogroup')
	})

	it('renders options with role="radio"', () => {
		const { container } = render(Toggle, { options: basicOptions })
		const radios = container.querySelectorAll('[role="radio"]')
		expect(radios.length).toBe(3)
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('marks selected option with data-selected', () => {
		const { container } = render(Toggle, { options: basicOptions, value: 'b' })
		const opts = container.querySelectorAll('[data-toggle-option]')
		expect(opts[0]?.hasAttribute('data-selected')).toBe(false)
		expect(opts[1]?.hasAttribute('data-selected')).toBe(true)
		expect(opts[2]?.hasAttribute('data-selected')).toBe(false)
	})

	it('sets aria-checked on selected option', () => {
		const { container } = render(Toggle, { options: basicOptions, value: 'a' })
		const opts = container.querySelectorAll('[data-toggle-option]')
		expect(opts[0]?.getAttribute('aria-checked')).toBe('true')
		expect(opts[1]?.getAttribute('aria-checked')).toBe('false')
	})

	it('calls onchange when clicking an option', async () => {
		const onchange = vi.fn()
		const { container } = render(Toggle, { options: basicOptions, value: 'a', onchange })
		const opts = container.querySelectorAll('[data-toggle-option]')
		await fireEvent.click(opts[1])
		expect(onchange).toHaveBeenCalledWith('b', basicOptions[1])
	})

	it('does not call onchange when clicking already selected option', async () => {
		const onchange = vi.fn()
		const { container } = render(Toggle, { options: basicOptions, value: 'a', onchange })
		const opts = container.querySelectorAll('[data-toggle-option]')
		await fireEvent.click(opts[0])
		expect(onchange).not.toHaveBeenCalled()
	})

	// ─── Labels and Icons ───────────────────────────────────────────

	it('shows labels by default', () => {
		const { container } = render(Toggle, { options: basicOptions })
		const labels = container.querySelectorAll('[data-toggle-label]')
		expect(labels.length).toBe(3)
		expect(labels[0]?.textContent).toBe('Option A')
	})

	it('hides labels when showLabels is false', () => {
		const { container } = render(Toggle, { options: basicOptions, showLabels: false })
		const labels = container.querySelectorAll('[data-toggle-label]')
		expect(labels.length).toBe(0)
	})

	it('renders icons when provided', () => {
		const opts = [
			{ text: 'Bold', value: 'bold', icon: 'mdi:format-bold' },
			{ text: 'Italic', value: 'italic', icon: 'mdi:format-italic' }
		]
		const { container } = render(Toggle, { options: opts })
		const icons = container.querySelectorAll('[data-toggle-icon]')
		expect(icons.length).toBe(2)
		expect(icons[0]?.classList.contains('mdi:format-bold')).toBe(true)
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('disables all options when toggle is disabled', () => {
		const { container } = render(Toggle, { options: basicOptions, disabled: true })
		const el = container.querySelector('[data-toggle]')
		expect(el?.hasAttribute('data-toggle-disabled')).toBe(true)
		const buttons = container.querySelectorAll('button[disabled]')
		expect(buttons.length).toBe(3)
	})

	it('does not call onchange when toggle is disabled', async () => {
		const onchange = vi.fn()
		const { container } = render(Toggle, { options: basicOptions, disabled: true, onchange })
		const opts = container.querySelectorAll('[data-toggle-option]')
		await fireEvent.click(opts[1])
		expect(onchange).not.toHaveBeenCalled()
	})

	it('disables individual options', async () => {
		const opts = [
			{ text: 'A', value: 'a' },
			{ text: 'B', value: 'b', disabled: true },
			{ text: 'C', value: 'c' }
		]
		const onchange = vi.fn()
		const { container } = render(Toggle, { options: opts, onchange })
		const buttons = container.querySelectorAll('[data-toggle-option]')
		expect(buttons[1]?.hasAttribute('data-disabled')).toBe(true)
		await fireEvent.click(buttons[1])
		expect(onchange).not.toHaveBeenCalled()
	})

	// ─── Keyboard ───────────────────────────────────────────────────

	it('selects on Enter key', async () => {
		const onchange = vi.fn()
		const { container } = render(Toggle, { options: basicOptions, value: 'a', onchange })
		const opts = container.querySelectorAll('[data-toggle-option]')
		;(opts[2] as HTMLElement).focus()
		await fireEvent.keyDown(opts[2], { key: 'Enter' })
		expect(onchange).toHaveBeenCalledWith('c', basicOptions[2])
	})

	it('selects on Space key', async () => {
		const onchange = vi.fn()
		const { container } = render(Toggle, { options: basicOptions, value: 'a', onchange })
		const opts = container.querySelectorAll('[data-toggle-option]')
		;(opts[1] as HTMLElement).focus()
		await fireEvent.keyDown(opts[1], { key: ' ' })
		expect(onchange).toHaveBeenCalledWith('b', basicOptions[1])
	})

	// ─── Arrow Key Navigation ───────────────────────────────────────

	it('moves focus right with ArrowRight', async () => {
		const { container } = render(Toggle, { options: basicOptions, value: 'a' })
		const toggle = container.querySelector('[data-toggle]')!
		const opts = container.querySelectorAll('[data-toggle-option]')
		opts[0].focus()
		await fireEvent.keyDown(toggle, { key: 'ArrowRight' })
		expect(document.activeElement).toBe(opts[1])
	})

	it('moves focus left with ArrowLeft', async () => {
		const { container } = render(Toggle, { options: basicOptions, value: 'b' })
		const toggle = container.querySelector('[data-toggle]')!
		const opts = container.querySelectorAll('[data-toggle-option]')
		opts[1].focus()
		await fireEvent.keyDown(toggle, { key: 'ArrowLeft' })
		await waitFor(() => expect(document.activeElement).toBe(opts[0]))
	})

	it('moves focus to first with Home', async () => {
		const { container } = render(Toggle, { options: basicOptions, value: 'c' })
		const toggle = container.querySelector('[data-toggle]')!
		const opts = container.querySelectorAll('[data-toggle-option]')
		opts[2].focus()
		await fireEvent.keyDown(toggle, { key: 'Home' })
		await waitFor(() => expect(document.activeElement).toBe(opts[0]))
	})

	it('moves focus to last with End', async () => {
		const { container } = render(Toggle, { options: basicOptions, value: 'a' })
		const toggle = container.querySelector('[data-toggle]')!
		const opts = container.querySelectorAll('[data-toggle-option]')
		opts[0].focus()
		await fireEvent.keyDown(toggle, { key: 'End' })
		await waitFor(() => expect(document.activeElement).toBe(opts[2]))
	})

	it('does not move past the last option', async () => {
		const { container } = render(Toggle, { options: basicOptions, value: 'c' })
		const toggle = container.querySelector('[data-toggle]')!
		const opts = container.querySelectorAll('[data-toggle-option]')
		opts[2].focus()
		await fireEvent.keyDown(toggle, { key: 'ArrowRight' })
		expect(document.activeElement).toBe(opts[2])
	})

	it('does not move before the first option', async () => {
		const { container } = render(Toggle, { options: basicOptions, value: 'a' })
		const toggle = container.querySelector('[data-toggle]')!
		const opts = container.querySelectorAll('[data-toggle-option]')
		opts[0].focus()
		await fireEvent.keyDown(toggle, { key: 'ArrowLeft' })
		expect(document.activeElement).toBe(opts[0])
	})

	// ─── Sizes ──────────────────────────────────────────────────────

	it('renders with default md size', () => {
		const { container } = render(Toggle, { options: basicOptions })
		const el = container.querySelector('[data-toggle]')
		expect(el?.getAttribute('data-toggle-size')).toBe('md')
	})

	it('renders with sm size', () => {
		const { container } = render(Toggle, { options: basicOptions, size: 'sm' })
		const el = container.querySelector('[data-toggle]')
		expect(el?.getAttribute('data-toggle-size')).toBe('sm')
	})

	it('renders with lg size', () => {
		const { container } = render(Toggle, { options: basicOptions, size: 'lg' })
		const el = container.querySelector('[data-toggle]')
		expect(el?.getAttribute('data-toggle-size')).toBe('lg')
	})

	// ─── Custom Fields ──────────────────────────────────────────────

	it('supports custom field mapping', async () => {
		const opts = [
			{ name: 'Bold', id: 'bold' },
			{ name: 'Italic', id: 'italic' }
		]
		const onchange = vi.fn()
		const { container } = render(Toggle, {
			options: opts,
			fields: { text: 'name', value: 'id' },
			onchange
		})
		const labels = container.querySelectorAll('[data-toggle-label]')
		expect(labels[0]?.textContent).toBe('Bold')
		const buttons = container.querySelectorAll('[data-toggle-option]')
		await fireEvent.click(buttons[1])
		expect(onchange).toHaveBeenCalledWith('italic', opts[1])
	})

	// ─── Custom Snippets ────────────────────────────────────────────

	it('renders custom item snippet', () => {
		const { container } = render(ToggleSnippetTest, { options: basicOptions })
		const customItems = container.querySelectorAll('[data-custom-toggle-item]')
		expect(customItems.length).toBe(3)
		expect(customItems[0]?.textContent?.trim()).toContain('Custom: Option A')
	})

	it('custom snippet receives selection state', () => {
		const { container } = render(ToggleSnippetTest, { options: basicOptions, value: 'b' })
		const customItems = container.querySelectorAll('[data-custom-toggle-item]')
		expect(customItems[0]?.hasAttribute('data-selected')).toBe(false)
		expect(customItems[1]?.hasAttribute('data-selected')).toBe(true)
	})

	it('custom snippet handles click', async () => {
		const onchange = vi.fn()
		const { container } = render(ToggleSnippetTest, {
			options: basicOptions,
			value: 'a',
			onchange
		})
		const customItems = container.querySelectorAll('[data-custom-toggle-item]')
		await fireEvent.click(customItems[2])
		expect(onchange).toHaveBeenCalledWith('c', basicOptions[2])
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders empty toggle with no options', () => {
		const { container } = render(Toggle, { options: [] })
		const el = container.querySelector('[data-toggle]')
		expect(el).toBeTruthy()
		expect(container.querySelectorAll('[data-toggle-option]').length).toBe(0)
	})
})
