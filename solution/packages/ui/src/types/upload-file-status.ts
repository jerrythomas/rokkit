/**
 * UploadFileStatus Component Types
 *
 * Renders a single file's upload status with progress bar, action buttons
 * (cancel/retry/remove), and file metadata (icon, name, size, status label).
 * Action button visibility driven by cancelWhen/retryWhen/removeWhen arrays.
 */

import type { ProxyItem } from '@rokkit/states'

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for the UploadFileStatus component
 */
export interface UploadFileStatusProps {
	/** ProxyItem wrapping the file data */
	proxy: ProxyItem

	/** Status values that show the cancel button */
	cancelWhen?: string[]

	/** Status values that show the retry button */
	retryWhen?: string[]

	/** Status values that show the remove button */
	removeWhen?: string[]

	/** Called when cancel is clicked */
	oncancel?: (proxy: ProxyItem) => void

	/** Called when retry is clicked */
	onretry?: (proxy: ProxyItem) => void

	/** Called when remove is clicked */
	onremove?: (proxy: ProxyItem) => void

	/** Label overrides merged with messages.current.uploadProgress */
	labels?: Record<string, string>

	/** Icon class overrides for action buttons (cancel, retry, remove) */
	icons?: Record<string, string>
}
