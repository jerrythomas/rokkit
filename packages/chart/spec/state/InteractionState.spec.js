import { describe, it, expect, vi } from 'vitest'
import { PlotConfig } from '../../src/state/PlotConfig.svelte.js'
import { InteractionState } from '../../src/state/InteractionState.svelte.js'

const row = { id: 1 }
const other = { id: 2 }

describe('InteractionState — hover', () => {
	it('tracks and clears the hovered row', () => {
		const i = new InteractionState(new PlotConfig())
		expect(i.hovered).toBeNull()
		i.setHovered(row)
		// toEqual, not toBe: $state proxies a plain object. A real hovered row is already a
		// proxy of PlotState.data, which Svelte does not wrap again, so identity holds there.
		expect(i.hovered).toEqual(row)
		i.clearHovered()
		expect(i.hovered).toBeNull()
	})
})

describe('InteractionState — selection', () => {
	it('is interactive with an onselect or when selectable', () => {
		expect(new InteractionState(new PlotConfig()).interactive).toBe(false)
		expect(new InteractionState(new PlotConfig({ onselect: () => {} })).interactive).toBe(true)
		expect(new InteractionState(new PlotConfig({ selectable: true })).interactive).toBe(true)
	})

	it('seeds from the initial selection', () => {
		const i = new InteractionState(new PlotConfig(), [row])
		expect(i.isSelected(row)).toBe(true)
		expect(i.selectedRows).toEqual([row])
	})

	it('handleSelect reports every activation and toggles only when selectable', () => {
		const onselect = vi.fn()
		const passive = new InteractionState(new PlotConfig({ onselect }))
		passive.handleSelect({ datum: row })
		expect(onselect).toHaveBeenCalledWith({ datum: row })
		expect(passive.isSelected(row)).toBe(false)

		const toggling = new InteractionState(new PlotConfig({ selectable: true }))
		toggling.handleSelect({ datum: row })
		toggling.handleSelect({ datum: other })
		expect(toggling.selectedRows).toEqual([row, other])
		toggling.handleSelect({ datum: row })
		expect(toggling.selectedRows).toEqual([other])
		toggling.handleSelect({})
		expect(toggling.selectedRows).toEqual([other])
	})

	it('replaces and clears the selection', () => {
		const i = new InteractionState(new PlotConfig())
		i.setSelected([row, other])
		expect(i.selectedRows).toEqual([row, other])
		i.setSelected(undefined)
		expect(i.selectedRows).toEqual([])
		i.setSelected([row])
		i.clearSelected()
		expect(i.selectedRows).toEqual([])
	})
})

describe('InteractionState — zoom', () => {
	it('holds the zoom transform until reset', () => {
		const i = new InteractionState(new PlotConfig())
		const t = { k: 2 }
		i.applyZoom(t)
		expect(i.zoom).toEqual(t)
		i.resetZoom()
		expect(i.zoom).toBeNull()
	})
})
