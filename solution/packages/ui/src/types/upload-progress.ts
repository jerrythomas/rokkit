/**
 * UploadProgress Component Types
 *
 * File upload status orchestrator. Thin composition layer that renders
 * a header + List or Grid layout. Default itemContent snippet renders
 * UploadFileStatus for each file. Consumer can override with custom snippet.
 */

import type { Snippet } from 'svelte'
import type { ProxyItem } from '@rokkit/states'

// =============================================================================
// Item Types
// =============================================================================

/**
 * Generic upload file item — any object with mapped fields
 */
export type UploadItem = Record<string, unknown>

// =============================================================================
// Field Mapping Types
// =============================================================================

/**
 * Field mapping for upload file data.
 * Maps semantic field names to keys in the data objects.
 */
export interface UploadFields {
	/** Field for display text - default: 'text' */
	label?: string

	/** Field for unique value - default: 'value' */
	value?: string

	/** Field for icon class - default: 'icon' */
	icon?: string

	/** Field for upload status key - default: 'status' */
	status?: string

	/** Field for progress percentage (0-100) - default: 'progress' */
	progress?: string

	/** Field for file size in bytes - default: 'size' */
	size?: string

	/** Field for MIME type - default: 'type' */
	type?: string

	/** Field for error message - default: 'error' */
	error?: string
}

// =============================================================================
// Snippet Types
// =============================================================================

/**
 * Snippet for custom per-file rendering inside List/Grid.
 * Receives the ProxyItem wrapping the file data.
 */
export type UploadItemSnippet = Snippet<[proxy: ProxyItem]>

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the UploadProgress component
 */
export interface UploadProgressProps {
	/** Array of file data objects */
	files?: UploadItem[]

	/** Field mapping configuration */
	fields?: UploadFields

	/** Layout mode */
	view?: 'list' | 'grid'

	/** Status values that show the cancel button */
	cancelWhen?: string[]

	/** Status values that show the retry button */
	retryWhen?: string[]

	/** Status values that show the remove button */
	removeWhen?: string[]

	/** Called when cancel is clicked (receives raw file object) */
	oncancel?: (file: UploadItem) => void

	/** Called when retry is clicked (receives raw file object) */
	onretry?: (file: UploadItem) => void

	/** Called when remove is clicked (receives raw file object) */
	onremove?: (file: UploadItem) => void

	/** Called when clear all is clicked */
	onclear?: () => void

	/** Label overrides merged with messages.current.uploadProgress */
	labels?: Record<string, string>

	/** Additional CSS classes */
	class?: string

	/** Custom snippet for per-file rendering (overrides default UploadFileStatus) */
	itemContent?: UploadItemSnippet
}
