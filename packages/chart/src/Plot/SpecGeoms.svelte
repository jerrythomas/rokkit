<script lang="ts">
	import type { Component } from 'svelte'
	import type { PlotSpec, PlotHelpers } from '../lib/plot/types.js'
	import { specGeomProps } from '../lib/plot/spec.js'
	import Bar from '../geoms/Bar.svelte'
	import Line from '../geoms/Line.svelte'
	import Area from '../geoms/Area.svelte'
	import Point from '../geoms/Point.svelte'
	import Arc from '../geoms/Arc.svelte'
	import Box from '../geoms/Box.svelte'
	import Violin from '../geoms/Violin.svelte'
	import Heatmap from '../geoms/Heatmap.svelte'
	import Candlestick from '../geoms/Candlestick.svelte'
	import Waterfall from '../geoms/Waterfall.svelte'
	import Hexbin from '../geoms/Hexbin.svelte'
	import Ribbon from '../geoms/Ribbon.svelte'
	import Radar from '../geoms/Radar.svelte'
	import Rule from '../geoms/Rule.svelte'
	import Region from '../geoms/Region.svelte'
	import Hull from '../geoms/Hull.svelte'
	import Contour from '../geoms/Contour.svelte'

	type Props = {
		/** The chart spec; its `geoms` are drawn, and its channels are what each one inherits. */
		spec?: PlotSpec
		/** `helpers.geoms` replaces a built-in (or an annotation) by type name. */
		helpers?: PlotHelpers
	}

	let { spec = undefined, helpers = {} }: Props = $props()

	// Geom component resolver for spec-driven mode. Typed as a lookup table, not the union of
	// its members: a spec names geoms by string at runtime, exactly like `helpers.geoms`, and the
	// union of every geom's Props has no single shape a generic call site can satisfy.
	// `any` is the honest type for a heterogeneous table resolved by name — the same one the
	// public `PlotHelpers.geoms` already declares in lib/plot/types.js.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const GEOM_COMPONENTS: Record<string, Component<any>> = {
		bar: Bar,
		line: Line,
		area: Area,
		point: Point,
		arc: Arc,
		box: Box,
		violin: Violin,
		heatmap: Heatmap,
		candlestick: Candlestick,
		waterfall: Waterfall,
		hexbin: Hexbin,
		ribbon: Ribbon,
		// Radar reads the generic x/y/color this path passes via its own aliases, and takes
		// its axis order from `options.axes` — see Radar.svelte's Props.
		radar: Radar,
		hull: Hull,
		contour: Contour
	}

	// Plane annotations read no data, so they take ONLY their own `props` — never the spec's
	// field channels: a Region's `x`/`y` are ranges, and handing it the field name 'instability'
	// would be a range of one string. A helper registered under the same name is a geom again.
	const ANNOTATIONS = { rule: Rule, region: Region }

	function resolveGeomComponent(type: string) {
		return helpers?.geoms?.[type] ?? GEOM_COMPONENTS[type]
	}
</script>

<!-- Keyed by position, not type: two regions in one spec are normal, and a type key would be a
     duplicate that aborts the whole render. An unknown type renders nothing. -->
{#each spec?.geoms ?? [] as geomSpec, i (`${geomSpec.type}-${i}`)}
	{@const Annotation = ANNOTATIONS[geomSpec.type as keyof typeof ANNOTATIONS]}
	{@const GeomComponent = resolveGeomComponent(geomSpec.type)}
	{#if Annotation && !helpers?.geoms?.[geomSpec.type]}
		<Annotation {...geomSpec.props ?? {}} />
	{:else if GeomComponent}
		<GeomComponent {...specGeomProps(geomSpec, spec)} />
	{/if}
{/each}
