<script lang="ts">
	interface ProgressBarProps {
		/** Current progress value (null = indeterminate) */
		value?: number | null
		/** Maximum value (default: 100) */
		max?: number
		/** Additional CSS class */
		class?: string
	}

	const {
		value = null,
		max = 100,
		class: className = ''
	}: ProgressBarProps = $props()

	const indeterminate = $derived(value === null || value === undefined || max === null || max === undefined)
	const percentage = $derived(indeterminate ? 100 : Math.min(100, Math.max(0, (value! / max!) * 100)))
</script>

<div
	data-progress
	data-indeterminate={indeterminate || undefined}
	class={className || undefined}
	role="progressbar"
	aria-valuenow={indeterminate ? undefined : value}
	aria-valuemin={0}
	aria-valuemax={max}
>
	<div data-progress-bar style:width="{percentage}%"></div>
</div>
