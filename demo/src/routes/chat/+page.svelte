<script lang="ts">
	import { tick } from 'svelte'
	import { ChatComposer, ChatStream, ChatMessage, configureWho } from '$lib/chat'
	import { Button, Toggle } from '@rokkit/ui'
	import {
		conversation,
		submitText,
		submitData,
		resetConversation
	} from '$lib/chat-demo/store.svelte'
	import { tryParse, parseCSV } from '$lib/chat-demo/infer'
	import {
		llm,
		ensureWebLLMEngine,
		resetWebLLMEngine,
		detectWebGPU,
		OPENROUTER_MODELS,
		WEBLLM_MODELS
	} from '$lib/chat-demo/llm.svelte'
	import BlockList from '$lib/chat-demo/components/BlockList.svelte'

	// ─── Mode (Scripted / OpenRouter / Web-LLM) — 3-way derived from llm state
	type Mode = 'scripted' | 'openrouter' | 'webllm'
	const mode = $derived<Mode>(
		!llm.enabled ? 'scripted' : llm.provider === 'webllm' ? 'webllm' : 'openrouter'
	)
	function setMode(next: Mode) {
		if (next === 'scripted') {
			llm.enabled = false
			return
		}
		llm.enabled = true
		llm.provider = next === 'webllm' ? 'webllm' : 'openrouter'
	}
	const modeOptions = [
		{ value: 'scripted', label: 'Scripted', icon: 'i-mdi:script-text-outline' },
		{ value: 'openrouter', label: 'OpenRouter', icon: 'i-mdi:cloud-outline' },
		{ value: 'webllm', label: 'Web-LLM', icon: 'i-mdi:laptop' }
	]
	const crumbLabel = $derived(
		mode === 'scripted'
			? 'Inline chat · scripted responses'
			: mode === 'openrouter'
				? 'Inline chat · OpenRouter (hosted)'
				: 'Inline chat · Web-LLM (browser)'
	)

	$effect(() => {
		// Probe WebGPU on mount so the toggle shows the right state.
		void detectWebGPU()
	})

	// Brand the assistant for this surface. User name stays at the default
	// "you" — wire it up to a real session once we have auth.
	configureWho({ assistant: 'Rokkit' })

	let composerValue = $state('')
	let streamRef = $state<HTMLElement | null>(null)
	let fileInputRef = $state<HTMLInputElement | null>(null)
	let dragOver = $state(false)
	let attachError = $state<string | null>(null)

	const SAMPLE_SALES = JSON.stringify(
		[
			{ region: 'EMEA', product: 'Hardware', revenue: 124 },
			{ region: 'EMEA', product: 'Software', revenue: 81 },
			{ region: 'APAC', product: 'Hardware', revenue: 92 },
			{ region: 'APAC', product: 'Software', revenue: 67 },
			{ region: 'AMER', product: 'Hardware', revenue: 156 },
			{ region: 'AMER', product: 'Software', revenue: 119 }
		],
		null,
		2
	)

	const SAMPLE_USER = JSON.stringify(
		{
			name: 'Maya Anand',
			email: 'maya@example.com',
			role: 'editor',
			joinedAt: '2025-08-12',
			active: true,
			signupCount: 3
		},
		null,
		2
	)

	const seedSuggestions = [
		{ label: 'Quarterly revenue chart', query: 'Show me a chart of quarterly revenue' },
		{ label: 'Products table', query: 'Show me a sortable table of products' },
		{ label: 'Try: paste sales JSON', query: SAMPLE_SALES },
		{ label: 'Try: paste a user record', query: SAMPLE_USER }
	]

	function send() {
		const q = composerValue.trim()
		if (!q || conversation.thinking) return
		composerValue = ''
		attachError = null
		// submitText auto-detects JSON / CSV; falls back to keyword routing.
		// Scroll-to-bottom is handled by the $effect below (it watches
		// turns.length + thinking); duplicating it here would fight that.
		submitText(q)
	}

	function handleSuggestion(query: string) {
		composerValue = query
		send()
	}

	async function handleFile(file: File) {
		attachError = null
		const text = await file.text()
		const isCsv = /\.csv$/i.test(file.name) || file.type === 'text/csv'
		if (isCsv) {
			try {
				const rows = parseCSV(text)
				if (rows.length === 0) {
					attachError = 'CSV file parsed to no rows.'
					return
				}
				submitData({ source: 'csv', text, parsed: rows, query: `Uploaded ${file.name}` })
			} catch (e) {
				attachError = `CSV error: ${(e as Error).message}`
			}
			return
		}
		const parsed = tryParse(text)
		if (!parsed.ok) {
			attachError = parsed.error
			return
		}
		submitData({
			source: parsed.format,
			text,
			parsed: parsed.value,
			query: `Uploaded ${file.name}`
		})
	}

	function onFileChange(e: Event) {
		const f = (e.target as HTMLInputElement).files?.[0]
		if (f) handleFile(f)
		;(e.target as HTMLInputElement).value = ''
	}

	function onDrop(e: DragEvent) {
		e.preventDefault()
		dragOver = false
		const f = e.dataTransfer?.files?.[0]
		if (f) handleFile(f)
	}

	$effect(() => {
		// Scroll on every new turn (incl. assistant reply).
		void conversation.turns.length
		void conversation.thinking
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
	<title>Chat · Rokkit</title>
</svelte:head>

<div class="chat-shell">
	<div class="chat-subtoolbar">
		<div class="subtoolbar-left">
			<span class="route-label">{crumbLabel}</span>
			<Toggle
				variant="group"
				size="sm"
				options={modeOptions}
				value={mode}
				onchange={(v) => setMode(v as Mode)}
				showLabels={true}
			/>
		</div>
		<div class="subtoolbar-right">
			{#if mode === 'openrouter'}
				<label class="subtoolbar-field">
					<span class="subtoolbar-label">Model</span>
					<select bind:value={llm.openRouterModel} class="llm-model">
						{#each OPENROUTER_MODELS as m (m.id)}
							<option value={m.id}>{m.label}</option>
						{/each}
					</select>
				</label>
			{:else if mode === 'webllm'}
				<label class="subtoolbar-field">
					<span class="subtoolbar-label">Model</span>
					<select
						bind:value={llm.webllmModel}
						class="llm-model"
						disabled={llm.webllmStatus === 'loading'}
						onchange={resetWebLLMEngine}
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
				title="Clear the conversation"
				onclick={resetConversation}
			/>
		</div>
	</div>

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
						<p>
							Or drop a <strong>CSV / JSON file</strong> anywhere on this page
							(or paste it in the composer) and Rokkit will pick the right UI
							for your data — table, chart, or editable form.
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
						<ChatMessage kind="user" icon="i-mdi:chat-outline">
							{turn.text}
						</ChatMessage>
					{:else}
						<ChatMessage kind="info" icon="i-mdi:robot-happy-outline">
							<BlockList blocks={turn.blocks} onSuggestion={handleSuggestion} />
						</ChatMessage>
					{/if}
				{/each}

				{#if conversation.thinking}
					<ChatMessage kind="info" status="thinking" icon="i-mdi:dots-horizontal">
						<span class="thinking">Picking the right tool…</span>
					</ChatMessage>
				{/if}
			</ChatStream>
		</div>

		<div class="composer-wrap">
			{#if attachError}
				<div class="attach-error">
					<span class="i-mdi:alert-circle-outline" aria-hidden="true"></span>
					{attachError}
					<button type="button" onclick={() => (attachError = null)} class="attach-error-dismiss">dismiss</button>
				</div>
			{/if}
			<ChatComposer
				bind:value={composerValue}
				placeholder="Ask, or paste JSON / CSV, or drop a file…"
				onsubmit={send}
				running={conversation.thinking}
				accent
			>
				{#snippet leftActions()}
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
				{/snippet}
			</ChatComposer>
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

	.route-label {
		font: 500 12px var(--font-mono);
		letter-spacing: 0.08em;
		color: var(--ink-mute);
		text-transform: uppercase;
	}

	.chat-subtoolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 8px 24px;
		border-bottom: 1px solid var(--paper-edge);
		background: var(--paper-soft);
		font: 400 12px var(--font-ui);
		color: var(--ink-mute);
		flex-shrink: 0;
	}

	.subtoolbar-left,
	.subtoolbar-right {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.subtoolbar-left .route-label {
		font: 500 11.5px var(--font-mono);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-mute);
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
