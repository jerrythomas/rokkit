import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { flushSync } from 'svelte'
import Link from '../src/Link.svelte'
import { FieldMapper } from '@rokkit/core'

describe('Link', () => {
	it('should render', () => {
		const props = $state({ value: 'Hello' })
		const { container } = render(Link, { props })
		expect(container).toMatchSnapshot()
		props.value = { text: 'World' }
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with custom mapping', () => {
		const mapping = new FieldMapper({ icon: 'text' })
		const props = $state({
			value: { text: null, url: 'http://example.com', props: { target: '_blank' } },
			mapping
		})
		const { container } = render(Link, { props })
		expect(container).toMatchSnapshot()
		props.value.text = 'World'
		flushSync()
		expect(container).toMatchSnapshot()

		mapping.fields = { icon: 'icon' }
		props.value.image = 'world.png'
		flushSync()
		expect(container).toMatchSnapshot()
	})

	it('should render with href', () => {
		const props = $state({ value: { text: 'Hello' }, href: 'http://example.com', target: '_blank' })
		const { container } = render(Link, { props })
		expect(container).toMatchSnapshot()
	})

	it('should render with icon', () => {
		const { container } = render(Link, { value: { text: 'Hello', icon: 'world' } })
		expect(container).toMatchSnapshot()
	})

	it('should render with image', () => {
		const { container } = render(Link, { value: { text: 'Hello', image: 'world.png' } })
		expect(container).toMatchSnapshot()
	})
})
