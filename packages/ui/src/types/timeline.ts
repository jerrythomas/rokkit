/**
 * Timeline Component Types
 *
 * View-only vertical steps for instructions, changelogs,
 * or process visualization. No interaction.
 */

import type { Snippet } from 'svelte'
// =============================================================================
// Field Mapping Types
// =============================================================================

export interface TimelineFields {
	label?: string
	icon?: string
	subtext?: string
}

export const defaultTimelineFields: Required<TimelineFields> = {
	label: 'label',
	icon: 'icon',
	subtext: 'description'
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface TimelineIcons {
	/** Icon class for completed state (default: i-lucide:check) */
	completed?: string
}

export const defaultTimelineIcons: Required<TimelineIcons> = {
	completed: 'i-lucide:check'
}

export interface TimelineProps {
	/** Array of timeline items */
	items?: Record<string, unknown>[]

	/** Field mapping configuration */
	fields?: TimelineFields

	/** Custom icons */
	icons?: TimelineIcons

	/** Additional CSS class */
	class?: string

	/** Custom content snippet for each item: (item, index) */
	content?: Snippet<[Record<string, unknown>, number]>
}
