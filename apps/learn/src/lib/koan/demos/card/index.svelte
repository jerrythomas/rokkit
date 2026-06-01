<script lang="ts">
	import { Card } from '@rokkit/ui'

	let { ...spread }: Record<string, unknown> = $props()

	let clicked = $state<string | null>(null)
</script>

<div class="grid">
	<section>
		<header>Three modes — plain, link, interactive</header>
		<div class="row">
			<Card {...spread}>
				<h3>Simple Card</h3>
				<p>A basic card with text content. No interaction.</p>
			</Card>

			<Card href="https://github.com/jerrythomas/rokkit" {...spread}>
				<h3>Linked Card</h3>
				<p>Click to open the repo — renders as an anchor.</p>
			</Card>

			<Card onclick={() => (clicked = 'card three')} {...spread}>
				<h3>Interactive Card</h3>
				<p>Click handler — renders as a button.</p>
			</Card>
		</div>
		<p class="hint">Last clicked: <code>{clicked ?? '—'}</code></p>
	</section>

	<section>
		<header>With header + footer snippets</header>
		<div class="row">
			<Card {...spread}>
				{#snippet header()}
					<div class="card-head">
						<span class="i-mdi:account" aria-hidden="true"></span>
						<strong>Profile</strong>
					</div>
				{/snippet}

				<p>Body content sits between header and footer zones, each separated by a paper-edge.</p>

				{#snippet footer()}
					<div class="card-foot">
						<button type="button" class="ghost">Edit</button>
						<button type="button" class="ghost">View</button>
					</div>
				{/snippet}
			</Card>

			<Card {...spread}>
				{#snippet header()}
					<div class="card-head">
						<span class="i-mdi:bell" aria-hidden="true"></span>
						<strong>Notifications</strong>
						<span class="badge">3</span>
					</div>
				{/snippet}

				<ul class="card-list">
					<li>New message from Alice</li>
					<li>Build completed successfully</li>
					<li>PR #42 merged</li>
				</ul>
			</Card>
		</div>
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
	.row {
		display: grid;
		gap: 14px;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	}
	h3 {
		margin: 0 0 6px;
		font: 600 14px var(--font-display);
		color: var(--ink);
	}
	p {
		margin: 0;
		font: 400 13px/1.5 var(--font-ui);
		color: var(--ink-mute);
	}
	.card-head {
		display: flex;
		align-items: center;
		gap: 8px;
		font: 500 13px var(--font-ui);
		color: var(--ink);
	}
	.card-head .i-mdi\:account,
	.card-head .i-mdi\:bell {
		width: 16px;
		height: 16px;
		color: var(--ink-soft);
	}
	.badge {
		margin-left: auto;
		padding: 1px 7px;
		border-radius: 9px;
		background: var(--accent, var(--ink-soft));
		color: var(--paper);
		font: 500 11px var(--font-mono);
	}
	.card-foot {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
	}
	.ghost {
		padding: 3px 10px;
		border: 1px solid var(--paper-edge);
		border-radius: 4px;
		background: var(--paper);
		color: var(--ink);
		font: 500 12px var(--font-ui);
		cursor: pointer;
	}
	.card-list {
		margin: 0;
		padding-left: 18px;
		font: 400 13px/1.55 var(--font-ui);
		color: var(--ink-mute);
	}
	.hint {
		margin: 0;
		font: 400 12px var(--font-ui);
		color: var(--ink-mute);
	}
</style>
