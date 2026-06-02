/**
 * AlertList Component Types
 *
 * Renders a portalled toast stack at a screen-edge position, reading from
 * the shared `alerts` state.
 */

/**
 * Screen position for the toast stack.
 */
export type AlertListPosition =
	| 'top-right'
	| 'top-center'
	| 'top-left'
	| 'bottom-right'
	| 'bottom-center'
	| 'bottom-left'

/**
 * Props for the AlertList component.
 */
export interface AlertListProps {
	/** Screen position for the toast stack. */
	position?: AlertListPosition

	/** Additional CSS class. */
	class?: string
}
