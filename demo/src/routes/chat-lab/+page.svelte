<script lang="ts">
	import {
		ChatChrome,
		ChatComposer,
		ChatMessage,
		ChatResponse,
		ChatSidebar,
		ChatStream,
		Chips
	} from '$lib/chat'

	const styles = [
		{ id: 'zen-sumi', label: 'zen-sumi', colors: ['#F7F3EA', '#2A2925', '#A83D1F'] },
		{ id: 'rokkit', label: 'rokkit', colors: ['#FFFFFF', '#1F2937', '#EF4136'] },
		{ id: 'minimal', label: 'minimal', colors: ['#FAFAFA', '#0A0A0A', '#0A0A0A'] },
		{ id: 'material', label: 'material', colors: ['#FFFFFF', '#1F1F1F', '#6750A4'] }
	]

	import { vibe } from '@rokkit/states'

	let style = $state('zen-sumi')
	let density = $state('cozy')
	const mode = $derived<'light' | 'dark'>(vibe.mode === 'dark' ? 'dark' : 'light')
	let collapsed = $state(false)
	let composerValue = $state('')

	const chips = [
		{ label: 'Tabs · 5 panes', icon: 'i-mdi:tab' },
		{ label: 'Sortable data table', icon: 'i-mdi:table' },
		{ label: 'Tree select', icon: 'i-mdi:file-tree' },
		{ label: 'Multi-select with chips', icon: 'i-mdi:select-multiple' }
	]

	$effect(() => {
		document.documentElement.dataset.mode = mode
		document.documentElement.dataset.style = style
		document.documentElement.dataset.density = density
		document.body.dataset.mode = mode
		document.body.dataset.style = style
		document.body.dataset.density = density
	})
</script>

<svelte:head>
	<title>Chat lab — Koan primitives</title>
</svelte:head>

<div class="lab">
	<ChatChrome
		bind:style
		bind:density
		{styles}
	>
		{#snippet brand()}
			<span class="brand-mark">Koan</span>
		{/snippet}
		{#snippet crumb()}
			<span>Tabs</span><span data-sep>·</span><span>chat-lab</span>
		{/snippet}
	</ChatChrome>

	<div class="stage">
		<ChatSidebar bind:collapsed onnew={() => alert('new conversation')}>
			<div class="conv-group">Today</div>
			<div class="conv">Show me how Tabs work</div>
			<div class="conv conv-active">Theme for our brand red</div>
			<div class="conv">How do I bind a list to async data?</div>
			{#snippet collapsedBody()}
				<div class="conv-mini" title="Show me how Tabs work">·</div>
				<div class="conv-mini conv-mini-active" title="Theme for our brand red">·</div>
				<div class="conv-mini" title="How do I bind a list to async data?">·</div>
			{/snippet}
			{#snippet footer()}
				<span>3 conversations</span>
			{/snippet}
		</ChatSidebar>

		<aside class="chat-left">
			<div class="chat-header">
				<span class="chat-title">Conversation <span class="chat-sub">· Tabs · mounted</span></span>
			</div>
			<ChatStream>
				<ChatMessage kind="user" ago="2m">
					Mount a Tabs demo with five panes. Walk me through how the data-driven API works.
				</ChatMessage>
				<ChatMessage kind="info" status="mounted" ago="just now">
					<code>&lt;Tabs/&gt;</code> from <code>@rokkit/ui</code> on the canvas. Five panes from <code>items</code>.
				</ChatMessage>
				<ChatMessage kind="think" status="thinking">
					wiring sample data and the style cascade…
				</ChatMessage>
				<Chips items={chips} onselect={() => {}} />
			</ChatStream>
			<ChatComposer
				bind:value={composerValue}
				placeholder="Ask anything · type / for commands"
				onsubmit={() => {}}
			/>
		</aside>

		<main class="canvas">
			<div class="canvas-head">
				<div class="canvas-eyebrow">Mounted demo · live</div>
				<div class="canvas-title">Tabs · how the data-driven API works</div>
			</div>
			<div class="canvas-body">
				<ChatResponse
					name="<Tabs/>"
					meta="· @rokkit/ui · style={style}"
					kicker="LIVE"
				>
					<div class="tabs-stub">
						<div class="tabs-bar">
							<button>Overview</button>
							<button class="on">Theming</button>
							<button>Anatomy</button>
							<button>A11y</button>
							<button>API</button>
						</div>
						<div class="tabs-content">
							<strong>Theming · data-driven</strong>
							<p>One component definition. The look comes from <code>data-style</code> on the parent.</p>
						</div>
					</div>
					{#snippet props()}
						<span>items</span><span data-value>[5]</span>
						<span data-sep>·</span>
						<span>style</span><span data-value>{style}</span>
					{/snippet}
					{#snippet actions()}
						<button>Copy code</button>
						<button>Download</button>
					{/snippet}
				</ChatResponse>
			</div>
		</main>
	</div>
</div>

<style>
	.lab {
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
	}

	.canvas {
		flex: 1;
		min-width: 0;
		background: var(--paper);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
	}

	.canvas-head {
		padding: 24px 28px 18px;
		border-bottom: 1px solid var(--paper-edge);
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

	.canvas-body {
		padding: 22px 28px 32px;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	.brand-mark {
		font: 500 14px var(--font-display);
		letter-spacing: -0.01em;
	}

	.conv-group {
		padding: 14px 8px 4px;
		font: 500 10px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.conv {
		padding: 6px 8px;
		margin: 1px 0;
		border-radius: 6px;
		color: var(--ink-mute);
		font: 450 12.5px var(--font-ui);
		cursor: pointer;
	}

	.conv:hover {
		background: var(--paper-soft);
		color: var(--ink);
	}

	.conv-active {
		background: color-mix(in oklab, var(--accent) 6%, transparent);
		color: var(--ink);
		position: relative;
	}

	.conv-active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 7px;
		bottom: 7px;
		width: 2px;
		background: var(--accent);
		border-radius: 2px;
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

	.conv-mini-active {
		background: var(--paper-mute);
		color: var(--accent);
	}

	.tabs-stub {
		font-family: var(--font-ui);
	}

	.tabs-bar {
		display: flex;
		border-bottom: 1px solid var(--paper-edge);
	}

	.tabs-bar button {
		position: relative;
		padding: 9px 14px;
		font: 500 13px var(--font-ui);
		background: transparent;
		border: 0;
		cursor: pointer;
		color: var(--ink-soft);
	}

	.tabs-bar button.on {
		color: var(--ink);
	}

	.tabs-bar button.on::after {
		content: '';
		position: absolute;
		left: 14px;
		right: 14px;
		bottom: -1px;
		height: 1.5px;
		background: var(--accent);
	}

	.tabs-content {
		padding: 18px 4px 8px;
		font: 400 13px/1.6 var(--font-ui);
		color: var(--ink-mute);
	}

	.tabs-content strong {
		display: block;
		font: 500 14.5px var(--font-display);
		color: var(--ink);
		margin-bottom: 6px;
	}

	.tabs-content code {
		font: 500 12px var(--font-mono);
		padding: 1px 5px;
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		border-radius: 3px;
		color: var(--ink-mute);
	}
</style>
