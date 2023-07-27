import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import BreadCrumbs from '../src/BreadCrumbs.svelte'

describe('BreadCrumbs.svelte', () => {
	beforeEach(() => cleanup())
	it('should render breadcrumbs', () => {
		const { container } = render(BreadCrumbs, { items: ['Alpha', 'Beta'] })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render breadcrumbs with separator', () => {
		const { container } = render(BreadCrumbs, {
			items: ['Alpha', 'Beta'],
			separator: '>'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render breadcrumbs with separator icon', () => {
		const { container } = render(BreadCrumbs, {
			items: ['Alpha', 'Beta'],
			separator: 'icon'
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
