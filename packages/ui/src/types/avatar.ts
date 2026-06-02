/**
 * Avatar Component Types
 */

/** Avatar size scale. */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Avatar shape. */
export type AvatarShape = 'circle' | 'square'

/** Online presence status. */
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy'

/**
 * Props for the Avatar component.
 */
export interface AvatarProps {
	/** Image source URL. */
	src?: string

	/** Alt text for the image. */
	alt?: string

	/** Explicit initials to display as fallback. */
	initials?: string

	/** Full name — auto-derives initials if `initials` prop not provided. */
	name?: string

	/** Size variant. */
	size?: AvatarSize

	/** Online presence status. */
	status?: AvatarStatus

	/** Shape variant. */
	shape?: AvatarShape

	/** Additional CSS class. */
	class?: string
}
