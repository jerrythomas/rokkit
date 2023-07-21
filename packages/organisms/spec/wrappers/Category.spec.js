import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { Category } from '../../src/wrappers'
import Register from '../mocks/Register.svelte'
import Switch from '../../src/Switch.svelte'

describe('Category.svelte', () => {
	const items = ['one', 'two', 'three']
	beforeEach(() => {
		cleanup()
	})

	it('should render using default props', () => {
		const { container } = render(Register, {
			render: Category,
			properties: { options: items }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified type', async () => {
		const { container, component } = render(Register, {
			render: Category,
			properties: { options: items, type: 'horizontal' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ type: 'section' })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified class', async () => {
		const { container, component } = render(Register, {
			render: Category,
			properties: { options: items, class: 'custom-class' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ class: 'custom-class-2' })
		await tick()
		expect(container).toMatchSnapshot()
	})
	it('should render with alternative navigator', async () => {
		const { container, component } = render(Register, {
			render: Category,
			components: { Switch },
			properties: { options: items, navigator: 'Switch' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ navigator: 'tabs' })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render with extra props', async () => {
		const { container, component } = render(Register, {
			render: Category,
			properties: { options: items, align: 'center' }
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ align: 'right' })
		await tick()
		expect(container).toMatchSnapshot()
	})
})
