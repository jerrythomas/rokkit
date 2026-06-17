<script lang="ts">
	import type { Snippet } from 'svelte'

	/**
	 * ChartExporter — wraps a chart and provides export actions for SVG and PNG.
	 *
	 * Usage:
	 * <ChartExporter bind:this={exporter}>
	 *   <BarChart bind:el={chartEl} ... />
	 * </ChartExporter>
	 * <button onclick={() => exporter.exportSVG()}>SVG</button>
	 * <button onclick={() => exporter.exportPNG()}>PNG</button>
	 */
	type Props = {
		children?: Snippet
		filename?: string
		scale?: number
	}

	let {
		children,
		filename = 'chart',
		scale = 2
	}: Props = $props()

	let containerEl = $state<HTMLDivElement | null>(null)

	function getSvgEl(): SVGSVGElement | null {
		return containerEl?.querySelector('svg') ?? null
	}

	/**
	 * Inline all computed CSS custom property values into the SVG for portability.
	 */
	// eslint-disable-next-line complexity
	function inlineStyles(svg: SVGSVGElement): SVGSVGElement {
		const clone = svg.cloneNode(true) as SVGSVGElement
		const computed = getComputedStyle(svg)

		// Copy relevant CSS custom properties to inline styles on the root
		const props = ['color', 'font-family', 'font-size']
		for (const prop of props) {
			clone.style.setProperty(prop, computed.getPropertyValue(prop))
		}

		// Resolve CSS variable references in fill/stroke attributes
		const elements = clone.querySelectorAll('[fill],[stroke]')
		for (const el of elements) {
			for (const attr of ['fill', 'stroke']) {
				const val = el.getAttribute(attr)
				if (val?.startsWith('var(')) {
					const computedVal = getComputedStyle(
						svg.querySelector(`[${attr}="${val}"]`) ?? svg
					).getPropertyValue(attr)
					el.setAttribute(attr, computedVal || val)
				}
			}
		}

		return clone
	}

	/**
	 * Export the chart as an SVG file download.
	 */
	export function exportSVG() {
		const svg = getSvgEl()
		if (!svg) return

		const clone = inlineStyles(svg)
		const serializer = new XMLSerializer()
		const svgString = serializer.serializeToString(clone)
		const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
		download(blob, `${filename}.svg`)
	}

	/**
	 * Export the chart as a PNG file download.
	 * @param scaleFactor Override scale factor for this export
	 */
	export function exportPNG(scaleFactor?: number) {
		const svg = getSvgEl()
		if (!svg) return

		const factor = scaleFactor ?? scale
		const clone = inlineStyles(svg)
		const serializer = new XMLSerializer()
		const svgString = serializer.serializeToString(clone)
		const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
		const url = URL.createObjectURL(svgBlob)
		const img = new Image()

		img.onload = () => {
			const canvas = document.createElement('canvas')
			canvas.width = svg.clientWidth * factor
			canvas.height = svg.clientHeight * factor
			const ctx = canvas.getContext('2d')
			if (!ctx) return
			ctx.scale(factor, factor)
			ctx.drawImage(img, 0, 0)
			URL.revokeObjectURL(url)

			canvas.toBlob((blob) => {
				if (blob) download(blob, `${filename}.png`)
			}, 'image/png')
		}
		img.src = url
	}

	function download(blob: Blob, name: string) {
		const a = document.createElement('a')
		a.href = URL.createObjectURL(blob)
		a.download = name
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(a.href)
	}
</script>

<div bind:this={containerEl} class="chart-exporter" data-chart-exporter>
	{@render children?.()}
</div>

<style>
	.chart-exporter {
		display: contents;
	}
</style>
