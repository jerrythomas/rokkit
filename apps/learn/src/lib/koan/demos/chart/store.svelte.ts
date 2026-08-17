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
 * The chart explorer's single source of truth. The chart host, control drawer, and guidance
 * strip all read/write this slice. Selecting a type resets settings to that type's defaults +
 * field mapping, so controls never carry over stale values from a different chart.
 */
export class ChartExplorerStore {
	type = $state('bar')
	settings = $state<Settings>({ ...BASE_SETTINGS })
	drawerOpen = $state(false)

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
		const cfg = registry[typeId]
		if (!cfg) return
		this.type = typeId
		this.settings = {
			...BASE_SETTINGS,
			fill: cfg.fields.fill ?? '',
			color: cfg.fields.color ?? '',
			size: cfg.fields.size ?? '',
			...(cfg.defaults as Partial<Settings>)
		}
	}

	set<K extends keyof Settings>(key: K, value: Settings[K]): void {
		this.settings = { ...this.settings, [key]: value }
	}

	/** Apply a guidance tip: switch type and/or set settings. */
	apply(tip: Tip): void {
		if (tip.to) this.select(tip.to)
		if (tip.set) this.settings = { ...this.settings, ...(tip.set as Partial<Settings>) }
	}

	toggleDrawer(open?: boolean): void {
		this.drawerOpen = open ?? !this.drawerOpen
	}
}

/** Shared singleton for the demo (components import this). */
export const explorer = new ChartExplorerStore()
