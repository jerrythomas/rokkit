<script lang="ts">
	import type { Snippet } from 'svelte'
	import {
		ChatChrome,
		ChatComposer,
		ChatMessage,
		ChatResponse,
		ChatSidebar,
		ChatStream,
		Chips,
		CodeBlock
	} from '$lib/chat'
	import { Tabs } from '@rokkit/ui'
	import RokkitWordmark from '$lib/components/RokkitWordmark.svelte'
	import { theme } from '$lib/stores/theme.svelte'
	import { vibe } from '@rokkit/states'
	import { koan } from '$lib/koan/store.svelte'
	import { runMatch } from '$lib/koan/match.svelte'
	import { shell } from '$lib/koan/shell.svelte'
	import ThemeWizardCard from '$lib/koan/demos/theme-wizard/ThemeWizardCard.svelte'
	import { onMount } from 'svelte'
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'

	interface Props {
		children?: Snippet
	}
	const { children }: Props = $props()

	const styles = [
		{ id: 'zen-sumi', label: 'zen-sumi', colors: ['#F7F3EA', '#2A2925', '#A83D1F'] },
		{ id: 'rokkit', label: 'rokkit', colors: ['#FFFFFF', '#1F2937', '#EF4136'] },
		{ id: 'minimal', label: 'minimal', colors: ['#FAFAFA', '#0A0A0A', '#0A0A0A'] },
		{ id: 'material', label: 'material', colors: ['#FFFFFF', '#1F1F1F', '#6750A4'] }
	]

	let style = $state(theme.style)
	let density = $state(theme.density)
	const mode = $derived<'light' | 'dark'>(theme.mode === 'dark' ? 'dark' : 'light')

	$effect(() => {
		if (style !== theme.style) theme.setStyle(style)
	})
	$effect(() => {
		if (density !== theme.density) theme.setDensity(density)
	})
	$effect(() => {
		if (vibe.mode !== theme.mode) theme.setMode(vibe.mode)
	})

	let thinkingTimer: ReturnType<typeof setTimeout> | null = null

	type DemoKind = 'tabs' | 'theme-wizard'
	const DEMO_ROUTE: Record<DemoKind, string> = {
		tabs: '/app/tabs',
		'theme-wizard': '/app/wizard'
	}

	function pickDemoKind(query: string): DemoKind {
		const matches = runMatch(query)
		return matches[0]?.id === 'theme-wizard' ? 'theme-wizard' : 'tabs'
	}

	function submitQuery(value: string) {
		const trimmed = value.trim()
		if (!trimmed) return
		koan.query = trimmed
		shell.lastQuery = trimmed
		shell.composerValue = ''
		shell.phase = 'thinking'
		shell.demoType = null

		const nextKind = pickDemoKind(trimmed)
		if (thinkingTimer) clearTimeout(thinkingTimer)
		thinkingTimer = setTimeout(() => {
			goto(DEMO_ROUTE[nextKind])
		}, 1500)
	}

	function tryChip(item: { label?: string }) {
		if (item.label?.startsWith('switch style')) {
			style = style === 'zen-sumi' ? 'rokkit' : 'zen-sumi'
		}
	}

	function startNewConversation() {
		if (thinkingTimer) {
			clearTimeout(thinkingTimer)
			thinkingTimer = null
		}
		shell.lastQuery = ''
		shell.composerValue = ''
		koan.query = ''
		goto('/app')
	}

	// Hardcoded conversation history (will wire to real store later)
	const today = [
		{ id: 'h1', icon: 'i-mdi:tab', title: 'Show me how Tabs work', ago: '12m' },
		{ id: 'h2', icon: 'i-mdi:palette', title: 'Theme for our brand red', ago: '47m' },
		{ id: 'h3', icon: 'i-mdi:help-circle-outline', title: 'How do I bind a list to async data?', ago: '2h' },
		{ id: 'h4', icon: 'i-mdi:select-multiple', title: 'Multi-select with chip overflow', ago: '3h' }
	]
	const yesterday = [
		{ id: 'h5', icon: 'i-mdi:file-tree', title: 'Compare List vs Tree', ago: 'yest' },
		{ id: 'h6', icon: 'i-mdi:help-circle-outline', title: 'A11y for tree navigation', ago: 'yest' },
		{ id: 'h7', icon: 'i-mdi:form-textbox', title: 'Form validation · per-field', ago: 'yest' }
	]
	const older = [
		{ id: 'h8', icon: 'i-mdi:book-open-variant', title: 'When to use Combo vs Select?', ago: 'Mon' },
		{ id: 'h9', icon: 'i-mdi:palette', title: 'Custom skin from brand palette', ago: 'Sun' }
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

	const tryChips = [
		{ label: 'switch style → rokkit', icon: 'i-mdi:palette' },
		{ label: 'show the .css too', icon: 'i-mdi:code-tags' },
		{ label: 'wire it to a real list' }
	]

	const wizardChips = [
		{ label: '← previous step' },
		{ label: 'next step → typography' },
		{ label: 'export tokens.css', icon: 'i-mdi:download' }
	]

	function pickChip(item: { label?: string }) {
		if (item.label) submitQuery(item.label)
	}

	// Tabs demo state — mounted in the canvas response card
	const tabsItems = [
		{ label: 'Overview' },
		{ label: 'Theming' },
		{ label: 'Anatomy' },
		{ label: 'A11y' },
		{ label: 'API' }
	]
	let activeTab = $state<unknown>('Theming')

	const tabsCode = `<script>
  import { Tabs } from '@rokkit/ui'

  let items = $state([
    { label: 'Overview',  content: overviewSnippet },
    { label: 'Theming',   content: themingSnippet  },
    { label: 'Anatomy',   content: anatomySnippet  },
    { label: 'A11y',      content: a11ySnippet     },
    { label: 'API',       content: apiSnippet      },
  ])
  let value = $state(null)
<\/script>

<Tabs bind:items bind:value />`

	onMount(() => {
		if (!browser) return
		const params = new URL(window.location.href).searchParams
		const modeParam = params.get('mode')
		const collapsedParam = params.get('collapsed')
		const q = params.get('q')

		const persistedMode = theme.mode === 'dark' ? 'dark' : 'light'
		const initialMode = modeParam === 'dark' || modeParam === 'light' ? modeParam : persistedMode
		if (theme.mode !== initialMode) theme.setMode(initialMode)
		if (vibe.mode !== initialMode) vibe.mode = initialMode

		if (collapsedParam === 'true' || collapsedParam === '1') {
			shell.collapsed = true
		}
		if (q) {
			koan.query = q
			shell.lastQuery = q
		}
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
			<RokkitWordmark height={20} />
		{/snippet}
	</ChatChrome>

	<div class="stage">
		<ChatSidebar bind:collapsed={shell.collapsed} onnew={startNewConversation}>
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
					{#if shell.phase !== 'welcome'}
						<span class="chat-sub">· {shell.lastQuery}</span>
					{/if}
				</span>
			</div>

			{#if shell.phase === 'welcome'}
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
			{:else if shell.phase === 'thinking'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
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
			{:else if shell.phase === 'response' && shell.demoType === 'tabs'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="2m"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="MOUNTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:layers-outline"
					>
						<code>&lt;Tabs/&gt;</code> from <code>@rokkit/ui</code> on the canvas.
						Five panes from <code>items</code>. The style on screen is whatever
						<code>data-style</code> is set to — there is no <code>variant</code> prop.
						<div class="mounted-callout">
							<span class="callout-label">Canvas →</span>
							<span>Tabs · how the data-driven API works</span>
						</div>
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="EXPLAINED"
						icon="i-mdi:book-open-variant"
					>
						<strong>Items in, value out.</strong> The component owns selection,
						keyboard nav, focus, a11y. You hand it data, it hands you back
						which one is active.
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="TRY"
						icon="i-mdi:palette"
					>
						Flip the <em>style</em> at the top of the window — the same Tabs
						re-renders. Or copy the source on the right and paste it in.
					</ChatMessage>
					<Chips items={tryChips} onselect={tryChip} />
				</ChatStream>
			{:else if shell.phase === 'response' && shell.demoType === 'theme-wizard'}
				<ChatStream>
					<ChatMessage
						kind="user"
						head="YOU"
						who="Jerry"
						ago="just now"
						icon="i-mdi:chat-outline"
					>
						{shell.lastQuery}
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="STARTED"
						who="Rokkit"
						ago="just now"
						icon="i-mdi:palette"
					>
						Opened the theme wizard on the canvas. Step 02 — Skin — is active.
						Each role on the left can pick its palette and step. Mode-aware:
						light + dark share roles, swap palette steps.
					</ChatMessage>
					<ChatMessage
						kind="info"
						head="GLOSSARY"
						icon="i-mdi:book-open-variant"
					>
						<ul class="glossary">
							<li><strong>Palette</strong> — a 50→950 color scale.</li>
							<li>
								<strong>Skin</strong> — roles (paper, ink, accent…) mapped to a
								palette + step. Optionally dual-mapped for light + dark.
							</li>
							<li>
								<strong>Style</strong> — the thematic character: zen-sumi
								(underline), rokkit (block), minimal, material.
							</li>
							<li><strong>Density</strong> — padding rhythm. Chrome-wide attribute.</li>
						</ul>
					</ChatMessage>
					<Chips items={wizardChips} onselect={tryChip} />
				</ChatStream>
			{/if}

			<ChatComposer
				bind:value={shell.composerValue}
				placeholder={shell.phase === 'welcome'
					? 'Ask anything · type / for commands'
					: 'Refine · ask follow-ups · request another component'}
				running={shell.phase === 'thinking'}
				onsubmit={submitQuery}
			/>
		</aside>

		<main class="canvas">
			{#if shell.phase === 'welcome'}
				<div class="welcome-hero">
					<div class="mark"><RokkitWordmark height={64} /></div>
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
			{:else if shell.phase === 'thinking'}
				<div class="canvas-head preparing">
					<div class="canvas-eyebrow">Canvas · preparing</div>
					<div class="canvas-title">{shell.lastQuery}</div>
					<div class="canvas-sub">
						A live preview, the source, and the levers that change its look.
					</div>
				</div>
				<div class="canvas-body thinking">
					<span class="koan-spinner" aria-hidden="true"></span>
					<span class="thinking-step">mounting — step 3 of 4</span>
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'tabs'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Mounted demo · live</div>
					<div class="canvas-title">Tabs · how the data-driven API works</div>
					<div class="canvas-sub">
						Five panes from one <code>items</code> array. Selection is bound.
						Style comes from <code>data-style</code> on the parent. Flip the
						chrome toggle to see it re-render.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;Tabs/&gt;"
						meta="· @rokkit/ui · style={style}"
						kicker="LIVE"
					>
						{#snippet icon()}
							<span class="i-mdi:layers-outline" aria-hidden="true"></span>
						{/snippet}
						<div class="tabs-mount">
							<Tabs options={tabsItems} bind:value={activeTab} />
						</div>
						{#snippet props()}
							<span>items</span><span data-value>[5]</span>
							<span data-sep>·</span>
							<span>style</span><span data-value>{style}</span>
							<span data-sep>·</span>
							<span>bytes</span><span data-value>2.1kb</span>
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-copy" aria-hidden="true"></span>
								Copy code
							</button>
							<button type="button">
								<span class="i-mdi:download" aria-hidden="true"></span>
								Download
							</button>
						{/snippet}
					</ChatResponse>

					<CodeBlock filename="Tabs.demo.svelte" language="svelte" code={tabsCode} />
				</div>
			{:else if shell.phase === 'response' && shell.demoType === 'theme-wizard'}
				<div class="canvas-head">
					<div class="canvas-eyebrow">Theme wizard · live preview</div>
					<div class="canvas-title">Build a theme · step 02 of 04</div>
					<div class="canvas-sub">
						Style chosen; now map roles to palette steps. The right side previews
						each role on the running app.
					</div>
				</div>
				<div class="canvas-body response">
					<ChatResponse
						name="&lt;ThemeWizard/&gt;"
						meta="· step 02 · skin"
						kicker="WIZARD"
					>
						{#snippet icon()}
							<span class="i-mdi:palette" aria-hidden="true"></span>
						{/snippet}
						<ThemeWizardCard {mode} />
						{#snippet props()}
							<span>style</span><span data-value>{style}</span>
							<span data-sep>·</span>
							<span>palette</span><span data-value>warm-gray + shu</span>
							<span data-sep>·</span>
							<span>dual-mode</span><span data-value>yes</span>
						{/snippet}
						{#snippet actions()}
							<button type="button">
								<span class="i-mdi:content-save-outline" aria-hidden="true"></span>
								Save preset
							</button>
							<button type="button">
								<span class="i-mdi:download" aria-hidden="true"></span>
								Export tokens.css
							</button>
							<button type="button">
								<span class="i-mdi:refresh" aria-hidden="true"></span>
								Preview live
							</button>
						{/snippet}
					</ChatResponse>
				</div>
			{/if}
		</main>
	</div>

	{#if children}{@render children()}{/if}
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
		color: var(--ink-soft);
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

	.chat-left {
		width: 400px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		border-right: 1px solid var(--paper-edge);
		background: var(--paper);
		min-width: 0;
	}

	.chat-header {
		padding: 12px 16px;
		border-bottom: 1px solid var(--paper-edge);
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
		border-bottom: 1px solid var(--paper-edge);
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

	.canvas-body.response {
		padding: 22px 28px 32px;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.tabs-mount {
		min-height: 120px;
	}

	:global([data-chat-message] .mounted-callout) {
		margin-top: 8px;
		padding: 8px 10px;
		background: var(--accent-soft);
		border-radius: 6px;
		border: 1px dashed color-mix(in oklab, var(--accent) 30%, transparent);
		font-size: 12.5px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	:global([data-chat-message] .glossary) {
		margin: 4px 0 0;
		padding-left: 18px;
		font-size: 13px;
		line-height: 1.7;
		color: var(--ink-mute);
	}

	:global([data-chat-message] .glossary li) {
		margin-bottom: 2px;
	}

	:global([data-chat-message] .glossary strong) {
		color: var(--ink);
		font-weight: 500;
	}

	:global([data-chat-message] .mounted-callout .callout-label) {
		font: 500 10.5px var(--font-mono);
		color: var(--accent);
		letter-spacing: 0.12em;
		text-transform: uppercase;
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
