<script lang="ts">
	import {
		ChatChrome,
		ChatComposer,
		ChatMessage,
		ChatSidebar,
		ChatStream,
		Chips
	} from '$lib/chat'
	import RokkitWordmark from '$lib/components/RokkitWordmark.svelte'
	import { theme } from '$lib/stores/theme.svelte'
	import { vibe } from '@rokkit/states'
	import { koan, selectDemo } from '$lib/koan/store.svelte'
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'

	const styles = [
		{ id: 'zen-sumi', label: 'zen-sumi', colors: ['#F7F3EA', '#2A2925', '#A83D1F'] },
		{ id: 'rokkit', label: 'rokkit', colors: ['#FFFFFF', '#1F2937', '#EF4136'] },
		{ id: 'minimal', label: 'minimal', colors: ['#FAFAFA', '#0A0A0A', '#0A0A0A'] },
		{ id: 'material', label: 'material', colors: ['#FFFFFF', '#1F1F1F', '#6750A4'] }
	]

	// Local chrome bindings synced with the theme store
	let style = $state(theme.style)
	let density = $state(theme.density)
	const mode = $derived<'light' | 'dark'>(theme.mode === 'dark' ? 'dark' : 'light')

	$effect(() => {
		if (style !== theme.style) theme.setStyle(style)
	})
	$effect(() => {
		if (density !== theme.density) theme.setDensity(density)
	})

	// Bridge: ChatChrome's mode toggle (ThemeSwitcherToggle) writes to vibe.
	// Sync vibe.mode → demo theme store so body.dataset.mode flips and the
	// dark mode CSS responds. On mount we seed vibe from theme so the
	// switcher reflects the persisted user choice.
	onMount(() => {
		if (browser) {
			const persisted = theme.mode === 'dark' ? 'dark' : 'light'
			if (vibe.mode !== persisted) vibe.mode = persisted
		}
	})
	$effect(() => {
		if (vibe.mode !== theme.mode) theme.setMode(vibe.mode)
	})

	let collapsed = $state(false)
	let composerValue = $state('')

	// Conversation phase state machine — drives chat-left + canvas content.
	// 'welcome'  → no conversation yet; show eyebrow chips + hero
	// 'thinking' → user submitted; show reasoning steps + canvas spinner
	// 'response' → demo mounted on canvas (next round)
	let phase = $state<'welcome' | 'thinking' | 'response'>('welcome')
	let lastQuery = $state('')

	function submitQuery(value: string) {
		const trimmed = value.trim()
		if (!trimmed) return
		koan.query = trimmed
		lastQuery = trimmed
		composerValue = ''
		phase = 'thinking'
		// Response transition will land next round — for now the thinking
		// state persists until the user starts a new conversation.
	}

	function startNewConversation() {
		phase = 'welcome'
		lastQuery = ''
		composerValue = ''
		koan.query = ''
	}

	// Hardcoded conversation history (will wire to real store later)
	const today = [
		{ id: 'h1', kind: 'build', icon: 'i-mdi:tab', title: 'Show me how Tabs work', ago: '12m' },
		{ id: 'h2', kind: 'theme', icon: 'i-mdi:palette', title: 'Theme for our brand red', ago: '47m' },
		{ id: 'h3', kind: 'how', icon: 'i-mdi:help-circle-outline', title: 'How do I bind a list to async data?', ago: '2h' },
		{ id: 'h4', kind: 'build', icon: 'i-mdi:select-multiple', title: 'Multi-select with chip overflow', ago: '3h' }
	]
	const yesterday = [
		{ id: 'h5', kind: 'build', icon: 'i-mdi:file-tree', title: 'Compare List vs Tree', ago: 'yest' },
		{ id: 'h6', kind: 'how', icon: 'i-mdi:help-circle-outline', title: 'A11y for tree navigation', ago: 'yest' },
		{ id: 'h7', kind: 'build', icon: 'i-mdi:form-textbox', title: 'Form validation · per-field', ago: 'yest' }
	]
	const older = [
		{ id: 'h8', kind: 'docs', icon: 'i-mdi:book-open-variant', title: 'When to use Combo vs Select?', ago: 'Mon' },
		{ id: 'h9', kind: 'theme', icon: 'i-mdi:palette', title: 'Custom skin from brand palette', ago: 'Sun' }
	]
	const allConv = [...today, ...yesterday, ...older]

	const buildChips = [
		{ label: 'Tabs · 5 panes', icon: 'i-mdi:tab' },
		{ label: 'Sortable data table', icon: 'i-mdi:table' },
		{ label: 'Tree select', icon: 'i-mdi:file-tree' },
		{ label: 'Multi-select with chips', icon: 'i-mdi:select-multiple' }
	]
	const howChips = [
		{ label: 'How does theming work?', icon: 'i-mdi:help-circle-outline' },
		{ label: 'Bind a list to async data', icon: 'i-mdi:help-circle-outline' },
		{ label: 'A11y for keyboard nav', icon: 'i-mdi:help-circle-outline' }
	]
	const themeChips = [
		{ label: 'Theme to my brand', icon: 'i-mdi:palette' },
		{ label: 'Build a custom skin', icon: 'i-mdi:palette' }
	]

	function pickChip(item: { label?: string }) {
		if (item.label) submitQuery(item.label)
	}

	onMount(() => {
		const params = new URL(window.location.href).searchParams
		const demoId = params.get('demo')
		const q = params.get('q')
		if (q) koan.query = q
		if (demoId) selectDemo(demoId)
	})
