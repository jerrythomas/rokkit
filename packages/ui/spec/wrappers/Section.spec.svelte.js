import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import { flushSync, tick } from 'svelte'
import { Section } from '../../src/wrappers'

describe('Section.svelte', () => {
	beforeEach(() => cleanup())

	it('should render using default props', () => {
		const { container } = render(Section)
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render using props', () => {
		const props = $state({ title: 'Section Title', open: false })
		const { container } = render(Section, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.title = 'custom'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified type', () => {
		const props = $state({ type: 'horizontal' })
		const { container } = render(Section, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.type = 'section'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render using specified class', () => {
		const props = $state({ class: 'custom-class' })
		const { container } = render(Section, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()

		props.class = 'custom-class-2'
		flushSync()
		expect(container).toMatchSnapshot()
	})
})
