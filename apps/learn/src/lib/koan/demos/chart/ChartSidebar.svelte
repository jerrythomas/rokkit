<script lang="ts">
	import { MarkdownRenderer } from '@rokkit/ui'
	import { explorer } from './store.svelte'
	import { chartTypes } from './registry'
	import {
		conversations,
		getCurrentId,
		startNew,
		appendUser,
		appendAssistant
	} from '../../conversations.svelte'

	const config = $derived(explorer.config)
	const s = $derived(explorer.settings)
	const positionOptions = $derived(
		explorer.type === 'area' ? ['stack', 'fill', 'identity'] : ['stack', 'dodge', 'fill', 'identity']
	)
	const groups = ['Charts', 'Geoms'] as const
	const tips = $derived(explorer.tips.slice(0, 4))

	// Reactive turns of the active conversation (touch `conversations` so pushes re-render).
	const turns = $derived.by(() => {
		void conversations.length
		const id = getCurrentId()
		return conversations.find((c) => c.id === id)?.turns ?? []
	})
	const chatTurns = $derived(
		turns.filter((t) => t.kind === 'user' || (t.kind === 'assistant' && t.body.kind === 'markdown'))
	)

	// A hint click simulates a chat turn: the user "asks", the chart changes, the bot describes it.
	// Direct navigation to /app/chart has no active conversation yet — start one on first click.
	function runHint(tip: { text: string; to?: string; set?: Record<string, unknown> }) {
		if (getCurrentId()) appendUser(tip.text)
		else startNew('app', tip.text)
		explorer.apply(tip)
		appendAssistant({ kind: 'markdown', text: explorer.describe() })
	}

	// Auto-scroll the chat to the newest turn.
	let stream = $state<HTMLDivElement>()
	$effect(() => {
		void chatTurns.length
		if (stream) stream.scrollTop = stream.scrollHeight
	})
</script>

