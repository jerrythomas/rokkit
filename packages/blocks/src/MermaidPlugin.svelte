<script lang="ts">
	import { onMount } from 'svelte'
	import DOMPurify from 'isomorphic-dompurify'

	let { code }: { code: string } = $props()
	let svgHtml = $state<string | null>(null)
	let error = $state<string | null>(null)

	onMount(async () => {
		try {
			const { default: mermaid } = await import('mermaid')
			mermaid.initialize({ startOnLoad: false, theme: 'default' })
			const id = `mermaid-${Math.random().toString(36).slice(2)}`
			const { svg } = await mermaid.render(id, code)
			svgHtml = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true } })
		} catch (e) {
			error = e instanceof Error ? e.message : 'Mermaid render failed'
		}
	})
</script>

{#if error}
	<div data-block-error class="block-error">
		<span>Mermaid error: {error}</span>
		<details>
			<summary>Raw</summary>
			<pre>{code}</pre>
		</details>
	</div>
{:else}
	<div class="mermaid-block" data-mermaid-block>
		{#if svgHtml}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html svgHtml}
		{/if}
	</div>
{/if}
