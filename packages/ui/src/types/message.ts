/**
 * Message Component Types
 */

import type { Snippet } from 'svelte'

/** Semantic message type — drives color treatment and the default icon. */
export type MessageType = 'error' | 'info' | 'success' | 'warning'

/**
 * Icon overrides for the Message component, keyed by message type.
 */
export interface MessageIcons {
	error?: string
	info?: string
	success?: string
	warning?: string
}

/**
 * Props for the Message component.
 */
export interface MessageProps {
	/** Message type — controls color and the default icon. */
	type?: MessageType

	/** Icon class overrides per type. */
	icons?: MessageIcons

	/** Text content (shorthand). `children` takes precedence when both provided. */
	text?: string

	/** Show a dismiss button. */
	dismissible?: boolean

	/**
	 * Auto-dismiss after N milliseconds. Defaults to `4000` when not
	 * `dismissible`, otherwise persistent (no auto-dismiss). Pass `0`
	 * to disable auto-dismissal explicitly.
	 */
	timeout?: number

	/** Optional action buttons snippet. */
	actions?: Snippet

	/** Rich content (takes precedence over `text`). */
	children?: Snippet

	/** Called when dismissed — via button click or timeout. */
	ondismiss?: () => void

	/** Additional CSS class. */
	class?: string
}
