<script lang="ts">
	import { setContext, untrack } from 'svelte'
	import type { Snippet } from 'svelte'
	import { PlotState } from './PlotState.svelte.js'
	import DefinePatterns from './patterns/DefinePatterns.svelte'

	type Row = Record<string, unknown>

	type Props = {
		/** Full PlotState config. `config.width` is the initial/fallback width — PlotSurface
		 *  owns the responsive width via a ResizeObserver and overrides it. */
		config?: Record<string, unknown>
		/** Animate marks on data/flip changes (data-plot-animate). Enabled one frame after the
		 *  width settles so the initial layout paints un-animated. */
		animate?: boolean
		/** Enable d3-zoom pan/zoom on the svg. */
		zoom?: boolean
		ariaLabel?: string
		/** SVG <desc> for screen readers. */
		summary?: string
		/** Two-way selection (row references), synced with the PlotState selection. */
		selected?: Row[]
		/** Canvas content (geoms/grid/axes) — rendered inside the svg. */
		children?: Snippet
		/** HTML overlays (legend/tooltip/a11y table) — rendered outside the svg but INSIDE the
		 *  plot-state context, so they can read plotState. */
		overlay?: Snippet
	}

	let {
		config = {},
		animate = true,
		zoom = false,
		ariaLabel = 'Chart visualization',
		summary = '',
		selected = $bindable([]),
		children,
		overlay
	}: Props = $props()

	// ── Responsive width: observe the container, use its pixel width so the chart fills the stage.
	let containerEl = $state<HTMLDivElement | null>(null)
	let svgEl = $state<SVGSVGElement | null>(null)
	let observedWidth = $state(0)
	$effect(() => {
		if (!containerEl) return
		const ro = new ResizeObserver((entries) => {
			const w = Math.floor(entries[0].contentRect.width)
			if (w > 0) observedWidth = w
		})
		ro.observe(containerEl)
		return () => ro.disconnect()
	})
	const fallbackWidth = $derived(Number(config.width) || 600)
	const effectiveWidth = $derived(observedWidth > 0 ? observedWidth : fallbackWidth)
	const svgHeight = $derived(Number(config.height) || 400)
	const mode = $derived(config.mode as 'light' | 'dark' | undefined)

	// ── The single PlotState + context. config.width is overridden with the observed width.
	const fullConfig = () => ({ ...config, width: effectiveWidth })
	const plotState = untrack(() => new PlotState(fullConfig()))
	setContext('plot-state', plotState)
	$effect(() => {
		plotState.update(fullConfig())
	})

	// ── Selection sync (external prop ↔ PlotState). Guarded to avoid an update loop.
	$effect(() => {
		plotState.setSelected(selected)
	})
	$effect(() => {
		const rows = plotState.selectedRows
		const same = rows.length === selected.length && rows.every((r, i) => r === selected[i])
		if (!same) selected = rows
	})

	// ── Enable data-change / flip animation one frame after the width first settles, so the
	//    initial (possibly reflowed) layout paints without animating.
	let animateReady = $state(false)
	$effect(() => {
		if (!animate || animateReady || observedWidth <= 0) return
		const raf = requestAnimationFrame(() => {
			animateReady = true
		})
		return () => cancelAnimationFrame(raf)
	})

	// ── Pan/zoom (d3-zoom/d3-selection are client-only → dynamic import).
	$effect(() => {
		if (!zoom || !svgEl) return
		let cancelled = false
		let detach: (() => void) | undefined
		Promise.all([import('d3-zoom'), import('d3-selection')]).then(
			([{ zoom: d3Zoom }, { select }]) => {
				if (cancelled || !svgEl) return
				const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
					.scaleExtent([1, 8])
					.on('zoom', (event) => plotState.applyZoom(event.transform))
				const sel = select(svgEl)
				sel.call(zoomBehavior)
				detach = () => sel.on('.zoom', null)
			}
		)
		return () => {
			cancelled = true
			detach?.()
			plotState.resetZoom()
		}
	})
</script>

<div class="plot-surface" bind:this={containerEl}>
	<svg
		bind:this={svgEl}
		width={effectiveWidth}
		height={svgHeight}
		viewBox="0 0 {effectiveWidth} {svgHeight}"
		role="img"
		aria-label={ariaLabel}
		data-plot-root
		data-mode={mode}
		data-plot-animate={animate && animateReady ? '' : undefined}
		style:cursor={zoom ? 'grab' : undefined}
	>
		{#if summary}
			<desc>{summary}</desc>
		{/if}
		<!-- SVG <pattern> defs for texture fills (Bar/Area/Arc/Box/Violin `pattern` channel) -->
		<DefinePatterns />
		<g
			class="plot-canvas"
			transform="translate({plotState.margin.left}, {plotState.margin.top})"
			data-plot-canvas
		>
			{@render children?.()}
		</g>
	</svg>
	<!-- HTML overlays (legend/tooltip/a11y table) — inside the context, outside the svg. -->
	{@render overlay?.()}
</div>

<style>
	.plot-surface {
		width: 100%;
	}
	.plot-surface svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
	}
	.plot-canvas {
		pointer-events: all;
	}
	/* Mode token-lock colour (only when data-mode is set explicitly). */
	[data-plot-root][data-mode='light'] {
		color: rgba(var(--color-surface-700, 59, 65, 77), 1);
	}
	[data-plot-root][data-mode='dark'] {
		color: rgba(var(--color-surface-200, 224, 224, 224), 1);
	}
</style>
