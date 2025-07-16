import { describe, it, expect, beforeEach } from 'vitest'
import { render, cleanup } from '@testing-library/svelte'
import Tabs from '../src/Tabs.svelte'
import { flushSync } from 'svelte'
import CustomTabs from './mocks/CustomTabs.svelte'

describe('Tabs', () => {
	const rootSelector = '[data-tabs-root]'
	const items = [
		{ text: 'Tab 1', content: 'Content 1', id: 'tab1' },
		{ text: 'Tab 2', content: 'Content 2', id: 'tab2' },
		{ text: 'Tab 3', content: 'Content 3', id: 'tab3' },
		{ text: 'Tab 4', content: 'Content 4', id: 'tab4' }
	]

	beforeEach(() => cleanup())

	it('should render empty tabs', () => {
		const props = $state({ items: [] })
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render simple tabs with string array', () => {
		const props = $state({ items: ['Tab 1', 'Tab 2', 'Tab 3'], class: 'custom-class' })
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'another-class'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render tabs with object array', () => {
		const props = $state({ items, class: 'custom-class' })
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with horizontal orientation', () => {
		const props = $state({ items, orientation: 'horizontal' })
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const tabRoot = container.querySelector(rootSelector)
		expect(tabRoot.getAttribute('data-orientation')).toBe('horizontal')
	})

	it('should render with vertical orientation', () => {
		const props = $state({ items, orientation: 'vertical' })
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const tabRoot = container.querySelector(rootSelector)
		expect(tabRoot.getAttribute('data-orientation')).toBe('vertical')
	})

	it('should render with different positions', () => {
		const props = $state({ items, position: 'after' })
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const tabRoot = container.querySelector(rootSelector)
		expect(tabRoot.getAttribute('data-position')).toBe('after')
	})

	it('should render with different alignments', () => {
		const props = $state({ items, align: 'center' })
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const tabRoot = container.querySelector(rootSelector)
		expect(tabRoot.getAttribute('data-align')).toBe('center')
	})

	it('should render with selected value', () => {
		const props = $state({ items, value: items[1] })
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const selectedTab = container.querySelector('[aria-selected="true"]')
		expect(selectedTab).toBeTruthy()
	})

	it('should render with editable tabs', () => {
		const props = $state({ items, editable: true })
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const removeButtons = container.querySelectorAll('[data-icon-remove]')
		expect(removeButtons).toHaveLength(items.length)

		const addButton = container.querySelector('[data-icon-add]')
		expect(addButton).toBeTruthy()
	})

	it('should render with field mapping', () => {
		const mappedItems = [
			{ label: 'First', body: 'First content', key: '1' },
			{ label: 'Second', body: 'Second content', key: '2' }
		]
		const props = $state({
			items: mappedItems,
			fields: { text: 'label', content: 'body', id: 'key' }
		})
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom header snippet', () => {
		const props = $state({ items, addheader: true })
		const { container } = render(CustomTabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom content snippet', () => {
		const props = $state({ items, addcontent: true })
		const { container } = render(CustomTabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom empty state', () => {
		const props = $state({ items: [], addempty: true })
		const { container } = render(CustomTabs, props)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		const emptyState = container.querySelector('[data-empty]')
		expect(emptyState.textContent).toContain('Custom empty state')
	})

	it('should handle tabindex', () => {
		const props = $state({ items, tabindex: 5 })
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()

		const tabRoot = container.querySelector(rootSelector)
		expect(tabRoot.getAttribute('tabindex')).toBe('5')
	})

	it('should handle name for accessibility', () => {
		const props = $state({ items, name: 'navigation-tabs' })
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()

		const tabRoot = container.querySelector(rootSelector)
		expect(tabRoot.getAttribute('aria-label')).toBe('navigation-tabs')
	})

	it('should render placeholder when no tab is selected', () => {
		const props = $state({
			items,
			value: null,
			placeholder: 'Please select a tab to view content'
		})
		const { container } = render(Tabs, props)
		expect(container).toBeTruthy()

		const placeholder = container.querySelector('[data-placeholder]')
		expect(placeholder.textContent).toBe('Please select a tab to view content')
	})

	it('should render with role attributes for accessibility', () => {
		const props = $state({ items })
		const { container } = render(Tabs, props)

		const tabList = container.querySelector('[role="tablist"]')
		expect(tabList).toBeTruthy()

		const tabs = container.querySelectorAll('[role="tab"]')
		expect(tabs).toHaveLength(items.length)

		const tabPanel = container.querySelector('[role="tabpanel"]')
		expect(tabPanel).toBeTruthy()
	})

	it('should handle tab switching', () => {
		let selectedValue = null
		const props = $state({
			items,
			value: selectedValue,
			onselect: (value) => {
				selectedValue = value
			}
		})
		const { container } = render(Tabs, props)

		// Initially no tab should be selected
		expect(selectedValue).toBeNull()

		// Simulate tab selection by updating value
		props.value = items[0]
		flushSync()

		const selectedTab = container.querySelector('[aria-selected="true"]')
		expect(selectedTab).toBeTruthy()
	})
})
