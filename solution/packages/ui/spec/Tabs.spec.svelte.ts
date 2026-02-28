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

	it('renders a tabs container with data-tabs', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		expect(container.querySelector('[data-tabs]')).toBeTruthy()
	})

	it('has aria-label defaulting to "tabs"', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('aria-label')).toBe('tabs')
	})

	it('renders all tab triggers as buttons', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const triggers = container.querySelectorAll('button[data-tabs-trigger]')
		expect(triggers.length).toBe(3)
	})

	it('renders a tablist with role', () => {
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

	it('renders tab labels', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const labels = container.querySelectorAll('[data-tabs-label]')
		expect(labels.length).toBe(3)
		expect(labels[0]?.textContent).toBe('Tab 1')
		expect(labels[1]?.textContent).toBe('Tab 2')
		expect(labels[2]?.textContent).toBe('Tab 3')
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

	it('does not render icons when not provided', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const icons = container.querySelectorAll('[data-tabs-icon]')
		expect(icons.length).toBe(0)
	})

	it('passes class prop to container', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', class: 'my-tabs' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.classList.contains('my-tabs')).toBe(true)
	})

	// ─── Selection ──────────────────────────────────────────────────

	it('marks selected tab with data-selected', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab2' })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		expect(triggers[0]?.hasAttribute('data-selected')).toBe(false)
		expect(triggers[1]?.hasAttribute('data-selected')).toBe(true)
		expect(triggers[2]?.hasAttribute('data-selected')).toBe(false)
	})

	it('sets aria-selected on all tabs', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		expect(triggers[0]?.getAttribute('aria-selected')).toBe('true')
		expect(triggers[1]?.getAttribute('aria-selected')).toBe('false')
		expect(triggers[2]?.getAttribute('aria-selected')).toBe('false')
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
		expect(onchange).toHaveBeenCalled()
		expect(onchange.mock.calls[0][0]).toBe('tab2')
	})

	it('does not call onchange when clicking already selected tab', async () => {
		const onchange = vi.fn()
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', onchange })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		// First click selects tab1 (same-value guard: wrapper hasn't seen tab1 yet so first fires)
		await fireEvent.click(triggers[0])
		onchange.mockClear()
		// Second click on same tab should NOT fire onchange
		await fireEvent.click(triggers[0])
		expect(onchange).not.toHaveBeenCalled()
	})

	it('calls onselect on every click including same tab', async () => {
		const onselect = vi.fn()
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', onselect })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		await fireEvent.click(triggers[0])
		expect(onselect).toHaveBeenCalled()
		expect(onselect.mock.calls[0][0]).toBe('tab1')
		onselect.mockClear()
		// Second click on same tab should still fire onselect
		await fireEvent.click(triggers[0])
		expect(onselect).toHaveBeenCalled()
	})

	// ─── Per-Item Disabled ──────────────────────────────────────────

	it('marks individual disabled tabs', () => {
		const opts = [
			{ text: 'Tab 1', value: 'tab1', content: 'C1' },
			{ text: 'Tab 2', value: 'tab2', content: 'C2', disabled: true },
			{ text: 'Tab 3', value: 'tab3', content: 'C3' }
		]
		const { container } = render(Tabs, { options: opts, value: 'tab1' })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		expect(triggers[0]?.hasAttribute('data-disabled')).toBe(false)
		expect(triggers[1]?.hasAttribute('data-disabled')).toBe(true)
		expect(triggers[2]?.hasAttribute('data-disabled')).toBe(false)
	})

	it('sets disabled attribute on individual disabled tab buttons', () => {
		const opts = [
			{ text: 'Tab 1', value: 'tab1', content: 'C1' },
			{ text: 'Tab 2', value: 'tab2', content: 'C2', disabled: true }
		]
		const { container } = render(Tabs, { options: opts, value: 'tab1' })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		expect((triggers[0] as HTMLButtonElement).disabled).toBe(false)
		expect((triggers[1] as HTMLButtonElement).disabled).toBe(true)
	})

	// ─── Orientation / Position / Align ─────────────────────────────

	it('defaults to horizontal orientation', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('data-orientation')).toBe('horizontal')
	})

	it('sets aria-orientation on tablist', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const tabList = container.querySelector('[role="tablist"]')
		expect(tabList?.getAttribute('aria-orientation')).toBe('horizontal')
	})

	it('supports vertical orientation', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', orientation: 'vertical' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('data-orientation')).toBe('vertical')
		const tabList = container.querySelector('[role="tablist"]')
		expect(tabList?.getAttribute('aria-orientation')).toBe('vertical')
	})

	it('defaults to position before', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('data-position')).toBe('before')
	})

	it('supports position after', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', position: 'after' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('data-position')).toBe('after')
	})

	it('defaults to start alignment', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('data-align')).toBe('start')
	})

	it('supports center alignment', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', align: 'center' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('data-align')).toBe('center')
	})

	it('supports end alignment', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', align: 'end' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('data-align')).toBe('end')
	})

	// ─── Disabled (entire component) ────────────────────────────────

	it('sets data-disabled on container when disabled', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', disabled: true })
		const el = container.querySelector('[data-tabs]')
		expect(el?.hasAttribute('data-disabled')).toBe(true)
	})

	it('disables all tab buttons when disabled', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', disabled: true })
		const buttons = container.querySelectorAll('button[data-tabs-trigger][disabled]')
		expect(buttons.length).toBe(3)
	})

	it('does not set data-disabled when not disabled', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.hasAttribute('data-disabled')).toBe(false)
	})

	// ─── Keyboard: Selection ────────────────────────────────────────

	it('selects focused item on Enter key', async () => {
		const onchange = vi.fn()
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', onchange })
		const tabs = container.querySelector('[data-tabs]')!
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		;(triggers[2] as HTMLElement).focus()
		await fireEvent.keyDown(tabs, { key: 'Enter' })
		expect(onchange).toHaveBeenCalled()
		expect(onchange.mock.calls[0][0]).toBe('tab3')
	})

	it('selects focused item on Space key', async () => {
		const onchange = vi.fn()
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', onchange })
		const tabs = container.querySelector('[data-tabs]')!
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		;(triggers[1] as HTMLElement).focus()
		await fireEvent.keyDown(tabs, { key: ' ' })
		expect(onchange).toHaveBeenCalled()
		expect(onchange.mock.calls[0][0]).toBe('tab2')
	})

	// ─── Keyboard: Horizontal Arrow Navigation ─────────────────────

	it('moves focus right with ArrowRight', async () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const tabs = container.querySelector('[data-tabs]')!
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		;(triggers[0] as HTMLElement).focus()
		await fireEvent.keyDown(tabs, { key: 'ArrowRight' })
		expect(document.activeElement).toBe(triggers[1])
	})

	it('moves focus left with ArrowLeft', async () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab2' })
		const tabs = container.querySelector('[data-tabs]')!
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		;(triggers[1] as HTMLElement).focus()
		await fireEvent.keyDown(tabs, { key: 'ArrowLeft' })
		await waitFor(() => expect(document.activeElement).toBe(triggers[0]))
	})

	it('moves focus to first with Home', async () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab3' })
		const tabs = container.querySelector('[data-tabs]')!
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		;(triggers[2] as HTMLElement).focus()
		await fireEvent.keyDown(tabs, { key: 'Home' })
		await waitFor(() => expect(document.activeElement).toBe(triggers[0]))
	})

	it('moves focus to last with End', async () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const tabs = container.querySelector('[data-tabs]')!
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		;(triggers[0] as HTMLElement).focus()
		await fireEvent.keyDown(tabs, { key: 'End' })
		await waitFor(() => expect(document.activeElement).toBe(triggers[2]))
	})

	// ─── Custom Fields ──────────────────────────────────────────────

	it('supports custom field mapping', async () => {
		const opts = [
			{ name: 'First', body: 'First content', key: '1' },
			{ name: 'Second', body: 'Second content', key: '2' }
		]
		const onchange = vi.fn()
		const { container } = render(Tabs, {
			options: opts,
			fields: { text: 'name', content: 'body', value: 'key' },
			value: '1',
			onchange
		})
		const labels = container.querySelectorAll('[data-tabs-label]')
		expect(labels[0]?.textContent).toBe('First')
		expect(labels[1]?.textContent).toBe('Second')
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		await fireEvent.click(triggers[1])
		expect(onchange).toHaveBeenCalled()
		expect(onchange.mock.calls[0][0]).toBe('2')
	})

	// ─── Panel Content ──────────────────────────────────────────────

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

	it('renders all panels (active and inactive)', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const panels = container.querySelectorAll('[data-tabs-panel]')
		expect(panels.length).toBe(3)
	})

	// ─── External Value Sync (moveToValue) ──────────────────────────

	it('marks matching tab as selected on initial render', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab2' })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		expect(triggers[0]?.hasAttribute('data-selected')).toBe(false)
		expect(triggers[1]?.hasAttribute('data-selected')).toBe(true)
		expect(triggers[2]?.hasAttribute('data-selected')).toBe(false)
	})

	it('updates selected tab when value changes externally', async () => {
		const { container, rerender } = render(Tabs, { options: basicOptions, value: 'tab1' })
		let triggers = container.querySelectorAll('[data-tabs-trigger]')
		expect(triggers[0]?.hasAttribute('data-selected')).toBe(true)

		await rerender({ value: 'tab3' })
		triggers = container.querySelectorAll('[data-tabs-trigger]')
		expect(triggers[0]?.hasAttribute('data-selected')).toBe(false)
		expect(triggers[2]?.hasAttribute('data-selected')).toBe(true)
	})

	it('updates active panel when value changes externally', async () => {
		const { container, rerender } = render(Tabs, { options: basicOptions, value: 'tab1' })
		expect(container.querySelector('[data-tabs-panel][data-panel-active]')?.textContent).toContain('Content 1')

		await rerender({ value: 'tab2' })
		const panels = container.querySelectorAll('[data-tabs-panel]')
		expect(panels[0]?.hasAttribute('data-panel-active')).toBe(false)
		expect(panels[1]?.hasAttribute('data-panel-active')).toBe(true)
	})

	it('shows placeholder when value is cleared to undefined', async () => {
		const { container, rerender } = render(Tabs, { options: basicOptions, value: 'tab1' })
		expect(container.querySelector('[data-tabs-placeholder]')).toBeNull()

		await rerender({ value: undefined })
		expect(container.querySelector('[data-tabs-placeholder]')).toBeTruthy()
	})

	// ─── Accessibility ──────────────────────────────────────────────

	it('sets custom aria-label from name prop', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', name: 'navigation-tabs' })
		const el = container.querySelector('[data-tabs]')
		expect(el?.getAttribute('aria-label')).toBe('navigation-tabs')
	})

	it('sets aria-label on tab triggers', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const triggers = container.querySelectorAll('[data-tabs-trigger]')
		expect(triggers[0]?.getAttribute('aria-label')).toBe('Tab 1')
	})

	it('assigns panel ids', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const panels = container.querySelectorAll('[data-tabs-panel]')
		expect(panels[0]?.id).toContain('tab-panel-')
		expect(panels[1]?.id).toContain('tab-panel-')
	})

	// ─── Empty State ────────────────────────────────────────────────

	it('renders empty state with no options', () => {
		const { container } = render(Tabs, { options: [] })
		const empty = container.querySelector('[data-tabs-empty]')
		expect(empty).toBeTruthy()
		expect(empty?.textContent).toContain('No tabs available')
	})

	it('does not render tablist when empty', () => {
		const { container } = render(Tabs, { options: [] })
		expect(container.querySelector('[role="tablist"]')).toBeNull()
	})

	it('does not render panels when empty', () => {
		const { container } = render(Tabs, { options: [] })
		expect(container.querySelectorAll('[data-tabs-panel]').length).toBe(0)
	})

	it('renders placeholder when no value is selected', () => {
		const { container } = render(Tabs, {
			options: basicOptions,
			placeholder: 'Please select a tab'
		})
		const placeholder = container.querySelector('[data-tabs-placeholder]')
		expect(placeholder?.textContent).toBe('Please select a tab')
	})

	it('does not render placeholder when a value is selected', () => {
		const { container } = render(Tabs, {
			options: basicOptions,
			value: 'tab1',
			placeholder: 'Please select a tab'
		})
		expect(container.querySelector('[data-tabs-placeholder]')).toBeNull()
	})

	// ─── Editable ───────────────────────────────────────────────────

	it('renders remove buttons in editable mode', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', editable: true })
		const removeButtons = container.querySelectorAll('[data-tabs-remove]')
		expect(removeButtons.length).toBe(3)
	})

	it('does not render remove buttons when not editable', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		const removeButtons = container.querySelectorAll('[data-tabs-remove]')
		expect(removeButtons.length).toBe(0)
	})

	it('renders add button in editable mode', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', editable: true })
		const addButton = container.querySelector('[data-tabs-add]')
		expect(addButton).toBeTruthy()
	})

	it('does not render add button when not editable', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1' })
		expect(container.querySelector('[data-tabs-add]')).toBeNull()
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

	it('remove button has accessible label', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', editable: true })
		const removeButtons = container.querySelectorAll('[data-tabs-remove]')
		expect(removeButtons[0]?.getAttribute('aria-label')).toBe('Remove tab')
	})

	it('add button has accessible label', () => {
		const { container } = render(Tabs, { options: basicOptions, value: 'tab1', editable: true })
		const addButton = container.querySelector('[data-tabs-add]')
		expect(addButton?.getAttribute('aria-label')).toBe('Add tab')
	})
})
