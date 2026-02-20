import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Toolbar from '../src/components/Toolbar.svelte'
import ToolbarSnippetTest from './ToolbarSnippetTest.svelte'

const basicItems = [
	{ text: 'Bold', value: 'bold', icon: 'mdi:format-bold' },
	{ text: 'Italic', value: 'italic', icon: 'mdi:format-italic' },
	{ text: 'Underline', value: 'underline', icon: 'mdi:format-underline' }
]

describe('Toolbar', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a toolbar element', () => {
		const { container } = render(Toolbar, { items: basicItems })
		expect(container.querySelector('[data-toolbar]')).toBeTruthy()
	})

	it('has role="toolbar"', () => {
		const { container } = render(Toolbar, { items: basicItems })
		const el = container.querySelector('[data-toolbar]')
		expect(el?.getAttribute('role')).toBe('toolbar')
	})

	it('renders all items', () => {
		const { container } = render(Toolbar, { items: basicItems })
		const items = container.querySelectorAll('[data-toolbar-item]')
		expect(items.length).toBe(3)
	})

	// ─── Item Content ───────────────────────────────────────────────

	it('renders icons', () => {
		const { container } = render(Toolbar, { items: basicItems })
		const icons = container.querySelectorAll('[data-toolbar-icon]')
		expect(icons.length).toBe(3)
		expect(icons[0]?.classList.contains('mdi:format-bold')).toBe(true)
	})

	it('shows text labels when no icon', () => {
		const items = [{ text: 'Save', value: 'save' }]
		const { container } = render(Toolbar, { items })
		expect(container.querySelector('[data-toolbar-label]')?.textContent).toBe('Save')
	})

	it('shows icon instead of label when both present', () => {
		const { container } = render(Toolbar, { items: basicItems })
		expect(container.querySelectorAll('[data-toolbar-icon]').length).toBe(3)
		expect(container.querySelectorAll('[data-toolbar-label]').length).toBe(0)
	})

	it('sets title with shortcut when present', () => {
		const items = [{ text: 'Save', value: 'save', icon: 'mdi:save', shortcut: 'Ctrl+S' }]
		const { container } = render(Toolbar, { items })
		const btn = container.querySelector('[data-toolbar-item]')
		expect(btn?.getAttribute('title')).toBe('Save (Ctrl+S)')
	})

	// ─── Active State ───────────────────────────────────────────────

	it('marks active items', () => {
		const items = [
			{ text: 'Bold', value: 'bold', icon: 'mdi:bold', active: true },
			{ text: 'Italic', value: 'italic', icon: 'mdi:italic' }
		]
		const { container } = render(Toolbar, { items })
		const btns = container.querySelectorAll('[data-toolbar-item]')
		expect(btns[0]?.hasAttribute('data-active')).toBe(true)
		expect(btns[0]?.getAttribute('aria-pressed')).toBe('true')
		expect(btns[1]?.hasAttribute('data-active')).toBe(false)
	})

	// ─── Special Types ──────────────────────────────────────────────

	it('renders separator items', () => {
		const items = [
			{ text: 'Bold', value: 'bold', icon: 'mdi:bold' },
			{ type: 'separator' },
			{ text: 'Italic', value: 'italic', icon: 'mdi:italic' }
		]
		const { container } = render(Toolbar, { items })
		const sep = container.querySelector('[data-toolbar-separator]')
		expect(sep).toBeTruthy()
		expect(sep?.getAttribute('role')).toBe('separator')
	})

	it('renders spacer items', () => {
		const items = [
			{ text: 'Left', value: 'left', icon: 'mdi:left' },
			{ type: 'spacer' },
			{ text: 'Right', value: 'right', icon: 'mdi:right' }
		]
		const { container } = render(Toolbar, { items })
		expect(container.querySelector('[data-toolbar-spacer]')).toBeTruthy()
	})

	// ─── Click Handling ─────────────────────────────────────────────

	it('calls onclick when clicking an item', async () => {
		const onclick = vi.fn()
		const { container } = render(Toolbar, { items: basicItems, onclick })
		const btns = container.querySelectorAll('[data-toolbar-item]')
		await fireEvent.click(btns[1])
		expect(onclick).toHaveBeenCalledWith('italic', basicItems[1])
	})

	it('does not call onclick for disabled items', async () => {
		const items = [{ text: 'Disabled', value: 'x', icon: 'mdi:x', disabled: true }]
		const onclick = vi.fn()
		const { container } = render(Toolbar, { items, onclick })
		const btn = container.querySelector('[data-toolbar-item]')
		await fireEvent.click(btn!)
		expect(onclick).not.toHaveBeenCalled()
	})

	// ─── Keyboard ───────────────────────────────────────────────────

	it('triggers on Enter key', async () => {
		const onclick = vi.fn()
		const { container } = render(Toolbar, { items: basicItems, onclick })
		const btn = container.querySelectorAll('[data-toolbar-item]')[0]
		await fireEvent.keyDown(btn, { key: 'Enter' })
		expect(onclick).toHaveBeenCalledWith('bold', basicItems[0])
	})

	it('triggers on Space key', async () => {
		const onclick = vi.fn()
		const { container } = render(Toolbar, { items: basicItems, onclick })
		const btn = container.querySelectorAll('[data-toolbar-item]')[2]
		await fireEvent.keyDown(btn, { key: ' ' })
		expect(onclick).toHaveBeenCalledWith('underline', basicItems[2])
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('disables entire toolbar', () => {
		const { container } = render(Toolbar, { items: basicItems, disabled: true })
		const el = container.querySelector('[data-toolbar]')
		expect(el?.hasAttribute('data-toolbar-disabled')).toBe(true)
		expect(el?.getAttribute('aria-disabled')).toBe('true')
		const buttons = container.querySelectorAll('button[disabled]')
		expect(buttons.length).toBe(3)
	})

	it('does not call onclick when toolbar is disabled', async () => {
		const onclick = vi.fn()
		const { container } = render(Toolbar, { items: basicItems, disabled: true, onclick })
		const btn = container.querySelectorAll('[data-toolbar-item]')[0]
		await fireEvent.click(btn)
		expect(onclick).not.toHaveBeenCalled()
	})

	// ─── Position and Size ──────────────────────────────────────────

	it('defaults to top position', () => {
		const { container } = render(Toolbar, { items: basicItems })
		const el = container.querySelector('[data-toolbar]')
		expect(el?.getAttribute('data-toolbar-position')).toBe('top')
	})

	it('supports bottom position', () => {
		const { container } = render(Toolbar, { items: basicItems, position: 'bottom' })
		const el = container.querySelector('[data-toolbar]')
		expect(el?.getAttribute('data-toolbar-position')).toBe('bottom')
	})

	it('supports left position', () => {
		const { container } = render(Toolbar, { items: basicItems, position: 'left' })
		const el = container.querySelector('[data-toolbar]')
		expect(el?.getAttribute('data-toolbar-position')).toBe('left')
	})

	it('defaults to md size', () => {
		const { container } = render(Toolbar, { items: basicItems })
		const el = container.querySelector('[data-toolbar]')
		expect(el?.getAttribute('data-toolbar-size')).toBe('md')
	})

	it('supports sm size', () => {
		const { container } = render(Toolbar, { items: basicItems, size: 'sm' })
		const el = container.querySelector('[data-toolbar]')
		expect(el?.getAttribute('data-toolbar-size')).toBe('sm')
	})

	// ─── Sticky and Compact ─────────────────────────────────────────

	it('sets sticky attribute', () => {
		const { container } = render(Toolbar, { items: basicItems, sticky: true })
		const el = container.querySelector('[data-toolbar]')
		expect(el?.hasAttribute('data-toolbar-sticky')).toBe(true)
	})

	it('sets compact attribute', () => {
		const { container } = render(Toolbar, { items: basicItems, compact: true })
		const el = container.querySelector('[data-toolbar]')
		expect(el?.hasAttribute('data-toolbar-compact')).toBe(true)
	})

	// ─── Custom Fields ──────────────────────────────────────────────

	it('supports custom field mapping', async () => {
		const items = [
			{ name: 'Bold', id: 'bold', glyph: 'mdi:bold' },
			{ name: 'Italic', id: 'italic', glyph: 'mdi:italic' }
		]
		const onclick = vi.fn()
		const { container } = render(Toolbar, {
			items,
			fields: { text: 'name', value: 'id', icon: 'glyph' },
			onclick
		})
		const btns = container.querySelectorAll('[data-toolbar-item]')
		expect(btns.length).toBe(2)
		await fireEvent.click(btns[0])
		expect(onclick).toHaveBeenCalledWith('bold', items[0])
	})

	// ─── Custom Snippets ────────────────────────────────────────────

	it('renders custom item snippet', () => {
		const { container } = render(ToolbarSnippetTest, {
			items: basicItems,
			useItemSnippet: true
		})
		const customItems = container.querySelectorAll('[data-custom-toolbar-item]')
		expect(customItems.length).toBe(3)
		expect(customItems[0]?.textContent?.trim()).toContain('Custom: Bold')
	})

	it('custom snippet handles click', async () => {
		const onclick = vi.fn()
		const { container } = render(ToolbarSnippetTest, {
			items: basicItems,
			useItemSnippet: true,
			onclick
		})
		const customItems = container.querySelectorAll('[data-custom-toolbar-item]')
		await fireEvent.click(customItems[1])
		expect(onclick).toHaveBeenCalledWith('italic', basicItems[1])
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders empty toolbar with no items', () => {
		const { container } = render(Toolbar, { items: [] })
		const el = container.querySelector('[data-toolbar]')
		expect(el).toBeTruthy()
		expect(container.querySelectorAll('[data-toolbar-item]').length).toBe(0)
	})
})
