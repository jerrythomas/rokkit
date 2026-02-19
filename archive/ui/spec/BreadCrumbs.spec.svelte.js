import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import BreadCrumbs from '../src/BreadCrumbs.svelte'

describe('BreadCrumbs.svelte', () => {
	beforeEach(() => cleanup())
	it('should render breadcrumbs', () => {
		const props = $state({ items: ['Alpha', 'Beta'] })
		const { container } = render(BreadCrumbs, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render breadcrumbs with separator', () => {
		const props = $state({
			items: ['Alpha', 'Beta'],
			separator: '>'
		})
		const { container } = render(BreadCrumbs, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render breadcrumbs with separator icon', () => {
		const props = $state({
			items: ['Alpha', 'Beta'],
			separator: 'icon'
		})
		const { container } = render(BreadCrumbs, { props })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
