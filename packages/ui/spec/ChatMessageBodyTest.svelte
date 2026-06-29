<script lang="ts">
	import ChatMessage from '../src/components/ChatMessage.svelte'
	const { message }: { message: unknown } = $props()
</script>

<ChatMessage {message}>
	{#snippet body(m)}<div data-custom-body>custom: {m.text}</div>{/snippet}
</ChatMessage>
