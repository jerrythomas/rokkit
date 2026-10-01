<script lang="ts">
	/**
	 * Which measure a channel encodes (#168) — one picker per channel of a polymetric view.
	 *
	 * The measures offered are the ones the data has (`GraphState.measureKeys`): a picker that
	 * lists a metric no node carries offers a box of minimum size everywhere.
	 */
	type Props = {
		/** The channel this picks for — width, height, or color. */
		channel: 'width' | 'height' | 'color'
		value?: string
		options: string[]
		/** Allow "none" — a host may have only two metrics live yet (the colour stays off). */
		allowNone?: boolean
		onchange?: (value: string | undefined) => void
	}

	let { channel, value = undefined, options, allowNone = false, onchange }: Props = $props()

	const LABELS = { width: 'Width', height: 'Height', color: 'Shade' }
</script>

<label data-graph-measure-control>
	<span data-graph-control-label>{LABELS[channel]}</span>
	<select
		data-graph-measure={channel}
		value={value ?? ''}
		onchange={(event) => {
			const picked = (event.currentTarget as HTMLSelectElement).value
			onchange?.(picked === '' ? undefined : picked)
		}}
	>
		{#if allowNone}
			<option value="">none</option>
		{/if}
		{#each options as option (option)}
			<option value={option}>{option}</option>
		{/each}
	</select>
</label>
