<script lang="ts">
	import type { Snippet } from 'svelte'

	interface ChatComposerProps {
		/** Placeholder text in the textarea */
		placeholder?: string
		/** Bindable input value */
		value?: string
		/** When true, send button shows a spinner instead of the send icon */
		running?: boolean
		/** Right-aligned hint text, e.g. "⌘ ↵ to send". Defaults to that string. */
		hint?: string
		/** Use accent color for the send button instead of ink */
		accent?: boolean
		/** Fires on Cmd/Ctrl+Enter or send-button click with the current value */
		onsubmit?: (value: string) => void
		/** Snippet for left-side action buttons (e.g. attach, voice, commands) */
		leftActions?: Snippet
		/** Snippet for additional right-side controls before the send button */
		rightActions?: Snippet
	}

	let {
		placeholder = 'Ask anything…',
		value = $bindable(''),
		running = false,
		hint,
		accent = false,
		onsubmit,
		leftActions,
		rightActions
	}: ChatComposerProps = $props()

	function send() {
		if (running || !value.trim()) return
		onsubmit?.(value)
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			e.preventDefault()
			send()
		}
	}
</script>

<div data-koanchat-composer data-composer-state={running ? 'running' : 'idle'}>
	<div data-koanchat-composer-inner>
		<textarea
			rows="1"
			{placeholder}
			bind:value
			onkeydown={handleKey}
		></textarea>
		<div data-koanchat-composer-controls>
			<div data-koanchat-composer-left>
				{#if leftActions}
					{@render leftActions()}
				{/if}
			</div>
			<div data-koanchat-composer-right>
				{#if rightActions}
					{@render rightActions()}
				{/if}
				<span data-koanchat-composer-hint>
					{#if hint}
						{hint}
					{:else}
						<kbd>⌘</kbd>
						<kbd>↵</kbd>
						to send
					{/if}
				</span>
				<button
					type="button"
					data-koanchat-composer-send
					data-accent={accent ? '' : undefined}
					title="Send"
					disabled={!value.trim() || running}
					onclick={send}
					aria-label="Send"
				>
					{#if running}
						<span data-koanchat-composer-spinner></span>
					{:else}
						<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
							<path d="M2 8 L14 2 L10 14 L8 9 L2 8 Z"/>
						</svg>
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>
