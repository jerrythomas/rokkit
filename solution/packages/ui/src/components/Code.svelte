<script lang="ts">
	import type { CodeProps, CodeStateIcons } from '../types/index.js'
	import { defaultCodeStateIcons } from '../types/code.js'
	import { highlightCode } from '../utils/shiki.js'

	const {
		code,
		language = 'text',
		theme = 'dark',
		showLineNumbers = false,
		showCopyButton = true,
		icons: userIcons,
		class: className = ''
	}: CodeProps = $props()

	// Merge icons with defaults
	const icons = $derived<CodeStateIcons>({ ...defaultCodeStateIcons, ...userIcons })

	let copied = $state(false)
	let highlightedCode = $derived(highlightCode(code, { lang: language, theme }))

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(code)
			copied = true
			setTimeout(() => {
				copied = false
			}, 2000)
		} catch {
			// Fallback for older browsers
			const textarea = document.createElement('textarea')
			textarea.value = code
			textarea.style.position = 'fixed'
			textarea.style.opacity = '0'
			document.body.appendChild(textarea)
			textarea.select()
			document.execCommand('copy')
			document.body.removeChild(textarea)
			copied = true
			setTimeout(() => {
				copied = false
			}, 2000)
		}
	}
</script>

<div
	class="code-block {className}"
	class:show-line-numbers={showLineNumbers}
	data-language={language}
	data-theme={theme}
>
	{#if showCopyButton}
		<button
			type="button"
			class="copy-button"
			onclick={copyToClipboard}
			aria-label={copied ? 'Copied!' : 'Copy code'}
		>
			{#if copied}
				<span class="copy-icon {icons.copysuccess}"></span>
			{:else}
				<span class="copy-icon {icons.copy}"></span>
			{/if}
		</button>
	{/if}

	{#await highlightedCode}
		<div class="code-loading">
			<pre><code>{code}</code></pre>
		</div>
	{:then html}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	{:catch error}
		<div class="code-error">
			<pre><code>{code}</code></pre>
			<p class="error-message">Highlighting failed: {error.message}</p>
		</div>
	{/await}
</div>

<style>
	.code-block {
		position: relative;
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.code-block :global(pre) {
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
		font-family: 'Victor Mono', ui-monospace, monospace;
		font-size: 0.875rem;
		line-height: 1.6;
		tab-size: 2;
	}

	.code-block :global(code) {
		font-family: inherit;
	}

	/* Line numbers */
	.code-block.show-line-numbers :global(pre) {
		padding-left: 3.5rem;
	}

	.code-block.show-line-numbers :global(.line::before) {
		content: counter(line);
		counter-increment: line;
		display: inline-block;
		width: 2rem;
		margin-left: -3rem;
		margin-right: 1rem;
		text-align: right;
		color: var(--code-line-number-color, hsl(220 10% 40%));
		user-select: none;
	}

	.code-block.show-line-numbers :global(pre) {
		counter-reset: line;
	}

	/* Copy button */
	.copy-button {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		padding: 0.375rem;
		background: var(--code-copy-bg, hsla(220, 15%, 25%, 0.8));
		border: 1px solid var(--code-copy-border, hsl(220 15% 35%));
		border-radius: 0.375rem;
		color: var(--code-copy-color, hsl(220 10% 70%));
		cursor: pointer;
		opacity: 0;
		transition:
			opacity 0.15s ease,
			background-color 0.15s ease;
		z-index: 10;
	}

	.code-block:hover .copy-button,
	.copy-button:focus {
		opacity: 1;
	}

	.copy-button:hover {
		background: var(--code-copy-bg-hover, hsla(220, 15%, 30%, 0.9));
		color: var(--code-copy-color-hover, hsl(220 10% 90%));
	}

	.copy-icon {
		display: block;
		width: 1rem;
		height: 1rem;
	}

	/* Loading state */
	.code-loading {
		background: var(--code-bg, hsl(220 15% 13%));
	}

	.code-loading pre {
		color: var(--code-color, hsl(220 10% 60%));
	}

	/* Error state */
	.code-error {
		background: var(--code-bg, hsl(220 15% 13%));
	}

	.code-error pre {
		color: var(--code-color, hsl(220 10% 70%));
	}

	.error-message {
		padding: 0.5rem 1rem;
		margin: 0;
		font-size: 0.75rem;
		color: var(--code-error-color, hsl(0 70% 60%));
		background: var(--code-error-bg, hsla(0, 70%, 30%, 0.2));
		border-top: 1px solid var(--code-error-border, hsl(0 70% 40%));
	}
</style>
