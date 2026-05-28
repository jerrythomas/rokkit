<script lang="ts">
	import type { Snippet } from 'svelte'
	import { onMount } from 'svelte'
	import { highlightCode } from '../utils/shiki.js'
	import Frame from './Frame.svelte'

	/**
	 * CodeBlock — code with chrome.
	 *
	 * Wraps a Shiki-highlighted code body in a Frame whose header carries
	 * the filename + language chip + optional action buttons (copy /
	 * download). Adding the chrome on top of the same Frame primitive
	 * the rest of the app uses keeps the visual rhythm consistent.
	 *
	 * Action buttons are opt-in: dev surfaces enable them per instance,
	 * end-user surfaces default to plain.
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

	// Store Shiki output in $state. Using a $derived Promise here would have
	// {#await} reset to pending on every reactivity tick (each $derived call
	// produces a new Promise reference). Fall back to a plain <pre> while
	// Shiki initialises and on error.
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

	const hasHeader = $derived(Boolean(filename || language || allowCopy || allowDownload || actions))

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
	<Frame flush>
		{#snippet header()}
			{#if hasHeader}
				<div data-code-block-header>
					<div data-code-block-title>
						<span data-code-block-icon class="view-code" aria-hidden="true"></span>
						{#if filename}<span data-code-block-filename>{filename}</span>{/if}
						{#if language}<span data-code-block-lang>{language}</span>{/if}
					</div>
					{#if allowCopy || allowDownload || actions}
						<div data-code-block-actions>
							{#if allowCopy}
								<button type="button" onclick={copyCode} title="Copy code">
									<span class={copied ? 'action-check' : 'action-copy'} aria-hidden="true"></span>
									<span>{copied ? 'Copied' : 'Copy'}</span>
								</button>
							{/if}
							{#if allowDownload}
								<button type="button" onclick={downloadCode} title="Download as file">
									<span class="action-download" aria-hidden="true"></span>
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
		{/snippet}

		{#if highlighted}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<div data-code-block-body>{@html highlighted}</div>
		{:else}
			<pre data-code-block-body><code>{code}</code></pre>
		{/if}
	</Frame>
</div>
