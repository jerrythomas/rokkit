import { registry, type Setting, type Tip } from './registry'

export type Settings = {
	orientation: 'vertical' | 'horizontal'
	position: 'stack' | 'dodge' | 'fill' | 'identity'
	fill: string
	color: string
	pattern: string
	alpha: number | undefined
	legend: boolean
	innerRadius: number
	size: string
}

const BASE_SETTINGS: Settings = {
	orientation: 'vertical',
	position: 'dodge',
	fill: '',
	color: '',
	pattern: '',
	alpha: undefined,
	legend: false,
	innerRadius: 0,
	size: ''
}

/**
 * The settings a type mounts with: its field mapping (fill/color/size) plus any per-type
 * default overrides. Used both for the store's initial value and on every `select()`, so the
 * very first chart is already grouped/coloured (not bare BASE_SETTINGS) — otherwise a stack
 * with no fill has nothing to group and the axis can't size to the stacked total.
 */
function settingsFor(typeId: string): Settings {
	const cfg = registry[typeId]
	if (!cfg) return { ...BASE_SETTINGS }
	return {
		...BASE_SETTINGS,
		fill: cfg.fields.fill ?? '',
		color: cfg.fields.color ?? '',
		size: cfg.fields.size ?? '',
		...(cfg.defaults as Partial<Settings>)
	}
}

/**
 * The chart explorer's single source of truth. The chart host, control drawer, and guidance
 * strip all read/write this slice. Selecting a type resets settings to that type's defaults +
 * field mapping, so controls never carry over stale values from a different chart.
 */
export class ChartExplorerStore {
	type = $state('bar')
	settings = $state<Settings>(settingsFor('bar'))

	get config() {
		return registry[this.type]
	}
	get tips(): Tip[] {
		return this.config?.tips ?? []
	}

	/** Does the current type expose this setting in the drawer? */
	applies(setting: Setting): boolean {
		return this.config?.applies.includes(setting) ?? false
	}

	/** Switch chart type — resets settings to the type's field mapping + defaults. */
	select(typeId: string): void {
		if (!registry[typeId]) return
		this.type = typeId
		this.settings = settingsFor(typeId)
	}

	set<K extends keyof Settings>(key: K, value: Settings[K]): void {
		this.settings = { ...this.settings, [key]: value }
	}

	/** Apply a guidance tip: switch type and/or set settings. */
	apply(tip: Tip): void {
		if (tip.to) this.select(tip.to)
		if (tip.set) this.settings = { ...this.settings, ...(tip.set as Partial<Settings>) }
	}

	/** A short bot-style description of what the canvas is currently showing. */
	describe(): string {
		const c = this.config
		const s = this.settings
		const context: Record<string, string> = {
			productSeries: 'quarterly revenue across two products',
			segments: 'market share by segment',
			cars: 'engine size vs. highway efficiency by car class',
			daily: 'a daily metric over the last 30 days',
			heatmap: 'weekly activity by day and hour',
			points: 'a dense 2-D point cloud',
			ohlc: 'open/high/low/close prices over 12 sessions',
			waterfall: 'a running total built up step by step',
			flows: 'flows between source and target groups'
		}
		const bits = [`A ${c.label.toLowerCase()} chart of ${context[c.dataset] ?? 'the sample data'}.`]
		if (this.applies('position') && s.position) {
			const p: Record<string, string> = {
				stack: 'The series are stacked to show cumulative totals.',
				dodge: 'The series sit side-by-side for direct comparison.',
				fill: 'Each column is normalised to 100% so you read share, not totals.',
				identity: 'The series overlap on a shared baseline.'
			}
			if (p[s.position]) bits.push(p[s.position])
		}
		if (this.applies('orientation') && s.orientation === 'horizontal') bits.push('Bars run horizontally.')
		if (this.applies('pattern') && s.pattern) bits.push('Fills use textured patterns.')
		if (this.applies('innerRadius') && s.innerRadius) bits.push('The centre is cut out into a donut.')
		if (this.applies('legend') && s.legend) bits.push('A colour legend is shown.')
		return bits.join(' ')
	}
}

/** Shared singleton for the demo (components import this). */
export const explorer = new ChartExplorerStore()
