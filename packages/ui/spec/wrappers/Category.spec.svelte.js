import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import { Wrapper, Category } from '../../src/wrappers'
import Switch from '../../src/Switch.svelte'
import Item from '../../src/Item.svelte'
import Tabs from '../../src/Tabs.svelte'

describe('Category.svelte', () => {
	const items = ['one', 'two', 'three']
	const using = {
		editors: {},
		components: {},
		wrappers: {},
		navigators: {}
	}
	const registry = $state({
		editors: { ...using.editors },
		components: { default: Item, ...using.components },
		wrappers: { default: Wrapper, ...using.wrappers },
		navigators: { default: Tabs, ...using.navigators }
	})

	beforeEach(() => {
		cleanup()
	})

	it('should render using default props', () => {
		const props = $state({ options: items })
		const { container } = render(Category, {
			context: new Map([['registry', registry]]),
			props
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified type', () => {
		const props = $state({ options: items, type: 'horizontal' })
		const { container } = render(Category, {
			context: new Map([['registry', registry]]),
			props
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.type = 'section'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified class', () => {
		const props = $state({ options: items, class: 'custom-class' })
		const { container } = render(Category, {
			context: new Map([['registry', registry]]),
			props
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'custom-class-2'
		flushSync()
		expect(container).toMatchSnapshot()
	})
	it('should render with extra props', async () => {
		const props = $state({ options: items, align: 'center' })
		const { container } = render(Category, {
			context: new Map([['registry', registry]]),
			props
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.align = 'right'
		flushSync()
		expect(container).toMatchSnapshot()
	})
	it('should render with alternative navigator', async () => {
		registry.navigators = { ...registry.navigators, Switch }
		const props = $state({ options: items, navigator: 'Switch' })
		const { container } = render(Category, {
			context: new Map([['registry', registry]]),
			props
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.navigator = 'tabs'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})
