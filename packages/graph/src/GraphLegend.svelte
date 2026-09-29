<script lang="ts">
	/**
	 * What the colours and strokes on the canvas mean.
	 *
	 * Graph-native rather than `@rokkit/chart`'s legend: that package carries eight d3 modules
	 * plus ramda, and `@rokkit/graph` has exactly one dependency — so reusing it would cost a
	 * consumer ten transitive packages for one component, and there is no package both already
	 * share (chart does not depend on `@rokkit/ui` either). The vocabularies differ anyway: a
	 * chart swatch is a symbol path, a graph swatch is a kind ICON or a LINE STYLE. If the
	 * generic legend is ever promoted somewhere both can reach, this is what it replaces.
	 *
	 * Every section is opt-in. A diagram whose nodes are all one kind wants the relations key
	 * and nothing else, and a legend that lists a constant is noise.
	 */
	import type { GraphState } from './GraphState.svelte.js'
	import { DEFAULT_ICONS } from './icons.js'

	type Section = 'kind' | 'relation' | 'group'

	type Props = {
		state: GraphState
		/** Node kinds present, each with its glyph. */
		kinds?: boolean
		/** Edge relations present, each drawn as the stroke it uses. */
		relations?: boolean
		/** Group names present, each with its ramp colour. */
		groups?: boolean
		icons?: Record<string, string>
		/**
		 * Fires with the entry a reader activated. Given one, entries become real buttons;
		 * without one they stay inert text, because a static key is not a control.
		 */
		onpick?: (section: Section, value: string) => void
	}

	let {
		state: graph,
		kinds = false,
		relations = false,
		groups = false,
		icons: userIcons,
		onpick
	}: Props = $props()

	const icons = $derived<Record<string, string>>({ ...DEFAULT_ICONS, ...userIcons })
	const shown = $derived(kinds || relations || groups)

	/** Underscores are the WIRE format (dbd sends `materialized_view`), not something to read. */
	const readable = (value: string) => value.replace(/_/g, ' ')

	/** `data-legend-kind` / `-relation` / `-group`, so CSS and tests can address a section. */
	const attrs = (section: Section, value: string) => ({ [`data-legend-${section}`]: value })
</script>

<!-- The swatch IS the mark used on the canvas: a kind's own icon, the group's ramp chip, or
     an SVG line inheriting the stroke the edge is drawn with. A key that redraws its marks a
     second way is a key that can disagree with the picture. -->
{#snippet swatch(section: Section, value: string)}
	{#if section === 'kind'}
		<span data-legend-swatch data-node-kind={value} class={icons[value] ?? icons.fallback}></span>
	{:else if section === 'relation'}
		<svg data-legend-swatch data-edge-relation={value} aria-hidden="true">
			<line x1="1" y1="4" x2="21" y2="4" />
		</svg>
	{:else}
		<span data-legend-swatch data-node-group={value} style={graph.groupStyleAttr(value)}></span>
	{/if}
{/snippet}

<!-- Two branches so the element and its role are STATIC. Written as one `<svelte:element>`
     with a conditional tag, the compiler cannot tell whether it is interactive and neither can
     a screen reader — and a click handler on a `<span>` is unreachable by keyboard. -->
{#snippet row(section: Section, value: string)}
	{#if onpick}
		<button
			type="button"
			data-graph-legend-entry
			{...attrs(section, value)}
			onclick={() => onpick(section, value)}
		>
			{@render swatch(section, value)}
			<span data-legend-label>{readable(value)}</span>
		</button>
	{:else}
		<span data-graph-legend-entry {...attrs(section, value)}>
			{@render swatch(section, value)}
			<span data-legend-label>{readable(value)}</span>
		</span>
	{/if}
{/snippet}

{#if shown}
	<div data-graph-legend aria-label="Legend">
		{#if kinds}
			{#each graph.kindsPresent as kind (kind)}
				{@render row('kind', kind)}
			{/each}
		{/if}

		{#if relations}
			{#each graph.relationsPresent as relation (relation)}
				{@render row('relation', relation)}
			{/each}
		{/if}

		{#if groups}
			{#each graph.groupsPresent as group (group)}
				{@render row('group', group)}
			{/each}
		{/if}
	</div>
{/if}
