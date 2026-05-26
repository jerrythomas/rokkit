<script lang="ts">
	import type { Snippet } from 'svelte'
	import { onMount } from 'svelte'
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
		/**
		 * Shiki theme. 'auto' (default) follows body[data-mode]; pass 'light'
		 * or 'dark' to force one.
		 */
		theme?: 'auto' | 'light' | 'dark'
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
		theme = 'auto',
		allowCopy = false,
		allowDownload = false,
		actions
	}: Props = $props()

	// Track body data-mode so the Shiki theme follows light/dark changes.
	let bodyMode = $state<'light' | 'dark'>('dark')
	onMount(() => {
		const sync = () => {
			const m = document.body?.dataset.mode
			bodyMode = m === 'light' ? 'light' : 'dark'
		}
		sync()
		const observer = new MutationObserver(sync)
		observer.observe(document.body, { attributes: true, attributeFilter: ['data-mode'] })
		return () => observer.disconnect()
	})
	const effectiveTheme = $derived(theme === 'auto' ? bodyMode : theme)

	// Resolve Shiki output into reactive state. Using a $derived Promise here
	// would have {#await} reset to pending on every reactivity tick (the
	// $derived produces a *new* promise object each time), so we store the
	// resolved HTML in $state and let the template branch on whether it's
	// populated. The plain <pre><code>…</code></pre> fallback shows while
	// Shiki initialises and on the rare error.
	let highlighted = $state<string | null>(null)
	$effect(() => {
		const c = code
		const l = language
		const t = effectiveTheme
		let cancelled = false
		highlightCode(c, { lang: l, theme: t })
			.then((html) => {
				if (!cancelled) highlighted = html
			})
			.catch(() => {
				if (!cancelled) highlighted = null
			})
		return () => { cancelled = true }
	})

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
	{#if highlighted}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		<div data-code-block-body>{@html highlighted}</div>
	{:else}
		<pre data-code-block-body><code>{code}</code></pre>
	{/if}
</div>

<!--
	No <style> block: chrome styling lives in @rokkit/themes/base/code-block.css
	so themes can layer on top via attribute selectors
	([data-code-block-*]). Add zen-sumi / material / etc. specific
	overrides in their respective theme files.
-->

