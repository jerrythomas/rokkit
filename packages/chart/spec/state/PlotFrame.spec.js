import { describe, it, expect } from 'vitest'
import { PlotConfig } from '../../src/state/PlotConfig.svelte.js'
import { PlotFrame } from '../../src/state/PlotFrame.svelte.js'

describe('PlotFrame', () => {
	it('insets the default margin from the size', () => {
		const f = new PlotFrame(new PlotConfig({ width: 600, height: 400 }))
		expect(f.margin).toEqual({ top: 20, right: 20, bottom: 40, left: 50 })
		expect(f.innerWidth).toBe(530)
		expect(f.innerHeight).toBe(340)
	})

	it('uses a margin override, and drops it when the override is withdrawn', () => {
		const config = new PlotConfig({
			width: 300,
			height: 200,
			margin: { top: 0, right: 0, bottom: 0, left: 0 }
		})
		const f = new PlotFrame(config)
		expect([f.innerWidth, f.innerHeight]).toEqual([300, 200])
		config.update({})
		expect(f.innerWidth).toBe(230)
	})
})
