<script lang="ts">
	/*
	 * How a visitor sets up System One: their own Ollama, asked from this page. The steps come from
	 * `setupSteps` for this origin; nothing contacts localhost until "Check connection" — a public
	 * site reaching the local network makes the browser ask for permission, so it should be the
	 * visitor's click that triggers it.
	 */
	import { browser } from '$app/environment'
	import { checkOllama, setupSteps, type OllamaStatus } from '../intent/ollama-setup'
	import { DEFAULT_OLLAMA } from '../intent/interpret'

	const { origin }: { origin: string } = $props()

	/** Remembered once connected, so a returning visitor starts with the steps folded away. */
	const CONNECTED_KEY = 'rokkit:systemone:connected'
	// `browser`, not `typeof localStorage`: newer Node defines a localStorage global on the server
	// whose methods throw unless configured, which crashed the server render.
	const connectedBefore = () => browser && localStorage.getItem(CONNECTED_KEY) === 'yes'

	const steps = $derived(setupSteps(origin, DEFAULT_OLLAMA.model))
	let status = $state<OllamaStatus | 'checking' | null>(null)
	let open = $state(!connectedBefore())
	let copied = $state<string | null>(null)

	async function check() {
		status = 'checking'
		status = await checkOllama(DEFAULT_OLLAMA)
		if (status !== 'ready') return
		// Connected: fold the steps; the summary keeps saying so.
		open = false
		localStorage.setItem(CONNECTED_KEY, 'yes')
	}

	async function copy(text: string) {
		try {
			await navigator.clipboard.writeText(text)
			copied = text
		} catch {
			// The command stays visible to select by hand.
		}
	}

	const MESSAGES: Record<Exclude<OllamaStatus, 'ready'>, string> = {
		'no-model': `Ollama answered, but ${DEFAULT_OLLAMA.model} is not pulled yet — run the command in step 2.`,
		unreachable: `Can’t reach Ollama at ${DEFAULT_OLLAMA.url}. Check that it is running, that OLLAMA_ORIGINS includes this site (step 3), and that you allowed local network access (step 4).`
	}
</script>

{#snippet command(text: string)}
	<span data-ollama-command>
		<code>{text}</code>
		<button type="button" data-ollama-copy onclick={() => copy(text)} aria-label="Copy command">
			<span class={copied === text ? 'i-mdi:check' : 'i-mdi:content-copy'} aria-hidden="true"></span>
		</button>
	</span>
{/snippet}

<details data-ollama-setup bind:open>
	<summary>
		<span class="i-mdi:brain" aria-hidden="true"></span>
		Set up System One on your machine
		{#if status === 'ready'}
			<span data-ollama-badge data-ollama-status="ready">connected — {DEFAULT_OLLAMA.model} ready</span>
		{/if}
	</summary>
	<p data-ollama-lede>
		System One runs on <strong>your own Ollama</strong>, asked straight from this page — your messages never
		leave your machine. Four steps, once:
	</p>
	<ol data-ollama-steps>
		<li>
			Install <a href={steps.install} target="_blank" rel="noreferrer">Ollama</a> 0.35 or later.
		</li>
		<li>Pull the System One model: {@render command(steps.model)}</li>
		<li>
			Let Ollama accept requests from this site.
			{#if !steps.allowNeeded}
				<em>This page runs on localhost, which Ollama already allows — you can skip this step.</em>
			{/if}
			<dl data-ollama-allow>
				{#each steps.allow as step (step.os)}
					<dt>{step.os}</dt>
					<dd>
						{#each step.commands as line (line)}{@render command(line)}{/each}
						{#if step.note}<small>{step.note}</small>{/if}
					</dd>
				{/each}
			</dl>
		</li>
		<li>When your browser asks to let this site access devices on your <strong>local network</strong>, choose Allow.</li>
	</ol>
	<div data-ollama-check>
		<button type="button" onclick={check} disabled={status === 'checking'}>
			<span class={status === 'checking' ? 'i-mdi:loading' : 'i-mdi:lan-connect'} aria-hidden="true"></span>
			Check connection
		</button>
		{#if status && status !== 'checking' && status !== 'ready'}
			<p data-ollama-status={status}>{MESSAGES[status]}</p>
		{/if}
	</div>
</details>

<style>
	[data-ollama-setup] {
		margin: 0 0 12px;
		padding: 10px 14px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper-soft);
		font: 400 13px/1.55 var(--font-ui);
		color: var(--ink);
	}

	summary {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
		font-weight: 600;
	}

	[data-ollama-badge] {
		margin-left: auto;
		font: 500 11px var(--font-ui);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink-mute);
	}

	[data-ollama-lede] {
		margin: 8px 0 4px;
		color: var(--ink-mute);
	}

	[data-ollama-setup] {
		flex-shrink: 0;
	}

	[data-ollama-steps] {
		margin: 0;
		padding-left: 20px;
		list-style: decimal;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	[data-ollama-command] {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		margin: 2px 4px 2px 0;
		padding: 2px 4px 2px 8px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		background: var(--paper);
	}

	[data-ollama-command] code {
		font: 12px var(--font-mono);
		white-space: pre-wrap;
		word-break: break-all;
	}

	[data-ollama-copy] {
		border: 0;
		background: transparent;
		color: var(--ink-mute);
		cursor: pointer;
		padding: 2px;
	}

	[data-ollama-allow] {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 4px 12px;
		margin: 6px 0 0;
	}

	[data-ollama-allow] dt {
		font-weight: 500;
		color: var(--ink-mute);
		padding-top: 4px;
	}

	[data-ollama-allow] dd {
		margin: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	[data-ollama-allow] small {
		color: var(--ink-mute);
	}

	[data-ollama-check] {
		margin-top: 10px;
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;
	}

	[data-ollama-check] button {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 28px;
		padding: 0 12px;
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		background: var(--paper);
		font: 500 12px var(--font-ui);
		color: var(--ink);
		cursor: pointer;
	}

	[data-ollama-status] {
		margin: 0;
	}

	[data-ollama-status='unreachable'],
	[data-ollama-status='no-model'] {
		color: var(--ink-mute);
	}
</style>
