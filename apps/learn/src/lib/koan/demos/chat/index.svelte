<script lang="ts">
	import { ChatMessage, ChatComposer, ChatHistory, ChatShell } from '@rokkit/ui'
	import type { ChatMessage as ChatMessageData, ConversationSummary } from '@rokkit/ui'

	// Static demo conversation. One assistant turn carries a {kind:'chart'}
	// payload on `data` — the consumer-supplied `message` snippet below switches
	// on it to render a placeholder box, proving the dumb-component seam without
	// importing @rokkit/chart.
	let messages = $state<ChatMessageData[]>([
		{
			id: 'm1',
			role: 'user',
			text: 'Can you show me last quarter’s revenue?',
			timestamp: new Date(Date.now() - 6 * 60_000).toISOString()
		},
		{
			id: 'm2',
			role: 'assistant',
			text: 'Sure — here’s the **Q3 revenue** trend. It’s up ~12% over Q2, driven by the EU region.',
			timestamp: new Date(Date.now() - 5 * 60_000).toISOString(),
			data: { kind: 'chart', spec: 'line', title: 'Q3 revenue' }
		},
		{
			id: 'm3',
			role: 'user',
			text: 'Nice. What drove the EU jump?',
			timestamp: new Date(Date.now() - 4 * 60_000).toISOString()
		},
		{
			id: 'm4',
			role: 'assistant',
			text: 'Mostly the new self-serve tier. Markdown bodies render via the built-in `ChatMessage` body.',
			timestamp: new Date(Date.now() - 3 * 60_000).toISOString()
		}
	])

	const conversations: ConversationSummary[] = [
		{ id: 'c1', title: 'Q3 revenue review', timestamp: new Date(Date.now() - 3 * 60_000).toISOString() },
		{ id: 'c2', title: 'Onboarding funnel', timestamp: new Date(Date.now() - 26 * 60 * 60_000).toISOString() }
	]
	let activeConversationId = $state<string | null>('c1')

	let value = $state('')

	// Local-only submit: append the user turn + a canned assistant reply. No LLM,
	// no network — the chat components stay presentation-only; the app owns state.
	function handleSubmit(text: string) {
		const trimmed = text.trim()
		if (!trimmed) return
		messages.push({
			id: crypto.randomUUID(),
			role: 'user',
			text: trimmed,
			timestamp: new Date().toISOString()
		})
		value = ''
		messages.push({
			id: crypto.randomUUID(),
			role: 'assistant',
			text: 'This is a canned reply — wire `onsubmit` to your backend to make it real.',
			timestamp: new Date().toISOString()
		})
	}

	function selectConversation(id: string) {
		activeConversationId = id
	}

	function newConversation() {
		activeConversationId = null
	}

	// Standalone-primitives sample data.
	const sampleUser: ChatMessageData = { id: 's1', role: 'user', text: 'How do I theme this?' }
	const sampleAssistant: ChatMessageData = {
		id: 's2',
		role: 'assistant',
		text: 'Style cascades from `data-style` on the shell — no `variant` prop.'
	}
	const sampleConversations: ConversationSummary[] = [
		{ id: 'p1', title: 'Theming questions' },
		{ id: 'p2', title: 'Keyboard navigation' }
	]
	let primitiveValue = $state('')
</script>

<div class="chat-demo">
	<section>
		<header>Primitives — standalone</header>
		<div class="primitives">
			<div class="primitive-block">
				<span class="primitive-label">ChatMessage</span>
				<ChatMessage message={sampleUser} />
				<ChatMessage message={sampleAssistant} />
			</div>
			<div class="primitive-block">
				<span class="primitive-label">ChatComposer</span>
				<ChatComposer bind:value={primitiveValue} placeholder="Ask Rokkit something…" />
			</div>
			<div class="primitive-block">
				<span class="primitive-label">ChatHistory</span>
				<ChatHistory conversations={sampleConversations} activeId="p1" />
			</div>
		</div>
	</section>

	<section>
		<header>Composed — ChatShell with a rich-message seam</header>
		<div class="shell-frame">
			<ChatShell
				{messages}
				{conversations}
				{activeConversationId}
				bind:value
				placeholder="Reply to Rokkit…"
				onsubmit={handleSubmit}
				onselectConversation={selectConversation}
				onnew={newConversation}
			>
				{#snippet message(msg)}
					{#if msg.data && (msg.data as { kind?: string }).kind === 'chart'}
						<div data-chat-message data-role={msg.role}>
							<div data-chat-bubble>
								{#if msg.text}<p class="rich-caption">{msg.text}</p>{/if}
								<div class="chart-placeholder">📊 chart renders here</div>
							</div>
						</div>
					{:else}
						<ChatMessage message={msg} />
					{/if}
				{/snippet}
			</ChatShell>
		</div>
	</section>
</div>

<style>
	.chat-demo {
		display: flex;
		flex-direction: column;
		gap: 22px;
	}

	section {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	header {
		font: 500 11px var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-soft);
	}

	.primitives {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
	}

	.primitive-block {
		flex: 1 1 240px;
		min-width: 220px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 12px;
		border: 1px solid var(--paper-edge);
		border-radius: 10px;
		background: var(--paper-faint);
	}

	.primitive-label {
		font: 600 11px var(--font-mono);
		color: var(--ink-mute);
	}

	.shell-frame {
		height: 460px;
		border: 1px solid var(--paper-edge);
		border-radius: 10px;
		overflow: hidden;
	}

	.shell-frame :global([data-chat-shell]) {
		height: 100%;
	}

	.rich-caption {
		margin: 0 0 8px;
		font: 400 13px/1.5 var(--font-ui);
		color: var(--ink);
	}

	.chart-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 140px;
		border: 1px dashed var(--accent);
		border-radius: 8px;
		background: color-mix(in oklch, var(--accent) 8%, var(--paper));
		font: 500 14px var(--font-ui);
		color: var(--ink-soft);
	}
</style>
