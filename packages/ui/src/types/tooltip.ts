import type { Snippet } from 'svelte'

export interface TooltipProps {
	/** Tooltip text (alternative: use tooltipContent snippet for rich content) */
	content?: string

	/** Preferred position — auto-flips when the preferred side overflows the viewport */
	position?: 'top' | 'bottom' | 'left' | 'right'

	/** Show delay in ms (default: 300) */
	delay?: number

	/** Additional CSS classes on the root wrapper */
	class?: string

	/** Trigger element(s) */
	children?: Snippet

	/** Rich tooltip content — overrides the content string */
	tooltipContent?: Snippet
}
