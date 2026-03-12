import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/svelte'
import Pill from '../src/components/Pill.svelte'

describe('Pill', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a pill container', () => {
		const { container } = render(Pill, { value: 'Hello' })
		expect(container.querySelector('[data-pill]')).toBeTruthy()
	})

	it('renders text from a string value', () => {
		const { container } = render(Pill, { value: 'Tag' })
		const text = container.querySelector('[data-pill-text]')
		expect(text?.textContent).toBe('Tag')
	})

	it('renders text from an object value', () => {
		const { container } = render(Pill, { value: { label: 'Item' } })
		const text = container.querySelector('[data-pill-text]')
		expect(text?.textContent).toBe('Item')
	})

	it('renders icon when present', () => {
		const { container } = render(Pill, { value: { label: 'Tag', icon: 'i-lucide:tag' } })
		expect(container.querySelector('[data-pill-icon]')).toBeTruthy()
	})

	it('does not render icon when absent', () => {
		const { container } = render(Pill, { value: 'Tag' })
		expect(container.querySelector('[data-pill-icon]')).toBeNull()
	})

	it('applies custom class', () => {
		const { container } = render(Pill, { value: 'Tag', class: 'my-pill' })
		const el = container.querySelector('[data-pill]')
		expect(el?.classList.contains('my-pill')).toBe(true)
	})

	// ─── Disabled ───────────────────────────────────────────────────

	it('sets data-pill-disabled when disabled', () => {
		const { container } = render(Pill, { value: 'Tag', disabled: true })
		expect(container.querySelector('[data-pill-disabled]')).toBeTruthy()
	})

	it('does not set data-pill-disabled when enabled', () => {
		const { container } = render(Pill, { value: 'Tag', disabled: false })
		expect(container.querySelector('[data-pill-disabled]')).toBeNull()
	})

	// ─── Remove Button ──────────────────────────────────────────────

	it('shows remove button when removable', () => {
		const { container } = render(Pill, { value: 'Tag', removable: true })
		expect(container.querySelector('[data-pill-remove]')).toBeTruthy()
	})

	it('hides remove button when not removable', () => {
		const { container } = render(Pill, { value: 'Tag', removable: false })
		expect(container.querySelector('[data-pill-remove]')).toBeNull()
	})

	it('calls onremove when remove button is clicked', async () => {
		const onremove = vi.fn()
		const { container } = render(Pill, { value: 'Tag', removable: true, onremove })
		const removeBtn = container.querySelector('[data-pill-remove]')!
		await fireEvent.click(removeBtn)
		expect(onremove).toHaveBeenCalledWith('Tag')
	})

	it('does not call onremove when disabled', async () => {
		const onremove = vi.fn()
		const { container } = render(Pill, { value: 'Tag', removable: true, disabled: true, onremove })
		const removeBtn = container.querySelector('[data-pill-remove]')!
		await fireEvent.click(removeBtn)
		expect(onremove).not.toHaveBeenCalled()
	})

	// ─── Tabindex ───────────────────────────────────────────────────

	it('is focusable when removable and not disabled', () => {
		const { container } = render(Pill, { value: 'Tag', removable: true })
		const el = container.querySelector('[data-pill]') as HTMLElement
		expect(el?.tabIndex).toBe(0)
	})

	it('is not focusable when not removable', () => {
		const { container } = render(Pill, { value: 'Tag', removable: false })
		const el = container.querySelector('[data-pill]') as HTMLElement
		expect(el?.getAttribute('tabindex')).toBeNull()
	})

	// ─── Field Mapping ──────────────────────────────────────────────

	it('supports custom field mappings', () => {
		const { container } = render(Pill, {
			value: { label: 'Custom', symbol: 'i-lucide:star' },
			fields: { label: 'label', icon: 'symbol' }
		})
		const text = container.querySelector('[data-pill-text]')
		expect(text?.textContent).toBe('Custom')
		expect(container.querySelector('[data-pill-icon]')).toBeTruthy()
	})

	// ─── Icons ──────────────────────────────────────────────────────

	it('renders default semantic action-remove icon in remove button', () => {
		const { container } = render(Pill, { value: 'Tag', removable: true })
		const icon = container.querySelector('[data-pill-remove-icon]')
		expect(icon).toBeTruthy()
		expect(icon?.classList.contains('action-remove')).toBe(true)
	})

	it('uses custom remove icon override', () => {
		const { container } = render(Pill, {
			value: 'Tag',
			removable: true,
			icons: { remove: 'custom-x' }
		})
		const icon = container.querySelector('[data-pill-remove-icon]')
		expect(icon?.classList.contains('custom-x')).toBe(true)
	})

	// ─── Accessibility ──────────────────────────────────────────────

	it('remove button has aria-label', () => {
		const { container } = render(Pill, { value: 'Tag', removable: true })
		const removeBtn = container.querySelector('[data-pill-remove]')
		expect(removeBtn?.getAttribute('aria-label')).toBe('Remove Tag')
	})
})