<div class="chart-sidebar" data-chart-sidebar>
	<!-- Always-on controls -->
	<section class="controls" data-chart-controls>
		<span class="eyebrow">Configure</span>
		{#each groups as group (group)}
			<span class="group-label">{group}</span>
			<div class="picker" data-chart-picker>
				{#each chartTypes.filter((t) => t.group === group) as t (t.id)}
					<button type="button" class="chip" data-active={explorer.type === t.id ? 'true' : undefined} data-chart-type={t.id} onclick={() => explorer.select(t.id)}>{t.label}</button>
				{/each}
			</div>
		{/each}

		<div class="settings">
			{#if explorer.applies('orientation')}
				<div class="row"><span>Orientation</span><div class="seg">{#each ['vertical', 'horizontal'] as o (o)}<button type="button" data-active={s.orientation === o ? 'true' : undefined} onclick={() => explorer.set('orientation', o as 'vertical' | 'horizontal')}>{o}</button>{/each}</div></div>
			{/if}
			{#if explorer.applies('position')}
				<div class="row"><span>Position</span><div class="seg wrap">{#each positionOptions as p (p)}<button type="button" data-active={s.position === p ? 'true' : undefined} onclick={() => explorer.set('position', p as typeof s.position)}>{p}</button>{/each}</div></div>
			{/if}
			{#if explorer.applies('fill')}
				<label class="row check"><input type="checkbox" checked={Boolean(s.fill)} onchange={(e) => explorer.set('fill', e.currentTarget.checked ? (config.fields.fill ?? '') : '')} /><span>Fill by <code>{config.fields.fill}</code></span></label>
			{/if}
			{#if explorer.applies('color')}
				<label class="row check"><input type="checkbox" checked={Boolean(s.color)} onchange={(e) => explorer.set('color', e.currentTarget.checked ? (config.fields.color ?? '') : '')} /><span>Color by <code>{config.fields.color}</code></span></label>
			{/if}
			{#if explorer.applies('pattern')}
				<label class="row check"><input type="checkbox" checked={Boolean(s.pattern)} onchange={(e) => explorer.set('pattern', e.currentTarget.checked ? (config.fields.fill ?? config.fields.x ?? '') : '')} /><span>Pattern fill</span></label>
			{/if}
			{#if explorer.applies('innerRadius')}
				<div class="row"><span>Donut hole</span><input type="range" min="0" max="0.8" step="0.1" value={s.innerRadius} oninput={(e) => explorer.set('innerRadius', Number(e.currentTarget.value))} /></div>
			{/if}
			{#if explorer.applies('alpha')}
				<div class="row"><span>Opacity</span><input type="range" min="0.1" max="1" step="0.1" value={s.alpha ?? 1} oninput={(e) => explorer.set('alpha', Number(e.currentTarget.value))} /></div>
			{/if}
			{#if explorer.applies('legend')}
				<label class="row check"><input type="checkbox" checked={s.legend} onchange={(e) => explorer.set('legend', e.currentTarget.checked)} /><span>Show legend</span></label>
			{/if}
		</div>
	</section>

	<!-- Chat conversation -->
	<div class="stream" data-chart-chat bind:this={stream}>
		{#if chatTurns.length === 0}
			<div class="msg bot"><MarkdownRenderer markdown={explorer.describe()} /></div>
		{/if}
		{#each chatTurns as turn (turn.id)}
			{#if turn.kind === 'user'}
				<div class="msg user" data-chat-user>{turn.text}</div>
			{:else if turn.kind === 'assistant' && turn.body.kind === 'markdown'}
				<div class="msg bot" data-chat-bot><MarkdownRenderer markdown={turn.body.text} /></div>
			{/if}
		{/each}
	</div>

	<!-- Hints — just above the composer -->
	{#if tips.length}
		<section class="hints" data-chart-hints>
			<span class="eyebrow">Try this</span>
			<div class="hint-list">
				{#each tips as tip (tip.text)}
					<button type="button" class="hint" data-chart-hint onclick={() => runHint(tip)}>
						<span class="i-mdi:lightbulb-on-outline" aria-hidden="true"></span>{tip.text}
						{#if tip.to || tip.set}<span class="arrow" aria-hidden="true">→</span>{/if}
					</button>
				{/each}
			</div>
		</section>
	{/if}
</div>

<style>
	.chart-sidebar {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
	}
	.controls {
		flex-shrink: 0;
		padding: 14px 16px;
		border-bottom: 1px solid var(--paper-edge);
	}
	.stream {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 14px 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.hints {
		flex-shrink: 0;
		padding: 12px 16px;
		border-top: 1px solid var(--paper-edge);
	}
	.eyebrow {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		display: block;
		margin-bottom: 8px;
	}
	.group-label {
		font: 400 11px var(--font-ui);
		color: var(--ink-mute);
		display: block;
		margin: 8px 0 4px;
	}
	.picker,
	.hint-list {
		display: flex;
		flex-wrap: wrap;
		gap: 5px;
	}
	.hint-list {
		flex-direction: column;
	}
	.settings {
		margin-top: 10px;
	}
	.chip,
	.seg button {
		border: 1px solid var(--paper-edge);
		background: var(--paper);
		color: var(--ink);
		border-radius: var(--density-radius-base);
		padding: 3px 8px;
		font: 400 11.5px var(--font-ui);
		cursor: pointer;
	}
	.chip[data-active='true'],
	.seg button[data-active='true'] {
		background: var(--primary);
		color: var(--on-primary);
		border-color: transparent;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin: 6px 0;
		font: 400 12px var(--font-ui);
		color: var(--ink);
	}
	.row.check {
		justify-content: flex-start;
		cursor: pointer;
	}
	.seg {
		display: flex;
		gap: 4px;
	}
	.seg.wrap {
		flex-wrap: wrap;
	}
	code {
		font: 400 11px var(--font-mono);
		color: var(--primary);
	}
	input[type='range'] {
		width: 6.5rem;
	}
	.hint {
		display: flex;
		align-items: center;
		gap: 6px;
		text-align: left;
		border: 1px solid var(--paper-edge);
		background: var(--paper-mute);
		color: var(--ink);
		border-radius: var(--density-radius-base);
		padding: 6px 10px;
		font: 400 12px var(--font-ui);
		cursor: pointer;
	}
	.hint:hover {
		border-color: var(--primary);
		color: var(--primary);
	}
	.arrow {
		margin-left: auto;
		opacity: 0.6;
	}
	.msg {
		max-width: 85%;
		padding: 7px 11px;
		border-radius: 12px;
		font: 400 12.5px/1.5 var(--font-ui);
	}
	.msg.user {
		align-self: flex-end;
		background: var(--primary);
		color: var(--on-primary);
		border-bottom-right-radius: 3px;
	}
	.msg.bot {
		align-self: flex-start;
		background: var(--paper-mute);
		color: var(--ink);
		border-bottom-left-radius: 3px;
	}
</style>
