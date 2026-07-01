<script lang="ts">
	import { tick, onMount } from 'svelte'
	import { ChatHistory, configureWho } from '$lib/chat'
	import { Button, ChatTimeline, ChatComposer, ChatMessage } from '@rokkit/ui'
	import { conversation, resetConversation, takePendingPrompt } from '$lib/chat-demo/store.svelte'
	import { getCurrentId, type Conversation } from '$lib/koan/conversations.svelte'
	import { goto } from '$app/navigation'
	import { page } from '$app/state'
	import {
		llm,
		setEngine,
		ensureWebLLMEngine,
		resetWebLLMEngine,
		detectWebGPU,
		OPENROUTER_MODELS,
		WEBLLM_MODELS
	} from '$lib/chat-demo/llm.svelte'
	import { cardFor } from '$lib/chat-demo/modes'
	import {
		composerValue,
		attachError,
		collapsed,
		messages,
		send,
		handleSuggestion,
		convIcon,
		resumeConversation,
		startNewChat,
		bucketsFor,
		submitFile,
		recencyLabel
	} from '$lib/chat-demo/chat-controller.svelte'
	import BlockList from '$lib/chat-demo/components/BlockList.svelte'

	const { data } = $props()

	// The engine is fixed by the route. Set it synchronously at init so a
	// picker-seeded prompt (consumed in onMount, which runs after init) is
	// answered by the right engine — not the default simulated one. `page`
	// from $app/state is available synchronously here.
	setEngine(data.mode, page.url.searchParams.get('model') ?? undefined)

	// Keep it in sync as the route/model change (?model= dropdown, resume).
	$effect(() => {
		setEngine(data.mode, page.url.searchParams.get('model') ?? undefined)
	})

	onMount(() => {
		// Probe WebGPU once so the Web-LLM status shows the right state.
		void detectWebGPU()
		// A prompt seeded by the picker (Task 6) is consumed once on mount.
		const p = takePendingPrompt()
		if (p) send(p)
	})

	// Brand the assistant for this surface. User name stays at the default
	// "you" — wire it up to a real session once we have auth.
	configureWho({ assistant: 'Rokkit' })

	// The model dropdown drives the URL (?model=) rather than llm state directly,
	// so the route stays the single source of truth (the $effect above re-derives
	// the engine from it). For Web-LLM we also tear down the loaded engine so the
	// newly-selected model is fetched fresh on next use (as the toggle version did).
	function selectModel(id: string) {
		goto(`/chat/${data.mode}?model=${encodeURIComponent(id)}`, {
			replaceState: true,
			keepFocus: true,
			noScroll: true
		})
		if (data.mode === 'webllm') resetWebLLMEngine()
	}

	// ─── DOM-bound concerns (stay in the component) ──────────────────────────
	let streamRef = $state<HTMLElement | null>(null)
	// Whether to keep pinning the stream to the bottom on new turns. Goes false
	// the moment the user scrolls up to read earlier messages, so autoscroll
	// never yanks them back down mid-read.
	let stickToBottom = $state(true)
	function onStreamScroll() {
		const el = streamRef
		if (!el) return
		stickToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
	}
	let fileInputRef = $state<HTMLInputElement | null>(null)
	let dragOver = $state(false)

	function onFileChange(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0]
		if (f) submitFile(f)
		;(e.target as HTMLInputElement).value = ''
	}

	function onDrop(e: DragEvent) {
		e.preventDefault()
		dragOver = false
		const f = e.dataTransfer?.files?.[0]
		if (f) submitFile(f)
	}

	// Sidebar history — scoped to the chat surface + this route's mode.
	const buckets = $derived(bucketsFor(data.mode))
	const allConv = $derived([...buckets.today, ...buckets.yesterday, ...buckets.earlier])

	$effect(() => {
		// Scroll on every new turn (incl. assistant reply).
		// NOTE: ChatTimeline ships its own autoscroll, but it scrolls
		// synchronously on append — before the ResizeObserver inside an inline
		// BarChart / Table has settled the figure's final height — so it leaves
		// the bottom clipped. We disable ChatTimeline autoscroll (autoscroll={false})
		// and keep this tuned scroller on the .chat-stream-wrap container instead.
		void conversation.turns.length
		void conversation.thinking
		// Don't fight a user who has scrolled up to read history.
		if (!stickToBottom) return
		// Two rAFs after tick() so the ResizeObserver inside the BarChart / Table
		// has fired and the figure's final height is settled before we measure
		// scrollHeight. `behavior: 'instant'` keeps the snap-to-bottom from
		// fighting concurrent layout shifts (otherwise the smooth animation
		// targets a stale offset and feels janky).
		tick().then(() => {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					streamRef?.scrollTo({ top: streamRef?.scrollHeight ?? 0, behavior: 'instant' })
				})
			})
		})
	})
