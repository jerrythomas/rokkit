<script lang="ts">
	import { tick } from 'svelte'
	import { ChatChrome, ChatComposer, ChatStream, ChatMessage } from '$lib/chat'
	import RokkitWordmark from '$lib/components/RokkitWordmark.svelte'
	import { conversation, submitQuery, resetConversation } from '$lib/chat-demo/store.svelte'
	import BlockList from '$lib/chat-demo/components/BlockList.svelte'

	let composerValue = $state('')
	let streamRef = $state<HTMLElement | null>(null)

	const seedSuggestions = [
		{ label: 'Quarterly revenue chart', query: 'Show me a chart of quarterly revenue' },
		{ label: 'Products table', query: 'Show me a sortable table of products' },
		{ label: 'Sign-up form', query: 'Render a sign-up form from a schema' },
		{ label: 'Settings list', query: 'Show a collapsible settings list' }
	]

	async function send() {
		const q = composerValue.trim()
		if (!q || conversation.thinking) return
		composerValue = ''
		submitQuery(q)
		await tick()
		streamRef?.scrollTo({ top: streamRef.scrollHeight, behavior: 'smooth' })
	}

	function handleSuggestion(query: string) {
		composerValue = query
		send()
	}

	$effect(() => {
		// Scroll on every new turn (incl. assistant reply).
		void conversation.turns.length
		void conversation.thinking
		tick().then(() =>
			streamRef?.scrollTo({ top: streamRef?.scrollHeight ?? 0, behavior: 'smooth' })
		)
	})
</script>

<svelte:head>
	<title>Chat · Rokkit</title>
</svelte:head>

<div class="chat-shell">
	<ChatChrome>
		{#snippet brand()}
			<RokkitWordmark />
		{/snippet}
		{#snippet crumb()}
			<span class="route-label">Inline chat · scripted responses</span>
		{/snippet}
		{#snippet actions()}
			<button type="button" class="reset-btn" onclick={resetConversation}>
				<span class="i-mdi:restore" aria-hidden="true"></span>
				Reset
			</button>
		{/snippet}
	</ChatChrome>

	<div class="chat-body">
		<div class="chat-stream-wrap" bind:this={streamRef}>
			<ChatStream>
				{#if conversation.turns.length === 0}
					<div class="welcome">
						<h1>Ask Rokkit anything</h1>
						<p>
							This is a chat-only demo. Responses are <em>rendered</em>, not just
							described — charts, tables, forms, and lists appear inline using
							the same <code>@rokkit</code> components.
						</p>
						<p class="welcome-meta">
							Today: mock router (zero tokens). Next: in-browser LLM.
						</p>
						<div class="welcome-suggestions">
							{#each seedSuggestions as s (s.query)}
								<button type="button" class="welcome-chip" onclick={() => handleSuggestion(s.query)}>
									{s.label}
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#each conversation.turns as turn (turn.id)}
					{#if turn.role === 'user'}
						<ChatMessage kind="user" head="YOU" who="Jerry" icon="i-mdi:chat-outline">
							{turn.text}
						</ChatMessage>
					{:else}
						<ChatMessage
							kind="info"
							head="ROKKIT"
							who="assistant"
							icon="i-mdi:robot-happy-outline"
						>
							<BlockList blocks={turn.blocks} onSuggestion={handleSuggestion} />
						</ChatMessage>
					{/if}
				{/each}

				{#if conversation.thinking}
					<ChatMessage kind="info" head="THINKING" icon="i-mdi:dots-horizontal">
						<span class="thinking">Picking the right tool…</span>
					</ChatMessage>
				{/if}
			</ChatStream>
		</div>

		<div class="composer-wrap">
			<ChatComposer
				bind:value={composerValue}
				placeholder="Ask for a chart, table, form, list…"
				onsubmit={send}
				running={conversation.thinking}
				accent
			/>
		</div>
	</div>
</div>

<style>
	.chat-shell {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		background: var(--paper);
		color: var(--ink);
	}

	.route-label {
		font: 500 12px var(--font-mono);
		letter-spacing: 0.08em;
		color: var(--ink-mute);
		text-transform: uppercase;
	}

	.reset-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 26px;
		padding: 0 10px;
		border: 1px solid var(--paper-edge);
		border-radius: 9999px;
		background: var(--paper-soft);
		font: 500 12px var(--font-ui);
		color: var(--ink-mute);
		cursor: pointer;
	}

	.reset-btn:hover {
		border-color: var(--ink-soft);
		color: var(--ink);
	}

	.chat-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		max-width: 880px;
		width: 100%;
		margin: 0 auto;
		min-height: 0;
	}

	.chat-stream-wrap {
		flex: 1;
		overflow-y: auto;
		padding: 32px 24px 8px;
	}

	.composer-wrap {
		flex-shrink: 0;
		padding: 0 24px 24px;
	}

	.welcome {
		max-width: 640px;
		margin: 48px auto 24px;
		text-align: center;
	}

	.welcome h1 {
		margin: 0 0 12px;
		font: 600 28px/1.2 var(--font-display, var(--font-ui));
		color: var(--ink);
	}

	.welcome p {
		margin: 0 0 8px;
		font: 400 14.5px/1.55 var(--font-ui);
		color: var(--ink-soft);
	}

	.welcome-meta {
		font-size: 12.5px;
		color: var(--ink-mute);
		margin-bottom: 24px;
	}

	.welcome-suggestions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		margin-top: 16px;
	}

	.welcome-chip {
		display: inline-flex;
		align-items: center;
		height: 32px;
		padding: 0 14px;
		border: 1px dashed var(--paper-edge);
		border-radius: 9999px;
		background: var(--paper);
		font: 500 13px var(--font-ui);
		color: var(--ink);
		cursor: pointer;
	}

	.welcome-chip:hover {
		border-color: var(--accent);
		color: var(--accent);
		border-style: solid;
		background: color-mix(in oklab, var(--accent) 6%, var(--paper-soft));
	}

	.thinking {
		font: 400 13px var(--font-ui);
		color: var(--ink-mute);
		font-style: italic;
	}
</style>
