<script lang="ts">
	/**
	 * Curved or orthogonal connectors.
	 *
	 * A toggle rather than a picker: there are exactly two, and a two-option `<select>` costs a
	 * reader more interaction than the thing it is choosing between is worth.
	 */
	import type { EdgeStyle } from '../layout/types.js'

	type Props = {
		edgeStyle?: EdgeStyle
		onchange?: (value: EdgeStyle) => void
	}

	let { edgeStyle = 'curved', onchange }: Props = $props()

	// `curved` is the default, so `orthogonal` is the pressed state — a toggle reads as "the
	// non-default is on", not as "one of two things is selected".
	const orthogonal = $derived(edgeStyle === 'orthogonal')
</script>

<button
	type="button"
	data-graph-edge-style={edgeStyle}
	aria-pressed={orthogonal}
	title={orthogonal ? 'Right-angle connectors' : 'Curved connectors'}
	onclick={() => onchange?.(orthogonal ? 'curved' : 'orthogonal')}
>
	<span data-graph-edge-style-glyph aria-hidden="true">{orthogonal ? '⌐' : '︵'}</span>
	<span data-graph-control-label>{orthogonal ? 'Angled' : 'Curved'}</span>
</button>
