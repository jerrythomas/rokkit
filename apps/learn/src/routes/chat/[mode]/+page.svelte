<script lang="ts">
	import { tick, onMount } from 'svelte'
	import { ChatHistory, configureWho } from '$lib/chat'
	import { ChatTimeline, ChatComposer, ChatMessage } from '@rokkit/ui'
	import { conversation, takePendingPrompt } from '$lib/chat-demo/store.svelte'
	import { pickStarterHints } from '$lib/chat-demo/starter-hints'
	import { getCurrentId, getCurrentConversation, setCurrentId } from '$lib/koan/conversations.svelte'
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
	// from $app/state is available synchronously here. Static capture of the
	// initial route is intentional; the $effect below handles subsequent
	// route/model changes.
	// svelte-ignore state_referenced_locally
	setEngine(data.mode, page.url.searchParams.get('model') ?? undefined)

	// Keep it in sync as the route/model change (?model= dropdown, resume).
	$effect(() => {
		setEngine(data.mode, page.url.searchParams.get('model') ?? undefined)
	})

	// A conversation is anchored to the engine that produced it. When the user
	// navigates to a mode whose current selection was made in a *different*
	// engine (e.g. Simulated → OpenRouter via top nav), clear it so the fresh
	// mode starts empty — otherwise the leftover turns render and the empty
	// state (starter hints) never gets a chance to appear. Resume flows always
	// route to the conversation's own mode, so mode always matches after them.
	$effect(() => {
		const cur = getCurrentConversation()
		if (cur && cur.surface === 'chat' && cur.mode !== data.mode) {
			setCurrentId(null)
		}
	})

	// Header content (icon + label + blurb) mirrors the picker card for this mode.
	const modeCard = $derived(cardFor(data.mode))

	// Starter hints — 4 randomized types (chart/table/form/list) shown on an
	// empty conversation. Picked once per component so the chips stay stable
	// while the user reads them; a new mount → a fresh randomization.
	const starterHints = pickStarterHints()

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
	//
	// Model switch UX: if the current conversation has turns, spin up a fresh
	// one so each conversation stays anchored to a single engine. Prevents the
	// confusion of half a thread answered by one model and half by another.
	function selectModel(id: string) {
		if (conversation.turns.length > 0) startNewChat()
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
	{#snippet convRow(conv: import('$lib/koan/conversations.svelte').Conversation)}
		<button
			type="button"
			class="conv"
			class:conv-active={conv.id === getCurrentId()}
			data-conv-mode={conv.mode ?? 'simulated'}
			onclick={() => resumeConversation(conv)}
		>
			<span class="conv-icon {convIcon(conv)}" aria-hidden="true"></span>
			<span class="conv-title">{conv.title}</span>
			<span class="conv-mode-badge" data-mode={conv.mode ?? 'simulated'}>
				{conv.mode ?? 'simulated'}
			</span>
			<span class="conv-when">{recencyLabel(conv)}</span>
		</button>
	{/snippet}
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
					{@render convRow(conv)}
				{/each}
			{/if}
			{#if buckets.yesterday.length > 0}
				<div class="group-label">Yesterday</div>
				{#each buckets.yesterday as conv (conv.id)}
					{@render convRow(conv)}
				{/each}
			{/if}
			{#if buckets.earlier.length > 0}
				<div class="group-label">Earlier</div>
				{#each buckets.earlier as conv (conv.id)}
					{@render convRow(conv)}
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
		<header class="chat-header" data-mode={data.mode}>
			<div class="chat-header-lead">
				<span class="chat-header-icon {modeCard.icon}" aria-hidden="true"></span>
				<div class="chat-header-titles">
					<h1 class="chat-header-title">{modeCard.label}</h1>
					<p class="chat-header-blurb">{modeCard.blurb}</p>
				</div>
			</div>
			<div class="chat-header-actions">
				{#if data.mode === 'openrouter'}
					<select
						value={llm.openRouterModel}
						class="llm-model"
						aria-label="Model"
						onchange={(e) => selectModel(e.currentTarget.value)}
					>
						{#each OPENROUTER_MODELS as m (m.id)}
							<option value={m.id}>{m.label}</option>
						{/each}
					</select>
				{:else if data.mode === 'webllm'}
					<select
						value={llm.webllmModel}
						class="llm-model"
						aria-label="Model"
						disabled={llm.webllmStatus === 'loading'}
						onchange={(e) => selectModel(e.currentTarget.value)}
					>
						{#each WEBLLM_MODELS as m (m.id)}
							<option value={m.id}>{m.label} · {m.size}</option>
						{/each}
					</select>
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
			</div>
		</header>
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
						<span class="empty-stream-icon i-mdi:message-text-outline" aria-hidden="true"></span>
						<p class="empty-stream-lead">
							Ask a question or drop a CSV / JSON file to render it inline.
						</p>
						<p class="empty-stream-sub">Try one of these to get started:</p>
						<ul class="starter-hints">
							{#each starterHints as hint (hint.kind)}
								<li>
									<button
										type="button"
										class="starter-hint"
										data-hint-kind={hint.kind}
										onclick={() => handleSuggestion(hint.prompt)}
										title={hint.prompt}
									>
										<span class="starter-hint-icon {hint.icon}" aria-hidden="true"></span>
										<span class="starter-hint-body">
											<span class="starter-hint-kind">{hint.kind}</span>
											<span class="starter-hint-label">{hint.label}</span>
										</span>
										<span class="starter-hint-arrow i-mdi:arrow-right" aria-hidden="true"></span>
									</button>
								</li>
							{/each}
						</ul>
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

	/* Full-width chat header — echoes the picker card shape
	   (icon + title + blurb) so entering a mode feels like the natural next step
	   from the gate. The model selector + status live to the right. */
	.chat-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		padding: 12px 24px;
		border-bottom: 1px solid var(--paper-edge);
		background: var(--paper);
		flex-shrink: 0;
	}

	.chat-header-lead {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
	}

	.chat-header-icon {
		width: 22px;
		height: 22px;
		color: var(--ink-mute);
		flex-shrink: 0;
	}

	.chat-header-titles {
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.chat-header-title {
		margin: 0;
		font: 600 15px var(--font-ui);
		color: var(--ink);
		line-height: 1.2;
	}

	.chat-header-blurb {
		margin: 0;
		font: 400 12.5px var(--font-ui);
		color: var(--ink-mute);
		line-height: 1.35;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chat-header-actions {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		flex-wrap: nowrap;
		flex-shrink: 0;
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

	/* Per-conversation mode badge — the sidebar is now shared across all
	   modes, so each row advertises which engine produced it. Colours use the
	   theme tokens so it stays subtle in both light + dark. */
	.conv-mode-badge {
		font: 500 8.5px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		padding: 1px 5px;
		border-radius: 4px;
		border: 1px solid var(--paper-edge);
		background: var(--paper);
		color: var(--ink-soft);
		flex-shrink: 0;
	}

	.conv-mode-badge[data-mode='simulated'] {
		color: var(--ink-mute);
	}

	.conv-mode-badge[data-mode='openrouter'] {
		color: var(--accent);
		border-color: color-mix(in oklab, var(--accent) 40%, var(--paper-edge));
	}

	.conv-mode-badge[data-mode='webllm'] {
		color: var(--primary);
		border-color: color-mix(in oklab, var(--primary) 40%, var(--paper-edge));
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
		max-width: 560px;
		margin: 48px auto 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		text-align: center;
		color: var(--ink-mute);
	}

	.empty-stream-icon {
		width: 32px;
		height: 32px;
		color: var(--ink-soft);
	}

	.empty-stream-lead {
		margin: 0;
		font: 400 14px/1.5 var(--font-ui);
	}

	.empty-stream-sub {
		margin: 12px 0 4px;
		font: 500 11px var(--font-mono);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	.starter-hints {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 8px;
		width: 100%;
	}

	.starter-hint {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper);
		color: var(--ink);
		text-align: left;
		cursor: pointer;
		transition: border-color 120ms ease, background 120ms ease;
	}

	.starter-hint:hover {
		border-color: var(--paper-edge-hover);
		background: var(--paper-soft);
	}

	.starter-hint-icon {
		width: 18px;
		height: 18px;
		color: var(--ink-mute);
		flex-shrink: 0;
	}

	.starter-hint-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.starter-hint-kind {
		font: 500 9.5px var(--font-mono);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	.starter-hint-label {
		font: 500 13px var(--font-ui);
		color: var(--ink);
	}

	.starter-hint-arrow {
		width: 14px;
		height: 14px;
		color: var(--ink-soft);
		flex-shrink: 0;
		opacity: 0.55;
		transition: transform 120ms ease, opacity 120ms ease;
	}

	.starter-hint:hover .starter-hint-arrow {
		opacity: 1;
		transform: translateX(2px);
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