</script>

<svelte:head>
	<title>{cardFor(data.mode).label} · Ask Rokkit</title>
</svelte:head>

<div class="chat-shell">
	<div class="chat-subtoolbar">
		<div class="subtoolbar-zone subtoolbar-left">
			<a class="chat-back" href="/chat">‹ Ask Rokkit</a>
		</div>
		<div class="subtoolbar-zone subtoolbar-center">
			<span class="title-kicker">Inline Chat</span>
			<span class="title-sep">·</span>
			<span class="title-mode">{cardFor(data.mode).label}</span>
		</div>
		<div class="subtoolbar-zone subtoolbar-right">
			{#if data.mode === 'openrouter'}
				<label class="subtoolbar-field">
					<span class="subtoolbar-label">Model</span>
					<select
						value={llm.openRouterModel}
						class="llm-model"
						onchange={(e) => selectModel(e.currentTarget.value)}
					>
						{#each OPENROUTER_MODELS as m (m.id)}
							<option value={m.id}>{m.label}</option>
						{/each}
					</select>
				</label>
			{:else if data.mode === 'webllm'}
				<label class="subtoolbar-field">
					<span class="subtoolbar-label">Model</span>
					<select
						value={llm.webllmModel}
						class="llm-model"
						disabled={llm.webllmStatus === 'loading'}
						onchange={(e) => selectModel(e.currentTarget.value)}
					>
						{#each WEBLLM_MODELS as m (m.id)}
							<option value={m.id}>{m.label} · {m.size}</option>
						{/each}
					</select>
				</label>
				{#if llm.webllmStatus === 'uninitialized'}
					<button type="button" class="llm-load-btn" onclick={() => ensureWebLLMEngine()}>
						<span class="i-mdi:download" aria-hidden="true"></span>
						Load
					</button>
				{:else if llm.webllmStatus === 'loading'}
					<span class="llm-progress" title={llm.webllmStage}>
						<span class="i-mdi:loading llm-spin" aria-hidden="true"></span>
						{Math.round(llm.webllmProgress * 100)}%
					</span>
				{:else if llm.webllmStatus === 'ready' || llm.webllmStatus === 'thinking'}
					<span class="llm-ready">
						<span class="i-mdi:check-circle-outline" aria-hidden="true"></span>
						ready
					</span>
				{:else if llm.webllmStatus === 'error'}
					<span class="llm-error" title={llm.errorMessage}>error</span>
				{/if}
			{/if}
			<Button
				variant="default"
				size="sm"
				icon="i-mdi:restore"
				label="Clear"
				title="Start a new conversation (current one stays in history)"
				onclick={resetConversation}
			/>
		</div>
	</div>
	<div class="chat-layout">
		<ChatHistory bind:collapsed={collapsed.value} onnew={startNewChat}>
			{#if allConv.length === 0}
				<div class="conv-empty">
					<span class="i-mdi:chat-plus-outline" aria-hidden="true"></span>
					<span>No history yet — ask Rokkit something to start.</span>
				</div>
			{/if}
			{#if buckets.today.length > 0}
				<div class="group-label">Today</div>
				{#each buckets.today as conv (conv.id)}
					<button
						type="button"
						class="conv"
						class:conv-active={conv.id === getCurrentId()}
						onclick={() => resumeConversation(conv)}
					>
						<span class="conv-icon {convIcon(conv)}" aria-hidden="true"></span>
						<span class="conv-title">{conv.title}</span>
						<span class="conv-when">{recencyLabel(conv)}</span>
					</button>
				{/each}
			{/if}
			{#if buckets.yesterday.length > 0}
				<div class="group-label">Yesterday</div>
				{#each buckets.yesterday as conv (conv.id)}
					<button
						type="button"
						class="conv"
						class:conv-active={conv.id === getCurrentId()}
						onclick={() => resumeConversation(conv)}
					>
						<span class="conv-icon {convIcon(conv)}" aria-hidden="true"></span>
						<span class="conv-title">{conv.title}</span>
						<span class="conv-when">{recencyLabel(conv)}</span>
					</button>
				{/each}
			{/if}
			{#if buckets.earlier.length > 0}
				<div class="group-label">Earlier</div>
				{#each buckets.earlier as conv (conv.id)}
					<button
						type="button"
						class="conv"
						class:conv-active={conv.id === getCurrentId()}
						onclick={() => resumeConversation(conv)}
					>
						<span class="conv-icon {convIcon(conv)}" aria-hidden="true"></span>
						<span class="conv-title">{conv.title}</span>
						<span class="conv-when">{recencyLabel(conv)}</span>
					</button>
				{/each}
			{/if}
			{#snippet collapsedBody()}
				{#each allConv.slice(0, 8) as conv (conv.id)}
					<button
						type="button"
						class="conv-mini"
						class:conv-mini-active={conv.id === getCurrentId()}
						title={conv.title}
						onclick={() => resumeConversation(conv)}
					>
						<span class="conv-icon {convIcon(conv)}" aria-hidden="true"></span>
					</button>
				{/each}
			{/snippet}
			{#snippet footer()}
				<span>{allConv.length} {allConv.length === 1 ? 'conversation' : 'conversations'}</span>
			{/snippet}
		</ChatHistory>

	<div class="chat-body">
		<div class="chat-stream-wrap" bind:this={streamRef} onscroll={onStreamScroll}>
			<ChatTimeline messages={messages.current} autoscroll={false}>
				{#snippet message(msg)}
					{#if msg.role === 'user'}
						<ChatMessage message={msg}>
							{#snippet avatar()}
								<span class="msg-avatar" data-role="user" aria-hidden="true">
									<span class="i-mdi:chat-outline"></span>
								</span>
							{/snippet}
						</ChatMessage>
					{:else if msg.data?.thinking}
						<ChatMessage message={msg}>
							{#snippet avatar()}
								<span class="msg-avatar" data-role="assistant" aria-hidden="true">
									<span class="i-mdi:dots-horizontal"></span>
								</span>
							{/snippet}
							{#snippet label()}
								{#if msg.data?.provider}
									<span class="msg-eyebrow">{msg.data.provider}</span>
								{/if}
							{/snippet}
							{#snippet body()}
								<span class="thinking">Picking the right tool…</span>
							{/snippet}
						</ChatMessage>
					{:else}
						<ChatMessage message={msg}>
							{#snippet avatar()}
								<span class="msg-avatar" data-role="assistant" aria-hidden="true">
									<span class="i-mdi:robot-happy-outline"></span>
								</span>
							{/snippet}
							{#snippet label()}
								{#if msg.data?.provider}
									<span class="msg-eyebrow">{msg.data.provider}</span>
								{/if}
							{/snippet}
							{#snippet body()}
								<BlockList blocks={msg.data?.blocks ?? []} onSuggestion={handleSuggestion} />
							{/snippet}
						</ChatMessage>
					{/if}
				{/snippet}

				{#snippet empty()}
					<div class="empty-stream">
						<span class="i-mdi:message-text-outline" aria-hidden="true"></span>
						<p>Ask a question or drop a CSV / JSON file to render it inline.</p>
					</div>
				{/snippet}
			</ChatTimeline>
		</div>

		<div class="composer-wrap">
			{#if attachError.message}
				<div class="attach-error">
					<span class="i-mdi:alert-circle-outline" aria-hidden="true"></span>
					{attachError.message}
					<button type="button" onclick={() => (attachError.message = null)} class="attach-error-dismiss">dismiss</button>
				</div>
			{/if}
			<ChatComposer
				bind:value={composerValue.value}
				placeholder="Ask, or paste JSON / CSV, or drop a file…"
				onsubmit={(text) => send(text)}
				busy={conversation.thinking}
			>
				{#snippet toolbar()}
					<div class="composer-toolbar">
						<button
							type="button"
							class="attach-btn"
							title="Attach JSON or CSV"
							onclick={() => fileInputRef?.click()}
						>
							<span class="i-mdi:paperclip" aria-hidden="true"></span>
							<span class="attach-label">Attach data</span>
						</button>
						<input
							type="file"
							accept=".json,.csv,application/json,text/csv"
							bind:this={fileInputRef}
							onchange={onFileChange}
							hidden
						/>
						<span class="composer-hint">
							<kbd>↵</kbd> to send · <kbd>⇧↵</kbd> for newline
						</span>
						<button
							type="button"
							class="composer-send"
							onclick={() => send(composerValue.value)}
							disabled={!composerValue.value.trim() || conversation.thinking}
							title="Send"
							aria-label="Send"
						>
							{#if conversation.thinking}
								<span class="composer-spinner" aria-hidden="true"></span>
							{:else}
								<svg
									width="14"
									height="14"
									viewBox="0 0 16 16"
									fill="none"
									stroke="currentColor"
									stroke-width="1.6"
									stroke-linecap="round"
									stroke-linejoin="round"
									aria-hidden="true"
								>
									<path d="M2 8 L14 2 L10 14 L8 9 L2 8 Z" />
								</svg>
							{/if}
						</button>
					</div>
				{/snippet}
			</ChatComposer>
		</div>
	</div>
	</div>

	{#if dragOver}
		<div class="drop-overlay">
			<div class="drop-target">
				<span class="i-mdi:file-upload-outline" aria-hidden="true"></span>
				<strong>Drop CSV or JSON to render it</strong>
				<span class="drop-hint">We'll infer a table, chart, or editable form</span>
			</div>
		</div>
	{/if}
</div>

<svelte:window
	ondragover={(e) => {
		if (!e.dataTransfer?.types.includes('Files')) return
		e.preventDefault()
		dragOver = true
	}}
	ondragleave={() => (dragOver = false)}
	ondrop={onDrop}
/>

<style>
	.chat-shell {
		/* Lives inside the root layout's <main>; flex column so the
		 * subtoolbar and content stretch to fill what's left after the
		 * SiteHeader + SiteFooter take their share. */
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		background: var(--paper);
		color: var(--ink);
	}

	.chat-subtoolbar {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 16px;
		padding: 8px 24px;
		border-bottom: 1px solid var(--paper-edge);
		background: var(--paper-soft);
		font: 400 12px var(--font-ui);
		color: var(--ink-mute);
		flex-shrink: 0;
	}

	.subtoolbar-zone {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		/* No wrap — toggle stays anchored left, model + clear stay anchored
		   right, centre title truncates with ellipsis if there isn't room. */
		flex-wrap: nowrap;
	}

	.subtoolbar-center {
		justify-self: center;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font: 500 11.5px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.title-kicker {
		color: var(--ink-soft);
	}
	.title-sep {
		color: var(--ink-faint);
	}
	.title-mode {
		color: var(--ink);
	}

	.subtoolbar-field {
		display: inline-flex;
		align-items: center;
		gap: 8px;
	}

	.subtoolbar-label {
		font: 500 11px var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	.chat-back {
		font: 500 12px var(--font-ui);
		color: var(--ink-mute);
		text-decoration: none;
		white-space: nowrap;
	}

	.chat-back:hover {
		color: var(--ink);
	}

	.chat-layout {
		flex: 1;
		display: flex;
		min-height: 0;
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

	.group-label {
		padding: 14px 8px 4px;
		font: 500 10px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.conv {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		margin: 1px 0;
		width: 100%;
		border: 0;
		background: transparent;
		border-radius: 6px;
		color: var(--ink-mute);
		cursor: pointer;
		text-align: left;
		font-family: var(--font-ui);
	}

	.conv:hover {
		background: var(--paper-soft);
		color: var(--ink);
	}

	.conv-active,
	.conv-active:hover {
		background: var(--paper-mute);
		color: var(--ink);
	}

	.conv-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		color: var(--ink-soft);
		display: inline-block;
	}

	.conv-title {
		flex: 1;
		min-width: 0;
		font: 450 12.5px var(--font-ui);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.conv-when {
		font: 500 10px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.02em;
		flex-shrink: 0;
	}

	.conv-empty {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 14px 10px;
		color: var(--ink-soft);
		font: 400 12px var(--font-ui);
		line-height: 1.4;
	}

	.conv-empty .i-mdi\:chat-plus-outline {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		color: var(--ink-mute);
	}

	.conv-mini {
		width: 32px;
		height: 32px;
		display: grid;
		place-items: center;
		margin: 0 auto;
		border: 0;
		background: transparent;
		border-radius: 6px;
		color: var(--ink-soft);
		cursor: pointer;
	}

	.conv-mini:hover {
		background: var(--paper-soft);
		color: var(--ink);
	}

	.conv-mini-active,
	.conv-mini-active:hover {
		background: var(--paper-mute);
		color: var(--ink);
	}

	.chat-stream-wrap {
		flex: 1;
		overflow-y: auto;
		padding: 32px 24px 8px;
	}

	/* ChatTimeline ships its own scroll + padding (theme layer), but here it
	   lives inside our tuned scroller (.chat-stream-wrap owns scroll/padding so
	   the chart-resize autoscroll stays correct). Neutralise the inner timeline
	   so we don't get a nested scroller or doubled padding — keep just the
	   message gap. */
	.chat-stream-wrap :global([data-chat-timeline]) {
		flex: initial;
		overflow: visible;
		padding: 0;
	}

	.composer-wrap {
		flex-shrink: 0;
		padding: 0 24px 24px;
	}

	.empty-stream {
		max-width: 480px;
		margin: 64px auto 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		text-align: center;
		color: var(--ink-mute);
	}

	.empty-stream .i-mdi\:message-text-outline {
		width: 32px;
		height: 32px;
		color: var(--ink-soft);
	}

	.empty-stream p {
		margin: 0;
		font: 400 14px/1.5 var(--font-ui);
	}

	.thinking {
		font: 400 13px var(--font-ui);
		color: var(--ink-mute);
		font-style: italic;
	}

	/* Message avatar node (icon) — assistant accent ring, user neutral fill. */
	.msg-avatar {
		flex-shrink: 0;
		width: 30px;
		height: 30px;
		display: grid;
		place-items: center;
		border-radius: 8px;
		border: 1px solid var(--paper-edge);
		font-size: 17px;
	}

	.msg-avatar[data-role='assistant'] {
		color: var(--accent);
		border-color: color-mix(in oklab, var(--accent) 30%, var(--paper-edge));
		background: color-mix(in oklab, var(--accent) 6%, var(--paper-soft));
	}

	.msg-avatar[data-role='user'] {
		color: var(--ink);
		background: var(--paper-mute);
	}

	.msg-eyebrow {
		display: block;
		margin-bottom: 6px;
		font: 500 11px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	/* Composer leading row (attach) + toolbar row (hint + send). The textarea
	   sits between them via order:2 set in chat.css. */
	.composer-leading {
		order: 1;
		display: flex;
		align-items: center;
		gap: 2px;
		margin-bottom: 8px;
	}

	.composer-toolbar {
		order: 3;
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
	}

	.composer-hint {
		flex: 1;
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.04em;
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}

	.composer-hint kbd {
		font: 500 9.5px var(--font-mono);
		padding: 1px 5px;
		border: 1px solid var(--paper-edge);
		border-radius: 3px;
		background: var(--paper);
		color: var(--ink-mute);
	}

	.composer-send {
		width: 28px;
		height: 28px;
		display: grid;
		place-items: center;
		background: var(--accent);
		color: var(--paper);
		border-radius: 6px;
		border: 0;
		cursor: pointer;
		flex-shrink: 0;
	}

	.composer-send:hover:not([disabled]) {
		background: color-mix(in oklab, var(--accent) 80%, white);
	}

	.composer-send[disabled] {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.composer-spinner {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1.5px solid currentColor;
		border-top-color: transparent;
		animation: spin 0.7s linear infinite;
	}

	.attach-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 28px;
		padding: 0 10px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		background: var(--paper);
		font: 500 12px var(--font-ui);
		color: var(--ink-mute);
		cursor: pointer;
	}

	.attach-btn:hover {
		border-color: var(--accent);
		color: var(--accent);
	}

	.attach-label {
		font-size: 11.5px;
	}

	.attach-error {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
		padding: 8px 10px;
		border: 1px solid color-mix(in oklab, var(--danger, #c43838) 40%, transparent);
		background: color-mix(in oklab, var(--danger, #c43838) 8%, var(--paper));
		border-radius: 6px;
		font: 400 12.5px var(--font-ui);
		color: var(--ink);
	}

	.attach-error-dismiss {
		margin-left: auto;
		background: transparent;
		border: 0;
		color: var(--ink-mute);
		font: 500 11px var(--font-ui);
		cursor: pointer;
		text-decoration: underline;
	}

	.drop-overlay {
		position: fixed;
		inset: 0;
		background: color-mix(in oklab, var(--paper) 92%, var(--accent));
		z-index: 100;
		display: grid;
		place-items: center;
		pointer-events: none;
	}

	.drop-target {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 36px 56px;
		border: 2px dashed var(--accent);
		border-radius: 12px;
		background: var(--paper);
		color: var(--ink);
		font: 500 16px var(--font-ui);
	}

	.drop-target .i-mdi\:file-upload-outline {
		font-size: 36px;
		color: var(--accent);
	}

	.drop-hint {
		font: 400 13px var(--font-ui);
		color: var(--ink-mute);
	}

	.llm-model {
		font: 500 11.5px var(--font-ui);
		padding: 2px 4px;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		background: var(--paper);
		color: var(--ink);
		max-width: 240px;
	}

	.llm-load-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 22px;
		padding: 0 8px;
		border: 1px solid var(--accent);
		border-radius: 9999px;
		background: var(--paper);
		color: var(--accent);
		font: 500 11.5px var(--font-ui);
		cursor: pointer;
	}

	.llm-load-btn:hover {
		background: var(--accent);
		color: var(--paper);
	}

	.llm-progress,
	.llm-ready,
	.llm-error {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 11.5px;
	}

	@keyframes spin {
		from { transform: rotate(0); }
		to { transform: rotate(360deg); }
	}

	:global(.llm-spin) {
		animation: spin 1.2s linear infinite;
		display: inline-block;
	}
</style>
