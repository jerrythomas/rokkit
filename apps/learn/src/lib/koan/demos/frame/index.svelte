<script lang="ts">
	import { Frame } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()
</script>

<div class="grid">
	<section>
		<header>Header + body + footer</header>
		<Frame {...spread}>
			{#snippet header()}
				<div class="frame-head">
					<span class="i-mdi:rocket-launch tile-icon" aria-hidden="true"></span>
					<strong class="tile-title">Deployment</strong>
					<span class="badge">live</span>
				</div>
			{/snippet}

			<p>
				Frame hands three zones to the theme — a header, a body, and a footer — each separated by a
				paper-edge. Consumers decide what goes inside.
			</p>

			{#snippet footer()}
				<div class="frame-foot">
					<button type="button" class="ghost-button">Rollback</button>
					<button type="button" class="ghost-button">Redeploy</button>
				</div>
			{/snippet}
		</Frame>
	</section>

	<section>
		<header>Body only — header and footer are optional</header>
		<Frame {...spread}>
			<p>
				A Frame is happy with just a body. Drop the header and footer snippets and it collapses to a
				single padded panel.
			</p>
		</Frame>
	</section>

	<section>
		<header>Flush body — inner artifact controls its own padding</header>
		<Frame flush {...spread}>
			{#snippet header()}
				<div class="frame-head">
					<span class="i-mdi:code-tags tile-icon" aria-hidden="true"></span>
					<strong class="tile-title">chart.svelte</strong>
				</div>
			{/snippet}

			<pre class="code">const total = rows.reduce((sum, r) =&gt; sum + r.value, 0)</pre>
		</Frame>
	</section>
</div>

<style>
	.grid {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	header {
		font: 500 11px var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-soft);
	}
	.frame-head {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.tile-icon {
		width: 16px;
		height: 16px;
		color: var(--ink-soft);
	}
	.tile-title {
		font: 600 14px var(--font-display);
		color: var(--ink);
	}
	.badge {
		margin-left: auto;
		padding: 1px 8px;
		border-radius: 9px;
		border: 1px solid var(--paper-edge);
		background: var(--paper);
		color: var(--ink-soft);
		font: 500 10px var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	p {
		margin: 0;
		font: 400 13px/1.5 var(--font-ui);
		color: var(--ink-mute);
	}
	.frame-foot {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
	.ghost-button {
		padding: 4px 12px;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		background: var(--paper);
		color: var(--ink);
		font: 500 12px var(--font-ui);
		cursor: pointer;
	}
	.code {
		margin: 0;
		padding: 12px 14px;
		font: 400 12px/1.6 var(--font-mono);
		color: var(--ink);
		white-space: pre-wrap;
	}
</style>
