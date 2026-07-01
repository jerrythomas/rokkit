<script lang="ts">
	import ChatTimeline from './ChatTimeline.svelte'
	import ChatComposer from './ChatComposer.svelte'
	import ChatHistory from './ChatHistory.svelte'
	import type { ChatShellProps } from '../types/chat.js'

	let {
		messages = [],
		conversations,
		activeConversationId = null,
		value = $bindable(''),
		placeholder,
		busy = false,
		onsubmit,
		onchange,
		onselectConversation,
		onnew,
		message,
		suggestions,
		toolbar,
		leading,
		historyItem,
		empty
	}: ChatShellProps = $props()
</script>

<div data-chat-shell data-has-history={conversations ? '' : undefined}>
	{#if conversations}
		<ChatHistory
			{conversations}
			activeId={activeConversationId}
			onselect={onselectConversation}
			{onnew}
			item={historyItem}
		/>
	{/if}
	<div data-chat-main>
		<ChatTimeline {messages} {message} {empty} />
		<ChatComposer bind:value {placeholder} {busy} {onsubmit} {onchange} {suggestions} {toolbar} {leading} />
	</div>
</div>