</script>

<svelte:head>
	<title>Koan — Rokkit demo</title>
</svelte:head>

<div class="koan-shell">
	<ChatChrome
		bind:style
		bind:density
		{styles}
	>
		{#snippet brand()}
			<RokkitWordmark {mode} height={20} />
		{/snippet}
	</ChatChrome>

	<div class="stage">
		<ChatSidebar bind:collapsed onnew={startNewConversation}>
			{#snippet children()}
				<div class="group-label">Today</div>
				{#each today as item (item.id)}
					<button type="button" class="conv" data-conv-item>
						<span class="conv-icon {item.icon}" aria-hidden="true"></span>
						<span class="conv-title">{item.title}</span>
						<span class="conv-when">{item.ago}</span>
					</button>
				{/each}
				<div class="group-label">Yesterday</div>
				{#each yesterday as item (item.id)}
					<button type="button" class="conv" data-conv-item>
						<span class="conv-icon {item.icon}" aria-hidden="true"></span>
						<span class="conv-title">{item.title}</span>
						<span class="conv-when">{item.ago}</span>
					</button>
				{/each}
				<div class="group-label">Earlier this week</div>
				{#each older as item (item.id)}
					<button type="button" class="conv" data-conv-item>
						<span class="conv-icon {item.icon}" aria-hidden="true"></span>
						<span class="conv-title">{item.title}</span>
						<span class="conv-when">{item.ago}</span>
					</button>
				{/each}
			{/snippet}
			{#snippet collapsedBody()}
				{#each allConv.slice(0, 8) as item (item.id)}
					<div class="conv-mini" title={item.title}>
						<span class="conv-icon {item.icon}" aria-hidden="true"></span>
					</div>
				{/each}
			{/snippet}
			{#snippet footer()}
				<span>{allConv.length} conversations</span>
			{/snippet}
		</ChatSidebar>

		<aside class="chat-left">
			<div class="chat-header">
				<span class="chat-title">
					Conversation
					{#if phase !== 'welcome'}
						<span class="chat-sub">· {lastQuery}</span>
					{/if}
				</span>
			</div>

			{#if phase === 'welcome'}
				<div class="welcome-stream">
					<h2 class="welcome-hello">Welcome back.</h2>
					<p class="welcome-lede">
						What are you building today? Three places people usually start —
					</p>

					<section>
						<div class="welcome-eyebrow">Build a component</div>
						<Chips items={buildChips} onselect={pickChip} />
					</section>

					<section>
						<div class="welcome-eyebrow">How-to</div>
						<Chips items={howChips} onselect={pickChip} />
					</section>

					<section>
						<div class="welcome-eyebrow">Theme &amp; customize</div>
						<Chips items={themeChips} onselect={pickChip} />
					</section>
				</div>
			{:else}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="UNDERSTOOD"
						who="Rokkit"
						icon="i-mdi:layers-outline"
					>
						Three things — locate the matching component in
						<code>@rokkit/ui</code>, mount it with sample data,
						and surface the Svelte source you'd copy.
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="LOCATED"
						icon="i-mdi:magnify"
					>
						Component reads <code>items</code> + binds
						<code>value</code>. Style cascades from
						<code>data-style</code> on the shell.
					</ChatMessage>
					<ChatMessage
						kind="think"
						head="MOUNTING"
					>
						wiring sample data and the style cascade…
					</ChatMessage>
				</ChatStream>
			{/if}

			<ChatComposer
				bind:value={composerValue}
				placeholder={phase === 'welcome'
					? 'Ask anything · type / for commands'
					: 'Refine · ask follow-ups · request another component'}
				running={phase === 'thinking'}
				onsubmit={submitQuery}
			/>
		</aside>

		<main class="canvas">
			{#if phase === 'welcome'}
				<div class="welcome-hero">
					<div class="mark"><RokkitWordmark {mode} height={64} /></div>
					<div class="lede">Pass the data. The component does the rest.</div>
					<div class="sub">
						Type a question on the left. The answer mounts here — themed,
						density-tuned, copyable, and identical to what you'd ship.
					</div>
					<div class="meta">
						<span>style</span>
						<span class="meta-value">{style}</span>
						<span class="meta-sep">·</span>
						<span>47 components</span>
						<span class="meta-sep">·</span>
						<span>Svelte 5 runes</span>
					</div>
				</div>
			{:else if phase === 'thinking'}
				<div class="canvas-head preparing">
					<div class="canvas-eyebrow">Canvas · preparing</div>
					<div class="canvas-title">{lastQuery}</div>
					<div class="canvas-sub">
						A live preview, the source, and the levers that change its look.
					</div>
				</div>
				<div class="canvas-body thinking">
					<span class="koan-spinner" aria-hidden="true"></span>
					<span class="thinking-step">mounting — step 3 of 4</span>
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	.koan-shell {
		position: fixed;
		inset: 0;
		display: flex;
		flex-direction: column;
		background: var(--paper);
		color: var(--ink);
		font-family: var(--font-ui);
		overflow: hidden;
	}

	.stage {
		flex: 1;
		display: flex;
		min-height: 0;
	}

	/* ─── Sidebar conversation rows ──────────────────────────────────── */

	.group-label {
		padding: 14px 8px 4px;
		font: 500 10px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	[data-chat-sidebar-scroll] > .group-label:first-child {
		padding-top: 4px;
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
		position: relative;
	}

	.conv:hover {
		background: var(--paper-soft);
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
		color: var(--ink-faint);
		letter-spacing: 0.02em;
		flex-shrink: 0;
	}

	.conv-mini {
		width: 32px;
		height: 32px;
		display: grid;
		place-items: center;
		margin: 0 auto;
		border-radius: 6px;
		color: var(--ink-soft);
		cursor: pointer;
	}

	.conv-mini:hover {
		background: var(--paper-soft);
		color: var(--ink);
	}

	/* ─── Chat-left ──────────────────────────────────────────────────── */

	.chat-left {
		width: 400px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		border-right: var(--hairline);
		background: var(--paper);
		min-width: 0;
	}

	.chat-header {
		padding: 12px 16px;
		border-bottom: var(--hairline);
	}

	.chat-title {
		font: 500 14px var(--font-display);
		color: var(--ink);
		letter-spacing: -0.01em;
		display: flex;
		align-items: baseline;
		gap: 6px;
	}

	.chat-sub {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.02em;
		max-width: 280px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.welcome-stream {
		flex: 1;
		overflow-y: auto;
		padding: 18px 16px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.welcome-hello {
		font: 400 22px/1.3 var(--font-display);
		color: var(--ink);
		letter-spacing: -0.015em;
		margin: 0;
	}

	.welcome-lede {
		font: 400 14px/1.6 var(--font-ui);
		color: var(--ink-mute);
		margin: 0;
	}

	.welcome-eyebrow {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		margin-bottom: 6px;
	}

	/* ─── Canvas ─────────────────────────────────────────────────────── */

	.canvas {
		flex: 1;
		min-width: 0;
		background: var(--paper);
		display: flex;
		flex-direction: column;
		overflow: auto;
	}

	.canvas-head {
		padding: 24px 28px 18px;
		border-bottom: var(--hairline);
	}

	.canvas-head.preparing {
		opacity: 0.55;
	}

	.canvas-eyebrow {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		margin-bottom: 6px;
	}

	.canvas-title {
		font: 400 22px var(--font-display);
		color: var(--ink);
		letter-spacing: -0.015em;
	}

	.canvas-sub {
		margin-top: 6px;
		font: 400 13.5px/1.55 var(--font-ui);
		color: var(--ink-mute);
		max-width: 640px;
	}

	.canvas-body {
		flex: 1;
		min-height: 0;
	}

	.canvas-body.thinking {
		display: grid;
		place-items: center;
		gap: 14px;
		padding: 56px;
		grid-auto-flow: column;
		grid-auto-columns: min-content;
	}

	.koan-spinner {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 1.5px solid var(--ink-soft);
		border-top-color: transparent;
		animation: koan-canvas-spin 0.8s linear infinite;
		flex-shrink: 0;
	}

	@keyframes koan-canvas-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.thinking-step {
		font: 500 12px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	/* Welcome variant of canvas centers the hero */
	.canvas:has(.welcome-hero) {
		display: grid;
		place-items: center;
	}

	.welcome-hero {
		max-width: 640px;
		padding: 64px 32px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 16px;
	}

	.welcome-hero .mark {
		margin-bottom: 8px;
		display: flex;
		justify-content: center;
	}

	.welcome-hero .lede {
		font: 400 28px/1.25 var(--font-display);
		color: var(--ink);
		letter-spacing: -0.01em;
	}

	.welcome-hero .sub {
		font: 400 15px/1.6 var(--font-ui);
		color: var(--ink-mute);
		max-width: 480px;
	}

	.welcome-hero .meta {
		margin-top: 24px;
		display: flex;
		gap: 16px;
		align-items: center;
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.welcome-hero .meta-value {
		color: var(--ink-mute);
		text-transform: none;
		letter-spacing: 0.04em;
		font-size: 12px;
	}

	.welcome-hero .meta-sep {
		color: var(--ink-faint);
	}
</style>
