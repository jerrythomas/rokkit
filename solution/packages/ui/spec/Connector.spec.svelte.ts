import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Connector from '../src/components/Connector.svelte'

describe('Connector', () => {
	// ─── Rendering ──────────────────────────────────────────────────

	it('renders a connector element', () => {
		const { container } = render(Connector)
		expect(container.querySelector('[data-connector]')).toBeTruthy()
	})

	it('defaults to empty type', () => {
		const { container } = render(Connector)
		const el = container.querySelector('[data-connector]')
		expect(el?.getAttribute('data-connector-type')).toBe('empty')
	})

	// ─── Type: empty ────────────────────────────────────────────────

	it('renders no inner elements for empty type', () => {
		const { container } = render(Connector, { type: 'empty' })
		const el = container.querySelector('[data-connector]')
		expect(el?.querySelector('i')).toBeNull()
	})

	// ─── Type: last ─────────────────────────────────────────────────

	it('renders last type with vertical + horizontal lines', () => {
		const { container } = render(Connector, { type: 'last' })
		const el = container.querySelector('[data-connector]')
		expect(el?.getAttribute('data-connector-type')).toBe('last')
		expect(el?.querySelector('[data-connector-v]')).toBeTruthy()
		expect(el?.querySelector('[data-connector-h]')).toBeTruthy()
	})

	it('renders last type with corner in RTL mode', () => {
		const { container } = render(Connector, { type: 'last', rtl: true })
		const el = container.querySelector('[data-connector]')
		expect(el?.querySelector('[data-connector-v]')).toBeTruthy()
		expect(el?.querySelector('[data-connector-corner]')).toBeTruthy()
		expect(el?.querySelector('[data-connector-h]')).toBeNull()
	})

	// ─── Type: child ────────────────────────────────────────────────

	it('renders child type with full vertical + horizontal lines', () => {
		const { container } = render(Connector, { type: 'child' })
		const el = container.querySelector('[data-connector]')
		expect(el?.getAttribute('data-connector-type')).toBe('child')
		const v = el?.querySelector('[data-connector-v]')
		expect(v).toBeTruthy()
		expect(v?.hasAttribute('data-connector-full')).toBe(true)
		expect(el?.querySelector('[data-connector-h]')).toBeTruthy()
	})

	it('renders child type with corner in RTL mode', () => {
		const { container } = render(Connector, { type: 'child', rtl: true })
		const el = container.querySelector('[data-connector]')
		const v = el?.querySelector('[data-connector-v]')
		expect(v?.hasAttribute('data-connector-full')).toBe(true)
		expect(el?.querySelector('[data-connector-corner]')).toBeTruthy()
		expect(el?.querySelector('[data-connector-h]')).toBeNull()
	})

	// ─── Type: sibling ──────────────────────────────────────────────

	it('renders sibling type with full vertical line only', () => {
		const { container } = render(Connector, { type: 'sibling' })
		const el = container.querySelector('[data-connector]')
		expect(el?.getAttribute('data-connector-type')).toBe('sibling')
		const v = el?.querySelector('[data-connector-v]')
		expect(v).toBeTruthy()
		expect(v?.hasAttribute('data-connector-full')).toBe(true)
		expect(el?.querySelector('[data-connector-h]')).toBeNull()
	})

	// ─── RTL ────────────────────────────────────────────────────────

	it('sets data-connector-rtl when rtl is true', () => {
		const { container } = render(Connector, { type: 'child', rtl: true })
		const el = container.querySelector('[data-connector]')
		expect(el?.hasAttribute('data-connector-rtl')).toBe(true)
	})

	it('does not set data-connector-rtl when rtl is false', () => {
		const { container } = render(Connector, { type: 'child', rtl: false })
		const el = container.querySelector('[data-connector]')
		expect(el?.hasAttribute('data-connector-rtl')).toBe(false)
	})

	// ─── Invalid type ───────────────────────────────────────────────

	it('falls back to empty for invalid type', () => {
		const { container } = render(Connector, { type: 'invalid' as any })
		const el = container.querySelector('[data-connector]')
		expect(el?.getAttribute('data-connector-type')).toBe('empty')
		expect(el?.querySelector('i')).toBeNull()
	})
})
