<script lang="ts">
	/**
	 * Which measure a channel encodes (#168) — one picker per channel of a polymetric view.
	 *
	 * The measures offered are the ones the data has (`GraphState.measureKeys`): a picker that
	 * lists a metric no node carries offers a box of minimum size everywhere.
	 */
	import { choices } from '../actions/choices.js'
	import { say } from '../messages.js'

	type Props = {
		channel: 'width' | 'height' | 'color'
		value?: string
		/** The measures to offer — `GraphState.measureKeys`, what the data has. */
		options: string[]
		/** Offer "none" — a host with two metrics yet can leave shade off. */
		allowNone?: boolean
		onchange?: (value: string | undefined) => void
	}

	let { channel, value = undefined, options, allowNone = false, onchange }: Props = $props()

	const LABEL = { width: 'width', height: 'height', color: 'shade' } as const
</script>

<label
	data-graph-measure-control
	use:choices={{ onchoose: (picked) => onchange?.(picked === '' ? undefined : picked) }}
>
	<span data-graph-control-label>{say(LABEL[channel])}</span>
	<select data-graph-measure={channel} value={value ?? ''}>
		{#if allowNone}
			<option value="">{say('measureNone')}</option>
		{/if}
		{#each options as option (option)}
			<option value={option}>{option}</option>
		{/each}
	</select>
</label>
