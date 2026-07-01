<script lang="ts">
	import { goto } from '$app/navigation'
	import { MODES, cardFor, type ChatMode } from '$lib/chat-demo/modes'
	import { setPendingPrompt } from '$lib/chat-demo/store.svelte'

	// Web-LLM needs WebGPU; disable its card when unavailable.
	let webgpu = $state(true)
	$effect(() => {
		webgpu = typeof navigator !== 'undefined' && 'gpu' in navigator
	})

	function routeFor(mode: ChatMode): string {
		const card = cardFor(mode)
		return card.needsModel && card.defaultModel
			? `/chat/${mode}?model=${encodeURIComponent(card.defaultModel)}`
			: `/chat/${mode}`
	}
	function enter(mode: ChatMode) {
		goto(routeFor(mode))
	}
	function enterWith(mode: ChatMode, prompt: string) {
		setPendingPrompt(prompt)
		goto(routeFor(mode))
	}
	const disabled = (mode: ChatMode) => mode === 'webllm' && !webgpu
</script>

<div data-mode-picker>
	{#each MODES as card (card.mode)}
		<section data-mode-card class:disabled={disabled(card.mode)}>
			<header>
				<span class={card.icon} aria-hidden="true"></span>
				<h2>{card.label}</h2>
			</header>
			<p data-mode-blurb>{card.blurb}</p>
			<p data-mode-caps>{card.capabilities}</p>
			{#if disabled(card.mode)}
				<p data-mode-note>Needs WebGPU — try Chrome or Edge.</p>
			{:else}
				<button type="button" data-mode-enter onclick={() => enter(card.mode)}>Open {card.label} ›</button>
				<ul data-mode-examples>
					{#each card.examples as ex (ex)}
						<li><button type="button" onclick={() => enterWith(card.mode, ex)}>{ex}</button></li>
					{/each}
				</ul>
			{/if}
		</section>
	{/each}
</div>

<style>
	[data-mode-picker] {
		display: grid;
		gap: 16px;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		padding: 32px;
		max-width: 1060px;
		margin: 0 auto;
	}
	[data-mode-card] {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 20px;
		border: 1px solid var(--paper-edge);
		border-radius: 12px;
		background: var(--paper);
		transition: border-color 120ms ease;
	}
	[data-mode-card]:not(.disabled):hover {
		border-color: var(--paper-edge-hover);
	}
	[data-mode-card].disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
	[data-mode-card] header {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	[data-mode-card] header [class^='i-'] {
		width: 20px;
		height: 20px;
		color: var(--ink-mute);
	}
	[data-mode-card] h2 {
		font: 600 16px var(--font-ui);
		color: var(--ink);
		margin: 0;
	}
	[data-mode-blurb] {
		color: var(--ink);
		font-size: 14px;
		margin: 0;
	}
	[data-mode-caps],
	[data-mode-note] {
		color: var(--ink-mute);
		font-size: 12.5px;
		line-height: 1.5;
		margin: 0;
	}
	[data-mode-enter] {
		align-self: flex-start;
		margin-top: 4px;
		font: 500 13px var(--font-ui);
		color: var(--ink);
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		padding: 6px 12px;
		cursor: pointer;
	}
	[data-mode-enter]:hover {
		border-color: var(--paper-edge-hover);
	}
	[data-mode-examples] {
		list-style: none;
		margin: 8px 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	[data-mode-examples] button {
		text-align: left;
		color: var(--ink-mute);
		font-size: 12px;
		background: var(--paper-soft);
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		padding: 6px 10px;
		cursor: pointer;
		width: 100%;
	}
	[data-mode-examples] button:hover {
		color: var(--ink);
		border-color: var(--paper-edge-hover);
	}
</style>
