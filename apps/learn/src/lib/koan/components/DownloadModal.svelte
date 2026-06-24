<script lang="ts">
	import { Tabs, Button } from '@rokkit/ui'
	import type { SavedTheme } from '../types'

	let {
		open = $bindable(false),
		theme
	}: {
		open?: boolean
		theme: SavedTheme
	} = $props()

	let format = $state<'config' | 'css'>('config')

	function configSnippet(t: SavedTheme): string {
		return `// rokkit.config.js
export default {
  name: '${t.name}',
  preset: '${t.preset}',
  mode: '${t.mode}',
  density: '${t.density}',
  shape: { radius: '${t.roundedness}' }
}
`
	}

	function cssSnippet(t: SavedTheme): string {
		return `:root[data-radius="${t.roundedness}"][data-density="${t.density}"][data-mode="${t.mode}"] {
  /* theme: ${t.name} (preset: ${t.preset}) */
}
`
	}

	const content = $derived(format === 'config' ? configSnippet(theme) : cssSnippet(theme))

	async function copy() {
		await navigator.clipboard.writeText(content)
	}

	function download() {
		const blob = new Blob([content], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}.${format === 'config' ? 'rokkit.config.js' : 'theme.css'}`
		a.click()
		URL.revokeObjectURL(url)
	}

	const tabOptions = [
		{ id: 'config', label: 'rokkit.config.js' },
		{ id: 'css',    label: 'CSS variables' }
	]

	let dialogEl = $state<HTMLDialogElement | null>(null)

	$effect(() => {
		if (!dialogEl) return
		if (open) {
			dialogEl.showModal()
		} else {
			dialogEl.close()
		}
	})

	function onDialogClose() {
		open = false
	}

	function onBackdropClick(e: MouseEvent) {
		if (e.target === dialogEl) {
			open = false
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	bind:this={dialogEl}
	onclose={onDialogClose}
	onclick={onBackdropClick}
	class="download-dialog"
>
	<div class="download">
		<h2>Download "{theme.name}"</h2>
		<Tabs
			options={tabOptions}
			bind:value={format}
			fields={{ value: 'id', label: 'label' }}
		>
			{#snippet tabPanel()}
				<pre><code>{content}</code></pre>
			{/snippet}
		</Tabs>
		<div class="actions">
			<Button label="Copy" onclick={copy} />
			<Button label="Download file" onclick={download} />
			<Button label="Close" style="outline" onclick={() => (open = false)} />
		</div>
	</div>
</dialog>

<style>
	.download-dialog {
		padding: 0;
		border: none;
		border-radius: var(--radius-md, 6px);
		@apply bg-paper;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
	}
	.download-dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
	}
	.download {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 480px;
		padding: 24px;
	}
	.download h2 {
		@apply text-ink-mute;
		margin: 0;
	}
	pre {
		@apply bg-paper-soft border border-paper-mute text-ink-mute;
		padding: 12px;
		border-radius: var(--radius-sm, 4px);
		overflow-x: auto;
		font-size: 12px;
	}
	.actions {
		display: flex;
		gap: 8px;
		justify-content: flex-end;
	}
</style>
