import {
	toSparklineProps,
	type SparklineSettings,
	type SparklineProps
} from './mapping'

/**
 * One fixed mixed-sign series so `baseline` has negatives to anchor and
 * min/max markers land on obvious points. Deterministic (no RNG) so renders
 * and e2e are stable.
 */
export const SAMPLE_SERIES = [12, -8, 23, -17, 34, 56, -9, 41]

// Default to a line so the baseline toggle is immediately live on first load:
// bars with negative values auto-anchor to 0 in the component regardless of the
// prop, which would make the baseline toggle look inert if the demo opened on bar.
const BASE: SparklineSettings = {
	type: 'line',
	baseline: true,
	highlight: 'minmax',
	trend: 'none'
}

/** One-tap guidance nudge — applies a settings patch. */
export type SparklineTip = { text: string; set: Partial<SparklineSettings> }

/**
 * The sparkline explorer's single source of truth. Simpler than the chart
 * registry: one component with variant settings, and the settings→prop mapping
 * lives here (via `toSparklineProps`) rather than in the template.
 */
export class SparklineStore {
	settings = $state<SparklineSettings>({ ...BASE })

	/** Real <Sparkline> props derived from the UI settings. */
	get props(): SparklineProps {
		return toSparklineProps(this.settings)
	}

	get tips(): SparklineTip[] {
		return [
			{ text: 'Anchor bars to a zero baseline', set: { type: 'bar', baseline: true } },
			{ text: 'Mark the min, max & last points', set: { highlight: 'all' } },
			{ text: 'Overlay a linear trend line', set: { type: 'line', trend: 'linear' } },
			{ text: 'Fill it in as an area', set: { type: 'area' } }
		]
	}

	set<K extends keyof SparklineSettings>(key: K, value: SparklineSettings[K]): void {
		// Immutable reassignment — required for Svelte 5 $state tracking.
		this.settings = { ...this.settings, [key]: value }
	}

	apply(patch: Partial<SparklineSettings>): void {
		this.settings = { ...this.settings, ...patch }
	}

	/** A short bot-style description of what the canvas is currently showing. */
	describe(): string {
		const s = this.settings
		const bits = [`A ${s.type} sparkline of an 8-point mixed-sign series.`]
		if (s.baseline) bits.push('A zero baseline anchors the swing between positive and negative.')
		if (s.highlight !== 'none') {
			const label =
				s.highlight === 'minmax'
					? 'the min and max points'
					: s.highlight === 'last'
						? 'the latest point'
						: 'the min, max and latest points'
			bits.push(`Markers call out ${label}.`)
		}
		if (s.trend !== 'none') {
			bits.push(`A ${s.trend === 'avg' ? 'mean' : 'linear'} trend line runs through it.`)
		}
		return bits.join(' ')
	}
}

/** Shared singleton for the demo (components import this). */
export const sparkline = new SparklineStore()
