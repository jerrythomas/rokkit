import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import StackTest from './StackTest.svelte'

describe('Stack', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a data-stack container', () => {
		const { container } = render(StackTest)
		expect(container.querySelector('[data-stack]')).toBeTruthy()
	})

	it('renders children', () => {
		const { container } = render(StackTest)
		expect(container.querySelectorAll('[data-stack-child]').length).toBe(2)
	})

	// ─── Direction ──────────────────────────────────────────────────

	it('defaults to direction="vertical"', () => {
		const { container } = render(StackTest)
		expect(container.querySelector('[data-stack]')?.getAttribute('data-direction')).toBe('vertical')
	})

	it('applies direction="horizontal"', () => {
		const { container } = render(StackTest, { props: { direction: 'horizontal' } })
		expect(container.querySelector('[data-stack]')?.getAttribute('data-direction')).toBe('horizontal')
	})

	// ─── Gap ────────────────────────────────────────────────────────

	it('defaults to gap="md"', () => {
		const { container } = render(StackTest)
		expect(container.querySelector('[data-stack]')?.getAttribute('data-gap')).toBe('md')
	})

	it('applies gap="sm"', () => {
		const { container } = render(StackTest, { props: { gap: 'sm' } })
		expect(container.querySelector('[data-stack]')?.getAttribute('data-gap')).toBe('sm')
	})

	it('applies gap="lg"', () => {
		const { container } = render(StackTest, { props: { gap: 'lg' } })
		expect(container.querySelector('[data-stack]')?.getAttribute('data-gap')).toBe('lg')
	})

	it('applies gap="none"', () => {
		const { container } = render(StackTest, { props: { gap: 'none' } })
		expect(container.querySelector('[data-stack]')?.getAttribute('data-gap')).toBe('none')
	})

	it('applies gap="xs"', () => {
		const { container } = render(StackTest, { props: { gap: 'xs' } })
		expect(container.querySelector('[data-stack]')?.getAttribute('data-gap')).toBe('xs')
	})

	it('applies gap="xl"', () => {
		const { container } = render(StackTest, { props: { gap: 'xl' } })
		expect(container.querySelector('[data-stack]')?.getAttribute('data-gap')).toBe('xl')
	})

	// ─── Align ──────────────────────────────────────────────────────

	it('does not set data-align when not provided', () => {
		const { container } = render(StackTest)
		expect(container.querySelector('[data-stack]')?.getAttribute('data-align')).toBeNull()
	})

	it('applies align="center"', () => {
		const { container } = render(StackTest, { props: { align: 'center' } })
		expect(container.querySelector('[data-stack]')?.getAttribute('data-align')).toBe('center')
	})

	it('applies align="start"', () => {
		const { container } = render(StackTest, { props: { align: 'start' } })
		expect(container.querySelector('[data-stack]')?.getAttribute('data-align')).toBe('start')
	})

	it('applies align="end"', () => {
		const { container } = render(StackTest, { props: { align: 'end' } })
		expect(container.querySelector('[data-stack]')?.getAttribute('data-align')).toBe('end')
	})

	it('applies align="stretch"', () => {
		const { container } = render(StackTest, { props: { align: 'stretch' } })
		expect(container.querySelector('[data-stack]')?.getAttribute('data-align')).toBe('stretch')
	})

	// ─── Justify ─────────────────────────────────────────────────────

	it('does not set data-justify when not provided', () => {
		const { container } = render(StackTest)
		expect(container.querySelector('[data-stack]')?.getAttribute('data-justify')).toBeNull()
	})

	it('applies justify="between"', () => {
		const { container } = render(StackTest, { props: { justify: 'between' } })
		expect(container.querySelector('[data-stack]')?.getAttribute('data-justify')).toBe('between')
	})

	it('applies justify="center"', () => {
		const { container } = render(StackTest, { props: { justify: 'center' } })
		expect(container.querySelector('[data-stack]')?.getAttribute('data-justify')).toBe('center')
	})

	// ─── Custom class ─────────────────────────────────────────────────

	it('applies custom CSS class', () => {
		const { container } = render(StackTest, { props: { class: 'my-stack' } })
		expect(container.querySelector('[data-stack]')?.classList.contains('my-stack')).toBe(true)
	})

	it('does not add class attribute when className is empty', () => {
		const { container } = render(StackTest)
		expect(container.querySelector('[data-stack]')?.getAttribute('class')).toBeNull()
	})
})
