<script>
	import { getContext, onMount, onDestroy } from 'svelte'

	let {
		x = undefined,
		y = undefined,
		color = undefined,
		fill: fillProp = undefined,
		stat = 'identity',
		options = {}
	} = $props()

	const sourceField = $derived(options.source ?? 'source')
	const targetField = $derived(options.target ?? 'target')
	const valueField = $derived(options.value ?? 'value')
	const colorChannel = $derived(fillProp ?? color)

	const plotState = getContext('plot-state')
	let id = $state(null)

	onMount(() => {
		id = plotState.registerGeom({
			type: 'ribbon',
			channels: { x, y, color: colorChannel },
			stat
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id)
			plotState.updateGeom(id, {
				channels: { x, y, color: colorChannel },
				stat
			})
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const colors = $derived(plotState.colors)
	const innerHeight = $derived(plotState.innerHeight)
	const innerWidth = $derived(plotState.innerWidth)

	// Compute Sankey-style layout
	const ribbons = $derived.by(() => {
		if (!data?.length) return { links: [], sourceNodes: [], targetNodes: [] }

		// Aggregate flows
		const flows = data.map((d) => ({
			source: String(d[sourceField]),
			target: String(d[targetField]),
			value: Number(d[valueField]) || 0,
			data: d
		}))

		// Compute node positions
		const sourceMap = new Map()
		const targetMap = new Map()
		for (const f of flows) {
			sourceMap.set(f.source, (sourceMap.get(f.source) ?? 0) + f.value)
			targetMap.set(f.target, (targetMap.get(f.target) ?? 0) + f.value)
		}

		const totalSource = Math.max(1, [...sourceMap.values()].reduce((s, v) => s + v, 0))
		const totalTarget = Math.max(1, [...targetMap.values()].reduce((s, v) => s + v, 0))
		const padding = 4
		const availHeight = innerHeight - padding * (Math.max(sourceMap.size, targetMap.size) - 1)

		// Position source nodes on left
		let sourceY = 0
		const sourceNodes = []
		for (const [name, value] of sourceMap) {
			const h = (value / totalSource) * availHeight
			sourceNodes.push({ name, y: sourceY, height: h })
			sourceY += h + padding
		}

		// Position target nodes on right
		let targetY = 0
		const targetNodes = []
		for (const [name, value] of targetMap) {
			const h = (value / totalTarget) * availHeight
			targetNodes.push({ name, y: targetY, height: h })
			targetY += h + padding
		}

		// Build ribbon paths
		const sourceOffsets = new Map(sourceNodes.map((n) => [n.name, n.y]))
		const targetOffsets = new Map(targetNodes.map((n) => [n.name, n.y]))
		const x0 = 0
		const x1 = innerWidth

		const links = flows.map((f, i) => {
			const sy0 = sourceOffsets.get(f.source) ?? 0
			const ty0 = targetOffsets.get(f.target) ?? 0
			const sourceTotal = sourceMap.get(f.source) ?? 1
			const targetTotal = targetMap.get(f.target) ?? 1
			const sh = (f.value / sourceTotal) * (sourceNodes.find((n) => n.name === f.source)?.height ?? 0)
			const th = (f.value / targetTotal) * (targetNodes.find((n) => n.name === f.target)?.height ?? 0)

			const path = `M${x0},${sy0} C${innerWidth * 0.4},${sy0} ${innerWidth * 0.6},${ty0} ${x1},${ty0} L${x1},${ty0 + th} C${innerWidth * 0.6},${ty0 + th} ${innerWidth * 0.4},${sy0 + sh} ${x0},${sy0 + sh} Z`

			// Update offsets for stacking
			sourceOffsets.set(f.source, sy0 + sh)
			targetOffsets.set(f.target, ty0 + th)

			const fillColor = colors?.get(f.source)?.fill ?? colors?.get(f.target)?.fill ?? '#888'

			return {
				key: `ribbon-${i}`,
				d: path,
				fill: fillColor,
				data: f.data
			}
		})

		return { links, sourceNodes, targetNodes }
	})
</script>

{#if ribbons.links.length > 0}
	<g data-plot-geom="ribbon">
		{#each ribbons.links as link (link.key)}
			<path
				d={link.d}
				fill={link.fill}
				opacity="0.5"
				data-plot-element="ribbon"
				onmouseenter={() => plotState.setHovered(link.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{link.data[sourceField]} → {link.data[targetField]}: {link.data[valueField]}</title>
			</path>
		{/each}
		<!-- Source node labels -->
		{#each ribbons.sourceNodes as node (node.name)}
			<text
				x="-4"
				y={node.y + node.height / 2}
				text-anchor="end"
				dominant-baseline="middle"
				font-size="11"
				fill="currentColor"
				data-plot-element="node-label"
			>{node.name}</text>
		{/each}
		<!-- Target node labels -->
		{#each ribbons.targetNodes as node (node.name)}
			<text
				x={innerWidth + 4}
				y={node.y + node.height / 2}
				text-anchor="start"
				dominant-baseline="middle"
				font-size="11"
				fill="currentColor"
				data-plot-element="node-label"
			>{node.name}</text>
		{/each}
	</g>
{/if}
