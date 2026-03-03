/**
 * UploadTarget Component Types
 *
 * Drop zone with file validation. Accepts drag-and-drop or click-to-browse.
 * Validates files against accept (MIME/extension) and maxSize constraints.
 */

import type { Snippet } from 'svelte'

// =============================================================================
// Item Types
// =============================================================================

/**
 * File validation error returned via onerror callback
 */
export interface UploadError {
	/** The file that failed validation */
	file: File
	/** Why the file was rejected */
	reason: 'type' | 'size'
}

// =============================================================================
// Snippet Types
// =============================================================================

/**
 * Snippet for custom drop zone content.
 * Receives the current dragging state.
 */
export type UploadTargetContentSnippet = Snippet<[dragging: boolean]>

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the UploadTarget component
 */
export interface UploadTargetProps {
	/** Accepted file types (MIME types or extensions, comma-separated) */
	accept?: string

	/** Maximum file size in bytes */
	maxSize?: number

	/** Allow multiple file selection */
	multiple?: boolean

	/** Disable the drop zone */
	disabled?: boolean

	/** Label overrides merged with messages.current.uploadTarget */
	labels?: Record<string, string>

	/** Called with validated files after drop or browse */
	onfiles?: (files: File[]) => void

	/** Called for each file that fails validation */
	onerror?: (err: UploadError) => void

	/** Additional CSS classes */
	class?: string

	/** Custom content snippet (replaces default drop zone UI) */
	content?: UploadTargetContentSnippet
}
