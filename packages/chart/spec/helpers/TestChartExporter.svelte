<script>
	import ChartExporter from '../../src/ChartExporter.svelte'

	let exporter = $state(null)
	let exporterRef = $state(null)

	export function callExportSVG() {
		exporter?.exportSVG()
	}

	export function callExportPNG(scale) {
		exporter?.exportPNG(scale)
	}

	export function getRef() {
		return exporter
	}
</script>

<ChartExporter bind:this={exporter}>
	<svg width="200" height="150" data-test-svg>
		<rect x="10" y="10" width="50" height="40" fill="steelblue" />
		<rect x="70" y="20" width="50" height="30" fill="tomato" />
	</svg>
</ChartExporter>
