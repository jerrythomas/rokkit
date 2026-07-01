<script lang="ts">
	import type { ChatComposerProps } from '../types/chat.js'

	let {
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		busy = false,
		onsubmit,
		onchange,
		suggestions,
		toolbar,
		leading
	}: ChatComposerProps = $props()

	let textarea: HTMLTextAreaElement

	export function focus() {
		textarea?.focus()
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (!disabled && !busy && value.trim()) onsubmit?.(value)
		}
	}

	function handleInput() {
		onchange?.(value)
	}
</script>

<div data-chat-composer data-busy={busy || undefined}>
	{#if leading}{@render leading()}{/if}
	{#if suggestions}{@render suggestions()}{/if}
	<textarea
		bind:this={textarea}
		bind:value
		{placeholder}
		{disabled}
		rows="2"
		data-chat-input
		oninput={handleInput}
		onkeydown={handleKeydown}
	></textarea>
	{#if toolbar}{@render toolbar()}{/if}
</div>
