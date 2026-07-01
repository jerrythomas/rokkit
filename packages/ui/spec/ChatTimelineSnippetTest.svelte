<script lang="ts">
	import ChatTimeline from '../src/components/ChatTimeline.svelte'
	import type { ChatMessage } from '../src/types/chat.js'
	const { messages = [] }: { messages?: ChatMessage[] } = $props()
</script>

<ChatTimeline {messages}>
	{#snippet message(m)}<div data-custom-msg data-id={m.id}>{m.role}:{m.text}</div>{/snippet}
</ChatTimeline>
