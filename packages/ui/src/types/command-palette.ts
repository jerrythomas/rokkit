/**
 * CommandPalette Component Types
 *
 * Overlay command launcher. It owns its own command source and filtering, so
 * the public surface is just visibility and the search affordance's label.
 */

/**
 * Props for the CommandPalette component.
 *
 * `CommandPalette.svelte` annotates its own `$props()` with this interface, so
 * the two cannot drift.
 */
export interface CommandPaletteProps {
	/** Whether the palette is open (bindable) */
	open?: boolean

	/** Placeholder text for the search input */
	placeholder?: string
}
