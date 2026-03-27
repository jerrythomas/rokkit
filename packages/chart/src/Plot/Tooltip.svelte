<script>
	import { getContext } from 'svelte'

	/** @type {{ tooltip?: boolean | ((data: Record<string, unknown>) => string) }} */
	let { tooltip = true } = $props()

	const plotState = getContext('plot-state')

	let mouseX = $state(0)
	let mouseY = $state(0)

	$effect(() => {
		function onMove(e) {
			mouseX = e.clientX
			mouseY = e.clientY
		}
		window.addEventListener('mousemove', onMove)
		return () => window.removeEventListener('mousemove', onMove)
	})

	const hovered = $derived(plotState.hovered)
	const mode = $derived(plotState.mode)

	function formatDefault(data) {
		return Object.entries(data)
			.filter(([, v]) => v !== undefined && v !== null)
			.map(
				([k, v]) =>
					`<div class="tt-row"><span class="tt-key">${k}</span><span class="tt-val">${v}</span></div>`
			)
			.join('')
	}

	const content = $derived.by(() => {
		if (!hovered) return ''
		if (typeof tooltip === 'function') return String(tooltip(hovered) ?? '')
		return formatDefault(hovered)
	})
</script>

{#if hovered && content}
	<div
		class="plot-tooltip"
		data-mode={mode}
		style:left="{mouseX + 14}px"
		style:top="{mouseY - 8}px"
	>
		{@html content}
	</div>
{/if}

<style>
	.plot-tooltip {
		position: fixed;
		pointer-events: none;
		z-index: 1000;
		padding: 8px 10px;
		border-radius: 6px;
		font-size: 12px;
		line-height: 1.5;
		white-space: nowrap;
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.12);
		background: #ffffff;
		border: 1px solid #e2e8f0;
		color: #1e293b;
	}

	.plot-tooltip[data-mode='dark'] {
		background: #1e293b;
		border-color: #334155;
		color: #f1f5f9;
	}

	:global(.tt-row) {
		display: flex;
		gap: 10px;
		justify-content: space-between;
	}

	:global(.tt-key) {
		opacity: 0.65;
	}

	:global(.tt-val) {
		font-weight: 600;
	}
</style>
