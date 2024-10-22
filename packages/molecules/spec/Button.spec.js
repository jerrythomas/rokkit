import { describe, expect, it, beforeEach } from 'vitest'
import { cleanup, render } from '@testing-library/svelte'
import Button from '../src/Button.svelte'

describe('Button.svelte', () => {
	beforeEach(() => cleanup())
	it('should render a button with a label', () => {
		const { container } = render(Button, { props: { label: 'Click me' } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a button with a label and left icon', () => {
		const { container } = render(Button, {
			props: {
				label: 'With Left Icon',
				leftIcon: 'theme'
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a button with a label and right icon', () => {
		const { container } = render(Button, {
			props: {
				label: 'With Right Icon',
				rightIcon: 'arrow-right'
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a button with a label and both icons', () => {
		const { container } = render(Button, {
			props: {
				label: 'Dual Icons',
				leftIcon: 'email',
				rightIcon: 'arrow-right'
			}
		})
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a button with icon only', () => {
		const { container } = render(Button, { props: { leftIcon: 'colors' } })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a button marked as primary', () => {
		const { container } = render(Button, { label: 'Primary', type: 'primary' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})

	it('should render a button with outline style', () => {
		const { container } = render(Button, { label: 'Outline', style: 'outline' })
		expect(container).toBeTruthy()
		expect(container).toMatchSnapshot()
	})
})
