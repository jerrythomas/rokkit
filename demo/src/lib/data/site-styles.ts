/**
 * Shared style + density catalogs used by `SiteHeader`.
 *
 * Defining them once at the demo level keeps every route's picker
 * consistent and lets SiteHeader render without prop-drilling from each
 * page's script.
 */

export interface StyleOption {
	id: string
	label: string
	/** Three swatches — paper / ink / accent — for the inline preview. */
	colors: string[]
}

export interface DensityOption {
	id: string
	label: string
}

export const siteStyles: StyleOption[] = [
	{ id: 'zen-sumi', label: 'zen-sumi', colors: ['#F7F3EA', '#2A2925', '#A83D1F'] },
	{ id: 'rokkit', label: 'rokkit', colors: ['#FFFFFF', '#1F2937', '#EF4136'] },
	{ id: 'minimal', label: 'minimal', colors: ['#FAFAFA', '#0A0A0A', '#0A0A0A'] },
	{ id: 'material', label: 'material', colors: ['#FFFFFF', '#1F1F1F', '#6750A4'] },
	{ id: 'frosted', label: 'frosted', colors: ['#F2F4F7', '#1B1F24', '#5B8DEF'] }
]

export const siteDensities: DensityOption[] = [
	{ id: 'compact', label: 'Compact' },
	{ id: 'cozy', label: 'Cozy' },
	{ id: 'comfortable', label: 'Comfortable' }
]
