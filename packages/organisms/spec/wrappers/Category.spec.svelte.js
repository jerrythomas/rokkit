import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { writable } from 'svelte/store'
import { Wrapper, Category } from '../../src/wrappers'
import Switch from '../../src/Switch.svelte'
import { Item } from '@rokkit/molecules'
import Tabs from '../../src/Tabs.svelte'

describe('Category.svelte', () => {
	const items = ['one', 'two', 'three']
	const using = {
		editors: {},
		components: {},
		wrappers: {},
		navigators: {}
	}
	const registry = writable({
		editors: { ...using.editors },
		components: { default: Item, ...using.components },
		wrappers: { default: Wrapper, ...using.wrappers },
		navigators: { default: Tabs, ...using.navigators }
	})

	beforeEach(() => {
		cleanup()
	})

	it('should render using default props', () => {
		const { container } = render(Category, {
			context: new Map([['registry', registry]]),
			props: { options: items }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified type', async () => {
		const props = $state({ options: items, type: 'horizontal' })
		const { container, component } = render(Category, {
			context: new Map([['registry', registry]]),
			props
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.type = 'section'
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified class', async () => {
		const props = $state({ options: items, class: 'custom-class' })
		const { container } = render(Category, {
			context: new Map([['registry', registry]]),
			props
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'custom-class-2'
		await tick()
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
		await tick()
		expect(container).toMatchSnapshot()
	})
	it('should render with alternative navigator', async () => {
		const props = $state({ options: items, navigator: 'Switch' })
		registry.update((state) => {
			state.navigators = { ...state.navigators, Switch }
			return state
		})
		const { container, component } = render(Category, {
			context: new Map([['registry', registry]]),
			props
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props, (navigator = 'tabs')
		await tick()
		expect(container).toMatchSnapshot()
	})
})
