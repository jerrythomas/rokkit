import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { Category } from '../../src/wrappers'
import Switch from '../../src/Switch.svelte'

describe('Category.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using default props', () => {
		const { container } = render(Category, { items: ['one', 'two', 'three'] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified type', async () => {
		const { container, component } = render(Category, {
			items: ['one', 'two', 'three'],
			type: 'horizontal'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ type: 'section' })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified class', async () => {
		const { container, component } = render(Category, { class: 'custom-class' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ class: 'custom-class-2' })
		await tick()
		expect(container).toMatchSnapshot()
	})
	it('should render with alternative navigator', async () => {
		const { container, component } = render(Category, {
			using: { Switch },
			navigator: 'Switch'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ navigator: 'tabs' })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render with extra props', async () => {
		const { container, component } = render(Category, { align: 'center' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ align: 'right' })
		await tick()
		expect(container).toMatchSnapshot()
	})
})
