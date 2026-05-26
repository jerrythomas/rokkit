<script lang="ts">
	import type { Snippet } from 'svelte'
	import { highlightCode } from '../utils/shiki.js'

	/**
	 * CodeBlock — code with chrome.
	 *
	 * Header: optional filename + language chip + optional action buttons
	 * (copy / download). Body: shiki-highlighted code. All action buttons
	 * are opt-in (default false) so end-user-facing surfaces stay clean;
	 * dev-facing surfaces enable them per instance.
	 *
	 * For a plain unstyled code surface (no chrome), use the lower-level
	 * `<Code/>` component instead.
	 */
	interface Props {
		/** The code body */
		code: string
		/** Language label shown as a chip in the header and used for highlighting */
		language?: string
		/** Filename label shown in the header */
		filename?: string
		/** Max height (CSS length) of the scrollable code area. No cap if unset. */
		height?: string
		/** Shiki theme (light/dark). */
		theme?: 'light' | 'dark'
		/** Show the copy-to-clipboard button. Default: false. */
		allowCopy?: boolean
		/** Show the download-as-file button. Default: false. */
		allowDownload?: boolean
		/** Optional extra-actions slot rendered after copy/download. */
		actions?: Snippet
	}

	const {
		code,
		language = 'text',
		filename = '',
		height,
		theme = 'dark',
		allowCopy = false,
		allowDownload = false,
		actions
	}: Props = $props()

	const hasActions = $derived(allowCopy || allowDownload || actions !== undefined)

	let copied = $state(false)
	async function copyCode() {
		try {
			await navigator.clipboard.writeText(code)
			copied = true
			setTimeout(() => (copied = false), 1500)
		} catch {
			// Silent fail — clipboard API may require https or user gesture
		}
	}

	function downloadCode() {
		const blob = new Blob([code], { type: 'text/plain' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = filename || `code.${language || 'txt'}`
		a.click()
		URL.revokeObjectURL(url)
	}

	const highlighted = $derived(highlightCode(code, { lang: language, theme }))
</script>

<div data-code-block style:max-height={height || undefined}>
	{#if filename || language || hasActions}
		<div data-code-block-header>
			<div data-code-block-title>
				<span data-code-block-icon class="i-mdi:code-tags" aria-hidden="true"></span>
				{#if filename}<span data-code-block-filename>{filename}</span>{/if}
				{#if language}<span data-code-block-lang>{language}</span>{/if}
			</div>
			{#if hasActions}
				<div data-code-block-actions>
					{#if allowCopy}
						<button type="button" onclick={copyCode} title="Copy code">
							<span class={copied ? 'i-mdi:check' : 'i-mdi:content-copy'} aria-hidden="true"></span>
							<span>{copied ? 'Copied' : 'Copy'}</span>
						</button>
					{/if}
					{#if allowDownload}
						<button type="button" onclick={downloadCode} title="Download as file">
							<span class="i-mdi:download" aria-hidden="true"></span>
							<span>.{language || 'txt'}</span>
						</button>
					{/if}
					{#if actions}
						{@render actions()}
					{/if}
				</div>
			{/if}
		</div>
	{/if}
	{#await highlighted}
		<pre data-code-block-body><code>{code}</code></pre>
	{:then html}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div data-code-block-body>{@html html}</div>
	{:catch}
		<pre data-code-block-body><code>{code}</code></pre>
	{/await}
</div>

<style>
	[data-code-block] {
		position: relative;
		border-radius: 0.5rem;
		overflow: hidden;
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
	}

	[data-code-block-header] {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 6px 10px;
		border-bottom: 1px solid var(--paper-edge);
		background: var(--paper);
	}

	[data-code-block-title] {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font: 500 11.5px var(--font-mono);
		color: var(--ink-mute);
	}

	[data-code-block-icon] {
		display: inline-block;
		width: 14px;
		height: 14px;
	}

	[data-code-block-filename] {
		color: var(--ink);
	}

	[data-code-block-lang] {
		padding: 1px 6px;
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		border-radius: 3px;
		color: var(--ink-mute);
		font-size: 10.5px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	[data-code-block-actions] {
		display: inline-flex;
		gap: 4px;
	}

	[data-code-block-actions] button {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		height: 24px;
		padding: 0 8px;
		border: 1px solid transparent;
		border-radius: 4px;
		background: transparent;
		color: var(--ink-mute);
		font: 500 11.5px var(--font-ui);
		cursor: pointer;
	}

	[data-code-block-actions] button:hover {
		background: var(--paper-soft);
		border-color: var(--paper-edge);
		color: var(--ink);
	}

	[data-code-block-actions] button > span:first-child {
		width: 14px;
		height: 14px;
	}

	[data-code-block-body] {
		overflow: auto;
	}

	[data-code-block-body] :global(pre) {
		margin: 0;
		padding: 10px 12px;
		overflow-x: auto;
		font-family: var(--font-mono);
		font-size: 12px;
		line-height: 1.55;
		tab-size: 2;
	}

	[data-code-block-body] :global(code) {
		font-family: inherit;
	}
</style>
