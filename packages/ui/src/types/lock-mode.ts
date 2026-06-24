import type { Snippet } from 'svelte'

/** The color mode a region can be locked to. */
export type LockedMode = 'dark' | 'light'

/** Props for the LockMode component. */
export interface LockModeProps {
	/** Color mode to pin this subtree to, regardless of the document mode. */
	mode: LockedMode

	/** Content rendered inside the locked region. */
	children: Snippet

	/** Additional CSS class. */
	class?: string
}
