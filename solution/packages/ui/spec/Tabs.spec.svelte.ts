import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import Tabs from '../src/components/Tabs.svelte'

const basicOptions = [
	{ text: 'Tab 1', value: 'tab1', content: 'Content 1' },
	{ text: 'Tab 2', value: 'tab2', content: 'Content 2' },
	{ text: 'Tab 3', value: 'tab3', content: 'Content 3' }
]

describe('Tabs', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a tabs container', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		expect(container.querySelector('[data-tabs]')).toBeTruthy()
	})

	it('renders all tab triggers', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		expect(triggers.length).toBe(3)
	})

	it('renders a tablist', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const tabList = container.querySelector('[role="tablist"]')
		expect(tabList).toBeTruthy()
	})

	it('renders triggers with role="tab"', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const tabs = container.querySelectorAll('[role="tab"]')
		expect(tabs.length).toBe(3)
	})

	it('renders tab panels with role="tabpanel"', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const panels = container.querySelectorAll('[role="tabpanel"]')
		expect(panels.length).toBe(3)
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('marks selected tab with data-selected', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab2' })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		expect(triggers[0]?.hasAttribute('data-selected')).toBe(false)
		expect(triggers[1]?.hasAttribute('data-selected')).toBe(true)
		expect(triggers[2]?.hasAttribute('data-selected')).toBe(false)
	})

	it('sets aria-selected on selected tab', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		expect(triggers[0]?.getAttribute('aria-selected')).toBe('true')
		expect(triggers[1]?.getAttribute('aria-selected')).toBe('false')
	})

	it('shows active panel for selected value', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab2' })
		const panels = container.querySelectorAll('[data-tabs-panel]')
		expect(panels[0]?.hasAttribute('data-panel-active')).toBe(false)
		expect(panels[1]?.hasAttribute('data-panel-active')).toBe(true)
		expect(panels[2]?.hasAttribute('data-panel-active')).toBe(false)
	})

	it('calls onchange when clicking a different tab', async () => {
		const onchange = vi.fn()
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', onchange })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		await fireEvent.click(triggers[1])
		expect(onchange).toHaveBeenCalledWith('tab2', basicOptions[1])
	})

	it('does not call onchange when clicking already selected tab', async () => {
		const onchange = vi.fn()
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', onchange })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		await fireEvent.click(triggers[0])
		expect(onchange).not.toHaveBeenCalled()
	})

	it('calls onselect on every click including same tab', async () => {
		const onselect = vi.fn()
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', onselect })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		await fireEvent.click(triggers[0])
		expect(onselect).toHaveBeenCalledWith('tab1', basicOptions[0])
	})

	// ─── Labels and Icons ───────────────────────────────────────────

	it('renders labels', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const labels = container.querySelectorAll('[data-tabs-label]')
		expect(labels.length).toBe(3)
		expect(labels[0]?.textContent).toBe('Tab 1')
	})

	it('renders icons when provided', () => {
		const opts = [
			{ text: 'Home', value: 'home', icon: 'i-lucide:home', content: 'Home content' },
			{ text: 'Settings', value: 'settings', icon: 'i-lucide:settings', content: 'Settings content' }
		]
		const { container } = render(Tabs, { options: opts, value: 'home' })
		const icons = container.querySelectorAll('[data-tabs-icon]')
		expect(icons.length).toBe(2)
		expect(icons[0]?.classList.contains('i-lucide:home')).toBe(true)
	})

	// ─── Orientation / Position / Align ─────────────────────────────

	it('renders with horizontal orientation by default', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('data-orientation')).toBe('horizontal')
	})

	it('renders with vertical orientation', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', orientation: 'vertical' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('data-orientation')).toBe('vertical')
	})

	it('renders with position after', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', position: 'after' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('data-position')).toBe('after')
	})

	it('renders with center alignment', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', align: 'center' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('data-align')).toBe('center')
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('disables all tabs when disabled', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', disabled: true })
		const el = container.querySelector('[data-tabs]')
		expect(el?.hasAttribute('data-disabled')).toBe(true)
		const buttons = container.querySelectorAll('button[disabled]')
		expect(buttons.length).toBe(3)
	})

	it('does not call onchange when disabled', async () => {
		const onchange = vi.fn()
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', disabled: true, onchange })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		await fireEvent.click(triggers[1])
		expect(onchange).not.toHaveBeenCalled()
	})

	// ─── Keyboard ───────────────────────────────────────────────────

	it('selects on Enter key', async () => {
		const onchange = vi.fn()
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', onchange })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		await fireEvent.keyDown(triggers[2], { key: 'Enter' })
		expect(onchange).toHaveBeenCalledWith('tab3', basicOptions[2])
	})

	it('selects on Space key', async () => {
		const onchange = vi.fn()
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', onchange })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		await fireEvent.keyDown(triggers[1], { key: ' ' })
		expect(onchange).toHaveBeenCalledWith('tab2', basicOptions[1])
	})

	// ─── Arrow Key Navigation ───────────────────────────────────────

	it('moves focus right with ArrowRight', async () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const tabs = container.querySelector('[data-tabs]')!
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		triggers[0].focus()
		await fireEvent.keyDown(tabs, { key: 'ArrowRight' })
		expect(document.activeElement).toBe(triggers[1])
	})

	it('moves focus left with ArrowLeft', async () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab2' })
		const tabs = container.querySelector('[data-tabs]')!
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		triggers[1].focus()
		await fireEvent.keyDown(tabs, { key: 'ArrowLeft' })
		await waitFor(() => expect(document.activeElement).toBe(triggers[0]))
	})

	it('moves focus to first with Home', async () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab3' })
		const tabs = container.querySelector('[data-tabs]')!
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		triggers[2].focus()
		await fireEvent.keyDown(tabs, { key: 'Home' })
		await waitFor(() => expect(document.activeElement).toBe(triggers[0]))
	})

	it('moves focus to last with End', async () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const tabs = container.querySelector('[data-tabs]')!
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		triggers[0].focus()
		await fireEvent.keyDown(tabs, { key: 'End' })
		await waitFor(() => expect(document.activeElement).toBe(triggers[2]))
	})

	// ─── Custom Fields ──────────────────────────────────────────────

	it('supports custom field mapping', async () => {
		const opts = [
			{ label: 'First', body: 'First content', key: '1' },
			{ label: 'Second', body: 'Second content', key: '2' }
		]
		const onchange = vi.fn()
		const { container } = render(Tabs, {
			options: opts,
			fields: { text: 'label', content: 'body', value: 'key' },
			value: '1',
			onchange
		})
		const labels = container.querySelectorAll('[data-tabs-label]')
		expect(labels[0]?.textContent).toBe('First')
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		await fireEvent.click(triggers[1])
		expect(onchange).toHaveBeenCalledWith('2', opts[1])
	})

	it('renders panel content from content field', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const activePanel = container.querySelector('[data-tabs-panel][data-panel-active]')
		expect(activePanel?.textContent).toContain('Content 1')
	})

	it('renders mapped content field', () => {
		const opts = [
			{ text: 'Tab', value: 't1', body: 'Custom body content' }
		]
		const { container } = render(Tabs, {
			options: opts,
			fields: { content: 'body' },
			value: 't1'
		})
		const activePanel = container.querySelector('[data-tabs-panel][data-panel-active]')
		expect(activePanel?.textContent).toContain('Custom body content')
	})

	// ─── Accessibility ──────────────────────────────────────────────

	it('sets aria-label from name prop', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', name: 'navigation-tabs' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('aria-label')).toBe('navigation-tabs')
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders empty state with no options', () => {
		const { container } = render(Tabs, { options: [] })
		const empty = container.querySelector('[data-tabs-empty]')
		expect(empty).toBeTruthy()
		expect(empty?.textContent).toContain('No tabs available')
	})

	it('renders placeholder when no value is selected', () => {
		const { container } = render(Tabs, {
			options: basicOptions,
			placeholder: 'Please select a tab'
		})
		const placeholder = container.querySelector('[data-tabs-placeholder]')
		expect(placeholder?.textContent).toBe('Please select a tab')
	})

	// ─── Editable ───────────────────────────────────────────────────

	it('renders remove buttons in editable mode', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', editable: true })
		const removeButtons = container.querySelectorAll('[data-tabs-remove]')
		expect(removeButtons.length).toBe(3)
	})

	it('renders add button in editable mode', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', editable: true })
		const addButton = container.querySelector('[data-tabs-add]')
		expect(addButton).toBeTruthy()
	})

	it('calls onadd when add button is clicked', async () => {
		const onadd = vi.fn()
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', editable: true, onadd })
		const addButton = container.querySelector('[data-tabs-add]')!
		await fireEvent.click(addButton)
		expect(onadd).toHaveBeenCalled()
	})

	it('calls onremove when remove button is clicked', async () => {
		const onremove = vi.fn()
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', editable: true, onremove })
		const removeButtons = container.querySelectorAll('[data-tabs-remove]')
		await fireEvent.click(removeButtons[1])
		expect(onremove).toHaveBeenCalledWith('tab2')
	})
})
