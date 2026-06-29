/** Format an ISO timestamp as a short relative label ("5m ago"), or a clock time when relative=false. */
export function formatRelativeTime(timestamp: string, relative = true): string {
	const ms = new Date(timestamp).getTime()
	if (Number.isNaN(ms)) return ''
	if (!relative) return new Date(ms).toLocaleTimeString()
	const minutes = Math.round((Date.now() - ms) / 60000)
	if (minutes < 1) return 'just now'
	if (minutes < 60) return `${minutes}m ago`
	const hours = Math.round(minutes / 60)
	if (hours < 24) return `${hours}h ago`
	return `${Math.round(hours / 24)}d ago`
}
