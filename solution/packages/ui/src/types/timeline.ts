/**
 * Timeline Component Types
 *
 * View-only vertical steps for instructions, changelogs,
 * or process visualization. No interaction.
 */

import type { Snippet } from 'svelte'
import type { ItemFields } from './item-proxy.js'

// =============================================================================
// Field Mapping Types
// =============================================================================

export type TimelineFields = Pick<ItemFields, 'text' | 'icon' | 'description'>

export const defaultTimelineFields: Required<TimelineFields> = {
	text: 'text',
	icon: 'icon',
	description: 'description'
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
