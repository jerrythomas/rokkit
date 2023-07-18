import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { tick } from 'svelte'
import { Section } from '../../src/wrappers'

describe('Section.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using default props', () => {
		const { container } = render(Section)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render using props', async () => {
		const { container, component } = render(Section, {
			title: 'Section Title',
			open: false
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ title: 'custom' })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified type', async () => {
		const { container, component } = render(Section, { type: 'horizontal' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ type: 'section' })
		await tick()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified class', async () => {
		const { container, component } = render(Section, { class: 'custom-class' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		component.$set({ class: 'custom-class-2' })
		await tick()
		expect(container).toMatchSnapshot()
	})
})
